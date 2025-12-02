# Environment Variables Setup

Create a `.env` file in the backend directory with the following variables:

```
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database Settings
DB_NAME=news_alert_db
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_HOST=localhost
DB_PORT=3306

# Email Settings
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=your-email@gmail.com

# News API Settings
NEWS_API_KEY=your-newsapi-key-here
```

## Getting Your API Keys

### NewsAPI Key
1. Visit https://newsapi.org/
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier allows 100 requests per day

### Gmail App Password (for email alerts)
1. Enable 2-Step Verification on your Google Account
2. Go to Google Account → Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a password for "Mail"
5. Use this password in EMAIL_HOST_PASSWORD

