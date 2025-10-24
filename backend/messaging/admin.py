from django.contrib import admin
from .models import Conversation, ConversationParticipant, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ["conversation_id", "conversation_name", "is_group", "created_by", "created_at"]
    search_fields = ["conversation_name", "created_by__username"]
    list_filter = ["is_group", "created_at"]


@admin.register(ConversationParticipant)
class ConversationParticipantAdmin(admin.ModelAdmin):
    list_display = ["user", "conversation", "joined_at", "is_active"]
    search_fields = ["user__username", "conversation__conversation_name"]
    list_filter = ["is_active", "joined_at"]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["sender", "conversation", "is_read", "sent_at"]
    search_fields = ["sender__username", "message_text"]
    list_filter = ["is_read", "sent_at"]
    ordering = ["-sent_at"]