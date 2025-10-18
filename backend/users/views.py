"""
    Where program handles any requests from the user. Error checks any input and
    checks information against the database for login info. Bridge between urls
    and models.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import User  # ← CHANGED: Import custom User model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .nps_service import NPS
from django.http import JsonResponse
from django.utils import timezone


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get("username")
    email = request.data.get("email", "")
    password = request.data.get("password")
    full_name = request.data.get("full_name", "")  # NEW
    
    if not username or not password:
        return Response({"error": "Username and password are required"}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    if not email:
        return Response({"error": "Email is required"}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        validate_password(password)
    except ValidationError as e:
        return Response({"error": list(e.messages)}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Create user with custom User model
    user = User.objects.create_user(
        username=username, 
        email=email, 
        password=password,
        full_name=full_name
    )
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        "message": "User created successfully",
        "token": token.key,
        "user": {
            "user_id": user.user_id,  # Changed from user.id
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "experience_level": user.experience_level,
            "bio": user.bio,
            "profile_photo_url": user.profile_photo_url
        }
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    
    if not username or not password:
        return Response({"error": "Username and password are required"}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "message": "Login successful",
            "token": token.key,
            "user": {
                "user_id": user.user_id,  # Changed from user.id
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "experience_level": user.experience_level,
                "bio": user.bio,
                "profile_photo_url": user.profile_photo_url
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid credentials"}, 
                       status=status.HTTP_401_UNAUTHORIZED)


@api_view(["POST"])
@permission_classes([])  # Requires authentication (default)
def logout(request):
    try:
        request.user.auth_token.delete()
        return Response({"message": "Logged out successfully"}, 
                       status=status.HTTP_200_OK)
    except:
        return Response({"error": "Error logging out"}, 
                       status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([])  # Requires authentication
def profile(request):
    """Get current user's profile"""
    user = request.user
    return Response({
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "experience_level": user.experience_level,
        "bio": user.bio,
        "profile_photo_url": user.profile_photo_url,
        "created_at": user.created_at
    })


@api_view(["GET"])
def search_parks(request):
    # Search by state
    state = request.GET.get("state")

    if not state:
        return Response({"Error": "state parameter required."},
                        status=status.HTTP_400_BAD_REQUEST)
    
    nps = NPS()
    parks_data = nps.get_parks(state_code=state.upper())

    if parks_data:
        # format for frontend
        parks = []
        for park in parks_data["data"]:
            parks.append({
                "park_code": park["parkCode"],
                "name": park["fullName"],
                "state": park["states"],
                "description": park["description"][:200] + "..." if len(park["description"]) > 200 else park["description"],
                "url": park.get("url", ""),
                "image": park["images"][0]["url"] if park.get("images") else None,
                "latitude": park.get("latitude"),
                "longitude": park.get("longitude")})
        return Response({
            "parks": parks,
            "total": parks_data["total"]
        })
    else:
        return Response({"Error": "Failed to fetch."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(["GET"])
def get_activities(request):
    nps = NPS()
    activities_data = nps.get_activities()

    if activities_data:
        return Response({"activities": activities_data["data"]})
    else:
        return Response({"Error": "Failed to fetch activities."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

# Test to see if frontend is connected to backend
def test_connection(request):
    return JsonResponse({
        "status": "success",
        "message": "Backend is connected!!",
        "timestamp": str(timezone.now())
    })