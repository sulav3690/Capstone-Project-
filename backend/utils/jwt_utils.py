from datetime import timedelta
from django.conf import settings


def set_jwt_cookies(response, access_token, refresh_token):
    """
    Sets access and refresh JWT tokens inside HTTPOnly secure cookies.
    """
    access_lifetime = timedelta(minutes=settings.ACCESS_TOKEN_LIFETIME_MINUTES)
    refresh_lifetime = timedelta(days=settings.REFRESH_TOKEN_LIFETIME_DAYS)

    # Secure cookies only on HTTPS (production)
    secure_cookie = not settings.DEBUG

    # Access Token Cookie
    response.set_cookie(
        key='access_token',
        value=str(access_token),
        max_age=int(access_lifetime.total_seconds()),
        path='/',
        secure=secure_cookie,
        httponly=True,
        samesite='Lax'
    )

    # Refresh Token Cookie
    response.set_cookie(
        key='refresh_token',
        value=str(refresh_token),
        max_age=int(refresh_lifetime.total_seconds()),
        path='/',
        secure=secure_cookie,
        httponly=True,
        samesite='Lax'
    )

    return response


def clear_jwt_cookies(response):
    """
    Clears all auth cookies upon user logout.
    """
    response.delete_cookie('access_token', path='/')
    response.delete_cookie('refresh_token', path='/')
    return response
