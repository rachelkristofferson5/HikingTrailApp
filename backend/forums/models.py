from django.db import models
from django.conf import settings
from django.utils import timezone


class ForumCategory(models.Model):
    """ Categories for otganizing the forum threads."""

    category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        db_table = "forum_categories"
        verbose_name_plural = "Forum Categories"
        ordering = ["display_order", "name"]

    
    def __str__(self):
        return self.name
    
    def get_thread_count(self):
        """ Get the number of threads in this category."""
        return self.forumthread_set.count()
    
class ForumThread(models.Model):
    """ Main threads in the forum. """

    thread_id = models.AutoField(primary_key=True)
    category = models.ForeignKey(
        ForumCategory,
        on_delete = models.CASCADE,
        db_column = "category_id",
        related_name = "forum_threads",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        db_column = "user_id",
        related_name = "thread_author",
    )
    title = models.CharField(max_length=200)
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    view_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "forum_threads"
        ordering = ["-is_pinned", "-updated_at"]

    def __str__(self):
        return self.title
        
    def get_post_count(self):
        """ Get the number of posts in this thread."""
        return self.posts.count()
        
    def increment_views(self):
        """Increment views of thred when viewed. """
        self.view_count += 1
        self.save(update_fields=["view_count"])

    def get_first_post(self):
        """ Get the first post in the thread."""
        return self.posts.filter(parent_post__isnull=True).first()
        
    def get_last_post(self):
        """Get the most recent post in the thread"""
        return self.posts.order_by("-created_at").first()
        

class ForumPost(models.Model):
    """
        Individual posts/replies within a thread. Replies will be nested
        from the parent post.
    """

    post_id = models.AutoField(primary_key=True)
    thread = models.ForeignKey(
        ForumThread,
        on_delete = models.CASCADE,
        db_column = "thread_id",
        related_name = "posts",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        db_column = "user_id",
        related_name = "forum_posts",
    )
    parent_post = models.ForeignKey(
        "self",
        null = True,
        blank = True,
        on_delete = models.CASCADE,
        db_column = "parent_post_id",
        related_name = "replies",
    )

    contents = models.TextField()
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "forum_posts"
        ordering = ["created_at"]

    def __str__(self):
        return f"Post by {self.user.username} in {self.thread.title}"
    
    def save(self, *args, **kwargs):
        """Mark the post as edited when updated by user."""

        if self.pk: # if it already exists
            original = ForumPost.objects.get(pk=self.pk)
            if original.contents != self.contents:
                self.is_edited = True
                self.edited_at = timezone.now()

        super().save(*args, **kwargs)

        # Updates the threads update time stamp
        self.thread.save(update_fields=["updated_at"])


    def get_replies(self):
        """Get all the replies within a post"""

        return self.replies.all()
    
    def reply_count(self):
        """Count the number of all replies to a post"""

        return self.replies.count()
    
    def is_first_post(self):
        """Check to see if this is the start of a thread"""

        return self.parent_post is None and self.thread.posts.first() == self
    

class ForumPostPhoto(models.Model):
    """Photos attached to forum posts"""
    photo_id = models.AutoField(primary_key=True)
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, 
                             db_column="post_id", related_name="photos")
    photo_url = models.URLField(max_length=500)
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "forum_post_photos"
        ordering = ["uploaded_at"]
    
    def __str__(self):
        return f"Photo for post {self.post_id}"