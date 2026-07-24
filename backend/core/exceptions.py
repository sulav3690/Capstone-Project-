import logging
from django.conf import settings
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from pymongo.errors import ConnectionFailure

logger = logging.getLogger(__name__)


def global_exception_handler(exc, context):
    """
    Custom exception handler to return clean JSON error payloads
    instead of native Django crash dumps.
    """
    # Call REST framework's default exception handler first to get the standard response.
    response = exception_handler(exc, context)

    if response is not None:
        # Structure the payload: { "error": "Main Error Message", "details": ... }
        response_details = response.data
        if isinstance(response_details, dict):
            message = response_details.get('detail', str(exc))
        else:
            message = str(exc)
        response.data = {
            'status': 'error',
            'message': message,
            'details': response_details
        }
        return response

    # Log unhandled exceptions (e.g. database disconnect, type errors, etc.)
    logger.exception("Unhandled server exception occurred: %s", str(exc))

    if isinstance(exc, ConnectionFailure):
        error_status = status.HTTP_503_SERVICE_UNAVAILABLE
        message = 'The database service is temporarily unavailable. Please try again shortly.'
    else:
        error_status = status.HTTP_500_INTERNAL_SERVER_ERROR
        message = 'An unexpected server error occurred. Please try again later.'

    payload = {
        'status': 'error',
        'message': message,
    }
    if settings.DEBUG:
        payload['details'] = str(exc)

    return Response(payload, status=error_status)
