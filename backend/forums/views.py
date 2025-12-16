from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import ForumCategory, ForumThread, ForumPost, ForumPostPhoto
from .serializers import (
    ForumCategorySerializer,
    ForumThreadListSerializer,
    ForumThreadDetailSerializer,
    CreateThreadSerializer,
    ForumPostSerializer,
    ForumPostPhotoSerializer,
    ForumPostPhotoUploadSerializer, # used in upload_photo method
)
import cloudinary.uploader


class ForumCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ 
        API endpoint for viewing forum categories. Read only because only the 
        admins can create the categories.
    """
    queryset = ForumCategory.objects.all()
    serializer_class = ForumCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ForumThreadViewSet(viewsets.ModelViewSet):
    """
        API endpoint for forum threads. 
        - List all the threads with filters
        - Create a new thread
        - View thread details (user, created/edited)
        - Update/delete threads
    """

    queryset = ForumThread.objects.select_related("user", "category").prefetch_related("posts")
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == "list":
            return ForumThreadListSerializer
        elif self.action == "create":
            return CreateThreadSerializer
        else:
            return ForumThreadDetailSerializer
        
    
    def get_queryset(self):
        """Filter threads by category"""
        queryset = super().get_queryset()
        category_id = self.request.query_params.get("category")

        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Increment viewcount when thread is viewed"""
        thread = self.get_object()
        thread.increment_views()
        serializer = self.get_serializer(thread)
        return Response(serializer.data)
    
    def perform_update(self, serializer):
        """Only allows users to edit their own threads"""
        thread = self.get_object()
        if thread.user != self.request.user:
            return Response({"ERROR": "You can only edit your own threads."},
                           status=status.HTTP_403_FORBIDDEN)
        serializer.save()

    def perform_destroy(self, instance):
        """Only allows users to delete their own threads"""
        if instance.user != self.request.user:
            return Response({"ERROR": "You can only delete your own threads."},
                            status=status.HTTP_403_FORBIDDEN)
        instance.delete()

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def pin(self, request, pk=None):
        """Pin or unpin threads. Admin only"""
        thread = self.get_object()
        thread.is_pinned = not thread.is_pinned
        thread.save()
        return Response({
            "message": f"Thread {'pinned' if thread.is_pinned else 'unpinned'}",
            "is_pinned": thread.is_pinned
        })
    
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def lock(self, request, pk=None):
        """Lock or unlock a thread. Admin only"""
        thread = self.get_object()
        thread.is_locked = not thread.is_locked
        thread.save()
        return Response({
            "message": f"Thread {'locked' if thread.is_locked else 'unlocked'}",
            "is_locked": thread.is_locked
        })
    

class ForumPostViewSet(viewsets.ModelViewSet):
    """
        API endpoint for forum posts/replies
        - Create new post
        - Edit post
        - Delete post
        - View posts
    """
    queryset = ForumPost.objects.select_related("user", "thread", "parent_post")
    serializer_class = ForumPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Filter post by thread"""
        queryset = super().get_queryset()
        thread_id = self.request.query_params.get("thread")

        if thread_id:
            queryset = queryset.filter(thread_id=thread_id)

        return queryset
    
    def perform_create(self, serializer):
        """Create a new post or reply. First checks if thread is locked"""
        thread = get_object_or_404(ForumThread, pk=self.request.data.get("thread"))

        if thread.is_locked:
            return Response({"ERROR": "Cannot post in locked thread."},
                            status=status.HTTP_403_FORBIDDEN)
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Allows only user to update their own posts"""
        post = self.get_object()
        if post.user != self.request.user:
            return Response({"ERROR": "You can only edit your own posts."},
                            status=status.HTTP_403_FORBIDDEN)
        serializer.save()

    def perform_destroy(self, instance):
        """Allows only user to delete their own posts"""
        if instance.user != self.request.user:
            return Response({"ERROR": "You can only delete your own posts."}, 
                            status=status.HTTP_403_FORBIDDEN)
        instance.delete()


class ForumPostPhotoViewSet(viewsets.ModelViewSet):
    """API endpoint for forum post photos"""
    queryset = ForumPostPhoto.objects.all()
    serializer_class = ForumPostPhotoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """Filter photos by post if specified"""
        queryset = ForumPostPhoto.objects.all()
        
        post_id = self.request.query_params.get("post_id", None)
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        return queryset
    
    @action(detail=False, methods=["post"], url_path="upload")
    def upload_photo(self, request):
        """Upload a photo to a forum post"""
        serializer = ForumPostPhotoUploadSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        photo_file = serializer.validated_data["photo"]
        post_id = serializer.validated_data["post_id"]
        caption = serializer.validated_data.get("caption", "")
        
        # Verify post exists
        try:
            post = ForumPost.objects.get(post_id=post_id)
        except ForumPost.DoesNotExist:
            return Response(
                {"error": "Forum post not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is the post author
        if post.user != request.user:
            return Response(
                {"error": "You can only upload photos to your own posts"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                photo_file,
                folder=f"hiking_app/forum_photos/post_{post_id}",
                resource_type="image",
                transformation=[
                    {"quality": "auto"},
                    {"fetch_format": "auto"}
                ]
            )
            
            # Create database entry
            photo = ForumPostPhoto.objects.create(
                post=post,
                photo_url=upload_result["secure_url"],
                caption=caption
            )
            
            response_serializer = ForumPostPhotoSerializer(photo)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": f"Upload failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        """Delete photo - only post author can delete"""
        photo = self.get_object()
        
        if photo.post.user != request.user:
            return Response(
                {"error": "You can only delete photos from your own posts"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Delete from Cloudinary
        try:
            url_parts = photo.photo_url.split("/")
            folder_start = None
            for i, part in enumerate(url_parts):
                if part == "hiking_app":
                    folder_start = i
                    break
            
            if folder_start:
                path_parts = url_parts[folder_start:]
                public_id = "/".join(path_parts).rsplit(".", 1)[0]
                cloudinary.uploader.destroy(public_id)
        except Exception as e:
            print(f"Cloudinary deletion warning: {str(e)}")
        
        # Delete from database
        photo.delete()
        return Response({"message": "Photo deleted successfully"},
                        status=status.HTTP_204_NO_CONTENT)
    
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def upload_forum_post_image(request):
    """Upload image directly to forum post's image_url field"""
    try:
        post_id = request.data.get("post_id")
        photo_file = request.FILES.get("photo")
        
        if not post_id or not photo_file:
            return Response(
                {"error": "post_id and photo are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the post
        try:
            post = ForumPost.objects.get(post_id=post_id)
        except ForumPost.DoesNotExist:
            return Response(
                {"error": "Post not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permission - only post author can upload
        if post.user != request.user:
            return Response(
                {"error": "You can only upload photos to your own posts"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            photo_file,
            folder=f"hiking_app/forum_posts",
            resource_type="image",
            transformation=[
                {"quality": "auto"},
                {"fetch_format": "auto"}
            ]
        )
        
        # Update post with image URL
        post.image_url = upload_result["secure_url"]
        post.save()
        
        return Response({
            "image_url": post.image_url,
            "post_id": post.post_id
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )