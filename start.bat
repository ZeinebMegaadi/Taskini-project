@echo off
echo ========================================
echo   Taskini - Task Management App
echo ========================================
echo.
echo This will start both backend and frontend.
echo Make sure MongoDB is running first!
echo.
pause

echo Starting Backend Server...
start "Taskini Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Taskini Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause

