import datetime
import mongoengine
from django.contrib.auth.hashers import make_password, check_password


class User(mongoengine.Document):
    """
    MongoEngine Document representing a User in MongoDB.
    Includes a compatibility layer for Django auth and SimpleJWT.
    """
    username = mongoengine.StringField(required=True, unique=True, max_length=150)
    email = mongoengine.EmailField(required=True, unique=True)
    password = mongoengine.StringField(required=True)
    profile_picture_url = mongoengine.StringField(default="")
    subscription_plan = mongoengine.StringField(
        choices=("Free", "Weekly", "Monthly", "Yearly"),
        default="Free"
    )
    created_at = mongoengine.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'users',
        'indexes': ['username', 'email']
    }

    # --- Django Auth Compatibility Interface ---
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def pk(self):
        return str(self.id)

    def set_password(self, raw_password):
        """
        Hashes the password using Django's configured password hashing backend (PBKDF2).
        """
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """
        Verifies the raw password against the stored hash.
        """
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.username
