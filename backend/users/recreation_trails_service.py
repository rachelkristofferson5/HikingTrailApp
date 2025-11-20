"""
Recreation.gov API Service
Fetches trail data from Recreation.gov API and integrates with NPS parks
"""

import os
import requests
from typing import Dict, List, Optional
from django.conf import settings


class RecreationTrailService:
    """Service for interacting with Recreation.gov API"""
    
    BASE_URL = "https://ridb.recreation.gov/api/v1"
    
    def __init__(self):
        self.api_key = settings.RECREATION_API_KEY
        if not self.api_key:
            raise ValueError("RECREATION_API_KEY environment variable not set")
    
    def _make_request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make a request to Recreation.gov API."""
        if params is None:
            params = {}
        
        # API key goes in query params for Recreation.gov
        params["apikey"] = self.api_key
        
        url = f"{self.BASE_URL}/{endpoint}"
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching from Recreation.gov: {e}")
            return {"RECDATA": [], "METADATA": {}}
    
    def get_trails_by_coordinates(self, latitude: float, longitude: float, 
                                  radius: int = 25) -> List[Dict]:
        """
        Get trails near specific coordinates
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            radius: Search radius in miles (default: 25)
        
        Returns:
            List of trail dictionaries
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "radius": radius,
            "activity": "HIKING",  # Filter for hiking trails
            "limit": 50
        }
        
        data = self._make_request("recareas", params)
        return self._parse_trails(data.get("RECDATA", []))
    
    def get_trails_by_state(self, state_code: str, limit: int = 50) -> List[Dict]:
        """
        Get trails in a specific state
        
        Args:
            state_code: Two-letter state code (e.g., "MN", "CA")
            limit: Maximum number of results
        
        Returns:
            List of trail dictionaries
        """
        params = {
            "state": state_code,
            "activity": "HIKING",
            "limit": limit
        }
        
        data = self._make_request("recareas", params)
        return self._parse_trails(data.get("RECDATA", []))
    
    def get_facilities_near_park(self, latitude: float, longitude: float, 
                                 radius: int = 10) -> List[Dict]:
        """
        Get recreation facilities (including trailheads) near a park
        
        Args:
            latitude: Park latitude
            longitude: Park longitude
            radius: Search radius in miles
        
        Returns:
            List of facility dictionaries
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "radius": radius,
            "limit": 50
        }
        
        data = self._make_request("facilities", params)
        return self._parse_facilities(data.get("RECDATA", []))
    
    def search_trails(self, query: str, limit: int = 25) -> List[Dict]:
        """
        Search for trails by name or keywords
        
        Args:
            query: Search query string
            limit: Maximum number of results
        
        Returns:
            List of trail dictionaries
        """
        params = {
            "query": query,
            "activity": "HIKING",
            "limit": limit
        }
        
        data = self._make_request("recareas", params)
        return self._parse_trails(data.get("RECDATA", []))
    
    def _parse_trails(self, recdata: List[Dict]) -> List[Dict]:
        """Parse recreation area data into simplified trail format"""
        trails = []
        
        for area in recdata:
            trail = {
                "id": area.get("RecAreaID"),
                "name": area.get("RecAreaName"),
                "description": area.get("RecAreaDescription", ""),
                "latitude": area.get("RecAreaLatitude"),
                "longitude": area.get("RecAreaLongitude"),
                "phone": area.get("RecAreaPhone"),
                "email": area.get("RecAreaEmail"),
                "directions": area.get("RecAreaDirections", ""),
                "keywords": area.get("KEYWORDS", []),
                "activities": self._extract_activities(area.get("ACTIVITY", [])),
                "media": self._extract_media(area.get("MEDIA", [])),
                "source": "recreation.gov"
            }
            trails.append(trail)
        
        return trails
    
    def _parse_facilities(self, recdata: List[Dict]) -> List[Dict]:
        """Parse facility data"""
        facilities = []
        
        for facility in recdata:
            parsed = {
                "id": facility.get("FacilityID"),
                "name": facility.get("FacilityName"),
                "type": facility.get("FacilityTypeDescription"),
                "description": facility.get("FacilityDescription", ""),
                "latitude": facility.get("FacilityLatitude"),
                "longitude": facility.get("FacilityLongitude"),
                "phone": facility.get("FacilityPhone"),
                "email": facility.get("FacilityEmail"),
                "reservable": facility.get("Reservable", False),
                "source": "recreation.gov"
            }
            facilities.append(parsed)
        
        return facilities
    
    def _extract_activities(self, activities: List[Dict]) -> List[str]:
        """Extract activity names from activity data"""
        return [act.get("ActivityName") for act in activities if act.get("ActivityName")]
    
    def _extract_media(self, media: List[Dict]) -> List[Dict]:
        """Extract and format media URLs"""
        images = []
        for item in media:
            if item.get("URL"):
                images.append({
                    "url": item.get("URL"),
                    "title": item.get("Title", ""),
                    "description": item.get("Description", "")
                })
        return images


class CombinedParkTrailService:
    """
    Combined service that uses both NPS API for parks and Recreation.gov for trails
    """
    
    def __init__(self, nps_service, recreation_service):
        self.nps = nps_service
        self.recreation = recreation_service
    

    def get_park_with_trails(self, park_code: str, trail_radius: int = 25) -> Dict:
        """
        Get a park from NPS with nearby trails from Recreation.gov
        
        Args:
            park_code: NPS park code (e.g., "voya", "yose")
            trail_radius: Radius in miles to search for trails (default: 25)
        
        Returns:
            Dictionary with park info and trails
        """
        # Get parks from NPS - need to get all and filter since API doesn't support park_code filter
        parks_data = self.nps.get_parks(limit=500)
        
        if not parks_data or "data" not in parks_data:
            return {"error": "Could not fetch parks"}
        
        # Find the specific park by park_code
        park = None
        for p in parks_data["data"]:
            if p.get("parkCode") == park_code:
                park = p
                break
        
        if not park:
            return {"error": "Park not found"}
        
        # Extract coordinates
        latitude = park.get("latitude")
        longitude = park.get("longitude")
        
        if not latitude or not longitude:
            return {
                "park": park,
                "trails": [],
                "message": "No coordinates available for this park"
            }
        
        # Get trails near the park
        trails = self.recreation.get_trails_by_coordinates(
            latitude=float(latitude),
            longitude=float(longitude),
            radius=trail_radius
        )
        
        return {
            "park": {
                "code": park.get("parkCode"),
                "name": park.get("fullName"),
                "description": park.get("description"),
                "state": park.get("states"),
                "url": park.get("url"),
                "latitude": latitude,
                "longitude": longitude,
                "images": park.get("images", []),
                "activities": park.get("activities", []),
                "source": "nps.gov"
            },
            "trails": trails,
            "trail_count": len(trails)
        }
    
    def get_parks_with_trails_by_state(self, state_code: str) -> List[Dict]:
        """
        Get all parks in a state from NPS with trails from Recreation.gov
        
        Args:
            state_code: Two-letter state code (e.g., "MN")
        
        Returns:
            List of dictionaries with park and trail info
        """
        # Get parks from NPS
        parks_data = self.nps.get_parks(state_code=state_code)
        
        if not parks_data or "data" not in parks_data:
            return []
        
        results = []
        
        for park in parks_data["data"]:
            park_code = park.get("parkCode")
            if park_code:
                park_with_trails = self.get_park_with_trails(park_code, trail_radius=15)
                if "error" not in park_with_trails:
                    results.append(park_with_trails)
        
        return results