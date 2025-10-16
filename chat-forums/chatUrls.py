from django.urls import path
from . import chatView
urlpatterns = [
    path("", chatView, name="chat"),
    path("add/", chatView, name="add_chat"),
]