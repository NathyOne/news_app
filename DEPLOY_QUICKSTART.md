# Quick Deployment Guide

## Fastest Way to Deploy

### Backend on Railway (5 minutes)

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - New Project → Deploy from GitHub
   - Select your repo
   - Set root directory to: `backend`

3. **Add MySQL Database**:
   - Click "+ New" → "Database" → "MySQL"
   - Copy the connection details

4. **Set Environment Variables** (in Railway dashboard):
   ```
   SECRET_KEY=<generate-a-random-key>
   DEBUG=False
   DB_NAME=<from-railway-mysql>
   DB_USER=<from-railway-mysql>
   DB_PASSWORD=<from-railway-mysql>
   DB_HOST=<from-railway-mysql>
   DB_PORT=3306
   NEWS_API_KEY=<your-newsapi-key>
   EMAIL_HOST_USER=<your-email@gmail.com>
   EMAIL_HOST_PASSWORD=<gmail-app-password>
   DEFAULT_FROM_EMAIL=<your-email@gmail.com>
   ALLOWED_HOSTS=<your-app-name>.railway.app
   ```

5. **Get Backend URL**: Railway will provide a URL like `https://your-app.up.railway.app`

### Frontend on Vercel (3 minutes)

1. **Go to Vercel**: [vercel.com](https://vercel.com)
2. **Import Project**:
   - Click "Add New" → "Project"
   - Import from GitHub
   - Select your repository
   - Configure:
     - **Root Directory**: `frontend`
     - **Framework**: Create React App
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

3. **Set Environment Variable**:
   - Go to Settings → Environment Variables
   - Add: `REACT_APP_API_URL` = `https://your-app.up.railway.app/api`

4. **Deploy**: Click "Deploy"

### Update CORS Settings

After deployment, update `backend/news_alert/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://your-frontend.vercel.app",  # Add your Vercel URL
]
```

Or set via environment variable:
```
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Test Deployment

1. Visit your frontend URL
2. Try fetching news
3. Check browser console for errors

## Alternative: Render.com

### Backend on Render

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Name**: news-alert-backend
   - **Root Directory**: backend
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn news_alert.wsgi:application --bind 0.0.0.0:$PORT`

5. Add environment variables
6. Deploy

### Frontend on Netlify

1. Go to [netlify.com](https://netlify.com)
2. New site from Git
3. Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `frontend/build`

4. Add environment variable: `REACT_APP_API_URL`

---

## Troubleshooting

**Backend won't start?**
- Check Procfile exists
- Verify all environment variables are set
- Check logs in Railway/Render dashboard

**Frontend can't connect to backend?**
- Verify `REACT_APP_API_URL` is set correctly
- Check CORS settings include frontend URL
- Ensure backend URL is accessible (test in browser)

**Database connection errors?**
- Verify database credentials
- Check database is running
- Ensure migrations ran successfully

**Static files not loading?**
- Run `python manage.py collectstatic` (or it runs automatically)
- Check STATIC_ROOT is set correctly


