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
    
    class Meta:
        model = Photo
        fields = "__all__"
        read_only_fields = ["uploaded_at"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = "__all__"


class TrailFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrailFeature
        fields = "__all__"