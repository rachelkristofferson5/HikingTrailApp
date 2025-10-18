"""
    Create the models of the database tables and thier relationships.
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
    """Manager for custom user model"""
    
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        if not username:
            raise ValueError("Users must have a username")
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model matching database schema"""
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    password_hash = models.CharField(max_length=255, db_column="password_hash")
    full_name = models.CharField(max_length=255, blank=True)
    profile_photo_url = models.URLField(max_length=500, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    experience_level = models.CharField(max_length=50, choices= 
                                        [("beginner", "Beginner"),
                                        ("intermediate", "Intermediate"),
                                        ("advanced", "Advanced"),
                                        ("expert", "Expert")], 
                                        default="beginner")
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    
    objects = UserManager()
    
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]
    
    class Meta:
        db_table = "users"
    
    def __str__(self):
        return self.username
    


class Park(models.Model):
    """Parks table from schema"""
    
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
    """Trails table matching schema"""
    
    trail_id = models.AutoField(primary_key=True)
    nps_trail_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    park = models.ForeignKey(Park, on_delete=models.CASCADE, db_column="park_id", related_name="trails")
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=200)
    decimal_latitude = models.DecimalField(max_digits=10, decimal_places=7, 
                                           null=True, blank=True)
    decimal_longitude = models.DecimalField(max_digits=10, decimal_places=7, 
                                            null=True, blank=True)
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
    featured_photo_url = models.URLField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    nps_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "trails"
        ordering = ["name"]
    
    def __str__(self):
        return f"{self.name} ({self.difficulty})"
    



class UserTrail(models.Model):
    """User completed trails matching schema"""
    
    user_trail_id = models.AutoField(primary_key=True)
    user = models.ForeignKey("User", on_delete=models.CASCADE, db_column="user_id",         related_name="completed_trails")
    trail = models.ForeignKey(Trail, on_delete=models.CASCADE, db_column="trail_id", related_name="completed_by"
    )
    completed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "user_trails"
        ordering = ["-completed_at"]
    
    def __str__(self):
        return f"{self.user.username} completed {self.trail.name}"