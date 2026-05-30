from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # API endpoints
    path('api/auth/', include('apps.accounts.urls')),
    path('api/analyze/', include('apps.detector.urls')),
    path('api/health/', include('apps.health.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
