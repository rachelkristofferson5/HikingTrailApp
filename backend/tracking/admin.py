from django.contrib import admin
from .models import Hike, GPSTrack, GPSPoint


@admin.register(Hike)
class HikeAdmin(admin.ModelAdmin):
    list_display = ["user", "trail", "start_time", "completed", "duration_min", 
                    "distance_miles"]
    list_filter = ["completed", "trail"]
    search_fields = ["user__username", "trail__name"]

@admin.register(GPSTrack)
class GPSTrackAdmin(admin.ModelAdmin):
    list_display = ["hike", "user", "started_at", "ended_at", "total_distance_miles"]
    list_filter = ["started_at"]
    search_fields = ["user__username", "hike__trail__name"]

@admin.register(GPSPoint)
class GPSPointAdmin(admin.ModelAdmin):
    list_display = ["track", "point_order", "latitude", "longitude", "recorded_at"]
    list_filter = ["track"]
    search_fields = ["track__hike__trail__name"]
