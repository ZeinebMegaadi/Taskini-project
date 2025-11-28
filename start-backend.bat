@echo off
echo Starting Taskini Backend Server...
cd backend
if not exist .env (
    echo Creating .env file...
    copy env.example .env
    echo .env file created! Please edit it if needed.
)
npm run dev

