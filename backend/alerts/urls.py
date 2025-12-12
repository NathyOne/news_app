from django.urls import path

from . import views

urlpatterns = [
    path("news/", views.news_list, name="news-list"),
    path("news/fetch/", views.news_fetch, name="news-fetch"),
    path("filters/", views.filters_list, name="filters-list"),
    path("filters/<int:filter_id>/", views.filter_detail, name="filter-detail"),
    path("filters/<int:filter_id>/apply/", views.filter_apply, name="filter-apply"),
    path("alerts/", views.alerts_list, name="alerts-list"),
    path("alerts/<int:alert_id>/", views.alert_detail, name="alert-detail"),
    path("alerts/<int:alert_id>/test/", views.alert_test, name="alert-test"),
    path("alerts/process_all/", views.alerts_process_all, name="alerts-process-all"),
    path("alert-history/", views.alert_history_list, name="alert-history"),
]

