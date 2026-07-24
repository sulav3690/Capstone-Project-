from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken
from mongoengine.errors import ValidationError as MongoValidationError
from .models import User


class CookieJWTAuthentication(JWTAuthentication):
    """
    Overrides simplejwt's default JWT authentication to read tokens from
    HTTPOnly cookies (access_token) with a fallback to the standard
    'Authorization: Bearer <token>' header.
    """
    def authenticate(self, request):
        # 1. Look in cookies first
        raw_token = request.COOKIES.get('access_token')

        # 2. Fallback to header authorization
        if raw_token is None:
            header = self.get_header(request)
            if header is None:
                return None
            raw_token = self.get_raw_token(header)

        if raw_token is None:
            return None

        # 3. Validate
        try:
            validated_token = self.get_validated_token(raw_token)
        except InvalidToken:
            # Return None instead of raising so that AllowAny views
            # (register, login) still work when a stale cookie exists.
            # IsAuthenticated views will still deny access because
            # request.user will be AnonymousUser.
            return None

        # 4. Fetch the MongoEngine user object
        try:
            user = self.get_user(validated_token)
        except AuthenticationFailed:
            # A correctly signed token can outlive a user deleted from MongoDB.
            # Treat that browser as signed out so login/register/logout can
            # recover, while protected views still return 401.
            return None
        return user, validated_token

    def get_user(self, validated_token):
        user_id = validated_token.get('user_id')
        if not user_id:
            raise AuthenticationFailed('Session is no longer valid.')
        try:
            user = User.objects.get(id=user_id)
            user.expire_subscription_if_needed()
            return user
        except (User.DoesNotExist, MongoValidationError) as exc:
            raise AuthenticationFailed('Session is no longer valid.') from exc
