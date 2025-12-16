from django.urls import path, include
from rest_framework.routers import DefaultRouter
#from .views import ForumCategoryViewSet, ForumThreadViewSet, ForumPostViewSet, ForumPostPhotoViewSet
from . import views

# Create a router and register viewsets
router = DefaultRouter()
router.register(r"categories", views.ForumCategoryViewSet, basename="category")
router.register(r"threads", views.ForumThreadViewSet, basename="thread")
router.register(r"posts", views.ForumPostViewSet, basename="post")
router.register(r"photos", views.ForumPostPhotoViewSet, basename="forum-photo")

urlpatterns = [
    path("", include(router.urls)),
    path('photos/upload/', views.upload_forum_post_image, name='upload_forum_post_image'),
]