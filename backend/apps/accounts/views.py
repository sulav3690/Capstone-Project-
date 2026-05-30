from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from apps.accounts.models import User
from apps.accounts.serializers import RegisterSerializer, UserSerializer, ProfileUpdateSerializer
from utils.jwt_utils import set_jwt_cookies, clear_jwt_cookies


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Registers a new user, generates access and refresh tokens, and returns
    them in HTTPOnly cookies.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            response = Response(
                {
                    "status": "success",
                    "message": "User registered successfully.",
                    "user": UserSerializer(user).data
                },
                status=status.HTTP_201_CREATED
            )
            
            # Save tokens in cookies
            return set_jwt_cookies(response, refresh.access_token, refresh)
            
        return Response(
            {
                "status": "error",
                "message": "Registration validation failed.",
                "details": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginView(APIView):
    """
    POST /api/auth/login/
    Validates user credentials (username or email), sets JWT access and refresh cookies,
    and returns user profile.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {
                    "status": "error",
                    "message": "Both username/email and password are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        from django.contrib.auth import authenticate
        user = authenticate(request, username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            response = Response(
                {
                    "status": "success",
                    "message": "Login successful.",
                    "user": UserSerializer(user).data
                },
                status=status.HTTP_200_OK
            )
            return set_jwt_cookies(response, refresh.access_token, refresh)

        return Response(
            {
                "status": "error",
                "message": "Invalid username/email or password."
            },
            status=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklists the user's refresh token and clears their cookies.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response(
            {
                "status": "success",
                "message": "Logout successful."
            },
            status=status.HTTP_200_OK
        )

        # Retrieve the refresh token from cookies to blacklist it
        refresh_token = request.COOKIES.get("refresh_token")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except (TokenError, Exception):
                # Ignore errors if token is already expired or blacklisted
                pass

        return clear_jwt_cookies(response)


class TokenRefreshView(APIView):
    """
    POST /api/auth/token/refresh/
    Reads the refresh token from the user's cookies, generates a new access token,
    and returns it in an HTTPOnly cookie.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {
                    "status": "error",
                    "message": "Refresh token is missing from cookies."
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            # Generate new access token
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)

            response = Response(
                {
                    "status": "success",
                    "message": "Access token refreshed successfully."
                },
                status=status.HTTP_200_OK
            )

            # Set new access token cookie (leave refresh token as is)
            # Secure cookies only on HTTPS (production)
            secure_cookie = not settings.DEBUG
            from datetime import timedelta
            access_lifetime = timedelta(minutes=settings.ACCESS_TOKEN_LIFETIME_MINUTES)
            
            response.set_cookie(
                key='access_token',
                value=new_access_token,
                max_age=int(access_lifetime.total_seconds()),
                path='/',
                secure=secure_cookie,
                httponly=True,
                samesite='Lax'
            )
            return response

        except Exception as e:
            # Clear invalid cookies
            response = Response(
                {
                    "status": "error",
                    "message": "Invalid or expired refresh token."
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
            return clear_jwt_cookies(response)


class MeView(APIView):
    """
    GET /api/auth/me/
    PUT /api/auth/me/update-profile/ (routed as PUT /api/auth/me/)
    Manages current authenticated user profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(
            {
                "status": "success",
                "user": serializer.data
            },
            status=status.HTTP_200_OK
        )

    def put(self, request):
        serializer = ProfileUpdateSerializer(
            instance=request.user, 
            data=request.data, 
            context={"request": request},
            partial=True
        )
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "status": "success",
                    "message": "Profile updated successfully.",
                    "user": UserSerializer(user).data
                },
                status=status.HTTP_200_OK
            )
        return Response(
            {
                "status": "error",
                "message": "Profile update validation failed.",
                "details": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
from django.conf import settings
