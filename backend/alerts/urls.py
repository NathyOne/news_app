from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NewsItemViewSet, FilterViewSet, AlertViewSet, AlertHistoryViewSet
)

router = DefaultRouter()
router.register(r'news', NewsItemViewSet, basename='news')
router.register(r'filters', FilterViewSet, basename='filter')
router.register(r'alerts', AlertViewSet, basename='alert')
router.register(r'alert-history', AlertHistoryViewSet, basename='alert-history')

urlpatterns = [
    path('', include(router.urls)),
]

