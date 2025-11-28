# Deployment Guide

This guide covers deploying the Taskini application to production.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (MongoDB Atlas account recommended for production)
- Git
- A hosting service (Heroku, Vercel, Netlify, AWS, etc.)

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=production
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=https://your-backend-api-url.com/api
```

## Deployment Options

### Option 1: Deploy to Heroku

#### Backend Deployment

1. Install Heroku CLI
2. Login to Heroku: `heroku login`
3. Navigate to backend directory: `cd backend`
4. Create Heroku app: `heroku create taskini-api`
5. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   ```
6. Deploy: `git push heroku main`

#### Frontend Deployment

1. Build the React app: `cd frontend && npm run build`
2. Use Heroku static buildpack or deploy to Vercel/Netlify

### Option 2: Deploy to Vercel (Frontend) + Railway/Render (Backend)

#### Backend (Railway/Render)

1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically on push

#### Frontend (Vercel)

1. Connect your GitHub repository
2. Set build command: `cd frontend && npm install && npm run build`
3. Set output directory: `frontend/build`
4. Add environment variable: `REACT_APP_API_URL`

### Option 3: Docker Deployment

See `docker-compose.yml` for local Docker setup.

## MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs in development)
5. Get your connection string and update `MONGODB_URI`

## Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Frontend can connect to backend API
- [ ] CORS is properly configured
- [ ] Environment variables are set
- [ ] MongoDB connection is working
- [ ] Authentication endpoints are working
- [ ] Task CRUD operations are working
- [ ] Error handling is working properly

## Troubleshooting

### CORS Issues
Ensure your backend has CORS configured to allow requests from your frontend domain.

### MongoDB Connection Issues
- Verify your MongoDB URI is correct
- Check IP whitelist settings
- Verify database user credentials

### Environment Variables
- Ensure all required environment variables are set
- Restart the server after changing environment variables

