from rest_framework import serializers
from .models import Chat

class ChatSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Chat
        fields = ('id', 'user', 'message', 'replies', 'created_at', 'updated_at')

    def get_user(self, obj):
        return obj.user.username

    def get_replies(self, obj):
        serializer = ChatSerializer(obj.replies.all().order_by('created_at'), many=True)
        return serializer.data
