from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ForumCategoryViewSet, ForumThreadViewSet, ForumPostViewSet

# Create a router and register viewsets
router = DefaultRouter()
router.register(r"categories", ForumCategoryViewSet, basename="category")
router.register(r"threads", ForumThreadViewSet, basename="thread")
router.register(r"posts", ForumPostViewSet, basename="post")

urlpatterns = [
    path("", include(router.urls)),
]