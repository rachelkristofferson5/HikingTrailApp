"""
    Define how the data is managed and stored at the admin dashboard. Each class
    is a table.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Park, Trail, UserTrail


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


@admin.register(Park)
class ParkAdmin(admin.ModelAdmin):
    list_display = ["park_name", "state", "region", "nps_park_code"]
    search_fields = ["park_name", "state", "nps_park_code"]
    list_filter = ["state", "region"]


@admin.register(Trail)
class TrailAdmin(admin.ModelAdmin):
    list_display = ["name", "park", "difficulty", "decimal_length_miles", "is_active"]
    search_fields = ["name", "park__park_name", "location"]
    list_filter = ["difficulty", "is_active", "park"]


@admin.register(UserTrail)
class UserTrailAdmin(admin.ModelAdmin):
    list_display = ["user", "trail", "completed_at"]
    search_fields = ["user__username", "trail__name"]
    list_filter = ["completed_at"]