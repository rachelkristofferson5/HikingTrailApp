"""
Trail, park, review, and photo models for hiking app
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Park(models.Model):
    park_id = models.AutoField(primary_key=True)
    nps_park_code = models.CharField(max_length=10, unique=True)
    park_name = models.CharField(max_length=200)
    state = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    park_url = models.URLField(max_length=500, null=True, blank=True)
    last_synced = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "parks"
    
    def __str__(self):
        return self.park_name


class Trail(models.Model):
    trail_id = models.AutoField(primary_key=True)
    nps_trail_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    park = models.ForeignKey(Park, on_delete=models.CASCADE, db_column="park_id", related_name="trails")
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=200)
    decimal_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    decimal_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    difficulty = models.CharField(
        max_length=20,
        choices=[
            ("easy", "Easy"),
            ("moderate", "Moderate"),
            ("hard", "Hard"),
            ("expert", "Expert")
        ]
    )
    decimal_length_miles = models.DecimalField(max_digits=5, decimal_places=2)
    elevation_gain_ft = models.IntegerField(null=True, blank=True)
    estimated_duration_hours = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    trail_type = models.CharField(max_length=50, blank=True)
    featured_photo_url = models.URLField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    nps_data = models.JSONField(null=True, blank=True)
    last_synced = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "trails"
        ordering = ["name"]
    
    def __str__(self):
        return f"{self.name} ({self.difficulty})"


class SavedTrail(models.Model):
    """User's saved/bookmarked trails (was UserTrail)"""
    saved_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column="int_user_id",
        related_name="saved_trails"
    )
    trail = models.ForeignKey(
        Trail,
        on_delete=models.CASCADE,
        db_column="int_trail_id",
        related_name="saved_by_users"
    )
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "saved_trails"
        unique_together = [["user", "trail"]]
        ordering = ["-saved_at"]
    
    def __str__(self):
        return f"{self.user.username} saved {self.trail.name}"


class Review(models.Model):
    """User reviews of trails"""
    review_id = models.AutoField(primary_key=True)
    trail = models.ForeignKey(
        Trail,
        on_delete=models.CASCADE,
        db_column="int_trail_id",
        related_name="reviews"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column="int_user_id",
        related_name="reviews"
    )
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=255, blank=True)
    review_text = models.TextField()
    visited_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "reviews"
        ordering = ["-created_at"]
    
    def __str__(self):
        return f"Review by {self.user.username} for {self.trail.name}"


class TrailCondition(models.Model):
    """Current trail conditions reported by users"""
    condition_id = models.AutoField(primary_key=True)
    trail = models.ForeignKey(
        Trail,
        on_delete=models.CASCADE,
        db_column="int_trail_id",
        related_name="conditions"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column="int_user_id",
        related_name="trail_conditions"
    )
    condition_type = models.CharField(max_length=100)
    description = models.TextField()
    severity = models.CharField(max_length=50)
    reported_date = models.DateField()
    verified = models.BooleanField(default=False)
    
    class Meta:
        db_table = "trail_conditions"
        ordering = ["-reported_date"]
    
    def __str__(self):
        return f"{self.condition_type} on {self.trail.name}"


class Photo(models.Model):
    """User-uploaded photos"""
    photo_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column="int_user_id",
        related_name="photos"
    )
    trail = models.ForeignKey(
        Trail,
        on_delete=models.CASCADE,
        db_column="int_trail_id",
        related_name="photos",
        null=True,
        blank=True
    )
    hike = models.ForeignKey(
        "tracking.Hike",
        on_delete=models.CASCADE,
        db_column="int_hike_id",
        related_name="photos",
        null=True,
        blank=True
    )
    photo_url = models.URLField(max_length=500)
    caption = models.TextField(blank=True)
    decimal_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    decimal_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "photos"
        ordering = ["-uploaded_at"]
    
    def __str__(self):
        return f"Photo by {self.user.username}"


class Tag(models.Model):
    """Tags for categorizing trails"""
    tag_id = models.AutoField(primary_key=True)
    tag_name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        db_table = "tags"
    
    def __str__(self):
        return self.tag_name


class TrailTag(models.Model):
    """Many-to-many relationship between trails and tags"""
    trail_tag_id = models.AutoField(primary_key=True)
    trail = models.ForeignKey(
        Trail,
        on_delete=models.CASCADE,
        db_column="int_trail_id",
        related_name="trail_tags"
    )
    tag = models.ForeignKey(
        Tag,
        on_delete=models.CASCADE,
        db_column="int_tag_id",
        related_name="trail_tags"
    )
    
    class Meta:
        db_table = "trail_tags"
        unique_together = [['trail', 'tag']]
    
    def __str__(self):
        return f"{self.trail.name} - {self.tag.tag_name}"


class TrailFeature(models.Model):
    """Points of interest and features along trails"""
    feature_id = models.AutoField(primary_key=True)
    trail = models.ForeignKey(
        Trail,
        on_delete=models.CASCADE,
        db_column="int_trail_id",
        related_name="features"
    )
    feature_type = models.CharField(max_length=100, blank=True)
    feature_name = models.CharField(max_length=255, blank=True)
    decimal_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    decimal_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = "trail_features"
    
    def __str__(self):
        return f"{self.feature_name} on {self.trail.name}"