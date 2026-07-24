@echo off
set "ROOT=%~dp0"

echo Starting VeritasAI local app...
echo.

start "VeritasAI Backend" cmd /k call "%ROOT%start-backend-8010.cmd"
start "VeritasAI Frontend" cmd /k call "%ROOT%start-frontend.cmd"

echo Backend:  http://localhost:8010/api/health/
echo Frontend: http://localhost:3000
echo.
echo Two terminal windows should now be open. Keep them open while testing.
pause
