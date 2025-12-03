from rest_framework import serializers
from .models import Hike, GPSTrack, GPSPoint
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """User infor"""
    class Meta:
        model = User
        fields = ["user_id", "username"]


class GPSPointSerializer(serializers.ModelSerializer):
    """GPS coordinate point"""
    coordinates = serializers.ReadOnlyField()

    class Meta:
        model = GPSPoint
        fields = ["point_id", "track", "latitude", "longitude", "altitude_feet",
                   "accuracy_feet", "speed_mps", "recorded_at", "point_order", 
                   "coordinates"]
        read_only_fields = ["point_id"]


class GPSPointCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating points during tracking"""

    class Meta:
        model = GPSPoint
        fields = ["latitude", "longitude", "altitude_miles", "accuracy_miles", 
                  "speed_mps", "recorded_at", "point_order"]

class GPSTrackSerializer(serializers.ModelSerializer):
    """All the points"""
    user = UserSerializer(read_only = True)
    gps_points = GPSPointSerializer(many=True, read_only=True)
    point_count = serializers.SerializerMethodField()

    class Meta:
        model = GPSTrack
        fields = ["track_id", "hike", "user", "started_at", "ended_at", 
                  "total_distance_miles", "text_gps_data", "gps_points", 
                  "point_count"]
        read_only_fields = ["track_id", "user", "started_at"]
    
    def get_point_count(self, obj):
        return obj.points_count()
    

class GPSTrackListSerializer(serializers.ModelSerializer):
    """Track serializer for list views"""
    user = UserSerializer(read_only=True)
    point_count = serializers.SerializerMethodField()

    class Meta:
        model = GPSTrack
        fields = ["track_id", "hike", "user", "started_at", "ended_at", 
                  "total_distance_miles", "point_count"]
        read_only_fields = ["track_id", "user"]

    def get_point_count(self, obj):
        return obj.point.count()
    

class HikeSerializer(serializers.ModelSerializer):
    """Complete the hike witht the GPS points"""
    user = UserSerializer(read_only=True)
    gps_tracks = GPSTrackListSerializer(many=True, read_only=True)
    trail_name = serializers.CharField(source="trail.name", read_only=True)

    class Meta:
        model = Hike
        fields = ["hike_id", "user", "trail", "trail_name", "start_time", 
                  "end_time", "duration_min", "distance_miles", "notes", 
                  "weather_conditions", "completed", "gps_tracks", "created_at"]
        read_only_fields = ["hike_id", "user", "duration_min", "created_at"]


class HikeListSerializer(serializers.ModelSerializer):
    """Serializer for the list of hikes done by user"""
    user = UserSerializer(read_only=True)
    trail_name = serializers.CharField(source="trail.name", read_only=True)
    track_count = serializers.SerializerMethodField()

    class Meta:
        model = Hike
        fields = ["hike_id", "user", "trail", "trail_name", "start_time", 
                  "end_time", "duration_min", "distance_miles", "completed", 
                  "track_count", "created_at"]
        read_only_fields = ["hike_id", "user", "created_at"]


    def get_track_count(self, obj):
        return obj.gps_tracks.count()
    
class StartHikeSerializer(serializers.ModelSerializer):
    """Serializer for starting a new hike"""
    class Meta:
        model = Hike
        fields = ["trail", "start_time", "weather_conditions", "notes"]


class CompleteHikeSerializer(serializers.ModelSerializer):
    """Serializer for completing a hike"""
    class Meta:
        model = Hike
        read_only_fields = ["duration_min"]

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        # Calculate the time it took to complete hike
        if instance.completed and instance.end_time:
            instance.calculate_duration()
        return instance