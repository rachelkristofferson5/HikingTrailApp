from django.urls import path
from . import views

urlpatterns = [
    path('api/chats/', views.api_chat_list, name='chat_list'),
    path('api/chats/add/', views.api_add_chat, name='add_chat'),
    path('api/chats/<int:id>/', views.api_edit_chat, name='edit_chat'),
    path('api/chats/<int:id>/delete/', views.api_delete_chat, name='delete_chat'),
]
