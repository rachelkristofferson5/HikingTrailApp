from django.contrib import admin
from .models import Park, Trail, SavedTrail, Review, TrailCondition, Photo, Tag, TrailTag, TrailFeature


@admin.register(Park)
class ParkAdmin(admin.ModelAdmin):
    list_display = ["park_name", "state", "region", "nps_park_code"]
    search_fields = ["park_name", "state", "nps_park_code"]
    list_filter = ["state", "region"]


@admin.register(Trail)
class TrailAdmin(admin.ModelAdmin):
    list_display = ["name", "park", "difficulty", "decimal_length_miles", "is_active"]
    search_fields = ["name", "park__park_name"]
    list_filter = ["difficulty", "is_active", "park"]
    ordering = ["name"]


@admin.register(SavedTrail)
class SavedTrailAdmin(admin.ModelAdmin):
    list_display = ["user", "trail", "saved_at"]
    search_fields = ["user__username", "trail__name"]
    list_filter = ["saved_at"]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["user", "trail", "rating", "created_at"]
    search_fields = ["user__username", "trail__name", "title"]
    list_filter = ["rating", "created_at"]


@admin.register(TrailCondition)
class TrailConditionAdmin(admin.ModelAdmin):
    list_display = ["trail", "condition_type", "severity", "reported_date", "verified"]
    search_fields = ["trail__name", "condition_type"]
    list_filter = ["condition_type", "severity", "verified"]


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ["user", "trail", "uploaded_at"]
    search_fields = ["user__username", "trail__name", "caption"]
    list_filter = ["uploaded_at"]


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ["tag_name"]
    search_fields = ["tag_name"]


@admin.register(TrailTag)
class TrailTagAdmin(admin.ModelAdmin):
    list_display = ["trail", "tag"]
    search_fields = ["trail__name", "tag__tag_name"]


@admin.register(TrailFeature)
class TrailFeatureAdmin(admin.ModelAdmin):
    list_display = ["feature_name", "trail", "feature_type"]
    search_fields = ["feature_name", "trail__name"]
    list_filter = ["feature_type"]