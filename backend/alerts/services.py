import requests
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import NewsItem, Filter, Alert, AlertHistory

logger = logging.getLogger(__name__)


class NewsAPIService:
    """Service to fetch news from NewsAPI"""
    
    def __init__(self):
        self.api_key = settings.NEWS_API_KEY
        self.base_url = settings.NEWS_API_URL
        
    def fetch_top_headlines(self, category=None, country='us', page_size=100):
        """Fetch top headlines from NewsAPI"""
        if not self.api_key:
            logger.warning("NEWS_API_KEY not configured. Using sample data.")
            return self._get_sample_data()
        
        try:
            url = f"{self.base_url}/top-headlines"
            params = {
                'apiKey': self.api_key,
                'country': country,
                'pageSize': page_size,
            }
            
            if category:
                params['category'] = category
                
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return data.get('articles', [])
            
        except requests.RequestException as e:
            logger.error(f"Error fetching news from API: {e}")
            return self._get_sample_data()
    
    def fetch_everything(self, query=None, page_size=100):
        """Fetch all news articles from NewsAPI"""
        if not self.api_key:
            logger.warning("NEWS_API_KEY not configured. Using sample data.")
            return self._get_sample_data()
        
        try:
            url = f"{self.base_url}/everything"
            params = {
                'apiKey': self.api_key,
                'pageSize': page_size,
                'sortBy': 'publishedAt',
            }
            
            if query:
                params['q'] = query
            else:
                # Default query if none provided
                params['q'] = 'news'
                
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return data.get('articles', [])
            
        except requests.RequestException as e:
            logger.error(f"Error fetching news from API: {e}")
            return self._get_sample_data()
    
    def _get_sample_data(self):
        """Return sample news data if API is unavailable"""
        return [
            {
                'title': 'Sample News Article 1',
                'description': 'This is a sample news article description.',
                'content': 'This is the full content of the sample news article.',
                'url': 'https://example.com/news/1',
                'source': {'name': 'Sample Source'},
                'author': 'Sample Author',
                'publishedAt': datetime.now().isoformat(),
                'urlToImage': None,
            },
            {
                'title': 'Sample News Article 2',
                'description': 'Another sample news article description.',
                'content': 'Another sample news article content.',
                'url': 'https://example.com/news/2',
                'source': {'name': 'Another Source'},
                'author': 'Another Author',
                'publishedAt': (datetime.now() - timedelta(hours=1)).isoformat(),
                'urlToImage': None,
            },
        ]


class NewsFilterService:
    """Service to filter news items based on criteria"""
    
    @staticmethod
    def filter_news(news_items, filter_criteria):
        """Filter news items based on filter criteria"""
        if not filter_criteria:
            return news_items
        
        filtered_items = []
        
        for item in news_items:
            matches = True
            
            # Filter by keywords
            if filter_criteria.keywords:
                text_content = f"{item.title} {item.description or ''} {item.content or ''}".lower()
                keyword_match = any(
                    keyword.lower() in text_content 
                    for keyword in filter_criteria.keywords
                )
                if not keyword_match:
                    matches = False
            
            # Filter by sources
            if filter_criteria.sources and matches:
                source_match = any(
                    source.lower() in item.source.lower()
                    for source in filter_criteria.sources
                )
                if not source_match:
                    matches = False
            
            # Filter by categories
            if filter_criteria.categories and matches:
                if item.category:
                    category_match = any(
                        cat.lower() == item.category.lower()
                        for cat in filter_criteria.categories
                    )
                    if not category_match:
                        matches = False
                else:
                    matches = False
            
            if matches:
                filtered_items.append(item)
        
        return filtered_items


class NewsStorageService:
    """Service to store news items in database"""
    
    @staticmethod
    def store_news_items(articles):
        """Store news articles in the database"""
        stored_items = []
        
        for article in articles:
            # Parse published date
            published_at_str = article.get('publishedAt')
            if published_at_str:
                try:
                    # Handle different datetime formats
                    if 'T' in published_at_str:
                        published_at = datetime.fromisoformat(
                            published_at_str.replace('Z', '+00:00')
                        )
                    else:
                        published_at = datetime.strptime(
                            published_at_str, '%Y-%m-%d %H:%M:%S'
                        )
                except (ValueError, AttributeError):
                    published_at = datetime.now()
            else:
                published_at = datetime.now()
            
            # Extract source name
            source = article.get('source', {})
            source_name = source.get('name', 'Unknown') if isinstance(source, dict) else str(source)
            
            # Check if news item already exists
            existing_item = NewsItem.objects.filter(url=article.get('url')).first()
            
            if existing_item:
                stored_items.append(existing_item)
                continue
            
            # Create news item
            news_item = NewsItem.objects.create(
                title=article.get('title', '')[:500],
                description=article.get('description', '')[:2000],
                content=article.get('content', '')[:10000],
                url=article.get('url', ''),
                source=source_name[:200],
                author=article.get('author', '')[:200] if article.get('author') else None,
                published_at=published_at,
                image_url=article.get('urlToImage', '')[:1000] if article.get('urlToImage') else None,
            )
            
            stored_items.append(news_item)
        
        return stored_items


class EmailAlertService:
    """Service to send email alerts"""
    
    @staticmethod
    def send_alert(alert, news_items):
        """Send email alert with filtered news items"""
        if not news_items:
            logger.info(f"No news items to send for alert {alert.id}")
            return False
        
        try:
            # Prepare email content
            subject = f"News Alert: {alert.filter_criteria.name}"
            
            # Create HTML email
            html_message = f"""
            <html>
            <body>
                <h2>News Alert: {alert.filter_criteria.name}</h2>
                <p>You have {len(news_items)} new article(s) matching your criteria.</p>
                <hr>
            """
            
            for item in news_items[:10]:  # Limit to 10 items in email
                html_message += f"""
                <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd;">
                    <h3><a href="{item.url}" target="_blank">{item.title}</a></h3>
                    <p><strong>Source:</strong> {item.source}</p>
                    <p><strong>Published:</strong> {item.published_at.strftime('%Y-%m-%d %H:%M')}</p>
                    {f'<p>{item.description[:200]}...</p>' if item.description else ''}
                </div>
                """
            
            html_message += """
                <hr>
                <p><small>This is an automated news alert. To manage your alerts, please visit the news alert system.</small></p>
            </body>
            </html>
            """
            
            plain_message = strip_tags(html_message)
            
            # Send email
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[alert.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            # Update alert last_sent
            alert.last_sent = datetime.now()
            alert.save()
            
            # Create alert history
            alert_history = AlertHistory.objects.create(
                alert=alert,
                email_status='sent'
            )
            alert_history.news_items.set(news_items)
            
            logger.info(f"Successfully sent alert {alert.id} to {alert.email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending alert {alert.id}: {e}")
            
            # Create alert history with failed status
            try:
                alert_history = AlertHistory.objects.create(
                    alert=alert,
                    email_status='failed'
                )
                alert_history.news_items.set(news_items)
            except Exception:
                pass
            
            return False

