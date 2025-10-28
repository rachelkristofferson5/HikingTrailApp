from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, ConversationParticipant, Message

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["user_id", "username", "profile_photo_url"]


class ConversationParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ConversationParticipant
        fields = "__all__"


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    
    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = ["message_id", "sender", "sent_at"]


class ConversationSerializer(serializers.ModelSerializer):
    participants = ConversationParticipantSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    
    class Meta:
        model = Conversation
        fields = "__all__"
        read_only_fields = ["conversation_id", "created_at", "updated_at"]


class ConversationListSerializer(serializers.ModelSerializer):
    """Lighter serializer for conversation lists"""
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    participant_count = serializers.IntegerField(source="participants.count", read_only=True)
    message_count = serializers.IntegerField(source="messages.count", read_only=True)
    
    class Meta:
        model = Conversation
        fields = ["conversation_id", "conversation_name", "is_group", "created_by", 
                  "created_by_username", "participant_count", "message_count", 
                  "created_at", "updated_at"]
        read_only_fields = ["conversation_id", "created_at", "updated_at"]