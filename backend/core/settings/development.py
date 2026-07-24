from .base import *

DEBUG = True

ALLOWED_HOSTS = list({
    origin.strip().replace('http://', '').replace('https://', '').split(':')[0]
    for origin in config(
        'CORS_ALLOWED_ORIGINS',
        default='http://localhost:3000,http://127.0.0.1:3000'
    ).split(',')
    if origin.strip()
} | {'localhost', '127.0.0.1', 'web', 'testserver'})

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
