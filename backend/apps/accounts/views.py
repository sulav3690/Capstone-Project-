from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from datetime import datetime

from django.conf import settings
from django.contrib.auth import authenticate
from mongoengine.errors import DoesNotExist, ValidationError as MongoValidationError
from .models import OnboardingSurvey, User, UserFeedback
from .serializers import (
    OnboardingSurveySerializer,
    PasswordChangeSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    SupportTicketSerializer,
    UserFeedbackSerializer,
    UserSerializer,
)
from ..detector.models import AnalysisRecord
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

        user = authenticate(request, username=username.strip(), password=password)

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
    # Logout must remain available when a browser has cookies for an account
    # that was deleted directly from MongoDB.
    permission_classes = [AllowAny]

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
            token = RefreshToken(refresh_token)
            user_id = token.get("user_id")
            try:
                user = User.objects.get(id=user_id)
            except (User.DoesNotExist, MongoValidationError):
                response = Response(
                    {
                        "status": "error",
                        "message": "Your previous account no longer exists. Please sign in or register again.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
                return clear_jwt_cookies(response)

            user.expire_subscription_if_needed()
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

        except TokenError:
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

    def patch(self, request):
        """Allow partial updates via PATCH as well."""
        return self.put(request)


class PasswordChangeView(APIView):
    """Change the signed-in user's password after verifying the old password."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={"request": request},
        )
        if not serializer.is_valid():
            return Response(
                {
                    "status": "error",
                    "message": "Password update validation failed.",
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        response = Response(
            {
                "status": "success",
                "message": "Password updated successfully. Please sign in again.",
            },
            status=status.HTTP_200_OK,
        )
        return clear_jwt_cookies(response)


class AdminStatsView(APIView):
    """
    GET /api/auth/admin-stats/
    Restricted to admin users (username 'admin' or is_admin=True).
    Returns total users, total scans, lists of users, and lists of recent scans.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not getattr(request.user, "is_admin", False):
            return Response(
                {
                    "status": "error",
                    "message": "Permission denied. Admin privileges required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Totals
        total_users = User.objects.count()
        total_scans = AnalysisRecord.objects.count()
        total_surveys = OnboardingSurvey.objects.count() + UserFeedback.objects.count()

        recent_users = list(User.objects.order_by('-created_at')[:50])
        users_list = [
            {
                "id": str(u.id),
                "username": u.username,
                "email": u.email,
                "role": getattr(u, "role", "") or "other",
                "subscription_plan": u.subscription_plan,
                "is_admin": getattr(u, 'is_admin', False),
                "created_at": u.created_at.isoformat() if u.created_at else None
            }
            for u in recent_users
        ]

        # Resolve scan owners in one query instead of one query per result.
        recent_scans = list(AnalysisRecord.objects.order_by('-created_at')[:50])
        user_ids = {scan.user_id for scan in recent_scans if scan.user_id}
        users_by_id = {
            str(user.id): user.username
            for user in User.objects(id__in=list(user_ids)).only('username')
        } if user_ids else {}
        scans_list = []
        for s in recent_scans:
            scans_list.append({
                "id": str(s.id),
                "user_id": s.user_id,
                "username": users_by_id.get(s.user_id, "Unknown"),
                "ai_score": s.ai_score,
                "misinformation_score": s.misinformation_score,
                "summary": (s.input_text or "")[:180],
                "created_at": s.created_at.isoformat() if s.created_at else None
            })

        source_counts = {}
        survey_role_counts = {}
        role_counts = {}
        recent_surveys = []

        def increment(bucket, key):
            key = (key or "Unknown").strip() or "Unknown"
            bucket[key] = bucket.get(key, 0) + 1

        for user in User.objects.only("role"):
            increment(role_counts, getattr(user, "role", "") or "other")

        onboarding_surveys = list(OnboardingSurvey.objects.order_by("-created_at")[:100])
        for survey in onboarding_surveys:
            increment(source_counts, survey.heard_about_us)
            increment(survey_role_counts, survey.role)
            recent_surveys.append({
                "id": str(survey.id),
                "type": "Onboarding",
                "role": survey.role or "Unknown",
                "source": survey.heard_about_us or "Unknown",
                "purpose": survey.purpose or "",
                "plan_chosen": survey.plan_chosen or "",
                "created_at": survey.created_at.isoformat() if survey.created_at else None,
            })

        feedback_surveys = list(UserFeedback.objects.order_by("-created_at")[:100])
        for feedback in feedback_surveys:
            increment(source_counts, feedback.hear_about_us)
            increment(survey_role_counts, feedback.role)
            recent_surveys.append({
                "id": str(feedback.id),
                "type": "Feedback",
                "role": feedback.role or "Unknown",
                "source": feedback.hear_about_us or "Unknown",
                "purpose": feedback.ai_usage or "",
                "plan_chosen": "",
                "created_at": feedback.created_at.isoformat() if feedback.created_at else None,
            })

        recent_surveys.sort(key=lambda item: item["created_at"] or "", reverse=True)

        daily_scores = {}
        for scan in AnalysisRecord.objects.order_by("-created_at")[:200]:
            day = scan.created_at.date().isoformat() if scan.created_at else "Unknown"
            bucket = daily_scores.setdefault(day, {
                "date": day,
                "ai_total": 0,
                "misinformation_total": 0,
                "count": 0,
            })
            bucket["ai_total"] += float(scan.ai_score or 0)
            bucket["misinformation_total"] += float(scan.misinformation_score or 0)
            bucket["count"] += 1

        score_trends = [
            {
                "date": item["date"],
                "avg_ai_score": round(item["ai_total"] / item["count"], 2),
                "avg_misinformation_score": round(item["misinformation_total"] / item["count"], 2),
                "count": item["count"],
            }
            for item in sorted(daily_scores.values(), key=lambda item: item["date"])
        ]

        return Response(
            {
                "status": "success",
                "stats": {
                    "total_users": total_users,
                    "total_scans": total_scans,
                    "total_surveys": total_surveys,
                },
                "users": users_list,
                "scans": scans_list,
                "survey_logs": recent_surveys[:50],
                "analytics": {
                    "source_counts": [
                        {"label": key, "value": value}
                        for key, value in sorted(source_counts.items(), key=lambda item: item[1], reverse=True)
                    ],
                    "survey_role_counts": [
                        {"label": key, "value": value}
                        for key, value in sorted(survey_role_counts.items(), key=lambda item: item[1], reverse=True)
                    ],
                    "role_counts": [
                        {"label": key, "value": value}
                        for key, value in sorted(role_counts.items(), key=lambda item: item[1], reverse=True)
                    ],
                    "score_trends": score_trends,
                },
            },
            status=status.HTTP_200_OK
        )


class SupportTicketView(APIView):
    """
    POST /api/support/
    Submits a user support message.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SupportTicketSerializer(
            data=request.data,
            context={"request": request},
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "status": "success",
                    "message": "Support ticket submitted successfully."
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                "status": "error",
                "message": "Validation failed.",
                "details": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class UserFeedbackView(APIView):
    """
    POST /api/auth/feedback/
    Saves general feedback answers in MongoDB.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserFeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "status": "success",
                    "message": "Feedback saved successfully."
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                "status": "error",
                "message": "Feedback validation failed.",
                "details": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class OnboardingSurveyView(APIView):
    """
    POST /api/auth/onboarding-survey/
    Saves onboarding survey answers in MongoDB.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OnboardingSurveySerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            completed_at = data.get("completed_at") or datetime.utcnow()
            user_id = str(request.user.id)

            survey = OnboardingSurvey.objects(user_id=user_id).first()
            if survey is None:
                survey = OnboardingSurvey(user_id=user_id)

            survey.role = data.get("role", "")
            survey.email = data.get("email") or request.user.email
            survey.heard_about_us = data.get("heard_about_us", "")
            survey.purpose = data.get("purpose", "")
            survey.plan_chosen = data.get("plan_chosen", "")
            survey.completed_at = completed_at
            survey.save()

            request.user.onboarding_completed = True
            request.user.onboarding_completed_at = completed_at
            request.user.save()

            return Response(
                {
                    "status": "success",
                    "message": "Onboarding survey saved successfully.",
                    "user": UserSerializer(request.user).data,
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {
                "status": "error",
                "message": "Onboarding survey validation failed.",
                "details": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
