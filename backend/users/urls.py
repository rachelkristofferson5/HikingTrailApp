"""
    Requests that can be made by the user. Directs data to views.py where it then
    goes to models.py
    
"""

from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("logout/", views.logout, name="logout"),
]