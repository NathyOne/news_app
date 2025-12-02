from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from alerts.models import Alert
from alerts.services import NewsFilterService, EmailAlertService


class Command(BaseCommand):
    help = 'Process all active alerts and send emails'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            help='Number of days to look back for news',
            default=1
        )

    def handle(self, *args, **options):
        days = options['days']
        since = timezone.now() - timedelta(days=days)
        
        self.stdout.write('Processing alerts...')
        
        active_alerts = Alert.objects.filter(is_active=True)
        self.stdout.write(f'Found {active_alerts.count()} active alerts')
        
        filter_service = NewsFilterService()
        email_service = EmailAlertService()
        
        sent_count = 0
        skipped_count = 0
        failed_count = 0
        
        for alert in active_alerts:
            # Check frequency
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
                skipped_count += 1
                continue
            
            # Get news items
            from alerts.models import NewsItem
            news_items = list(NewsItem.objects.filter(published_at__gte=since))
            
            # Apply filter
            filtered_items = filter_service.filter_news(news_items, alert.filter_criteria)
            
            if not filtered_items:
                skipped_count += 1
                continue
            
            # Send email
            success = email_service.send_alert(alert, filtered_items[:10])
            
            if success:
                sent_count += 1
                self.stdout.write(f'Sent alert to {alert.email}')
            else:
                failed_count += 1
                self.stdout.write(
                    self.style.ERROR(f'Failed to send alert to {alert.email}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Processed alerts: {sent_count} sent, '
                f'{skipped_count} skipped, {failed_count} failed'
            )
        )

