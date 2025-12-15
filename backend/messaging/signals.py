"""
Signals for messaging app
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message
from users.models import Notification

@receiver(post_save, sender=Message)
def create_message_notification(sender, instance, created, **kwargs):
    """Create notifications when a new message is sent"""
    if created:
        # Notify all participants except the sender
        participants = instance.conversation.participants.exclude(
            user=instance.sender
        ).filter(is_active=True)
        
        for participant in participants:
            Notification.objects.create(
                user=participant.user,
                notification_type="message",
                reference_id=instance.message_id,
                reference_type="message",
                message=f"{instance.sender.username} sent you a message"
            )