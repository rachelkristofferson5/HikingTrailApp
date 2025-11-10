from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Post
from .serilizers import PostSerializer

# List all posts (latest first)
@api_view(['GET'])
def list_posts(request):
    posts = Post.objects.all().order_by('-created_at')
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)

# Create a new post
@api_view(['POST'])
def create_post(request):
    serializer = PostSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Edit a post (only author can edit)
@api_view(['PUT'])
def edit_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

    # Author check
    username = request.data.get("username")
    if post.username != username:
        return Response({"error": "You can only edit your own posts"}, status=status.HTTP_403_FORBIDDEN)

    serializer = PostSerializer(post, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Delete a post (only author can delete)
@api_view(['DELETE'])
def delete_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

    # Author check
    username = request.data.get("username")
    if post.username != username:
        return Response({"error": "You can only delete your own posts"}, status=status.HTTP_403_FORBIDDEN)

    post.delete()
    return Response({"message": "Post deleted"}, status=status.HTTP_200_OK)

@api_view(['GET'])
def list_categories(request):
    #placeholder response
    categories = [{"id": 1, "name": "General Discussion"}]
    return Response(categories)

@api_view(['GET'])
def list_threads(request):
    threads = [{"id": 1, "title": "Main Chat Thread"}]
    return Response(threads)