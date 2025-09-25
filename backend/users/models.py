"""
    Create the models of the database tables and thier relationships.
"""

from django.db import models
from django.contrib.auth.models import User
import uuid


class HikingProfile(models.Model):
    """Extended profile for hikers with hiker specific data"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Hiking statistics
    miles_hiked = models.PositiveIntegerField(default=0)
    
    experience_level = models.CharField(
        max_length = 20,
        choices = [
            ("beginner", "Beginner"),
            ("intermediate", "Intermediate"),
            ("advanced", "Advanced")
        ], 
        default = "beginner"
    )

    # User's personal info
    bio = models.TextField(max_length=500, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    public_profile = models.BooleanField(default=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
    

class Trail(models.Model):

    """Trail info from NPS API and user submissions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Trail identification
    nps_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    name = models.CharField(max_length=200)
    difficulty = models.CharField(max_length=20, 
                                  choices=[
                                      ("easy", "Easy"),
                                      ("moderate", "Moderate"),
                                      ("hard", "Hard"),
                                      ("expert", "Expert")
                                  ]
                                  )
    

    # Trail Spefications
    length = models.FloatField(help_text="Trail length in miles")
    elevation_gain = models.PositiveBigIntegerField(help_text="Elevation gain in feet")
    location = models.CharField(max_length=200)
    description = models.TextField()


    # GPS coordinates for mapping
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)


    # Trail status
    is_open = models.BooleanField(default=True)
    requires_permit = models.BooleanField(default=False)


    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.name} ({self.difficulty})"
    



class UserTrail(models.Model):

    """Track user's completed trails with rating and notes"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    trail = models.ForeignKey(Trail, on_delete=models.CASCADE)


    # Completion detaisl
    completed_date = models.DateTimeField(auto_now_add=True)
    rating = models.PositiveSmallIntegerField(
        choices=[(i, i) for i in range(1, 6)],
        null=True, 
        blank=True,
        help_text="Rate trail 1-5 stars"
    )
    notes = models.TextField(max_length=1000, blank=True)
    is_public = models.BooleanField(default=True)

    def updateMilesHiked(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            profile = self.user.hikingprofile
            profile.miles_hiked += int(self.trail.length)
            profile.save()


    class Meta:

        unique_together = ("user", "trail") # User can only complete trail once
        ordering = ["-completed_date"]

    def __str__(self):
        return f"{self.user.username} completed {self.trail.name}"