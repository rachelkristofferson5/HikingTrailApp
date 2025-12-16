from django.urls import path, include
from rest_framework.routers import DefaultRouter
#from .views import ForumCategoryViewSet, ForumThreadViewSet, ForumPostViewSet, ForumPostPhotoViewSet
from . import views

# Create a router and register viewsets
router = DefaultRouter()
router.register(r"categories", ForumCategoryViewSet, basename="category")
router.register(r"threads", ForumThreadViewSet, basename="thread")
router.register(r"posts", ForumPostViewSet, basename="post")
router.register(r"photos", ForumPostPhotoViewSet, basename="forum-photo")

urlpatterns = [
    path("", include(router.urls)),
    path('photos/upload/', views.upload_forum_post_image, name='upload_forum_post_image'),

]