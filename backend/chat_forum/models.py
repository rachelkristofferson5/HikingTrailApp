from django.db import models

class Post(models.Model):
    username = models.CharField(max_length=100)  # User who created the post
    content = models.TextField()                 # Post content
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username}: {self.content[:20]}"
