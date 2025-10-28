from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("parks", views.ParkViewSet)
router.register("trails", views.TrailViewSet)
router.register("saved-trails", views.SavedTrailViewSet)
router.register("reviews", views.ReviewViewSet)
router.register("conditions", views.TrailConditionViewSet)
router.register("photos", views.PhotoViewSet)
router.register("tags", views.TagViewSet)
router.register("features", views.TrailFeatureViewSet)

urlpatterns = [
    path("", include(router.urls)),
]