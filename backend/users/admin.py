"""
    Define how the data is managed and stored at the admin dashboard. Each class
    is a table.
"""

from django.contrib import admin
from .models import HikingProfile, Trail, UserTrail

@admin.register(HikingProfile)
class HikingProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "experience_level", "miles_hiked", "public_profile"]
    list_filter = ["experience_level", "public_profile"]
    search_fields = ["user__username", "user__email"]


@admin.register(Trail)
class TrailAdmin(admin.ModelAdmin):
    list_display = ["name", "difficulty", "length", "location", "is_open"]
    list_filter = ["difficulty", "is_open", "requires_permit"]
    search_fields = ["name", "location"]



@admin.register(UserTrail)
class UserTrailAdmin(admin.ModelAdmin):
    list_display = ["user", "trail", "rating", "completed_date"]
    list_filter = ["rating", "completed_date"]
    search_fields = ["user__username", "trail__name"]
