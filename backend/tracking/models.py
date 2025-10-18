from django.db import models
from django.conf import settings
from decimal import Decimal


class Hike(models.Model):
    """
        Represents when a user hikes a trail. Shows all relevent data to showing
        trail has been completed.

        for users.Trail, this is assuming that the user has the trail saved and 
        is looking for trail in there.
    """
    hike_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column="user_id",
                             related_name="hikes")
    trail = models.ForeignKey("users.Trail", on_delete=models.CASCADE, 
                              db_column="trail_id", related_name="hikes")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    duration_min = models.IntegerField(null=True, blank=True)
    distance_miles = models.DecimalField(max_digits=6, decimal_places=2, null=True)
    notes = models.TextField(null=True, blank=True)
    weather_conditions = models.CharField(max_length=100, null=True, blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "hikes"
        ordering = ["-start_time"]

    def __str__(self):
        return f"{self.user.username} - {self.trail.name} on {self.start_time.date()}"
    
    def calculate_duration(self):
        """Calculates the duration of the hike in minutes once completed"""
        if self.end_time and self.start_time:
            hike_duration = self.end_time - self.start_time
            self.duration_min = int(hike_duration.total_seconds() / 60)
            self.save(update_fields=["duration_min"])


class GPSTrack(models.Model):
    """
        Records GPS data from the hike. Will save multiple points from the route.
    """
    track_id = models.AutoField(primary_key=True)
    hike = models.ForeignKey(Hike, on_delete=models.CASCADE, db_column="hike_id", 
                             related_name = "gps_tracks")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, 
                             db_column="user_id", related_name = "gps_tracks")
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    total_distance_miles = models.DecimalField(max_digits=8, decimal_places=3, 
                                               null=True, blank=True)
    text_gps_data = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "gps_tracks"
        ordering = ["-started_at"]

    def __str__(self):
        return f"Track for {self.hike}"
    
    def get_gps_point_count(self):
        """Get number of GPS points saved on the hike"""
        return self.gps_points.count()
    

class GPSPoint(models.Model):
    """
        Individual GPS coordinates on a track. Will record the exact location at 
        a specific time.
    """
    point_id = models.AutoField(primary_key=True)
    track = models.ForeignKey(GPSTrack, on_delete=models.CASCADE, 
                              db_column="track_id", related_name="gps_points")
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    altitude_feet = models.DecimalField(max_digits=6, decimal_places=2, 
                                        null=True, blank=True)
    accuracy_feet = models.DecimalField(max_digits=6, decimal_places=2, 
                                        null=True, blank=True)
    speed_mps = models.DecimalField(max_digits=6, decimal_places=2, 
                                        null=True, blank=True)
    recorded_at = models.DateTimeField()
    point_order = models.IntegerField()

    
    class Meta:
        db_table = "gps_points"
        ordering = ["track", "point_order"]

    def __str__(self):
        return f"Point {self.point_order} at ({self.latitude}, {self.longitude})"
    
    @property
    def coordinates(self):
        """Returns the coordinates as a tuple"""
        return (float(self.latitude), float(self.longitude))
    
    