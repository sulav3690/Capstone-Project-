from .base import *

DEBUG = True

ALLOWED_HOSTS = [
    origin.strip().replace('http://', '').replace('https://', '').split(':')[0]
    for origin in config('CORS_ALLOWED_ORIGINS', default='localhost,127.0.0.1').split(',')
] + ['localhost', '127.0.0.1', 'web']

# Custom dev logs to console
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
