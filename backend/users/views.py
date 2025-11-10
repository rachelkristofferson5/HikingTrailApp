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
from .models import User 
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .nps_service import NPS
from django.http import JsonResponse
from django.utils import timezone
from .recreation_trails_service import RecreationTrailService, CombinedParkTrailService

nps_service = NPS()
recreation_trail_service = RecreationTrailService()
combined_service = CombinedParkTrailService(nps_service, recreation_trail_service)

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get("username")
    email = request.data.get("email", "")
    password = request.data.get("password")
    full_name = request.data.get("full_name", "") 
    
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
    """Get current user"s profile"""
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


@api_view(["GET"])
def get_park_with_trails(request):
    """
    Get a specific park with nearby trails
    GET /api/parks/<park_code>/trails/
    
    Query parameters:
    - park_code: NPS park code (required)
    - radius: Search radius in miles (optional, default: 25)
    """
    park_code = request.query_params.get("park_code")
    radius = request.query_params.get("radius", 25)
    
    if not park_code:
        return Response(
            {"error": "park_code parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        radius = int(radius)
    except ValueError:
        return Response(
            {"error": "radius must be a number"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        result = combined_service.get_park_with_trails(park_code, trail_radius=radius)
        
        if "error" in result:
            return Response(result, status=status.HTTP_404_NOT_FOUND)
        
        return Response(result, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
def get_state_parks_with_trails(request):
    """
    Get all parks in a state with their nearby trails
    GET /api/states/<state_code>/parks-trails/
    
    Query parameters:
    - state: Two-letter state code (required)
    """
    state_code = request.query_params.get("state")
    
    if not state_code:
        return Response(
            {"error": "state parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        results = combined_service.get_parks_with_trails_by_state(state_code.upper())
        
        return Response({
            "state": state_code.upper(),
            "parks": results,
            "total": len(results)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
def search_trails_near_coordinates(request):
    """
    Search for trails near specific coordinates
    GET /api/trails/search/
    
    Query parameters:
    - lat: Latitude (required)
    - lon: Longitude (required)
    - radius: Search radius in miles (optional, default: 25)
    """
    try:
        latitude = float(request.query_params.get("lat"))
        longitude = float(request.query_params.get("lon"))
    except (TypeError, ValueError):
        return Response(
            {"error": "lat and lon parameters are required and must be numbers"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    radius = int(request.query_params.get("radius", 25))
    
    try:
        trails = recreation_trail_service.get_trails_by_coordinates(
            latitude=latitude,
            longitude=longitude,
            radius=radius
        )
        
        return Response({
            "location": {
                "latitude": latitude,
                "longitude": longitude,
                "radius_miles": radius
            },
            "trails": trails,
            "total": len(trails)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
def search_trails_by_name(request):
    """
    Search for trails by name or keywords
    GET /api/trails/search-by-name/
    
    Query parameters:
    - q: Search query (required)
    - limit: Maximum results (optional, default: 25)
    """
    query = request.query_params.get("q")
    
    if not query:
        return Response(
            {"error": "q parameter (search query) is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    limit = int(request.query_params.get("limit", 25))
    
    try:
        trails = recreation_service.search_trails(query, limit=limit)
        
        return Response({
            "query": query,
            "trails": trails,
            "total": len(trails)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
def get_trails_by_state(request):
    """
    Get trails in a specific state
    GET /api/trails/state/<state_code>/
    
    Query parameters:
    - state: Two-letter state code (required)
    - limit: Maximum results (optional, default: 50)
    """
    state_code = request.query_params.get("state")
    
    if not state_code:
        return Response(
            {"error": "state parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    limit = int(request.query_params.get("limit", 50))
    
    try:
        trails = recreation_trail_service.get_trails_by_state(
            state_code=state_code.upper(),
            limit=limit
        )
        
        return Response({
            "state": state_code.upper(),
            "trails": trails,
            "total": len(trails)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
