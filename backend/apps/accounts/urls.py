from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    TokenRefreshView,
    MeView,
    PasswordChangeView,
    AdminStatsView,
    UserFeedbackView,
    OnboardingSurveyView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='user_profile'),
    path('password/', PasswordChangeView.as_view(), name='password_change'),
    path('admin-stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('feedback/', UserFeedbackView.as_view(), name='user_feedback'),
    path('onboarding-survey/', OnboardingSurveyView.as_view(), name='onboarding_survey'),
]
