from rest_framework import serializers
from .models import Chat

class ChatSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'user', 'message', 'parent', 'replies', 'created_at', 'updated_at']

    def get_replies(self, obj):
        replies = obj.replies.all().order_by('created_at')
        return ChatSerializer(replies, many=True).data
