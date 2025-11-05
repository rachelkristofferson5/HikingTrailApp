from django.db import models
from django.conf import settings

class Chat(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # integrates with your custom user model
        on_delete=models.CASCADE,
        related_name="chats"
    )
    message = models.TextField()
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "chats"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username}: {self.message[:30]}"
