import re
import uuid
from rest_framework import serializers
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from apps.accounts.models import User


class UserSerializer(serializers.Serializer):
    """
    Serializer to represent User details to client.
    """
    id = serializers.CharField(read_only=True)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    profile_picture_url = serializers.CharField(read_only=True)
    subscription_plan = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class RegisterSerializer(serializers.Serializer):
    """
    Serializer to validate user registration inputs.
    Creates a new hashed MongoEngine User document.
    """
    username = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8, required=True)

    def validate_username(self, value):
        if User.objects(username=value).first():
            raise serializers.ValidationError("A user with this username already exists.")
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError("Enter a valid username containing only letters, numbers, and @/./+/-/_.")
        return value

    def validate_email(self, value):
        if User.objects(email=value).first():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
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

    def validate(self, attrs):
        user = self.context['request'].user
        username = attrs.get('username')
        email = attrs.get('email')

        if username and username != user.username:
            if User.objects(username=username).first():
                raise serializers.ValidationError({"username": "Username already taken."})

        if email and email != user.email:
            if User.objects(email=email).first():
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
