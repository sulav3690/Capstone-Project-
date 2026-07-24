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
    full_name = mongoengine.StringField(default="", max_length=255)
    phone = mongoengine.StringField(default="", max_length=30)
    country_code = mongoengine.StringField(default="", max_length=10)
    role = mongoengine.StringField(
        choices=("student", "teacher", "other"),
        default="other"
    )
    profile_picture_url = mongoengine.StringField(default="")
    subscription_plan = mongoengine.StringField(
        choices=("Free", "Weekly", "Monthly", "Yearly"),
        default="Free"
    )
    subscription_started_at = mongoengine.DateTimeField(null=True)
    subscription_expires_at = mongoengine.DateTimeField(null=True)
    # Existing records do not contain this field, so they inherit True and
    # bypass onboarding. Registration explicitly sets False for new accounts.
    onboarding_completed = mongoengine.BooleanField(default=True)
    onboarding_completed_at = mongoengine.DateTimeField(null=True)
    is_admin = mongoengine.BooleanField(default=False)
    created_at = mongoengine.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'users',
        'indexes': ['username', 'email'],
        'auto_create_index_on_save': False,
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

    def expire_subscription_if_needed(self, now=None):
        """Downgrade a timed paid plan after its verified billing period ends."""
        now = now or datetime.datetime.utcnow()
        if (
            self.subscription_plan != "Free"
            and self.subscription_expires_at
            and self.subscription_expires_at <= now
        ):
            self.subscription_plan = "Free"
            self.subscription_started_at = None
            self.subscription_expires_at = None
            self.save()
            return True
        return False

    def __str__(self):
        return self.username


class SupportTicket(mongoengine.Document):
    """
    MongoEngine Document representing a Support Ticket.
    """
    name = mongoengine.StringField(required=True)
    email = mongoengine.EmailField(required=True)
    subject = mongoengine.StringField(required=True)
    message = mongoengine.StringField(required=True)
    user_id = mongoengine.StringField(default="")
    subscription_plan = mongoengine.StringField(default="Free")
    priority = mongoengine.StringField(
        choices=("community", "standard", "priority"),
        default="community",
    )
    created_at = mongoengine.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'support_tickets',
        'indexes': ['email', '-created_at'],
        'auto_create_index_on_save': False,
    }

    def __str__(self):
        return f"{self.subject} - {self.email}"


class UserFeedback(mongoengine.Document):
    """
    MongoEngine Document representing general user feedback survey answers.
    """
    hear_about_us = mongoengine.StringField(default="")
    role = mongoengine.StringField(default="")
    ai_usage = mongoengine.StringField(default="")
    why_choose_us = mongoengine.ListField(mongoengine.StringField(), default=list)
    created_at = mongoengine.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'user_feedback',
        'indexes': ['role', '-created_at'],
        'auto_create_index_on_save': False,
    }


class OnboardingSurvey(mongoengine.Document):
    """
    MongoEngine Document representing onboarding survey answers.
    """
    user_id = mongoengine.StringField(required=False)
    role = mongoengine.StringField(default="")
    email = mongoengine.EmailField(required=False)
    heard_about_us = mongoengine.StringField(default="")
    purpose = mongoengine.StringField(default="")
    plan_chosen = mongoengine.StringField(default="")
    completed_at = mongoengine.DateTimeField(default=datetime.datetime.utcnow)
    created_at = mongoengine.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'onboarding_surveys',
        'indexes': [
            'role',
            'plan_chosen',
            '-created_at',
            {'fields': ['user_id'], 'unique': True, 'sparse': True},
        ],
        'auto_create_index': False,
        'auto_create_index_on_save': False,
    }


class PaymentTransaction(mongoengine.Document):
    """Immutable pricing snapshot and lifecycle record for a provider payment."""

    user_id = mongoengine.StringField(required=True)
    username = mongoengine.StringField(default="")
    email = mongoengine.EmailField(required=False)
    provider = mongoengine.StringField(
        default="esewa",
        choices=("esewa", "khalti"),
    )
    plan_code = mongoengine.StringField(required=True)
    plan_name = mongoengine.StringField(required=True, choices=("Monthly", "Yearly"))
    duration_months = mongoengine.IntField(required=True, choices=(1, 12))
    currency = mongoengine.StringField(default="NPR", choices=("NPR",))
    amount = mongoengine.StringField(required=True)
    tax_amount = mongoengine.StringField(required=True)
    service_charge = mongoengine.StringField(default="0.00")
    delivery_charge = mongoengine.StringField(default="0.00")
    total_amount = mongoengine.StringField(required=True)
    transaction_uuid = mongoengine.StringField(required=True)
    product_code = mongoengine.StringField(required=True)
    provider_payment_id = mongoengine.StringField(default="")
    status = mongoengine.StringField(
        default="INITIATED",
        choices=(
            "INITIATED",
            "PENDING",
            "COMPLETE",
            "FAILED",
            "CANCELED",
            "NOT_FOUND",
            "AMBIGUOUS",
            "EXPIRED",
            "REFUNDED",
            "PARTIALLY_REFUNDED",
        ),
    )
    reference_id = mongoengine.StringField(default="")
    provider_response = mongoengine.DictField(default=dict)
    created_at = mongoengine.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = mongoengine.DateTimeField(default=datetime.datetime.utcnow)
    completed_at = mongoengine.DateTimeField(null=True)

    meta = {
        'collection': 'payment_transactions',
        'indexes': [
            {'fields': ['transaction_uuid'], 'unique': True},
            {'fields': ['provider_payment_id'], 'sparse': True},
            {'fields': ['user_id', '-created_at']},
            'status',
        ],
        'auto_create_index': False,
        'auto_create_index_on_save': False,
    }
