import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

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
        response.data = {
            'status': 'error',
            'message': response.data.get('detail', str(exc)),
            'details': response.data
        }
        return response

    # Log unhandled exceptions (e.g. database disconnect, type errors, etc.)
    logger.exception("Unhandled server exception occurred: %s", str(exc))

    return Response(
        {
            'status': 'error',
            'message': 'An unexpected server error occurred. Please try again later.',
            'details': str(exc) if context.get('request').META.get('HTTP_HOST') in ['localhost', '127.0.0.1'] else {}
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
