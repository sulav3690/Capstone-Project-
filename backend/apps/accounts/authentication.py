from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from apps.accounts.models import User


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
        except Exception as e:
            raise AuthenticationFailed('Invalid or expired access token') from e

        # 4. Fetch the MongoEngine user object
        return self.get_user(validated_token), validated_token

    def get_user(self, validated_token):
        try:
            user_id = validated_token.get('user_id')
            user = User.objects.get(id=user_id)
            return user
        except Exception:
            raise AuthenticationFailed('User does not exist')
