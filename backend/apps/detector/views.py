import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers

from apps.detector.models import AnalysisJob, AnalysisRecord
from apps.detector.tasks import run_detector_analysis


class AnalysisRequestSerializer(serializers.Serializer):
    text = serializers.CharField(min_length=20, required=True)
    aiDetection = serializers.BooleanField(default=True)
    misinformation = serializers.BooleanField(default=True)

    def validate_text(self, value):
        # Validate max words limit (5000 words matching frontend MAX_WORDS)
        words_count = len(value.split())
        if words_count > 5000:
            raise serializers.ValidationError("Text exceeds the maximum limit of 5000 words.")
        return value


class AnalysisRecordSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    input_text = serializers.CharField(read_only=True)
    ai_score = serializers.FloatField(read_only=True)
    misinformation_score = serializers.FloatField(read_only=True)
    detailed_breakdown = serializers.DictField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class AnalyzeView(APIView):
    """
    POST /api/analyze/
    Accepts text, registers an async job in MongoDB, dispatches it to Celery,
    and returns a job_id for polling.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AnalysisRequestSerializer(data=request.data)
        if serializer.is_valid():
            text = serializer.validated_data['text']
            ai_enabled = serializer.validated_data['aiDetection']
            misinfo_enabled = serializer.validated_data['misinformation']

            # Generate unique job tracking identifier
            job_id = str(uuid.uuid4())

            # Save initial job tracking status in MongoDB
            job = AnalysisJob(job_id=job_id, status='PENDING')
            job.save()

            # Dispatch task to Celery worker queue
            run_detector_analysis.delay(
                job_id,
                str(request.user.id),
                text,
                ai_enabled,
                misinfo_enabled
            )

            return Response(
                {
                    "status": "success",
                    "message": "Analysis successfully queued in background.",
                    "job_id": job_id
                },
                status=status.HTTP_202_ACCEPTED
            )

        return Response(
            {
                "status": "error",
                "message": "Analysis request validation failed.",
                "details": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class JobStatusView(APIView):
    """
    GET /api/analyze/status/<job_id>/
    Queries MongoDB for the current progress of a queued analysis task.
    If finished, returns the populated analysis record database contents.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = AnalysisJob.objects.get(job_id=job_id)
        except AnalysisJob.DoesNotExist:
            return Response(
                {
                    "status": "error",
                    "message": f"Job with ID '{job_id}' not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        response_payload = {
            "job_id": job_id,
            "status": job.status
        }

        if job.status == 'SUCCESS' and job.result_record_id:
            try:
                record = AnalysisRecord.objects.get(id=job.result_record_id)
                response_payload["result"] = AnalysisRecordSerializer(record).data
            except AnalysisRecord.DoesNotExist:
                # Fallback if record was somehow deleted
                response_payload["status"] = 'FAILED'

        return Response(
            {
                "status": "success",
                "job": response_payload
            },
            status=status.HTTP_200_OK
        )


class AnalysisHistoryView(APIView):
    """
    GET /api/analyze/history/
    Lists all past analysis records of the currently logged-in user in chronological descending order.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = str(request.user.id)
        records = AnalysisRecord.objects(user_id=user_id).order_by('-created_at')
        serializer = AnalysisRecordSerializer(records, many=True)
        
        return Response(
            {
                "status": "success",
                "history": serializer.data
            },
            status=status.HTTP_200_OK
        )


class AnalysisDetailView(APIView):
    """
    GET /api/analyze/history/<id>/
    Retrieves the complete payload of a single past analysis record.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            record = AnalysisRecord.objects.get(id=pk)
            # Authorization check: make sure user owns this record
            if record.user_id != str(request.user.id):
                return Response(
                    {
                        "status": "error",
                        "message": "Permission denied. You do not own this record."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = AnalysisRecordSerializer(record)
            return Response(
                {
                    "status": "success",
                    "record": serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {
                    "status": "error",
                    "message": f"Analysis record with ID '{pk}' not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )
