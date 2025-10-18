from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """User info"""
    class Meta:
        model = User
        fields = ["user_id", "username", "email", "full_name", "profile_photo_url", 
                  "bio", "experience_level", "created_at"]
        read_only_fields = ["user_id", "created_at"]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ["username", "email", "password", "password_confirm", "full_name"]
    
    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError({"password": "Passwords don"t match"})
        return data
    
    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data.get("full_name", "")
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """User login"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)