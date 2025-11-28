# Setup Instructions - Get Taskini Running

Follow these steps to get your Taskini application up and running.

## Step 1: Dependencies Installed

Dependencies have been installed for both frontend and backend. You're all set!

## 📝 Step 2: Create Backend Environment File

Create a `.env` file in the `backend` directory with the following content:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskini
JWT_SECRET=taskini-super-secret-jwt-key-for-development-change-in-production-min-32-chars
NODE_ENV=development
```

**Quick way to create it:**
1. Navigate to the `backend` folder
2. Copy `env.example` and rename it to `.env`
3. Or create a new file named `.env` and paste the content above

## 🗄️ Step 3: Start MongoDB

Make sure MongoDB is running on your local machine:

### Windows:
- MongoDB usually runs as a Windows service automatically
- Check Services (services.msc) for "MongoDB"
- Or start it manually: `net start MongoDB`

### Mac:
```bash
brew services start mongodb-community
```

### Linux:
```bash
sudo systemctl start mongod
# or
sudo service mongod start
```

### Verify MongoDB is running:
- Check if port 27017 is listening
- Or try: `mongosh` or `mongo` (depending on your MongoDB version)

## 🚀 Step 4: Start the Application

### Terminal 1 - Backend Server:
```bash
cd backend
npm run dev
```

You should see:
```
Connected to MongoDB
Server is running on port 5000
```

### Terminal 2 - Frontend Development Server:
```bash
cd frontend
npm start
```

The React app will automatically open in your browser at `http://localhost:3000`

### Alternative: Run from the project root (convenience)

We added convenient root-level scripts so you can run the app from the repository root instead of opening two terminals.

- Install both subproject dependencies from the root:

```bash
npm run install-all
```

- Start just the frontend from the root (same as `cd frontend && npm start`):

```bash
npm start
```

- Start both backend (dev) and frontend together from the root (requires `concurrently`):

```bash
npm run start:all
```

The repo also includes a Windows shortcut script `start.bat` which opens two terminals and starts backend and frontend.

## 🎉 Step 5: Test the Application

1. **Register a new account:**
   - Click "Register" in the navigation
   - Fill in your name, email, and password
   - Submit the form

2. **Login:**
   - Use your registered credentials
   - You'll be redirected to the Tasks page

3. **Create a task:**
   - Click "+ Create New Task"
   - Fill in the task details
   - Submit to create your first task

4. **Manage tasks:**
   - Edit, delete, or filter tasks
   - Change task status and priority

## 🐛 Troubleshooting

### MongoDB Connection Error
- **Error**: "MongoDB connection error"
- **Solution**: Make sure MongoDB is running and accessible on `localhost:27017`
- Check: `mongosh` or `mongo` command works

### Port Already in Use
- **Error**: "Port 5000 already in use"
- **Solution**: Change PORT in `.env` file or stop the process using port 5000

### Frontend Can't Connect to Backend
- **Error**: Network errors or CORS issues
- **Solution**: 
  - Make sure backend is running on port 5000
  - Check that `proxy` in `frontend/package.json` points to `http://localhost:5000`

### Module Not Found Errors
- **Solution**: Run `npm install` again in the affected directory

## 📚 Next Steps

- Read the [README.md](README.md) for more information
- Check [QUICKSTART.md](QUICKSTART.md) for quick reference
- Explore the codebase and customize as needed!

Happy task managing! 🎨✨

