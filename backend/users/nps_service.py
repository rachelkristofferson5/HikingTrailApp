# Any data requests from NPS go here

import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class NPS:

    def __init__(self):
        self.api_key = settings.NPS_API_KEY
        self.base_url = settings.NPS_BASE_URL
        self.headers = {"X-Api-Key": self.api_key}

    # Getting national park data from NPS API. Data will be returned in a json
    # for implementation. 
    def get_parks(self, state_code=None, limit=50):
        endpoint = f"{self.base_url}parks"
        params = {"limit": limit}

        if state_code:
            params["stateCode"] = state_code
        try:
            response = requests.get(endpoint, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"NPS API error: {e}")
            return None
        
    # Activities available
    def get_activities(self):
        endpoint = f"{self.base_url}activities"

        try:
            response = requests.get(endpoint, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"NPS API error: {e}")
            return None
        