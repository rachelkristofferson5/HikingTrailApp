from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Conversation, ConversationParticipant, Message
from .serializers import (
    ConversationSerializer,
    ConversationListSerializer,
    ConversationParticipantSerializer,
    MessageSerializer,
    NotificationSerializer
)
from django.contrib.auth import get_user_model
from users.models import Notification

User = get_user_model()


class ConversationViewSet(viewsets.ModelViewSet):
    """API endpoint for conversations"""
    queryset = Conversation.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer 
    
    def get_serializer_class(self):
        if self.action == "list":
            return ConversationListSerializer
        return ConversationSerializer
    
    def get_queryset(self):
        """Return only conversations where user is a participant"""
        return self.queryset.filter(participants__user=self.request.user).distinct()
    
    def perform_create(self, serializer):
        conversation = serializer.save(created_by=self.request.user)

        ConversationParticipant.objects.get_or_create(
            conversation=conversation,
            user=self.request.user
        )

        participant_ids = self.request.data.get("participants", [])

        if isinstance(participant_ids, str):
            participant_ids = [participant_ids]

        for user_id in participant_ids:
            try:
                user = User.objects.get(id=user_id)  # Fix: Changed from user_id to id
                if user != self.request.user:
                    ConversationParticipant.objects.get_or_create(
                        conversation=conversation,
                        user=user
                    )
            except User.DoesNotExist:
                continue


class MessageViewSet(viewsets.ModelViewSet):
    """API endpoint for messages"""
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return messages from conversations user is part of"""
        conversation_id = self.request.query_params.get("conversation")
        if conversation_id:
            return self.queryset.filter(
                conversation_id=conversation_id,
                conversation__participants__user=self.request.user
            )
        return self.queryset.filter(
            conversation__participants__user=self.request.user
        )
    
    def perform_create(self, serializer):
        conversation = serializer.validated_data["conversation"]

        ConversationParticipant.objects.get_or_create(
            conversation=conversation,
            user=self.request.user
        )

        serializer.save(sender=self.request.user)


class ConversationParticipantViewSet(viewsets.ModelViewSet):
    """API endpoint for conversation participants"""
    queryset = ConversationParticipant.objects.all()
    serializer_class = ConversationParticipantSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return participants from user"s conversations"""
        conversation_id = self.request.query_params.get("conversation")
        if conversation_id:
            return self.queryset.filter(conversation_id=conversation_id)
        return self.queryset.filter(conversation__participants__user=self.request.user)
    

class NotificationViewSet(viewsets.ModelViewSet):
    """API endpoint for user notifications"""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        """Return only notifications for the current user"""
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get only unread notifications"""
        unread = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(unread, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'all notifications marked as read'})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a single notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})