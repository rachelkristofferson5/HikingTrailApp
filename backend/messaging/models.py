"""
Messaging models for private conversations
"""

from django.db import models
from django.conf import settings


class Conversation(models.Model):
    """Private message conversations"""
    conversation_id = models.AutoField(primary_key=True)
    conversation_name = models.CharField(max_length=255, blank=True)
    is_group = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        db_column="int_created_by",
        related_name="created_conversations"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "conversations"
        ordering = ["-updated_at"]
    
    def __str__(self):
        return self.conversation_name or f"Conversation {self.conversation_id}"


class ConversationParticipant(models.Model):
    """Users participating in conversations"""
    participant_id = models.AutoField(primary_key=True)
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        db_column="int_conversation_id",
        related_name="participants"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column="int_user_id",
        related_name="conversation_participations"
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    last_read_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = "conversation_participants"
        unique_together = [["conversation", "user"]]
    
    def __str__(self):
        return f"{self.user.username} in {self.conversation}"


class Message(models.Model):
    """Individual messages in conversations"""
    message_id = models.AutoField(primary_key=True)
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        db_column="int_conversation_id",
        related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column="int_sender_id",
        related_name="sent_messages"
    )
    message_text = models.TextField()
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "messages"
        ordering = ["sent_at"]
    
    def __str__(self):
        return f"Message from {self.sender.username} at {self.sent_at}"