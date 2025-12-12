# Render Deployment Guide for news_app

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

Make sure all files are committed and pushed:

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Deploy Backend on Render

1. **Go to Render**: https://render.com
2. **Sign up** with your GitHub account
3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select repository: `NathyOne/news_app`

4. **Configure Backend Service**:
   - **Name**: `news-alert-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn news_alert.wsgi:application --bind 0.0.0.0:$PORT`
   - **Instance Type**: Free (or paid if needed)
   - Click "Create Web Service"

5. **Add PostgreSQL Database** (Render's free MySQL has limitations):
   - Click "New +" → "PostgreSQL"
   - Name: `news-alert-db`
   - Database: (auto-generated)
   - User: (auto-generated)
   - Region: Choose closest to you
   - PostgreSQL Version: 15
   - Click "Create Database"
   - **Copy the Internal Database URL** from the database dashboard

6. **Update Backend for PostgreSQL**:

   Update `backend/requirements.txt` to include PostgreSQL driver:
   ```txt
   psycopg2-binary==2.9.9
   ```
   
   Update `backend/news_alert/settings.py` database configuration:
   ```python
   import os
   import dj_database_url
   
   # Database
   if 'DATABASE_URL' in os.environ:
       DATABASES = {
           'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
       }
   else:
       DATABASES = {
           'default': {
               'ENGINE': 'django.db.backends.mysql',
               'NAME': config('DB_NAME', default='news_alert_db'),
               'USER': config('DB_USER', default='root'),
               'PASSWORD': config('DB_PASSWORD', default=''),
               'HOST': config('DB_HOST', default='localhost'),
               'PORT': config('DB_PORT', default='3306'),
           }
       }
   ```

   Add to `requirements.txt`:
   ```txt
   dj-database-url==2.1.0
   ```

7. **Set Environment Variables** in Render:
   
   In your web service → "Environment" tab, add:
   ```
   SECRET_KEY=<generate-random-string>
   DEBUG=False
   DATABASE_URL=<postgres-internal-database-url-from-step-5>
   NEWS_API_KEY=<your-newsapi-key>
   EMAIL_HOST_USER=<your-email@gmail.com>
   EMAIL_HOST_PASSWORD=<your-gmail-app-password>
   DEFAULT_FROM_EMAIL=<your-email@gmail.com>
   ALLOWED_HOSTS=<your-service-name>.onrender.com
   ```
   
   **Generate SECRET_KEY**:
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

8. **Deploy**:
   - Render will automatically deploy when you save
   - Check the "Logs" tab for deployment progress
   - Once deployed, your backend URL will be: `https://your-service-name.onrender.com`

9. **Run Migrations**:
   - Go to "Shell" tab in Render dashboard
   - Run: `python manage.py migrate`
   - (Optional) Create superuser: `python manage.py createsuperuser`

### 3. Deploy Frontend on Render

1. **Create New Static Site**:
   - Click "New +" → "Static Site"
   - Connect GitHub if needed
   - Select repository: `NathyOne/news_app`

2. **Configure Frontend**:
   - **Name**: `news-alert-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - Click "Create Static Site"

3. **Set Environment Variable**:
   - Go to "Environment" tab
   - Add:
     ```
     REACT_APP_API_URL=https://your-backend-name.onrender.com/api
     ```
     (Replace with your actual backend service URL)

4. **Deploy**: Render will build and deploy automatically

### Alternative: Frontend on Vercel/Netlify

If you prefer, you can still deploy frontend on Vercel or Netlify (see `DEPLOYMENT.md` for details).

### 4. Update CORS Settings

After both are deployed, update your backend CORS to allow your frontend:

**Update `backend/news_alert/settings.py`**:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://your-frontend-name.onrender.com",  # Add your Render frontend URL
]
```

Or add via Render environment variable:
```
CORS_ALLOWED_ORIGINS=https://your-frontend-name.onrender.com
```

Then commit and push - Render will auto-redeploy.

## Quick Verification

After deployment:

1. **Test Backend**: 
   - Visit: `https://your-backend.onrender.com/api/news/`
   - Should return JSON (empty list if no news yet)

2. **Test Frontend**:
   - Visit your Render static site URL
   - Try fetching news
   - Check browser console for errors

## Important Notes

### Database Migration

Render will run migrations automatically if you add this to your start command:
```
gunicorn news_alert.wsgi:application --bind 0.0.0.0:$PORT
```

Or update your `Procfile`:
```
web: python manage.py migrate && gunicorn news_alert.wsgi:application --bind 0.0.0.0:$PORT
```

### Free Tier Limitations

- **Web Services**: Spin down after 15 minutes of inactivity (first request may be slow)
- **PostgreSQL**: 90 days free, then requires paid plan
- **Static Sites**: Free, always available

### Static Files

WhiteNoise is already configured in your `settings.py` to serve static files. Make sure migrations run to collect static files, or add to your build command:

```
pip install -r requirements.txt && python manage.py collectstatic --noinput
```

## Environment Variables Reference

### Backend (Render Web Service):
- `SECRET_KEY` - Django secret key (required)
- `DEBUG` - Set to `False` in production
- `DATABASE_URL` - PostgreSQL connection string (auto-provided if using Render PostgreSQL)
- `NEWS_API_KEY` - Your NewsAPI key
- `EMAIL_HOST_USER` - Gmail address
- `EMAIL_HOST_PASSWORD` - Gmail app password
- `DEFAULT_FROM_EMAIL` - Email address
- `ALLOWED_HOSTS` - Your service domain (e.g., `your-service.onrender.com`)
- `CORS_ALLOWED_ORIGINS` - Frontend URL (optional)

### Frontend (Render Static Site):
- `REACT_APP_API_URL` - Your backend API URL

## Troubleshooting

### Backend Won't Start

**Check Logs**:
- Go to your service → "Logs" tab
- Look for error messages

**Common Issues**:
1. **Missing environment variables**: Ensure all required variables are set
2. **Database connection**: Verify `DATABASE_URL` is correct
3. **Migration errors**: Run migrations manually in Shell
4. **Port binding**: Ensure using `$PORT` environment variable (Render sets this)

### Database Connection Errors

1. Use the **Internal Database URL** for `DATABASE_URL`
2. Ensure database service is running (check dashboard)
3. Verify `dj-database-url` and `psycopg2-binary` are in requirements.txt

### Frontend Build Fails

1. Check Node version: Render uses Node 18 by default
2. Verify all dependencies are in package.json
3. Check build logs for specific errors

### CORS Errors

1. Add frontend URL to `CORS_ALLOWED_ORIGINS` in settings.py
2. Or set via environment variable
3. Ensure URL includes `https://` protocol

### Slow First Request

- Render free tier spins down services after inactivity
- First request takes ~30 seconds to wake up
- Consider paid plan for always-on service

## Next Steps After Deployment

1. ✅ Test backend API endpoints
2. ✅ Create superuser for admin access
3. ✅ Test frontend connection to backend
4. ✅ Test fetching news
5. ✅ Test creating filters and alerts
6. ✅ Set up custom domain (optional)
7. ✅ Configure automatic deployments from GitHub

## Cost Estimate

- **Free Tier**: 
  - Web Service: Free (with spin-down)
  - PostgreSQL: Free for 90 days
  - Static Site: Free forever
- **Paid Plans**: Start at $7/month for always-on web service

## Useful Render Features

- **Automatic SSL**: HTTPS enabled automatically
- **Auto-Deploy**: Deploys on every git push
- **Manual Deploy**: Can trigger manual deployments
- **Rollback**: Can rollback to previous deployments
- **Logs**: Real-time logs in dashboard
- **Metrics**: View service metrics

