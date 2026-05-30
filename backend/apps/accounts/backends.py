from apps.accounts.models import User


class MongoEngineAuthBackend:
    """
    Custom authentication backend to authenticate users against MongoDB 
    documents using username or email.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username:
            username = kwargs.get('email')

        if not username or not password:
            return None

        try:
            # Authenticate via email or username
            if '@' in username:
                user = User.objects.get(email=username)
            else:
                user = User.objects.get(username=username)

            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None

        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except Exception:
            return None
