from django.urls import path
from .views import (
    AnalyzeView,
    DocumentExtractView,
    JobStatusView,
    AnalysisHistoryView,
    AnalysisDetailView
)

urlpatterns = [
    path('', AnalyzeView.as_view(), name='analyze_text'),
    path('extract/', DocumentExtractView.as_view(), name='extract_document_text'),
    path('status/<str:job_id>/', JobStatusView.as_view(), name='analysis_job_status'),
    path('history/', AnalysisHistoryView.as_view(), name='analysis_history'),
    path('history/<str:pk>/', AnalysisDetailView.as_view(), name='analysis_detail'),
]
