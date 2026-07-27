import os
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from decouple import config
import mongoengine

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

SECRET_KEY = config('SECRET_KEY', default='django-insecure-default-key-for-local-dev-only-change-this')

# Application definition
INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party packages
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Custom local apps
    'apps.accounts.apps.AccountsConfig',
    'apps.detector.apps.DetectorConfig',
    'apps.health.apps.HealthConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    
    # Custom Rate Limiter (Redis-backed)
    'middleware.rate_limit.RateLimitMiddleware',
    
    # Custom Compression (Gzip/Brotli lossy/lossless wrapper)
    'middleware.compression.CompressionMiddleware',
    
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    # CSP Middleware
    'csp.middleware.CSPMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'


# Dummy SQL database configuration to keep Django system checks happy.
# All application data will go to MongoDB via MongoEngine.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Connect MongoEngine. Keep selection timeouts short so a degraded Atlas
# cluster produces a prompt 503 instead of leaving every request hanging.
MONGO_URI = config('MONGO_URI', default='mongodb://localhost:27017/veritas_db')
MONGO_DB_NAME = config('MONGO_DB_NAME', default='veritas_db')
MONGO_CONNECT_TIMEOUT_MS = config('MONGO_CONNECT_TIMEOUT_MS', default=8000, cast=int)

# MongoEngine gives a database embedded in the URI precedence over the explicit
# ``db`` argument. Remove only the URI path so MONGO_DB_NAME always selects the
# intended database (especially the isolated database used by tests).
_mongo_uri_parts = urlsplit(MONGO_URI)
MONGO_CONNECTION_URI = urlunsplit(
    (
        _mongo_uri_parts.scheme,
        _mongo_uri_parts.netloc,
        '/',
        _mongo_uri_parts.query,
        _mongo_uri_parts.fragment,
    )
)
# eSewa ePay v2. Local development uses the provider's public UAT merchant.
# Production must override all ESEWA_* values with live merchant credentials.
FRONTEND_BASE_URL = config('FRONTEND_BASE_URL', default='http://localhost:3000').rstrip('/')
ESEWA_ENVIRONMENT = config('ESEWA_ENVIRONMENT', default='sandbox')
ESEWA_PRODUCT_CODE = config('ESEWA_PRODUCT_CODE', default='EPAYTEST')
ESEWA_SECRET_KEY = config('ESEWA_SECRET_KEY', default='8gBm/:&EnhH.1/q')
ESEWA_FORM_URL = config(
    'ESEWA_FORM_URL',
    default='https://rc-epay.esewa.com.np/api/epay/main/v2/form',
)
ESEWA_STATUS_URL = config(
    'ESEWA_STATUS_URL',
    default='https://rc.esewa.com.np/api/epay/transaction/status/',
)
ESEWA_HTTP_TIMEOUT_SECONDS = config('ESEWA_HTTP_TIMEOUT_SECONDS', default=12, cast=int)

# Khalti KPG-2. The sandbox secret key comes from test-admin.khalti.com and
# must remain server-side. Production must use the live API URL and live key.
KHALTI_ENVIRONMENT = config('KHALTI_ENVIRONMENT', default='sandbox')
KHALTI_SECRET_KEY = config('KHALTI_SECRET_KEY', default='')
KHALTI_API_BASE_URL = config(
    'KHALTI_API_BASE_URL',
    default='https://dev.khalti.com/api/v2',
).rstrip('/')
KHALTI_WEBSITE_URL = config(
    'KHALTI_WEBSITE_URL',
    default=FRONTEND_BASE_URL,
).rstrip('/')
KHALTI_HTTP_TIMEOUT_SECONDS = config(
    'KHALTI_HTTP_TIMEOUT_SECONDS',
    default=12,
    cast=int,
)
AI_DETECTOR_MODEL_DIR = config(
    'AI_DETECTOR_MODEL_DIR',
    default=str(BASE_DIR.parent / 'ai-detector' / 'roberta_ai_detector_v3_final'),
)
AI_DETECTOR_REQUIRE_MODEL = config(
    'AI_DETECTOR_REQUIRE_MODEL',
    default=False,
    cast=bool,
)
try:
    mongoengine.register_connection(
        alias='default',
        db=MONGO_DB_NAME,
        host=MONGO_CONNECTION_URI,
        connect=False,
        serverSelectionTimeoutMS=MONGO_CONNECT_TIMEOUT_MS,
        connectTimeoutMS=MONGO_CONNECT_TIMEOUT_MS,
        socketTimeoutMS=max(MONGO_CONNECT_TIMEOUT_MS * 2, 10000),
        retryReads=True,
        retryWrites=True,
        uuidRepresentation='standard',
    )
    print(
        f"MongoDB client configured for: "
        f"{MONGO_CONNECTION_URI.split('@')[-1]} (database: {MONGO_DB_NAME})"
    )  # Redact secrets in logs
except Exception as e:
    print(f"Error configuring MongoDB: {e}")

# Redis & Caching Configuration
# Local development can run without Redis. Enable it on the deployed website
# with USE_REDIS=True and a REDIS_URL value.
USE_REDIS = config('USE_REDIS', default=False, cast=bool)
REDIS_URL = config('REDIS_URL', default='redis://localhost:6379/0')
if USE_REDIS:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'SERIALIZER': 'django_redis.serializers.json.JSONSerializer',
            }
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'veritas-local-cache',
        }
    }

# Custom Auth Backend to support MongoEngine Documents
AUTHENTICATION_BACKENDS = [
    'apps.accounts.backends.MongoEngineAuthBackend',
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'apps.accounts.authentication.CookieJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'EXCEPTION_HANDLER': 'core.exceptions.global_exception_handler',
}

# Simple JWT configurations
ACCESS_TOKEN_LIFETIME_MINUTES = config('ACCESS_TOKEN_LIFETIME_MINUTES', default=15, cast=int)
REFRESH_TOKEN_LIFETIME_DAYS = config('REFRESH_TOKEN_LIFETIME_DAYS', default=7, cast=int)

# Celery Broker
CELERY_BROKER_URL = REDIS_URL if USE_REDIS else 'memory://'
CELERY_RESULT_BACKEND = REDIS_URL if USE_REDIS else 'cache+memory://'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_TASK_DEFAULT_PRIORITY = 0
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_BROKER_TRANSPORT_OPTIONS = {
    'priority_steps': list(range(10)),
    'queue_order_strategy': 'priority',
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Password Hashers - Argon2 is preferred, PBKDF2 as fallback
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (for user profile uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Config
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in config(
        'CORS_ALLOWED_ORIGINS',
        default='http://localhost:3000,http://127.0.0.1:3000'
    ).split(',')
    if origin.strip()
]
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# Reject unexpectedly large request bodies before they consume application
# memory. The largest advertised text tier supports up to 500,000 words.
DATA_UPLOAD_MAX_MEMORY_SIZE = 12 * 1024 * 1024

# Content Security Policy (CSP) Configurations
CSP_DEFAULT_SRC = ("'self'",)
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'", "https://fonts.googleapis.com")
CSP_FONT_SRC = ("'self'", "https://fonts.gstatic.com")
CSP_SCRIPT_SRC = ("'self'",)
CSP_IMG_SRC = ("'self'", "data:", config('MEDIA_URL', default='/media/'))
CSP_CONNECT_SRC = ("'self'",)
