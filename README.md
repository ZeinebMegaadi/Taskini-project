
# Taskini - Task Management Application

A full-stack task management web application built with React and Node.js/Express.

## Tech Stack

### Frontend
- React - UI library
- React Router - Client-side routing
- Axios - HTTP client for API requests
- CSS Modules - Component-scoped styling

### Backend
- Node.js - Runtime environment
- Express - Web framework
- MongoDB - Database
- Mongoose - MongoDB object modeling
- JWT - Authentication tokens
- bcryptjs - Password hashing

## 📁 Project Structure

```
Taskini/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── assets/        # Images, icons, etc.
│   │   └── App.js         # Main app component
│   └── package.json
├── backend/           # Express API server
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── config/        # Configuration files
│   └── server.js      # Entry point
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas account)
- Git

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will run on `http://localhost:3000`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. Start the server:
```bash
npm run dev
```

The API will run on `http://localhost:5000`

--------------------------------------------------------

## Features

- CRUD Operations
- User authentication (register/login)
- Role-based access control (user/admin)
- Responsive design
- Modern UI with clean styling


## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a single task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
