from django.urls import path

from .payment_views import (
    EsewaFailureView,
    EsewaInitiateView,
    EsewaTransactionView,
    EsewaVerifyView,
    KhaltiInitiateView,
    KhaltiTransactionView,
    KhaltiVerifyView,
)


urlpatterns = [
    path('esewa/initiate/', EsewaInitiateView.as_view(), name='esewa_initiate'),
    path('esewa/verify/', EsewaVerifyView.as_view(), name='esewa_verify'),
    path(
        'esewa/transactions/<str:transaction_uuid>/',
        EsewaTransactionView.as_view(),
        name='esewa_transaction',
    ),
    path(
        'esewa/transactions/<str:transaction_uuid>/failure/',
        EsewaFailureView.as_view(),
        name='esewa_failure',
    ),
    path('khalti/initiate/', KhaltiInitiateView.as_view(), name='khalti_initiate'),
    path('khalti/verify/', KhaltiVerifyView.as_view(), name='khalti_verify'),
    path(
        'khalti/transactions/<str:transaction_uuid>/',
        KhaltiTransactionView.as_view(),
        name='khalti_transaction',
    ),
]
