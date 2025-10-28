"""
    Define how the data is managed and stored at the admin dashboard. Each class
    is a table.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserFollow, Notification


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "email", "full_name", "experience_level", "created_at"]
    search_fields = ["username", "email", "full_name"]
    list_filter = ["experience_level", "is_staff", "is_active"]
    
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal Info", {"fields": ("email", "full_name", "bio", "profile_photo_url")}),
        ("Hiking Info", {"fields": ("experience_level",)}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser")}),
        ("Dates", {"fields": ("last_login", "created_at")}),
    )
    
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "password1", "password2"),
        }),
    )
    
    readonly_fields = ["created_at", "last_login"]
    ordering = ["username"]


@admin.register(UserFollow)
class UserFollowAdmin(admin.ModelAdmin):
    list_display = ["follower", "following", "followed_at"]
    search_fields = ["follower__username", "following__username"]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["user", "notification_type", "is_read", "created_at"]
    search_fields = ["user__username", "message"]
    list_filter = ["notification_type", "is_read", "created_at"]