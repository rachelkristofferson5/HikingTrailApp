from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Hike, GPSTrack, GPSPoint
from .serializers import (
    HikeSerializer,
    HikeListSerializer,
    StartHikeSerializer,
    CompleteHikeSerializer,
    GPSTrackSerializer,
    GPSTrackListSerializer,
    GPSPointSerializer,
    GPSPointCreateSerializer
)

class HikeViewSet(viewsets.ModelViewSet):
    """API endpoint for managing hikes"""
    queryset = Hike.objects.select_related("user", "trail").prefetch_related("gps_tracks")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return HikeListSerializer
        elif self.action == "create":
            return StartHikeSerializer
        elif self.action == "complete":
            return CompleteHikeSerializer
        else:
            return HikeSerializer
        
    def get_queryset(self):
        queryset = super().get_queryset().filter(user=self.request.user)

        completed = self.request.query_params.get("completed")
        if completed is not None:
            queryset = queryset.filter(completed=completed.lower() == "true")

        trail_id = self.request.query_params.get("trail")
        if trail_id:
            queryset = queryset.filter(trail_id=trail_id)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        hike = self.get_object()

        if hike.completed:
            return Response({"ERROR" : "Hike already completed."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        serializer = CompleteHikeSerializer(hike, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(completed=True)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=["get"])
    def activate(self, request):
        active_hikes = self.get_queryset().filter(completed=False)
        serializer = self.get_serializer(active_hikes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=["get"])
    def stats(self, request):
        queryset = self.get_queryset()
        completed_hikes = queryset.filter(completed=True)

        stats = {"total_hikes": completed_hikes.count(), 
                 "total_distance_miles": sum(hike.distance_miles for hike in 
                                             completed_hikes if hike.distance_miles), 
                 "total_duration_hours": sum(hike.duration_min for 
                                             hike in completed_hikes if hike.duration_min) / 60 if completed_hikes else 0, 
                 "active_hikes": queryset.filter(completed=False).count()}
        
        return Response(stats)
    
class GPSTrackViewSet(viewsets.ModelViewSet):
    """API endpoint for GPS tracks"""
    queryset = GPSTrack.objects.select_related("user", "hike").prefetch_related("gps_points")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return GPSTrackListSerializer
        return GPSTrackSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset().filter(user=self.request.user)

        hike_id = self.request.query_params.get("hike")
        if hike_id:
            queryset = queryset.filter(hike_id=hike_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user, started_at=timezone.now())

    @action(detail=True, methods=["post"])
    def stop(self, request, pk=None):
        track = self.get_object()

        if track.ended_at:
            return Response({"ERROR": "Track already stopped."},
                            status=status.HTTP_400_BAD_REQUEST)
        track.ended_at = timezone.now()
        track.save()

        serializer = self.get_serializer(track)
        return Response(serializer.data)
    
    @action(detail=True, methods=["post"])
    def add_track_point(self, request, pk=None):
        track = self.get_object()

        if track.ended_at:
            return Response({"ERROR": "Cannot add points to a stopped track"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        serializer = GPSPointCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(track=track)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class GPSPointViewSet(viewsets.ModelViewSet):
    """API endpoint for GPS points"""
    queryset = GPSPoint.objects.select_related("track")
    serializer_class = GPSPointSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset().filter(track__user=self.request.user)

        track_id = self.request.query_params.get("track")
        if track_id:
            queryset = queryset.filter(track_id=track_id)
        return queryset
    
    def create(self, request, *args, **kwargs):
        track_id = request.data.get("track")
        track = get_object_or_404(GPSTrack, track_id=track_id, user=request.user)

        if track.ended_at:
            return Response({"ERROR": "Cannot add points to a stopped track."},
                            status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)