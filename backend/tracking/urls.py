from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HikeViewSet, GPSTrackViewSet, GPSPointViewSet

router = DefaultRouter()
router.register(r"hikes", HikeViewSet, basename="hike")
router.register(r"tracks", GPSTrackViewSet, basename="track")
router.register(r"points", GPSPointViewSet, basename="point")

urlpatterns = [
    path("", include(router.urls)),
]