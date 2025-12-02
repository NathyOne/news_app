# Troubleshooting Guide

## Common Issues and Solutions

### 500 Internal Server Error on API Endpoints

This error typically occurs when:
1. Database migrations haven't been run
2. Database connection is failing
3. Database tables don't exist

**Solution:**

1. **Check if database exists:**
   ```bash
   mysql -u root -p
   SHOW DATABASES;
   ```
   If `news_alert_db` doesn't exist, create it:
   ```sql
   CREATE DATABASE news_alert_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

2. **Run migrations:**
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   python manage.py migrate
   ```

3. **Check backend logs:**
   Look at the terminal where you're running `python manage.py runserver` to see the actual error message.

4. **Verify database settings in `.env`:**
   Make sure your `backend/.env` file has correct database credentials:
   ```
   DB_NAME=news_alert_db
   DB_USER=root
   DB_PASSWORD=your-password
   DB_HOST=localhost
   DB_PORT=3306
   ```

### React Router Warnings

The warnings about `v7_startTransition` and `v7_relativeSplatPath` are now fixed by adding future flags to BrowserRouter. These are just warnings and won't break functionality, but the fix ensures compatibility with React Router v7.

### Frontend Can't Connect to Backend

**Error:** "Cannot connect to backend server"

**Solution:**

1. **Verify backend is running:**
   ```bash
   curl http://localhost:8000/api/news/
   ```
   Or visit http://localhost:8000/api/news/ in your browser

2. **Check CORS settings:**
   Make sure `CORS_ALLOWED_ORIGINS` in `backend/news_alert/settings.py` includes:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",
       "http://127.0.0.1:3000",
   ]
   ```

3. **Check proxy settings:**
   The `package.json` should have:
   ```json
   "proxy": "http://localhost:8000"
   ```

### Database Connection Errors

**Error:** "Can't connect to MySQL server"

**Solutions:**

1. **Start MySQL service:**
   ```bash
   # Linux
   sudo systemctl start mysql
   
   # macOS
   brew services start mysql
   
   # Windows
   # Start MySQL from Services
   ```

2. **Check MySQL is listening:**
   ```bash
   mysql -u root -p -e "SELECT 1;"
   ```

3. **Verify credentials:**
   Test connection manually:
   ```bash
   mysql -u root -p
   # Enter password
   USE news_alert_db;
   SHOW TABLES;
   ```

### Module Not Found Errors (Backend)

**Error:** "ModuleNotFoundError: No module named 'X'"

**Solution:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### News API Not Working

**Error:** "Error fetching news from API"

**Solutions:**

1. **Check API key:**
   - Verify `NEWS_API_KEY` in `backend/.env`
   - Get a free key from https://newsapi.org/

2. **Check API limits:**
   - Free tier: 100 requests per day
   - Check your usage at https://newsapi.org/account

3. **Test API manually:**
   ```bash
   curl "https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_API_KEY"
   ```

### Email Not Sending

**Error:** "Failed to send test alert"

**Solutions:**

1. **For Gmail:**
   - Enable 2-Step Verification
   - Generate App Password (not your regular password)
   - Use app password in `EMAIL_HOST_PASSWORD`

2. **Check email settings:**
   ```python
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password  # Not regular password!
   ```

3. **Test email configuration:**
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py shell
   ```
   ```python
   from django.core.mail import send_mail
   send_mail('Test', 'Test message', 'from@example.com', ['to@example.com'])
   ```

### Empty News List After Fetching

**Possible causes:**

1. **API returned empty results**
   - Try different category or query
   - Check if API key has remaining requests

2. **Database insert failed**
   - Check backend logs for errors
   - Verify database connection

3. **News items not displayed**
   - Check browser console for errors
   - Verify API response in Network tab

## Getting Help

If you're still experiencing issues:

1. Check backend server logs (terminal running `python manage.py runserver`)
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Try running migrations again: `python manage.py migrate --run-syncdb`

## Quick Diagnostic Checklist

- [ ] Backend server is running on port 8000
- [ ] Frontend server is running on port 3000
- [ ] MySQL is running and accessible
- [ ] Database `news_alert_db` exists
- [ ] Migrations have been run
- [ ] `.env` file exists in `backend/` directory
- [ ] All environment variables are set
- [ ] Python virtual environment is activated
- [ ] All Python packages are installed
- [ ] All Node.js packages are installed

