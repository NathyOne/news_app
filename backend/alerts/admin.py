from django.contrib import admin
from .models import NewsItem, Filter, Alert, AlertHistory


@admin.register(NewsItem)
class NewsItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'source', 'category', 'published_at', 'created_at']
    list_filter = ['source', 'category', 'published_at']
    search_fields = ['title', 'description', 'content']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Filter)
class FilterAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name']


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['email', 'filter_criteria', 'frequency', 'is_active', 'last_sent']
    list_filter = ['frequency', 'is_active', 'last_sent']
    search_fields = ['email']


@admin.register(AlertHistory)
class AlertHistoryAdmin(admin.ModelAdmin):
    list_display = ['alert', 'sent_at', 'email_status']
    list_filter = ['email_status', 'sent_at']
    filter_horizontal = ['news_items']

