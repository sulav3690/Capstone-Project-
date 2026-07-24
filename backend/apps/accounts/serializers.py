import re
import uuid
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from .models import SupportTicket, User, UserFeedback
from .subscriptions import get_subscription_access


class UserSerializer(serializers.Serializer):
    """
    Serializer to represent User details to client.
    """
    id = serializers.CharField(read_only=True)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    full_name = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True)
    country_code = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)
    profile_picture_url = serializers.CharField(read_only=True)
    subscription_plan = serializers.CharField(read_only=True)
    subscription_started_at = serializers.DateTimeField(read_only=True, allow_null=True)
    subscription_expires_at = serializers.DateTimeField(read_only=True, allow_null=True)
    subscription_access = serializers.SerializerMethodField()
    onboarding_completed = serializers.BooleanField(read_only=True)
    onboarding_completed_at = serializers.DateTimeField(read_only=True, allow_null=True)
    is_admin = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    def get_subscription_access(self, user):
        return get_subscription_access(user)


class RegisterSerializer(serializers.Serializer):
    """
    Serializer to validate user registration inputs.
    Creates a new hashed MongoEngine User document.
    """
    username = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8, required=True)
    full_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    country_code = serializers.CharField(max_length=10, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=("student", "teacher", "other"), required=False)

    def validate_username(self, value):
        value = value.strip()
        if User.objects(username__iexact=value).first():
            raise serializers.ValidationError("A user with this username already exists.")
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError("Enter a valid username containing only letters, numbers, and @/./+/-/_.")
        return value

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects(email__iexact=value).first():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value

    def validate_password(self, value):
        if not re.search(r'[a-z]', value) or not re.search(r'[A-Z]', value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase and one lowercase letter."
            )
        if not re.search(r'[0-9]|[^a-zA-Z0-9]', value):
            raise serializers.ValidationError(
                "Password must contain at least one number or symbol."
            )
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value

    def validate_phone(self, value):
        value = re.sub(r'\D', '', value or '')
        if value and not re.match(r'^[0-9]{7,15}$', value):
            raise serializers.ValidationError("Phone number must contain 7 to 15 digits.")
        return value

    def validate_role(self, value):
        return (value or 'other').strip().lower()

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=validated_data.get('full_name', ''),
            phone=validated_data.get('phone', ''),
            country_code=validated_data.get('country_code', ''),
            role=validated_data.get('role', 'other'),
            onboarding_completed=False,
            onboarding_completed_at=None,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class ProfileUpdateSerializer(serializers.Serializer):
    """
    Serializer to validate profile updates, including uploading profile images.
    """
    username = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False)
    profile_picture = serializers.ImageField(required=False, write_only=True)
    subscription_plan = serializers.CharField(required=False, write_only=True)

    def validate_username(self, value):
        value = value.strip()
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError(
                "Enter a valid username containing only letters, numbers, and @/./+/-/_."
            )
        return value

    def validate_email(self, value):
        return value.strip().lower()

    def validate_subscription_plan(self, value):
        raise serializers.ValidationError(
            "Subscription plans cannot be changed through profile updates."
        )

    def validate(self, attrs):
        user = self.context['request'].user
        username = attrs.get('username')
        email = attrs.get('email')

        if username and username != user.username:
            if User.objects(username__iexact=username).first():
                raise serializers.ValidationError({"username": "Username already taken."})

        if email and email != user.email:
            if User.objects(email__iexact=email).first():
                raise serializers.ValidationError({"email": "Email already in use."})

        return attrs

    def update(self, instance, validated_data):
        username = validated_data.get('username')
        email = validated_data.get('email')
        profile_picture = validated_data.get('profile_picture')

        if username:
            instance.username = username
        if email:
            instance.email = email
        if profile_picture:
            # Generate a secure unique file name
            ext = profile_picture.name.split('.')[-1]
            filename = f"profile_pics/{uuid.uuid4().hex}.{ext}"
            
            # Save the file using Django's default storage
            saved_path = default_storage.save(filename, ContentFile(profile_picture.read()))
            
            # Save the URL
            instance.profile_picture_url = f"{settings.MEDIA_URL}{saved_path}"

        instance.save()
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)

    def validate_current_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        if not re.search(r'[a-z]', value) or not re.search(r'[A-Z]', value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase and one lowercase letter."
            )
        if not re.search(r'[0-9]|[^a-zA-Z0-9]', value):
            raise serializers.ValidationError(
                "Password must contain at least one number or symbol."
            )
        return value


class SupportTicketSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, trim_whitespace=True)
    email = serializers.EmailField()
    subject = serializers.CharField(max_length=255, trim_whitespace=True)
    message = serializers.CharField(min_length=10, max_length=5000, trim_whitespace=True)

    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and getattr(user, "is_authenticated", False):
            access = get_subscription_access(user, include_usage=False)
            validated_data.update(
                {
                    "user_id": str(user.id),
                    "subscription_plan": access["plan"],
                    "priority": access["support_tier"],
                }
            )
        ticket = SupportTicket(**validated_data)
        ticket.save()
        return ticket


class UserFeedbackSerializer(serializers.Serializer):
    hear_about_us = serializers.CharField(required=False, allow_blank=True, max_length=255)
    role = serializers.CharField(required=False, allow_blank=True, max_length=100)
    ai_usage = serializers.CharField(required=False, allow_blank=True, max_length=255)
    why_choose_us = serializers.ListField(
        child=serializers.CharField(max_length=255),
        required=False,
        max_length=20
    )

    def create(self, validated_data):
        feedback = UserFeedback(**validated_data)
        feedback.save()
        return feedback


class OnboardingSurveySerializer(serializers.Serializer):
    role = serializers.CharField(required=False, allow_blank=True, max_length=100)
    email = serializers.EmailField(required=False, allow_blank=True)
    heard_about_us = serializers.CharField(required=False, allow_blank=True, max_length=255)
    purpose = serializers.CharField(required=False, allow_blank=True, max_length=500)
    plan_chosen = serializers.CharField(required=False, allow_blank=True, max_length=100)
    completed_at = serializers.DateTimeField(required=False)
