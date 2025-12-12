import json
from datetime import timedelta

from django.http import JsonResponse, HttpResponseNotAllowed
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import Alert, AlertHistory, Filter, NewsItem
from .services import EmailAlertService, NewsAPIService, NewsFilterService, NewsStorageService


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_json(request):
    try:
        if request.body:
            return json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return {}
    return {}


def news_item_to_dict(item: NewsItem):
    return {
        "id": item.id,
        "title": item.title,
        "description": item.description,
        "content": item.content,
        "url": item.url,
        "source": item.source,
        "author": item.author,
        "published_at": item.published_at,
        "image_url": item.image_url,
        "category": item.category,
        "keywords": item.keywords,
        "created_at": item.created_at,
    }


def filter_to_dict(f: Filter):
    return {
        "id": f.id,
        "name": f.name,
        "keywords": f.keywords,
        "sources": f.sources,
        "categories": f.categories,
        "is_active": f.is_active,
        "created_at": f.created_at,
        "updated_at": f.updated_at,
    }


def alert_to_dict(a: Alert):
    return {
        "id": a.id,
        "email": a.email,
        "filter_criteria": filter_to_dict(a.filter_criteria) if a.filter_criteria else None,
        "frequency": a.frequency,
        "is_active": a.is_active,
        "last_sent": a.last_sent,
        "created_at": a.created_at,
        "updated_at": a.updated_at,
    }


def alert_history_to_dict(h: AlertHistory):
    return {
        "id": h.id,
        "alert": alert_to_dict(h.alert),
        "news_items": [news_item_to_dict(n) for n in h.news_items.all()],
        "sent_at": h.sent_at,
        "email_status": h.email_status,
    }


# ---------------------------------------------------------------------------
# News endpoints
# ---------------------------------------------------------------------------

@csrf_exempt
def news_list(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    qs = NewsItem.objects.all()

    source = request.GET.get("source")
    if source:
        qs = qs.filter(source__icontains=source)

    category = request.GET.get("category")
    if category:
        qs = qs.filter(category=category)

    keywords = request.GET.get("keywords")
    if keywords:
        for kw in [k.strip() for k in keywords.split(",") if k.strip()]:
            qs = qs.filter(title__icontains=kw) | qs.filter(description__icontains=kw)

    items = [news_item_to_dict(n) for n in qs.order_by("-published_at")]
    return JsonResponse({"count": len(items), "results": items}, safe=False)


@csrf_exempt
def news_fetch(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    data = _parse_json(request)
    category = data.get("category")
    query = data.get("query")
    page_size = data.get("page_size", 100)

    news_service = NewsAPIService()
    if query:
        articles = news_service.fetch_everything(query=query, page_size=page_size)
    else:
        articles = news_service.fetch_top_headlines(category=category, page_size=page_size)

    stored_items = NewsStorageService.store_news_items(articles)
    items = [news_item_to_dict(n) for n in stored_items]
    return JsonResponse({"count": len(items), "results": items})


# ---------------------------------------------------------------------------
# Filters
# ---------------------------------------------------------------------------

@csrf_exempt
def filters_list(request):
    if request.method == "GET":
        filters = [filter_to_dict(f) for f in Filter.objects.all().order_by("-created_at")]
        return JsonResponse({"count": len(filters), "results": filters})

    if request.method == "POST":
        data = _parse_json(request)
        f = Filter.objects.create(
            name=data.get("name", ""),
            keywords=data.get("keywords", []),
            sources=data.get("sources", []),
            categories=data.get("categories", []),
            is_active=data.get("is_active", True),
        )
        return JsonResponse(filter_to_dict(f), status=201)

    return HttpResponseNotAllowed(["GET", "POST"])


@csrf_exempt
def filter_detail(request, filter_id):
    f = get_object_or_404(Filter, pk=filter_id)

    if request.method == "GET":
        return JsonResponse(filter_to_dict(f))

    if request.method == "PUT":
        data = _parse_json(request)
        f.name = data.get("name", f.name)
        f.keywords = data.get("keywords", f.keywords)
        f.sources = data.get("sources", f.sources)
        f.categories = data.get("categories", f.categories)
        f.is_active = data.get("is_active", f.is_active)
        f.save()
        return JsonResponse(filter_to_dict(f))

    if request.method == "DELETE":
        f.delete()
        return JsonResponse({"deleted": True})

    return HttpResponseNotAllowed(["GET", "PUT", "DELETE"])


@csrf_exempt
def filter_apply(request, filter_id):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    f = get_object_or_404(Filter, pk=filter_id)
    data = _parse_json(request)
    days = data.get("days", 7)
    since = timezone.now() - timedelta(days=days)
    news_items = NewsItem.objects.filter(published_at__gte=since)

    filtered = NewsFilterService.filter_news(news_items, f)
    items = [news_item_to_dict(n) for n in filtered]
    return JsonResponse({"filter": filter_to_dict(f), "count": len(items), "results": items})


# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------

@csrf_exempt
def alerts_list(request):
    if request.method == "GET":
        alerts = [alert_to_dict(a) for a in Alert.objects.all().order_by("-created_at")]
        return JsonResponse({"count": len(alerts), "results": alerts})

    if request.method == "POST":
        data = _parse_json(request)
        filter_id = data.get("filter_criteria_id")
        filter_obj = get_object_or_404(Filter, pk=filter_id)
        a = Alert.objects.create(
            email=data.get("email", ""),
            filter_criteria=filter_obj,
            frequency=data.get("frequency", "daily"),
            is_active=data.get("is_active", True),
        )
        return JsonResponse(alert_to_dict(a), status=201)

    return HttpResponseNotAllowed(["GET", "POST"])


@csrf_exempt
def alert_detail(request, alert_id):
    a = get_object_or_404(Alert, pk=alert_id)

    if request.method == "GET":
        return JsonResponse(alert_to_dict(a))

    if request.method == "PUT":
        data = _parse_json(request)
        if "filter_criteria_id" in data:
            a.filter_criteria = get_object_or_404(Filter, pk=data["filter_criteria_id"])
        a.email = data.get("email", a.email)
        a.frequency = data.get("frequency", a.frequency)
        a.is_active = data.get("is_active", a.is_active)
        a.save()
        return JsonResponse(alert_to_dict(a))

    if request.method == "DELETE":
        a.delete()
        return JsonResponse({"deleted": True})

    return HttpResponseNotAllowed(["GET", "PUT", "DELETE"])


@csrf_exempt
def alert_test(request, alert_id):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    alert = get_object_or_404(Alert, pk=alert_id)
    data = _parse_json(request)
    days = data.get("days", 7)
    since = timezone.now() - timedelta(days=days)
    news_items = list(NewsItem.objects.filter(published_at__gte=since))

    filtered_items = NewsFilterService.filter_news(news_items, alert.filter_criteria)
    if not filtered_items:
        return JsonResponse({"message": "No news items match the filter criteria", "count": 0})

    success = EmailAlertService.send_alert(alert, filtered_items[:10])
    return JsonResponse(
        {
            "message": "Test alert sent successfully" if success else "Failed to send test alert",
            "count": len(filtered_items),
            "status": "sent" if success else "failed",
        },
        status=200 if success else 500,
    )


@csrf_exempt
def alerts_process_all(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    data = _parse_json(request)
    days = data.get("days", 1)
    since = timezone.now() - timedelta(days=days)

    results = []
    for alert in Alert.objects.filter(is_active=True):
        should_send = False
        if alert.frequency == "immediate":
            should_send = True
        elif alert.frequency == "hourly":
            should_send = (not alert.last_sent) or (timezone.now() - alert.last_sent) >= timedelta(hours=1)
        elif alert.frequency == "daily":
            should_send = (not alert.last_sent) or (timezone.now() - alert.last_sent) >= timedelta(days=1)

        if not should_send:
            results.append({"alert_id": alert.id, "email": alert.email, "status": "skipped", "reason": "Frequency limit not reached"})
            continue

        news_items = list(NewsItem.objects.filter(published_at__gte=since))
        filtered_items = NewsFilterService.filter_news(news_items, alert.filter_criteria)
        if not filtered_items:
            results.append({"alert_id": alert.id, "email": alert.email, "status": "no_news", "count": 0})
            continue

        success = EmailAlertService.send_alert(alert, filtered_items[:10])
        results.append(
            {
                "alert_id": alert.id,
                "email": alert.email,
                "status": "sent" if success else "failed",
                "count": len(filtered_items),
            }
        )

    return JsonResponse({"processed": len(results), "results": results})


# ---------------------------------------------------------------------------
# Alert history
# ---------------------------------------------------------------------------

@csrf_exempt
def alert_history_list(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    alert_id = request.GET.get("alert")
    qs = AlertHistory.objects.all()
    if alert_id:
        qs = qs.filter(alert_id=alert_id)

    history = [alert_history_to_dict(h) for h in qs.order_by("-sent_at")]
    return JsonResponse({"count": len(history), "results": history})

