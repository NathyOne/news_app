"""
ASGI config for news_alert project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'news_alert.settings')

application = get_asgi_application()

