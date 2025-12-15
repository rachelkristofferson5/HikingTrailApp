from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Conversation, ConversationParticipant, Message, User
from .serializers import (
    ConversationSerializer,
    ConversationListSerializer,
    ConversationParticipantSerializer,
    MessageSerializer
)


class ConversationViewSet(viewsets.ModelViewSet):
    """API endpoint for conversations"""
    queryset = Conversation.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == "list":
            return ConversationListSerializer
        return ConversationSerializer
    
    def get_queryset(self):
        """Return only conversations where user is a participant"""
        return self.queryset.filter(participants__user=self.request.user).distinct()
    
    def perform_create(self, serializer):
        """Create conversation and add creator as participant"""
        conversation = serializer.save(created_by=self.request.user)
        
        # Add creator as participant
        ConversationParticipant.objects.create(conversation=conversation, 
                                               user=self.request.user)
        
        # Add other participants from request
        participant_ids = self.request.data.get("participants", [])
        for user_id in participant_ids:
            try:
                user = User.objects.get(user_id=user_id)
                if user.user_id != self.request.user.user_id:
                    ConversationParticipant.objects.create(conversation=conversation,
                                                           user=user)
            except User.DoesNotExist:
                print(f"User {user_id} not found")
                pass 
        
        return conversation


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
        """Set sender to current user"""
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