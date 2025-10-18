from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import ForumCategory, ForumThread, ForumPost
from .serializers import (
    ForumCategorySerializer,
    ForumThreadListSerializer,
    ForumThreadDetailSerializer,
    CreateThreadSerializer,
    ForumPostSerializer
)


class ForumCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ 
        API endpoint for viewing forum categories. Read only because only the 
        admins can create the categories.
    """
    queryset = ForumCategory.objects.all()
    serializer_class = ForumCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ForumThreadViewSet(viewsets.ModelViewSet):
    """
        API endpoint for forum threads. 
        - List all the threads with filters
        - Create a new thread
        - View thread details (user, created/edited)
        - Update/delete threads
    """

    queryset = ForumThread.objects.select_related("user", "category").prefetch_related("posts")
    permission_classes = [IsAuthenticatedOrReadOnly]

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
        thread = self.get.object()
        thread.increment_views()
        serializer = self.get_serializer(thread)
        return Response(serializer.data)
    
    def update_thread(self, serializer):
        """Only allows users to edit thier own threads"""
        thread = self.get_object()
        if thread.user != self.request.user:
            return Respons({"ERROR": "You can only edit your own threads."},
                           status=status.HTTP_403_FORBIDDEN)
        serializer.save()

    def delete_thread(self, instance):
        """Only allows users to delete their own threads"""
        if instance.user != self.request.user:
            return Response({"ERROR": "You can only delete your own threads."},
                            status=status.HTTP_403_FORBIDDEN)
        instance.delete()

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def pin(self, request, pk=None):
        """Pin or unpin threads. Admin only"""
        thread = self.get_object
        thread.is_pinned = not thread.is_pinned
        thread.save()
        return Response({
            "message": f"Thread {'pinned' if thread.is_pinned else 'unpinned'}",
            "is_pinned": thread.is_pinned
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def lock(self, request, pk=None):
        """Lock or unlocka  thread. Admin only"""
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
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Filter post by thread"""
        queryset = super().get_queryset()
        thread_id = self.request.query_params.get("thread")

        if thread_id:
            queryset = queryset.filter(thread_id=thread_id)

        return queryset
    
    def create_post(self, serializer):
        """Create a new post or reply. First checks if thread is locked"""
        thread = get_object_or_404(ForumThread, pk=self.request.data.get("thread"))

        if thread.is_locked:
            return Response({"ERROR": "Cannot post in locked thread."},
                            status=status.HTTP_403_FORBIDDEN)
        serializer.save(user=self.request.user)

    def update_post(self, serializer):
        """Allows only user to update their own posts"""
        post = self.get_object()
        if post.user != self.request.user:
            return Response({"ERROR": "You can only edit your own posts."},
                            status=status.HTTP_403_FORBIDDEN)
        serializer.save()

    def delete_post(self, instance):
        """Allows only user to delete their own posts"""
        if instance.user != self.request.user:
            return Response({"ERROR": "You can only delete your own posts."}, 
                            status=status.HTTP_403_FORBIDDEN)
        instance.delete()
