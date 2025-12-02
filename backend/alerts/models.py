from django.db import models
from django.core.validators import EmailValidator


class NewsItem(models.Model):
    """Model to store news items fetched from API"""
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    url = models.URLField(max_length=1000)
    source = models.CharField(max_length=200)
    author = models.CharField(max_length=200, blank=True, null=True)
    published_at = models.DateTimeField()
    image_url = models.URLField(max_length=1000, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    keywords = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at']
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['source']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return self.title[:100]


class Filter(models.Model):
    """Model to store filter criteria for news alerts"""
    name = models.CharField(max_length=200)
    keywords = models.JSONField(default=list, help_text="List of keywords to filter by")
    sources = models.JSONField(default=list, blank=True, help_text="List of source names")
    categories = models.JSONField(default=list, blank=True, help_text="List of categories")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Alert(models.Model):
    """Model to store alert configurations"""
    email = models.EmailField(validators=[EmailValidator()])
    filter_criteria = models.ForeignKey(Filter, on_delete=models.CASCADE, related_name='alerts')
    frequency = models.CharField(
        max_length=50,
        choices=[
            ('immediate', 'Immediate'),
            ('hourly', 'Hourly'),
            ('daily', 'Daily'),
        ],
        default='daily'
    )
    is_active = models.BooleanField(default=True)
    last_sent = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['email', 'filter_criteria']]

    def __str__(self):
        return f"{self.email} - {self.filter_criteria.name}"


class AlertHistory(models.Model):
    """Model to track sent alerts"""
    alert = models.ForeignKey(Alert, on_delete=models.CASCADE, related_name='history')
    news_items = models.ManyToManyField(NewsItem, related_name='alert_histories')
    sent_at = models.DateTimeField(auto_now_add=True)
    email_status = models.CharField(
        max_length=50,
        choices=[
            ('sent', 'Sent'),
            ('failed', 'Failed'),
        ],
        default='sent'
    )

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"{self.alert.email} - {self.sent_at}"

