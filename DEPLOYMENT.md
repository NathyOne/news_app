# Deployment Guide

This guide covers deploying both the Django backend and React frontend to production.

## Overview

**Recommended Setup:**
- **Backend**: Railway, Render, or Heroku
- **Frontend**: Vercel or Netlify
- **Database**: Managed MySQL (PlanetScale, Railway, or ClearDB)

## Prerequisites

1. Git repository (GitHub/GitLab)
2. Production-ready environment variables
3. Domain name (optional)

---

## Backend Deployment

### Option A: Railway (Recommended - Free tier available)

1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` folder as root directory

3. **Add Database**:
   - Click "+ New" → "Database" → "MySQL"
   - Railway will provide connection credentials

4. **Configure Environment Variables**:
   - Go to your service → Variables tab
   - Add all variables from `.env`:
   ```
   SECRET_KEY=your-production-secret-key
   DEBUG=False
   DB_NAME=railway
   DB_USER=root
   DB_PASSWORD=<provided-by-railway>
   DB_HOST=<provided-by-railway>
   DB_PORT=3306
   NEWS_API_KEY=your-newsapi-key
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   DEFAULT_FROM_EMAIL=your-email@gmail.com
   ALLOWED_HOSTS=your-app.railway.app,yourdomain.com
   ```

5. **Create Railway Config File** (`backend/railway.json`):
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn news_alert.wsgi:application --bind 0.0.0.0:$PORT",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

6. **Create `backend/Procfile`**:
   ```
   web: python manage.py migrate && gunicorn news_alert.wsgi:application --bind 0.0.0.0:$PORT
   ```

7. **Update `requirements.txt`** (add production dependencies):
   ```
   gunicorn==21.2.0
   whitenoise==6.6.0
   ```

8. **Update `settings.py` for production**:
   ```python
   # Add to settings.py
   import os
   
   # Static files
   STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
   STATIC_URL = '/static/'
   
   # Security settings for production
   if not DEBUG:
       SECURE_SSL_REDIRECT = True
       SESSION_COOKIE_SECURE = True
       CSRF_COOKIE_SECURE = True
       SECURE_BROWSER_XSS_FILTER = True
       SECURE_CONTENT_TYPE_NOSNIFF = True
       X_FRAME_OPTIONS = 'DENY'
   
   # Whitenoise for static files
   MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
   STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
   ```

9. **Push and Deploy**:
   - Commit changes and push to GitHub
   - Railway will automatically deploy

### Option B: Render

1. **Sign up**: Go to [render.com](https://render.com)

2. **Create Web Service**:
   - New → Web Service
   - Connect GitHub repository
   - Settings:
     - **Name**: news-alert-backend
     - **Root Directory**: backend
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn news_alert.wsgi:application --bind 0.0.0.0:$PORT`

3. **Add PostgreSQL Database** (Render's free MySQL has limitations):
   - New → PostgreSQL
   - Copy connection string
   - Update `settings.py` to use PostgreSQL:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': os.getenv('DB_NAME'),
           'USER': os.getenv('DB_USER'),
           'PASSWORD': os.getenv('DB_PASSWORD'),
           'HOST': os.getenv('DB_HOST'),
           'PORT': os.getenv('DB_PORT', '5432'),
       }
   }
   ```
   - Install: `psycopg2-binary==2.9.9` in requirements.txt

4. **Set Environment Variables** in Render dashboard

---

## Frontend Deployment

### Option A: Vercel (Recommended - Free tier)

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Root Directory**: `frontend`
     - **Framework Preset**: Create React App
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

3. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     REACT_APP_API_URL=https://your-backend-url.com/api
     ```

4. **Deploy**: Click "Deploy"

### Option B: Netlify

1. **Sign up**: Go to [netlify.com](https://netlify.com)

2. **Deploy**:
   - New site from Git
   - Select repository
   - Build settings:
     - **Base directory**: `frontend`
     - **Build command**: `npm install && npm run build`
     - **Publish directory**: `frontend/build`

3. **Environment Variables**:
   - Site settings → Environment variables
   - Add `REACT_APP_API_URL`

4. **Create `frontend/netlify.toml`** (optional):
   ```toml
   [build]
     base = "frontend"
     command = "npm install && npm run build"
     publish = "frontend/build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Option C: AWS S3 + CloudFront (Advanced)

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket**:
   - AWS Console → S3
   - Create bucket with public access
   - Upload `build` folder contents
   - Enable static website hosting

3. **Create CloudFront Distribution**:
   - Point to S3 bucket
   - Configure custom domain (optional)

---

## Database Setup

### Option A: Managed MySQL (PlanetScale)

1. **Sign up**: [planetscale.com](https://planetscale.com)
2. **Create Database**
3. **Get Connection String**
4. **Update Django settings** to use connection string

### Option B: Railway MySQL

- Automatically created when you add MySQL to Railway project

### Option C: ClearDB (Heroku)

- Add ClearDB addon in Heroku dashboard

---

## Post-Deployment Steps

### 1. Run Migrations

```bash
# On Railway/Render, migrations run automatically via start command
# Or manually via dashboard console:
python manage.py migrate
```

### 2. Create Superuser

```bash
python manage.py createsuperuser
```

### 3. Configure CORS

Update `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.vercel.app",
    "https://your-frontend-domain.netlify.app",
    # Add your production frontend URL
]
```

### 4. Update Frontend API URL

In production, set:
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

### 5. Set Up SSL/HTTPS

- Railway/Render/Vercel/Netlify: Automatic HTTPS
- Custom domains: Configure in platform dashboard

---

## Environment Variables Checklist

### Backend (.env or platform variables):
- ✅ `SECRET_KEY` (generate strong key)
- ✅ `DEBUG=False` (always False in production)
- ✅ `ALLOWED_HOSTS` (comma-separated list)
- ✅ Database credentials
- ✅ `NEWS_API_KEY`
- ✅ Email credentials
- ✅ `DJANGO_SETTINGS_MODULE=news_alert.settings` (usually not needed)

### Frontend (platform variables):
- ✅ `REACT_APP_API_URL` (your backend URL)

---

## Quick Deployment Commands

### Backend (Railway):
```bash
cd backend
# Add gunicorn to requirements.txt
echo "gunicorn==21.2.0" >> requirements.txt
echo "whitenoise==6.6.0" >> requirements.txt

# Commit and push
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Frontend (Vercel):
```bash
cd frontend
# Build locally to test
npm run build

# Deploy (if using CLI)
vercel --prod
```

---

## Troubleshooting

### Backend Issues:

1. **Static files not loading**:
   - Ensure `whitenoise` is installed and configured
   - Run `python manage.py collectstatic`

2. **Database connection errors**:
   - Verify environment variables
   - Check database is running
   - Verify connection string format

3. **CORS errors**:
   - Update `CORS_ALLOWED_ORIGINS` with production frontend URL

### Frontend Issues:

1. **API calls failing**:
   - Verify `REACT_APP_API_URL` is set correctly
   - Check backend is accessible
   - Verify CORS is configured

2. **Build fails**:
   - Check Node version (use Node 16+)
   - Verify all dependencies are in package.json

---

## Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY`
- [ ] `ALLOWED_HOSTS` configured
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] Database credentials secure
- [ ] API keys not exposed in frontend
- [ ] CORS properly configured
- [ ] Environment variables set in platform (not in code)

---

## Cost Estimates (Free Tiers)

- **Railway**: $5/month free credit, MySQL addon
- **Render**: Free tier available, limited hours
- **Vercel**: Free for personal projects
- **Netlify**: Free tier available
- **PlanetScale**: Free tier available

---

## Example Production URLs

After deployment, you'll have:
- **Backend**: `https://news-alert-backend.railway.app/api/`
- **Frontend**: `https://news-alert.vercel.app/`

Update frontend `REACT_APP_API_URL` to point to backend URL.


