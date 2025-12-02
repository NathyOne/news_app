# Project Structure

```
news_app/
│
├── backend/                          # Django REST Framework backend
│   ├── alerts/                       # Main application
│   │   ├── models.py                 # Database models (NewsItem, Filter, Alert, AlertHistory)
│   │   ├── views.py                  # API viewsets
│   │   ├── serializers.py            # DRF serializers
│   │   ├── services.py               # Business logic (NewsAPI, filtering, email)
│   │   ├── admin.py                  # Django admin configuration
│   │   ├── urls.py                   # URL routing
│   │   ├── apps.py                   # App configuration
│   │   └── management/
│   │       └── commands/
│   │           ├── fetch_news.py     # Command to fetch news
│   │           └── process_alerts.py # Command to process alerts
│   │
│   ├── news_alert/                   # Django project settings
│   │   ├── settings.py               # Main settings file
│   │   ├── urls.py                   # Root URL configuration
│   │   ├── wsgi.py                   # WSGI configuration
│   │   └── asgi.py                   # ASGI configuration
│   │
│   ├── manage.py                     # Django management script
│   ├── requirements.txt              # Python dependencies
│   └── ENV_SETUP.md                  # Environment setup guide
│
├── frontend/                         # React frontend
│   ├── public/
│   │   └── index.html                # HTML template
│   │
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── NewsList.js           # Display news articles
│   │   │   ├── FilterManagement.js   # Manage filters
│   │   │   ├── AlertManagement.js    # Manage alerts
│   │   │   └── AlertHistory.js       # View alert history
│   │   │
│   │   ├── store/                    # Redux store
│   │   │   ├── store.js              # Store configuration
│   │   │   └── slices/               # Redux slices
│   │   │       ├── newsSlice.js      # News state management
│   │   │       ├── filtersSlice.js   # Filters state management
│   │   │       ├── alertsSlice.js    # Alerts state management
│   │   │       └── alertHistorySlice.js
│   │   │
│   │   ├── services/
│   │   │   └── api.js                # API service layer
│   │   │
│   │   ├── App.js                    # Main App component
│   │   ├── App.css                   # App styles
│   │   ├── index.js                  # Entry point
│   │   └── index.css                 # Global styles
│   │
│   └── package.json                  # Node dependencies
│
├── README.md                         # Main documentation
├── QUICKSTART.md                     # Quick start guide
├── PROJECT_STRUCTURE.md              # This file
├── .gitignore                        # Git ignore rules
└── setup.sh                          # Setup script

```

## Key Components

### Backend (Django)

**Models:**
- `NewsItem`: Stores news articles from API
- `Filter`: User-defined filter criteria
- `Alert`: Email alert configuration
- `AlertHistory`: Tracks sent alerts

**Services:**
- `NewsAPIService`: Fetches news from NewsAPI
- `NewsFilterService`: Filters news based on criteria
- `NewsStorageService`: Stores news in database
- `EmailAlertService`: Sends email alerts

**API Endpoints:**
- `/api/news/` - News CRUD operations
- `/api/news/fetch/` - Fetch from external API
- `/api/filters/` - Filter management
- `/api/filters/{id}/apply/` - Apply filter to news
- `/api/alerts/` - Alert management
- `/api/alerts/{id}/test/` - Test alert
- `/api/alerts/process_all/` - Process all alerts
- `/api/alert-history/` - View alert history

### Frontend (React + Redux)

**Components:**
- `NewsList`: Display and fetch news articles
- `FilterManagement`: Create and manage filters
- `AlertManagement`: Create and manage alerts
- `AlertHistory`: View sent alert history

**State Management:**
- Redux Toolkit slices for each feature
- Centralized API service layer
- Async thunks for API calls

## Data Flow

1. **News Fetching:**
   - User clicks "Fetch Latest News"
   - Frontend calls `/api/news/fetch/`
   - Backend fetches from NewsAPI
   - News stored in database
   - Frontend displays news

2. **Filtering:**
   - User creates filter with criteria
   - User applies filter
   - Backend filters news items
   - Filtered results returned

3. **Alerts:**
   - User creates alert with email and filter
   - User tests alert or processes all
   - Backend filters news for alert
   - Email sent with filtered news
   - Alert history recorded

## Database Schema

- `alerts_newsitem`: News articles
- `alerts_filter`: Filter criteria
- `alerts_alert`: Alert configurations
- `alerts_alerthistory`: Sent alert records
- `alerts_alerthistory_news_items`: Many-to-many relationship

