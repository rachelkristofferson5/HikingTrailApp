from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Chat
from .serilizers import ChatSerializer
from django.shortcuts import get_object_or_404


# ✅ List all top-level chats with nested replies
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_chat_list(request):
    chats = Chat.objects.filter(parent__isnull=True).order_by('-created_at')
    serializer = ChatSerializer(chats, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ✅ Create new chat (thread or reply)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_add_chat(request):
    message = request.data.get('message')
    parent_id = request.data.get('parent_id')

    if not message:
        return Response({"error": "Message content required"}, status=status.HTTP_400_BAD_REQUEST)

    parent = None
    if parent_id:
        parent = get_object_or_404(Chat, id=parent_id)

    chat = Chat.objects.create(user=request.user, message=message, parent=parent)
    serializer = ChatSerializer(chat)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# ✅ Edit existing chat
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def api_edit_chat(request, id):
    chat = get_object_or_404(Chat, id=id, user=request.user)
    chat.message = request.data.get('message', chat.message)
    chat.save()
    serializer = ChatSerializer(chat)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ✅ Delete chat
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_delete_chat(request, id):
    chat = get_object_or_404(Chat, id=id, user=request.user)
    chat.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
