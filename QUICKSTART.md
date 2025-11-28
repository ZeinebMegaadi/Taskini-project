# Quick Start Guide

Get Taskini up and running in minutes!

## Prerequisites

- Node.js (v14 or higher) installed
- MongoDB installed locally OR MongoDB Atlas account
- Git installed

## Step 1: Install Dependencies

### Frontend
```bash
cd frontend
npm install
```

### Backend
```bash
cd backend
npm install
```

## Step 2: Set Up MongoDB

### Local MongoDB (Recommended for Development)
1. Install MongoDB locally (if not already installed)
2. Start MongoDB service:
   - **Windows**: MongoDB should start automatically as a service
   - **Mac/Linux**: Run `mongod` or `brew services start mongodb-community`
3. Verify MongoDB is running on `mongodb://localhost:27017`
4. Use connection string: `mongodb://localhost:27017/taskini`

### Option B: MongoDB Atlas (For Production)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP (0.0.0.0/0 for development)
5. Get your connection string

## Step 3: Configure Backend

1. Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskini
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=development
```

   **Note**: The default MongoDB URI is already set for local MongoDB. If you're using MongoDB Atlas, replace the `MONGODB_URI` with your Atlas connection string.

2. Start the backend server:
```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

## Step 4: Configure Frontend

1. Create a `.env` file in the `frontend` directory (optional if using proxy):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## Step 5: Test the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Click "Register" to create a new account
3. Login with your credentials
4. Start creating and managing tasks!

## Testing API with Postman

1. Import the following endpoints:
   - `POST http://localhost:5000/api/auth/register`
   - `POST http://localhost:5000/api/auth/login`
   - `GET http://localhost:5000/api/tasks` (requires Bearer token)
   - `POST http://localhost:5000/api/tasks` (requires Bearer token)
   - `PUT http://localhost:5000/api/tasks/:id` (requires Bearer token)
   - `DELETE http://localhost:5000/api/tasks/:id` (requires Bearer token)

2. For protected routes, add the token in the Authorization header:
   - Type: Bearer Token
   - Token: (from login response)

## Troubleshooting

### Port Already in Use
- Change the PORT in backend `.env` file
- Update frontend API URL accordingly

### MongoDB Connection Error
- Verify MongoDB is running (if local)
- Check connection string format
- Verify IP whitelist (if using Atlas)

### CORS Errors
- Ensure backend CORS is configured
- Check that frontend is using correct API URL

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions
- Explore the codebase and customize as needed!

