from django.core.management.base import BaseCommand
from alerts.services import NewsAPIService, NewsStorageService


class Command(BaseCommand):
    help = 'Fetch news from NewsAPI and store in database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--category',
            type=str,
            help='News category (e.g., technology, business, sports)',
            default=None
        )
        parser.add_argument(
            '--query',
            type=str,
            help='Search query for news',
            default=None
        )
        parser.add_argument(
            '--page-size',
            type=int,
            help='Number of articles to fetch',
            default=100
        )

    def handle(self, *args, **options):
        category = options['category']
        query = options['query']
        page_size = options['page_size']

        self.stdout.write('Fetching news...')
        
        news_service = NewsAPIService()
        
        if query:
            articles = news_service.fetch_everything(query=query, page_size=page_size)
        else:
            articles = news_service.fetch_top_headlines(category=category, page_size=page_size)
        
        self.stdout.write(f'Fetched {len(articles)} articles')
        
        storage_service = NewsStorageService()
        stored_items = storage_service.store_news_items(articles)
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully stored {len(stored_items)} news items')
        )

