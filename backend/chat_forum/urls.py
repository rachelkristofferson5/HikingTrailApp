from django.urls import path
from . import views

urlpatterns = [
    path('api/posts/', views.list_posts, name='list_posts'),
    path('api/posts/create/', views.create_post, name='create_post'),
    path('api/posts/<int:post_id>/edit/', views.edit_post, name='edit_post'),
    path('api/posts/<int:post_id>/delete/', views.delete_post, name='delete_post'),
]
