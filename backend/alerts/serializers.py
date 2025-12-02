from rest_framework import serializers
from .models import NewsItem, Filter, Alert, AlertHistory


class NewsItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsItem
        fields = [
            'id', 'title', 'description', 'content', 'url', 'source',
            'author', 'published_at', 'image_url', 'category', 'keywords',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class FilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filter
        fields = [
            'id', 'name', 'keywords', 'sources', 'categories',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AlertSerializer(serializers.ModelSerializer):
    filter_criteria = FilterSerializer(read_only=True)
    filter_criteria_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = Alert
        fields = [
            'id', 'email', 'filter_criteria', 'filter_criteria_id',
            'frequency', 'is_active', 'last_sent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_sent', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        filter_criteria_id = validated_data.pop('filter_criteria_id')
        from .models import Filter
        filter_criteria = Filter.objects.get(pk=filter_criteria_id)
        return Alert.objects.create(filter_criteria=filter_criteria, **validated_data)
    
    def update(self, instance, validated_data):
        if 'filter_criteria_id' in validated_data:
            filter_criteria_id = validated_data.pop('filter_criteria_id')
            from .models import Filter
            instance.filter_criteria = Filter.objects.get(pk=filter_criteria_id)
        return super().update(instance, validated_data)


class AlertHistorySerializer(serializers.ModelSerializer):
    news_items = NewsItemSerializer(many=True, read_only=True)
    alert = AlertSerializer(read_only=True)

    class Meta:
        model = AlertHistory
        fields = ['id', 'alert', 'news_items', 'sent_at', 'email_status']

