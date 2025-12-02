#!/bin/bash

echo "Setting up News Alert System..."

# Backend setup
echo "Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    echo "Please edit backend/.env with your configuration"
    cat > .env << EOF
SECRET_KEY=change-this-secret-key-in-production
DEBUG=True
DB_NAME=news_alert_db
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=
NEWS_API_KEY=
EOF
fi

echo "Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Create MySQL database: CREATE DATABASE news_alert_db;"
echo "3. Run migrations: cd backend && source venv/bin/activate && python manage.py migrate"
echo "4. Install frontend dependencies: cd frontend && npm install"
echo "5. Start backend: cd backend && source venv/bin/activate && python manage.py runserver"
echo "6. Start frontend: cd frontend && npm start"

