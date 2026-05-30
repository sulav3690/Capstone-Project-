import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import mongoengine
from django_redis import get_redis_connection


class HealthView(APIView):
    """
    GET /api/health/
    Performs active ping tests to MongoDB and Redis, returning the overall status of the services
    along with server metadata.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        status_code = status.HTTP_200_OK

        # 1. Test MongoDB Connection
        mongo_status = "ok"
        try:
            # Query db list to force active connection handshake
            mongoengine.connection.get_connection().list_database_names()
        except Exception:
            mongo_status = "failed"
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

        # 2. Test Redis Connection
        redis_status = "ok"
        try:
            r = get_redis_connection("default")
            r.ping()
        except Exception:
            redis_status = "failed"
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

        return Response(
            {
                "status": "ok" if status_code == status.HTTP_200_OK else "unhealthy",
                "services": {
                    "mongodb": mongo_status,
                    "redis": redis_status
                },
                "server_metadata": {
                    "framework": "Django REST Framework (Django 4.2)",
                    "version": "1.0.0",
                    "timestamp": int(time.time())
                }
            },
            status=status_code
        )
