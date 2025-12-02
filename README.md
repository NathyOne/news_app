# News Alert System

A comprehensive news alert system built with Django REST Framework (backend) and React with Redux Toolkit (frontend). The system fetches news from public APIs, filters them based on user-defined criteria, and sends email alerts.

## Features

- **News Fetching**: Retrieve news articles from NewsAPI (free tier available)
- **Filtering & Categorization**: Create custom filters based on keywords, sources, and categories
- **Email Alerts**: Configure email alerts with different frequencies (immediate, hourly, daily)
- **Web Interface**: Modern React-based UI with Redux Toolkit for state management
- **RESTful API**: Django REST Framework backend with MySQL database
- **Alert History**: Track all sent alerts with their status

## Tech Stack

### Backend
- Python 3.8+
- Django 4.2
- Django REST Framework 3.14
- MySQL
- NewsAPI (free tier)

### Frontend
- React 18
- Redux Toolkit 2.0
- React Router 6
- Axios

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- MySQL 5.7 or higher
- NewsAPI key (get one for free at https://newsapi.org/)
- Email account for sending alerts (Gmail recommended)

## Setup Instructions

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up MySQL database:**
   ```sql
   CREATE DATABASE news_alert_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your configuration:
   - Database credentials
   - Email settings (for Gmail, you may need to use an app-specific password)
   - NewsAPI key (get one at https://newsapi.org/)

6. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create a superuser (optional, for admin access):**
   ```bash
   python manage.py createsuperuser
   ```

8. **Start the development server:**
   ```bash
   python manage.py runserver
   ```
   The backend will be available at http://localhost:8000

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file (optional, if API URL differs):**
   ```bash
   echo "REACT_APP_API_URL=http://localhost:8000/api" > .env
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   The frontend will be available at http://localhost:3000

## Usage

### Fetching News

1. Navigate to the News page
2. Click "Fetch Latest News"
3. Choose a category or enter a search query
4. Click "Fetch News" to retrieve articles from the API

### Creating Filters

1. Go to the Filters page
2. Click "Create Filter"
3. Enter a name and define your filter criteria:
   - **Keywords**: Comma-separated keywords to search for in titles/descriptions
   - **Sources**: Specific news sources (optional)
   - **Categories**: News categories (optional)
4. Click "Create" to save the filter
5. Use "Apply" to see filtered news results

### Setting Up Alerts

1. Go to the Alerts page
2. Click "Create Alert"
3. Enter your email address
4. Select a filter from the dropdown
5. Choose alert frequency:
   - **Immediate**: Send as soon as matching news is found
   - **Hourly**: Send once per hour if there are new matches
   - **Daily**: Send once per day if there are new matches
6. Click "Create" to save the alert
7. Use "Test" to send a test email immediately

### Processing Alerts

- Click "Process All Alerts" to manually trigger all active alerts
- Alerts will automatically send emails based on their frequency settings
- View alert history in the History page

## Management Commands

### Fetch News Manually

```bash
python manage.py fetch_news --category technology --page-size 50
python manage.py fetch_news --query "artificial intelligence" --page-size 100
```

### Process All Alerts

```bash
python manage.py process_alerts --days 1
```

## API Endpoints

- `GET /api/news/` - List all news items
- `POST /api/news/fetch/` - Fetch news from API
- `GET /api/filters/` - List all filters
- `POST /api/filters/` - Create a filter
- `POST /api/filters/{id}/apply/` - Apply a filter to news
- `GET /api/alerts/` - List all alerts
- `POST /api/alerts/` - Create an alert
- `POST /api/alerts/{id}/test/` - Test send an alert
- `POST /api/alerts/process_all/` - Process all active alerts
- `GET /api/alert-history/` - View alert history

## Configuration

### Email Setup (Gmail)

1. Enable 2-Step Verification on your Google Account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use the app password in `EMAIL_HOST_PASSWORD`

### NewsAPI Setup

1. Sign up at https://newsapi.org/
2. Get your free API key
3. Add it to your `.env` file as `NEWS_API_KEY`

Note: The free tier has limitations (100 requests per day). For production, consider upgrading.

## Project Structure

```
news_app/
├── backend/
│   ├── alerts/
│   │   ├── models.py          # Database models
│   │   ├── views.py           # API views
│   │   ├── serializers.py     # DRF serializers
│   │   ├── services.py        # Business logic
│   │   └── management/        # Management commands
│   ├── news_alert/
│   │   └── settings.py        # Django settings
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── store/             # Redux store and slices
│   │   └── services/          # API service
│   └── package.json
└── README.md
```

## Troubleshooting

### Database Connection Issues

- Ensure MySQL is running
- Verify database credentials in `.env`
- Check if the database exists

### Email Not Sending

- Verify email credentials in `.env`
- For Gmail, use an app-specific password
- Check email backend configuration

### News API Not Working

- Verify your API key is correct
- Check if you've exceeded the free tier limit
- Ensure internet connection is working

## License

This project is open source and available for educational purposes.

## Contributing

Feel free to submit issues and enhancement requests!

