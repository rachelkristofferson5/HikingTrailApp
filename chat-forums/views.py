from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Chat
from .serilizers import ChatSerializer

# Show the chats with replies
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_chat_list(request):
    chats = Chat.objects.filter(parent__isnull=True).order_by('created_at')
    serializers = ChatSerializer(chats, many=True)
    return Response(serializers.data)

# Add new chat or reply
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_add_chat(request):
    message = request.data.get('message')
    parent_id = request.data.get('parent_id')
    parent = Chat.objects.get(id=parent_id) if parent_id else None
    chat = Chat.objects.create(user=request.user, message=message, parent=parent)
    serializers = ChatSerializer(chat)
    return Response(serializers.data, status=status.HTTP_201_CREATED)

# Edit chat by original poster
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def api_edit_chat(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id, user=request.user)
    except Chat.DoesNotExist:
        return Response({"detail": "Not found / permission denied"}, status=status.HTTP_404_NOT_FOUND)

    chat.message = request.data.get('message', chat.message)
    chat.save()
    serializers = ChatSerializer(chat)
    return Response(serializers.data)

# Delete chat by original poster only
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_delete_chat(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id, user=request.user)
    except Chat.DoesNotExist:
        return Response({"detail": "Not found / permission denied"}, status=status.HTTP_404_NOT_FOUND)

    chat.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)







