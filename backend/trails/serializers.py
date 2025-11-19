from rest_framework import serializers
from .models import Park, Trail, SavedTrail, Review, TrailCondition, Photo, Tag, TrailTag, TrailFeature


class ParkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Park
        fields = "__all__"


class TrailSerializer(serializers.ModelSerializer):
    park_name = serializers.CharField(source="park.park_name", read_only=True)
    
    class Meta:
        model = Trail
        fields = "__all__"


class SavedTrailSerializer(serializers.ModelSerializer):
    trail_name = serializers.CharField(source="trail.name", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    
    class Meta:
        model = SavedTrail
        fields = "__all__"
        read_only_fields = ["saved_at"]


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    trail_name = serializers.CharField(source="trail.name", read_only=True)
    
    class Meta:
        model = Review
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class TrailConditionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    trail_name = serializers.CharField(source="trail.name", read_only=True)
    
    class Meta:
        model = TrailCondition
        fields = "__all__"


class PhotoSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    trail_name = serializers.CharField(source="trail.name", read_only=True)
    
    class Meta:
        model = Photo
        fields = ["photo_id", "user", "username", "trail", "trail_name", 
                  "hike", "photo_url", "caption", "decimal_latitude", 
                  "decimal_longitude", "uploaded_at"]
        read_only_fields = ["photo_id", "user", "uploaded_at"]


class TrailPhotoUploadSerializer(serializers.Serializer):
    """Serializer for handling photo uploads"""
    photo = serializers.ImageField()
    trail_id = serializers.IntegerField(required=False, allow_null=True)
    caption = serializers.CharField(required=False, allow_blank=True)
    decimal_latitude = serializers.DecimalField(max_digits=10, decimal_places=7, 
                                                required=False, allow_null=True)
    decimal_longitude = serializers.DecimalField(max_digits=10, decimal_places=7,
                                                required=False, allow_null=True)

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"


class TrailFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrailFeature
        fields = "__all__"