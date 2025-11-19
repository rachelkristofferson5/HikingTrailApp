from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Park, Trail, SavedTrail, Review, TrailCondition, Photo, Tag, TrailFeature
from .serializers import (ParkSerializer, TrailSerializer, SavedTrailSerializer, 
                          ReviewSerializer, TrailConditionSerializer, PhotoSerializer,
                          TagSerializer, TrailFeatureSerializer, TrailPhotoUploadSerializer)
import cloudinary.uploader


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
    """ViewSet for trail and hike photos"""
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """Filter photos by trail or user if specified"""
        queryset = Photo.objects.all()
        
        trail_id = self.request.query_params.get("trail_id", None)
        if trail_id:
            queryset = queryset.filter(trail_id=trail_id)
        
        user_id = self.request.query_params.get("user_id", None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        return queryset
    
    @action(detail=False, methods=["post"], url_path="upload")
    def upload_photo(self, request):
        """Upload a photo to Cloudinary and create database entry"""
        serializer = TrailPhotoUploadSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        photo_file = serializer.validated_data["photo"]
        trail_id = serializer.validated_data.get("trail_id")
        caption = serializer.validated_data.get("caption", "")
        latitude = serializer.validated_data.get("decimal_latitude")
        longitude = serializer.validated_data.get("decimal_longitude")
        
        # Trail is optional
        trail = None
        if trail_id:
            try:
                trail = Trail.objects.get(trail_id=trail_id)
            except Trail.DoesNotExist:
                return Response({"error": "Trail not found"},
                                status=status.HTTP_404_NOT_FOUND)
        
        try:
            # Determine folder based on whether it's a trail photo
            folder = f"hiking_app/trail_photos/trail_{trail_id}" if trail_id else "hiking_app/user_photos"
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                photo_file,
                folder=folder,
                resource_type="image",
                transformation=[{"quality": "auto"}, {"fetch_format": "auto"}]
            )
            
            # Create database entry
            photo = Photo.objects.create(
                user=request.user,
                trail=trail,
                photo_url=upload_result["secure_url"],
                caption=caption,
                decimal_latitude=latitude,
                decimal_longitude=longitude
            )
            
            response_serializer = PhotoSerializer(photo)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": f"Upload failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        """Delete photo - only owner can delete"""
        photo = self.get_object()
    
        if photo.user != request.user:
            return Response({"error": "You can only delete your own photos"},
                            status=status.HTTP_403_FORBIDDEN)
    
        # Delete from Cloudinary
        try:
            # Extract public_id from Cloudinary URL
            url_parts = photo.photo_url.split("/")
            # Find the index of the folder name in the URL
            folder_start = None
            for i, part in enumerate(url_parts):
                if part == "hiking_app":
                    folder_start = i
                    break
        
            if folder_start:
                # Get everything from hiking_app onwards, remove file extension
                path_parts = url_parts[folder_start:]
                public_id = "/".join(path_parts).rsplit(".", 1)[0]
                cloudinary.uploader.destroy(public_id)
        except Exception as e:
            # Continue even if Cloudinary deletion fails
            print(f"Cloudinary deletion warning: {str(e)}")
    
        # Delete from database
        photo.delete()
        return Response({"message": "Photo deleted successfully"}, 
                        status=status.HTTP_204_NO_CONTENT)


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