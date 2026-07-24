import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import mongoengine
from django.conf import settings
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
        overall_status = "ok"
        service_latency_ms = {}

        # 1. Test MongoDB Connection
        mongo_status = "ok"
        mongo_started = time.perf_counter()
        try:
            # A ping is faster and requires fewer privileges than listing every
            # database on the cluster.
            mongoengine.connection.get_connection().admin.command('ping')
        except Exception:
            mongo_status = "failed"
            overall_status = "unhealthy"
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        finally:
            service_latency_ms["mongodb"] = round(
                (time.perf_counter() - mongo_started) * 1000,
                1,
            )

        # 2. Test Redis Connection only when enabled for this environment
        redis_status = "disabled"
        if getattr(settings, 'USE_REDIS', False):
            redis_status = "ok"
            redis_started = time.perf_counter()
            try:
                r = get_redis_connection("default")
                r.ping()
            except Exception:
                redis_status = "degraded"
                if overall_status == "ok":
                    overall_status = "degraded"
            finally:
                service_latency_ms["redis"] = round(
                    (time.perf_counter() - redis_started) * 1000,
                    1,
                )

        return Response(
            {
                "status": overall_status,
                "services": {
                    "mongodb": mongo_status,
                    "redis": redis_status
                },
                "latency_ms": service_latency_ms,
                "server_metadata": {
                    "framework": "Django REST Framework (Django 4.2)",
                    "version": "1.0.0",
                    "timestamp": int(time.time())
                }
            },
            status=status_code
        )
