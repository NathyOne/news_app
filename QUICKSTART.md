# Quick Start Guide

This guide will help you get the News Alert System up and running quickly.

## Prerequisites Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed  
- [ ] MySQL 5.7+ installed and running
- [ ] NewsAPI key (free at https://newsapi.org/)
- [ ] Gmail account (for email alerts)

## Step-by-Step Setup

### 1. Database Setup

```sql
CREATE DATABASE news_alert_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (see ENV_SETUP.md for details)
# Copy the template and fill in your values

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend should now be running at http://localhost:8000

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend should now be running at http://localhost:3000

### 4. First Steps

1. **Fetch News**: 
   - Go to http://localhost:3000
   - Click "Fetch Latest News"
   - Select a category or enter a query
   - Click "Fetch News"

2. **Create a Filter**:
   - Go to Filters page
   - Click "Create Filter"
   - Enter keywords (e.g., "technology, AI")
   - Save the filter

3. **Create an Alert**:
   - Go to Alerts page
   - Click "Create Alert"
   - Enter your email
   - Select the filter you created
   - Choose frequency
   - Click "Create"

4. **Test the Alert**:
   - Click "Test" on your alert
   - Check your email for the test alert

## Configuration

### Required Environment Variables

Create `backend/.env` with:

```
NEWS_API_KEY=your-newsapi-key-here
DB_PASSWORD=your-mysql-password
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
```

See `backend/ENV_SETUP.md` for detailed configuration instructions.

## Troubleshooting

### "Module not found" errors
- Make sure virtual environment is activated
- Reinstall requirements: `pip install -r requirements.txt`

### Database connection errors
- Check MySQL is running: `mysql -u root -p`
- Verify database exists
- Check credentials in `.env`

### Email not sending
- For Gmail, use an app-specific password
- Enable 2-Step Verification first
- Check email settings in `.env`

### News API errors
- Verify API key is correct
- Check if you've exceeded free tier (100 requests/day)
- API key might need time to activate

## Next Steps

- Set up automated news fetching (cron job or task scheduler)
- Set up automated alert processing (cron job)
- Customize email templates in `backend/alerts/services.py`
- Add more filter options
- Deploy to production

## Useful Commands

```bash
# Fetch news manually
python manage.py fetch_news --category technology

# Process all alerts
python manage.py process_alerts --days 1

# Access Django admin
python manage.py createsuperuser
# Then visit http://localhost:8000/admin
```

## Support

For detailed documentation, see README.md

