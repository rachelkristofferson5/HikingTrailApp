"""
    Requests that can be made by the user. Directs data to views.py where it then
    goes to models.py
    
"""

from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("logout/", views.logout, name="logout"),
    path("profile/", views.profile, name="profile"),

    # NPS
    path("nps/parks/", views.search_parks, name="search_parks"),
    path("nps/activities/", views.get_activities, name="get_activities"),

    # testing
    path("test/", views.test_connection, name="test_connection"),

    # NPS and Recreation.gov Trails
    path("parks/trails/", views.get_park_with_trails, name="get_park_with_trails"),
    path("states/parks-trails/", views.get_state_parks_with_trails, name="get_state_parks_with_trails"),
    
    # Recreation.gov trail-only endpoints
    path("trails/search/", views.search_trails_near_coordinates, name="search_trails_coordinates"),
    path("trails/search-by-name/", views.search_trails_by_name, name="search_trails_name"),
    path("trails/state/", views.get_trails_by_state, name="get_trails_by_state"),
]
