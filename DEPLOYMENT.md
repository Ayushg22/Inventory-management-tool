# Inventory Management System - Cloud Run Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Google Cloud Platform account
- Google Cloud SDK installed
- Docker installed
- Node.js 18+ installed

### 1. Backend Deployment

```bash
# Navigate to backend directory
cd Backend

# Build and deploy to Cloud Run
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/inventory-api
gcloud run deploy inventory-api \
  --image gcr.io/YOUR_PROJECT_ID/inventory-api \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars "JWT_SECRET_KEY=your-production-jwt-secret" \
  --set-env-vars "CORS_ORIGINS=https://your-frontend-domain.com"
```

### 2. Frontend Deployment

```bash
# Navigate to frontend directory
cd inventory-frontend

# Update API URL in axiosInstance.js
# Change: const API_URL = "https://your-backend-url.run.app/api";

# Build and deploy to Cloud Run
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/inventory-frontend
gcloud run deploy inventory-frontend \
  --image gcr.io/YOUR_PROJECT_ID/inventory-frontend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 5
```

### 3. Environment Variables

Create a `.env` file in the Backend directory:

```env
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ACCESS_MINUTES=30
JWT_REFRESH_DAYS=7
CORS_ORIGINS=https://your-frontend-domain.com
GOOGLE_APPLICATION_CREDENTIALS=path/to/firebase-service-account.json
LOG_LEVEL=INFO
PORT=8080
```

## 🔧 Local Development

### Backend
```bash
cd Backend
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd inventory-frontend
npm install
npm start
```

### Docker Compose
```bash
docker-compose -f docker-compose.local.yml up
```

## 🐛 Troubleshooting

### Authentication Issues
1. **Token Mismatch**: Ensure all components use `access_token` key
2. **CORS Issues**: Update CORS_ORIGINS in backend environment
3. **JWT Expiry**: Check JWT_ACCESS_MINUTES setting

### Common Issues
1. **Port Conflicts**: Backend uses 8080, Frontend uses 80
2. **Firebase Credentials**: Ensure service account JSON is properly configured
3. **Memory Limits**: Increase Cloud Run memory if needed

## 📝 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/refresh` - Token refresh

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Record sale
- `GET /api/sales/summary` - Sales summary

### Profile
- `GET /api/profile` - Get profile
- `POST /api/profile` - Update profile

## 🔒 Security Notes

1. **JWT Secret**: Use a strong, random JWT secret in production
2. **CORS**: Restrict CORS origins to your frontend domain
3. **Firebase**: Secure your Firebase service account credentials
4. **HTTPS**: Always use HTTPS in production

## 📊 Monitoring

Monitor your Cloud Run services:
```bash
gcloud run services list
gcloud run services describe inventory-api --region=asia-south1
```

## 🆘 Support

If you encounter issues:
1. Check Cloud Run logs: `gcloud logs read`
2. Verify environment variables
3. Test API endpoints with curl/Postman
4. Check browser console for frontend errors
