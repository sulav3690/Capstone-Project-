import logging
from django.http import JsonResponse
from django_redis import get_redis_connection

logger = logging.getLogger(__name__)


class RateLimitMiddleware:
    """
    Redis-backed rate limiting middleware to prevent API abuse.
    Limits:
    - 10 requests per minute for auth endpoints (/api/auth/*)
    - 100 requests per minute for all other endpoints
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Allow health checks to bypass rate limits
        if request.path.startswith('/api/health/'):
            return self.get_response(request)

        ip = self.get_ip(request)
        path = request.path

        if path.startswith('/api/auth/'):
            limit = 10
            window = 60
            key = f"rate:auth:{ip}"
        else:
            limit = 100
            window = 60
            key = f"rate:gen:{ip}"

        try:
            r = get_redis_connection("default")
            current = r.get(key)

            if current is not None:
                current_val = int(current)
                if current_val >= limit:
                    ttl = r.ttl(key)
                    # Standard 429 Too Many Requests payload
                    response = JsonResponse(
                        {
                            'status': 'error',
                            'message': 'Rate limit exceeded. Please try again later.',
                            'details': {
                                'limit': limit,
                                'window_seconds': window,
                                'retry_after_seconds': max(1, ttl)
                            }
                        },
                        status=429
                    )
                    response['Retry-After'] = str(max(1, ttl))
                    return response
                else:
                    r.incr(key)
            else:
                # Initialize counter atomically
                pipe = r.pipeline()
                pipe.set(key, 1)
                pipe.expire(key, window)
                pipe.execute()

        except Exception as e:
            # Log Redis failure but FAIL OPEN so the site remains accessible
            logger.warning("Redis Rate Limiter failed: %s. Failing open.", str(e))

        return self.get_response(request)

    def get_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
