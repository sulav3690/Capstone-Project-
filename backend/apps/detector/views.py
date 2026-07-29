import uuid
from mongoengine.errors import DoesNotExist, ValidationError as MongoValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework import serializers

from apps.accounts.subscriptions import get_subscription_access
from .document_text import (
    DocumentTextExtractionError,
    SUPPORTED_DOCUMENT_EXTENSIONS,
    extract_text_from_document,
)
from .models import AnalysisJob, AnalysisRecord
from .tasks import run_detector_analysis


MAX_DOCUMENT_UPLOAD_BYTES = 25 * 1024 * 1024


class AnalysisRequestSerializer(serializers.Serializer):
    text = serializers.CharField(min_length=20, required=True)
    aiDetection = serializers.BooleanField(default=True)
    misinformation = serializers.BooleanField(default=True)

    def validate_text(self, value):
        word_limit = self.context.get("word_limit", 10_000)
        words_count = len(value.split())
        if words_count > word_limit:
            raise serializers.ValidationError(
                f"Your plan supports up to {word_limit:,} words per scan."
            )
        return value


class DocumentExtractSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)

    def validate_file(self, value):
        extension = "." + value.name.rsplit(".", 1)[-1].lower() if "." in value.name else ""
        if extension not in SUPPORTED_DOCUMENT_EXTENSIONS:
            raise serializers.ValidationError(
                "Unsupported file type. Upload PDF, DOCX, PPTX, XLSX, ODT, ODS, ODP, LaTeX, CSV, Markdown, HTML, or plain text."
            )
        if value.size > MAX_DOCUMENT_UPLOAD_BYTES:
            raise serializers.ValidationError("Upload a document smaller than 25 MB.")
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
        access = get_subscription_access(request.user)
        remaining = access["detections_remaining"]
        if remaining is not None and remaining <= 0:
            return Response(
                {
                    "status": "error",
                    "code": "detection_limit_reached",
                    "message": (
                        f"You have used all {access['detection_limit']:,} "
                        f"detections included with the {access['plan']} plan."
                    ),
                    "subscription_access": access,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AnalysisRequestSerializer(
            data=request.data,
            context={"word_limit": access["word_limit"]},
        )
        if serializer.is_valid():
            text = serializer.validated_data['text']
            ai_enabled = serializer.validated_data['aiDetection']
            misinfo_enabled = serializer.validated_data['misinformation']

            # Generate unique job tracking identifier
            job_id = str(uuid.uuid4())

            # Save initial job tracking status in MongoDB
            user_id = str(request.user.id)
            job = AnalysisJob(job_id=job_id, user_id=user_id, status='PENDING')
            job.save()

            # Dispatch task: use Celery if Redis is available, otherwise run synchronously
            from django.conf import settings as django_settings
            use_redis = getattr(django_settings, 'USE_REDIS', False)

            ran_synchronously = not use_redis
            if use_redis:
                try:
                    run_detector_analysis.apply_async(
                        args=[
                            job_id,
                            user_id,
                            text,
                            ai_enabled,
                            misinfo_enabled,
                            access["features"],
                        ],
                        priority=access["queue_priority"],
                    )
                except Exception:
                    # Fallback to synchronous if Celery/Redis connection fails
                    ran_synchronously = True
                    run_detector_analysis(
                        job_id,
                        user_id,
                        text,
                        ai_enabled,
                        misinfo_enabled,
                        access["features"],
                    )
            else:
                # No Redis — run synchronously
                run_detector_analysis(
                    job_id,
                    user_id,
                    text,
                    ai_enabled,
                    misinfo_enabled,
                    access["features"],
                )

            payload = {
                "status": "success",
                "message": "Analysis successfully queued in background.",
                "job_id": job_id,
                "subscription_access": access,
            }
            response_status = status.HTTP_202_ACCEPTED

            if ran_synchronously:
                completed_job = AnalysisJob.objects.get(job_id=job_id)
                payload["message"] = "Analysis completed successfully."
                payload["job"] = self._serialize_job(completed_job)
                payload["subscription_access"] = get_subscription_access(
                    request.user
                )
                response_status = status.HTTP_200_OK

            return Response(payload, status=response_status)

        return Response(
            {
                "status": "error",
                "message": "Analysis request validation failed.",
                "details": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    @staticmethod
    def _serialize_job(job):
        payload = {
            "job_id": job.job_id,
            "status": job.status,
        }
        if job.status == 'SUCCESS' and job.result_record_id:
            try:
                record = AnalysisRecord.objects.get(id=job.result_record_id)
                payload["result"] = AnalysisRecordSerializer(record).data
            except (DoesNotExist, MongoValidationError):
                payload["status"] = 'FAILED'
        elif job.status == 'FAILED':
            payload["message"] = "Analysis could not be completed."
        return payload


class DocumentExtractView(APIView):
    """
    POST /api/analyze/extract/
    Extracts readable text from an uploaded document so it can be analyzed.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = DocumentExtractSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "status": "error",
                    "message": "Document upload validation failed.",
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        uploaded_file = serializer.validated_data["file"]
        content = b"".join(uploaded_file.chunks())

        try:
            text = extract_text_from_document(uploaded_file.name, content)
        except DocumentTextExtractionError as exc:
            return Response(
                {
                    "status": "error",
                    "message": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not text:
            return Response(
                {
                    "status": "error",
                    "message": "No readable text was found in this document.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        access = get_subscription_access(request.user)
        word_count = len(text.split())
        if word_count > access["word_limit"]:
            return Response(
                {
                    "status": "error",
                    "message": f"Your plan supports up to {access['word_limit']:,} words per scan.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "status": "success",
                "filename": uploaded_file.name,
                "text": text,
                "word_count": word_count,
            },
            status=status.HTTP_200_OK,
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

        if job.user_id and job.user_id != str(request.user.id):
            return Response(
                {
                    "status": "error",
                    "message": "Permission denied. You do not own this analysis job."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(
            {
                "status": "success",
                "job": AnalyzeView._serialize_job(job)
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
        try:
            requested_limit = int(request.query_params.get('limit', 50))
        except (TypeError, ValueError):
            requested_limit = 50
        limit = min(max(requested_limit, 1), 100)
        records = AnalysisRecord.objects(user_id=user_id).order_by('-created_at').limit(limit)
        serializer = AnalysisRecordSerializer(records, many=True)
        
        return Response(
            {
                "status": "success",
                "history": serializer.data,
                "limit": limit,
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
        except (DoesNotExist, MongoValidationError):
            return Response(
                {
                    "status": "error",
                    "message": f"Analysis record with ID '{pk}' not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk):
        try:
            record = AnalysisRecord.objects.get(id=pk)
        except (DoesNotExist, MongoValidationError):
            return Response(
                {
                    "status": "error",
                    "message": f"Analysis record with ID '{pk}' not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if record.user_id != str(request.user.id):
            return Response(
                {
                    "status": "error",
                    "message": "Permission denied. You do not own this record."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        record.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
