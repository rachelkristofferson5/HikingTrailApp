from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("conversations", views.ConversationViewSet)
router.register("messages", views.MessageViewSet)
router.register("participants", views.ConversationParticipantViewSet)

urlpatterns = [
    path("", include(router.urls)),
]