from rest_framework import serializers
from .models import ForumCategory, ForumThread, ForumPost, ForumPostPhoto
from django.contrib.auth import get_user_model

User = get_user_model()


class ForumPostPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumPostPhoto
        fields = ["photo_id", "post", "photo_url", "caption", "uploaded_at"]
        read_only_fields = ["photo_id", "uploaded_at"]


class UserSerializer(serializers.ModelSerializer):
    """Basic user info that displays the user/author"s details"""

    class Meta:
        model = User
        fields = ["user_id", "username", "profile_photo_url"]
        read_only_fields = ["user_id"]

class ForumPostPhotoUploadSerializer(serializers.Serializer):
    """Serializer for uploading photos to forum posts"""
    photo = serializers.ImageField()
    post_id = serializers.IntegerField()
    caption = serializers.CharField(required=False, allow_blank=True, max_length=255)

class ForumPostSerializer(serializers.ModelSerializer):
    """Serialize individual posts"""
    user = UserSerializer(read_only=True)
    reply_count = serializers.IntegerField(read_only=True, source="replies.count")
    photos = ForumPostPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = ForumPost
        fields = ["post_id", "thread", "user", "parent_post", "contents", 
                  "is_edited", "edited_at", "reply_count", "created_at", 
                  "updated_at", "photos"]
        read_only_fields = ["post_id", "user", "is_edited", "edited_at", 
                            "created_at", "updated_at"]
        

class ForumCategorySerializer(serializers.ModelSerializer):
    """Serialize the forum categories."""
    thread_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ForumCategory
        fields = ["category_id", "name", "description", "display_order", "thread_count", "created_at"]
        read_only_fields = ["category_id", "created_at"]


class ForumThreadListSerializer(serializers.ModelSerializer):
    """Thread serializer for list view"""
    user = UserSerializer(read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=False)
    post_count = serializers.IntegerField(read_only=True)
    latest_post = serializers.SerializerMethodField()

    class Meta:
        model = ForumThread
        fields = ["thread_id", "title", "user", "category", "category_name", 
                  "is_pinned", "is_locked", "view_count", "post_count",
                  "latest_post", "created_at", "updated_at"]
        read_only_fields = ["thread_id", "user", "view_count", "created_at", "updated_at"]

    def get_latest_post(self, obj):
        """Get info about latest post in thread"""
        latest = obj.get_last_post()
        if latest:
            return {"user": latest.user.username, "created_at": latest.created_at}
        return None
    
class CreateThreadSerializer(serializers.ModelSerializer):
    """Serializer for breating a new thread with first post"""
    first_post_content = serializers.CharField(write_only=True)

    class Meta:
        model = ForumThread
        fields = ["title", "category", "first_post_content"]

    def create(self, validated_data):
        # Get first post content
        first_post_content = validated_data.pop("first_post_content")

        # Get user
        user = self.context["request"].user

        # Create the thread
        thread = ForumThread.objects.create(user=user, **validated_data)

        # Create the first post
        ForumPost.objects.create(thread=thread, user=user, contents=first_post_content)

        return thread
    
class ForumThreadDetailSerializer(serializers.ModelSerializer):
    """Detailed thread serializer with all posts"""
    user = UserSerializer(read_only=True)
    category = ForumCategorySerializer(read_only=True)
    posts = ForumPostSerializer(many=True, read_only=True)
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumThread
        fields = ["thread_id", "title", "user", "category", "is_pinned", 
                  "is_locked", "view_count", "post_count", "posts", 
                  "created_at", "updated_at", "photos"]
        read_only_fields = ["thread_id", "user", "view_count", "created_at", "updated_at"]
    
    def get_post_count(self, obj):
        return obj.post_count()