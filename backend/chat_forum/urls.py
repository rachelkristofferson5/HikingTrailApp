from django.urls import path
from . import views

urlpatterns = [
    path('forums/categories/', views.list_categories, name='list_categories'),
    path('forums/', views.list_threads, name='list_threads'),
    
    path('forums/posts/', views.list_posts, name='list_posts'),
    path('forums/posts/create/', views.create_post, name='create_post'),
    path('forums/posts/<int:post_id>/edit/', views.edit_post, name='edit_post'),
    path('forums/posts/<int:post_id>/delete/', views.delete_post, name='delete_post'),
]
