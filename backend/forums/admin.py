from django.contrib import admin
from .models import ForumCategory, ForumThread, ForumPost


@admin.register(ForumCategory)
class ForumCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "display_order", "get_thread_count", "created_at"]
    ordering = ["display_order"]

    def get_thread_count(self, obj):
        return obj.thread_count()
    get_thread_count.short_description = "Threads"

@admin.register(ForumThread)
class ForumThreadAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "user", "is_pinned", "is_locked", 
                    "view_count", "created_at"]
    list_filter = ["category", "is_pinned", "is_locked"]
    search_fields = ["title", "user__username"]

@admin.register(ForumPost)
class ForumPostAdmin(admin.ModelAdmin):
    list_display = ["get_thread_title", "user", "parent_post", "is_edited", "created_at"]
    list_filter = ["thread", "is_edited"]
    search_fields = ["contents", "user__username"]

    def get_thread_title(self, obj):
        return obj.thread.title
    get_thread_title.short_description = "Thread"
