from django.urls import path
from . import chatView


urlpatterns = [
    path("", chatView.chatView, name="chat"),
    path("add/", chatView.add_chat, name="add_chat"),
    path("edit/<int:chat_id>/", chatView.edit_chat, name="edit_chat"),
    path("delete/<int:chat_id>/", chatView.delete_chat, name="delete_chat"),
]

