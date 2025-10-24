from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Park, Trail, SavedTrail, Review, TrailCondition, Photo, Tag, TrailFeature
from .serializers import (
    ParkSerializer, TrailSerializer, SavedTrailSerializer, 
    ReviewSerializer, TrailConditionSerializer, PhotoSerializer,
    TagSerializer, TrailFeatureSerializer
)


class ParkViewSet(viewsets.ModelViewSet):
    """API endpoint for parks"""
    queryset = Park.objects.all()
    serializer_class = ParkSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class TrailViewSet(viewsets.ModelViewSet):
    """API endpoint for trails"""
    queryset = Trail.objects.all()
    serializer_class = TrailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=["get"])
    def by_park(self, request):
        """Get trails by park ID"""
        park_id = request.query_params.get("park_id")
        if park_id:
            trails = self.queryset.filter(park_id=park_id)
            serializer = self.get_serializer(trails, many=True)
            return Response(serializer.data)
        return Response({"error": "park_id required"}, status=400)


class SavedTrailViewSet(viewsets.ModelViewSet):
    """API endpoint for saved trails"""
    queryset = SavedTrail.objects.all()
    serializer_class = SavedTrailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return saved trails for current user"""
        return self.queryset.filter(user=self.request.user)


class ReviewViewSet(viewsets.ModelViewSet):
    """API endpoint for reviews"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        """Set user to current user when creating review"""
        serializer.save(user=self.request.user)


class TrailConditionViewSet(viewsets.ModelViewSet):
    """API endpoint for trail conditions"""
    queryset = TrailCondition.objects.all()
    serializer_class = TrailConditionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PhotoViewSet(viewsets.ModelViewSet):
    """API endpoint for photos"""
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TagViewSet(viewsets.ModelViewSet):
    """API endpoint for tags"""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class TrailFeatureViewSet(viewsets.ModelViewSet):
    """API endpoint for trail features"""
    queryset = TrailFeature.objects.all()
    serializer_class = TrailFeatureSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]