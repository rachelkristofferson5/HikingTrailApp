"""
    Configuration for app. Defines app settings and runs the startup code.
"""

from django.apps import AppConfig

"""Configures users app and startup behavior of app."""
class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "users"

    # Loads signals for registration.
    def ready(self):
        import users.signals

