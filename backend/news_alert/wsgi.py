"""
WSGI config for news_alert project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'news_alert.settings')

application = get_wsgi_application()

