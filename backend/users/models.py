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
    


class UserFollow(models.Model):
    """User following relationships"""
    follow_id = models.AutoField(primary_key=True)
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following", 
                                 db_column="int_follower_id")
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers", 
                                  db_column="int_following_id")
    followed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "user_follows"
        unique_together = [["follower", "following"]]
    
    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"


class Notification(models.Model):
    """User notifications"""
    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications", 
                             db_column="int_user_id")
    notification_type = models.CharField(max_length=100)
    reference_id = models.IntegerField(null=True, blank=True)
    reference_type = models.CharField(max_length=100, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_read_secondary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
    
    def __str__(self):
        return f"Notification for {self.user.username}: {self.notification_type}"