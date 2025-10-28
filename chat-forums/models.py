from django.db import models
from django.contrib.auth.models import User

class Chat(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}: {self.message[:30]}"



