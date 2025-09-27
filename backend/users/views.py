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
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .nps_service import NPS

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get("username")
    email = request.data.get("email", "")
    password = request.data.get("password")
    
    if not username or not password:
        return Response({"error": "Username and password are required"}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        validate_password(password)
    except ValidationError as e:
        return Response({"error": list(e.messages)}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(username=username, email=email, password=password)
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        "message": "User created successfully",
        "token": token.key,
        "user_id": user.id,
        "username": user.username
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
            "token": token.key,
            "user_id": user.id,
            "username": user.username
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid credentials"}, 
                       status=status.HTTP_401_UNAUTHORIZED)

@api_view(["POST"])
def logout(request):
    try:
        request.user.auth_token.delete()
        return Response({"message": "Logged out successfully"}, 
                       status=status.HTTP_200_OK)
    except:
        return Response({"error": "Error logging out"}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
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
                "longitude": park.get("longitude")

            })
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
        return Response({"Error": "Failed to fetch activitiess."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)