from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import NewsItem, Filter, Alert, AlertHistory
from .serializers import (
    NewsItemSerializer, FilterSerializer, AlertSerializer, AlertHistorySerializer
)
from .services import (
    NewsAPIService, NewsFilterService, NewsStorageService, EmailAlertService
)


class NewsItemViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing news items"""
    queryset = NewsItem.objects.all()
    serializer_class = NewsItemSerializer
    search_fields = ['title', 'description', 'content']
    ordering_fields = ['published_at', 'created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by source
        source = self.request.query_params.get('source', None)
        if source:
            queryset = queryset.filter(source__icontains=source)
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by keywords (search in title/description)
        keywords = self.request.query_params.get('keywords', None)
        if keywords:
            keyword_list = [k.strip() for k in keywords.split(',')]
            for keyword in keyword_list:
                queryset = queryset.filter(
                    title__icontains=keyword
                ) | queryset.filter(
                    description__icontains=keyword
                )
        
        return queryset.distinct()
    
    @action(detail=False, methods=['post'])
    def fetch(self, request):
        """Fetch latest news from API and store in database"""
        category = request.data.get('category', None)
        query = request.data.get('query', None)
        page_size = request.data.get('page_size', 100)
        
        news_service = NewsAPIService()
        
        if query:
            articles = news_service.fetch_everything(query=query, page_size=page_size)
        else:
            articles = news_service.fetch_top_headlines(category=category, page_size=page_size)
        
        storage_service = NewsStorageService()
        stored_items = storage_service.store_news_items(articles)
        
        serializer = self.get_serializer(stored_items, many=True)
        return Response({
            'count': len(stored_items),
            'results': serializer.data
        })


class FilterViewSet(viewsets.ModelViewSet):
    """ViewSet for managing filters"""
    queryset = Filter.objects.all()
    serializer_class = FilterSerializer
    
    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """Apply filter to news items and return filtered results"""
        filter_obj = self.get_object()
        
        # Get news items (recent ones)
        days = request.data.get('days', 7)
        since = timezone.now() - timedelta(days=days)
        news_items = NewsItem.objects.filter(published_at__gte=since)
        
        # Apply filter
        filter_service = NewsFilterService()
        filtered_items = filter_service.filter_news(news_items, filter_obj)
        
        serializer = NewsItemSerializer(filtered_items, many=True)
        return Response({
            'filter': FilterSerializer(filter_obj).data,
            'count': len(filtered_items),
            'results': serializer.data
        })


class AlertViewSet(viewsets.ModelViewSet):
    """ViewSet for managing alerts"""
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    
    def perform_create(self, serializer):
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def test(self, request, pk=None):
        """Test sending an alert"""
        alert = self.get_object()
        
        # Get recent news items
        days = request.data.get('days', 7)
        since = timezone.now() - timedelta(days=days)
        news_items = list(NewsItem.objects.filter(published_at__gte=since))
        
        # Apply filter
        filter_service = NewsFilterService()
        filtered_items = filter_service.filter_news(news_items, alert.filter_criteria)
        
        if not filtered_items:
            return Response({
                'message': 'No news items match the filter criteria',
                'count': 0
            }, status=status.HTTP_200_OK)
        
        # Send email
        email_service = EmailAlertService()
        success = email_service.send_alert(alert, filtered_items[:10])
        
        if success:
            return Response({
                'message': 'Test alert sent successfully',
                'count': len(filtered_items)
            })
        else:
            return Response({
                'message': 'Failed to send test alert',
                'count': len(filtered_items)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def process_all(self, request):
        """Process all active alerts and send emails"""
        active_alerts = Alert.objects.filter(is_active=True)
        
        results = []
        
        for alert in active_alerts:
            # Check if alert should be sent based on frequency
            should_send = False
            
            if alert.frequency == 'immediate':
                should_send = True
            elif alert.frequency == 'hourly':
                if not alert.last_sent or \
                   (timezone.now() - alert.last_sent) >= timedelta(hours=1):
                    should_send = True
            elif alert.frequency == 'daily':
                if not alert.last_sent or \
                   (timezone.now() - alert.last_sent) >= timedelta(days=1):
                    should_send = True
            
            if not should_send:
                results.append({
                    'alert_id': alert.id,
                    'email': alert.email,
                    'status': 'skipped',
                    'reason': 'Frequency limit not reached'
                })
                continue
            
            # Get recent news items
            days = request.data.get('days', 1)
            since = timezone.now() - timedelta(days=days)
            news_items = list(NewsItem.objects.filter(published_at__gte=since))
            
            # Apply filter
            filter_service = NewsFilterService()
            filtered_items = filter_service.filter_news(news_items, alert.filter_criteria)
            
            if not filtered_items:
                results.append({
                    'alert_id': alert.id,
                    'email': alert.email,
                    'status': 'no_news',
                    'count': 0
                })
                continue
            
            # Send email
            email_service = EmailAlertService()
            success = email_service.send_alert(alert, filtered_items[:10])
            
            results.append({
                'alert_id': alert.id,
                'email': alert.email,
                'status': 'sent' if success else 'failed',
                'count': len(filtered_items)
            })
        
        return Response({
            'processed': len(results),
            'results': results
        })


class AlertHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing alert history"""
    queryset = AlertHistory.objects.all()
    serializer_class = AlertHistorySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by alert
        alert_id = self.request.query_params.get('alert', None)
        if alert_id:
            queryset = queryset.filter(alert_id=alert_id)
        
        return queryset

