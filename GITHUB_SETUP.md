# GitHub Actions Setup Guide

This guide will help you set up automated deployment for your Inventory Management System using GitHub Actions.

## 🔐 Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### 1. GCP_PROJECT_ID
- **Value:** `nice-height-460409-m5`
- **Description:** Your Google Cloud Project ID

### 2. GCP_SA_KEY
- **Value:** Your Google Cloud Service Account JSON key
- **Description:** Service account with Cloud Run and Firebase permissions

### 3. JWT_SECRET_KEY
- **Value:** Your JWT secret key (generate a strong random string)
- **Description:** Secret key for JWT token generation

### 4. ~~FIREBASE_TOKEN~~ (No longer needed)
- **Value:** ~~Token from `firebase login:ci`~~
- **Description:** ~~Token for Firebase deployment~~ (Deprecated - now using service account)

## 📋 Setup Steps

### Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin** > **Service Accounts**
3. Click **Create Service Account**
4. Name: `github-actions-deploy`
5. Description: `Service account for GitHub Actions deployment`
6. Click **Create and Continue**

### Step 2: Assign Roles

Add the following roles to your service account:
- **Cloud Run Admin**
- **Storage Admin**
- **Firebase Admin** (for Firebase Hosting deployment)
- **Cloud Build Editor**
- **Service Account User**
- **Firebase Hosting Admin** (if available)

### Step 3: Create and Download Key

1. Click on your service account
2. Go to **Keys** tab
3. Click **Add Key** > **Create new key**
4. Choose **JSON** format
5. Download the key file
6. **Important:** Copy the entire contents of the JSON file (including all newlines and formatting)

### Step 4: ~~Get Firebase Token~~ (No longer needed)

~~Run this command in your terminal:~~
```bash
# firebase login:ci  # DEPRECATED - No longer needed
```
~~Copy the generated token.~~

**Note:** Firebase deployment now uses the same service account key as Cloud Run deployment.

### Step 5: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret:

| Secret Name | Value |
|-------------|-------|
| `GCP_PROJECT_ID` | `nice-height-460409-m5` |
| `GCP_SA_KEY` | Contents of your service account JSON file |
| `JWT_SECRET_KEY` | Generate a strong random string |
| ~~`FIREBASE_TOKEN`~~ | ~~Token from `firebase login:ci`~~ (No longer needed) |

## 🚀 Workflow Files

The repository includes three workflow files:

### 1. `deploy-backend.yml`
- Deploys only the backend when Backend/ files change
- Triggers on push to main/master branch

### 2. `deploy-frontend.yml`
- Deploys only the frontend when inventory-frontend/ files change
- Triggers on push to main/master branch

### 3. `deploy-all.yml`
- Deploys both backend and frontend
- Can be triggered manually or on any push
- Includes deployment status notifications

## 🔄 How It Works

1. **Push to main/master branch**
2. **GitHub Actions detects changes**
3. **Backend changes** → Deploy to Cloud Run
4. **Frontend changes** → Deploy to Firebase
5. **Both changes** → Deploy both services
6. **Manual trigger** → Deploy everything

## 📊 Monitoring Deployments

- Go to **Actions** tab in your GitHub repository
- View deployment logs and status
- Check for any errors or warnings

## 🛠️ Troubleshooting

### Common Issues:

1. **Permission Denied**
   - Check service account roles
   - Verify GCP_SA_KEY is correct

2. **Firebase Deployment Failed**
   - Verify service account has Firebase Admin role
   - Check Firebase project configuration
   - Ensure the service account key is properly formatted in GitHub secrets

3. **Build Failed**
   - Check build logs in GitHub Actions
   - Verify all dependencies are correct

### Manual Deployment:

If automated deployment fails, you can deploy manually:

```bash
# Backend
cd Backend
gcloud builds submit --tag gcr.io/nice-height-460409-m5/inventory-api
gcloud run deploy inventory-api --image gcr.io/nice-height-460409-m5/inventory-api --region asia-south1

# Frontend
cd inventory-frontend
npm run build
firebase deploy --only hosting
```

## 🎯 Next Steps

1. Add the required secrets to your GitHub repository
2. Push your code to trigger the first deployment
3. Monitor the Actions tab for deployment status
4. Test your application after deployment

## 📝 Notes

- The workflows are optimized for your current setup
- Backend deploys to Cloud Run in asia-south1 region
- Frontend deploys to Firebase Hosting
- CORS is automatically configured for Firebase URL
- All deployments include proper error handling and notifications
