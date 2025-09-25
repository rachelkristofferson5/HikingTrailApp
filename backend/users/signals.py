"""
    When a certain event happens, another event is automatically triggered, if
    function below is triggered.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import HikingProfile

"""
    When a new user is created, so too is a hiking profile.
"""
@receiver(post_save, sender=User)
def create_hiking_profile(sender, instance, created, **kwargs):
    if created:
        HikingProfile.objects.create(user=instance)


"""
    Saves hiking profile if user updates profile.
"""
@receiver(post_save, sender=User)
def save_hiking_profile(sender, instance, **kwargs):
    if hasattr(instance, "hikingprofile"):
        instance.hikingprofile.save()