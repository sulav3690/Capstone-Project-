@echo off
cd /d "%~dp0backend"
echo Starting VeritasAI backend...
echo Backend folder: %CD%
echo MongoDB database: veritas_db
echo Register saves users into: veritas_db ^> users
echo Support form saves into: veritas_db ^> support_tickets
echo Scan history saves into: veritas_db ^> analysis_records
if not exist ".venv\Scripts\python.exe" (
  echo Creating Python environment...
  python -m venv .venv
  echo Installing backend packages...
  .venv\Scripts\python.exe -m pip install -r requirements.txt
)
echo Checking optional local admin setup...
.venv\Scripts\python.exe ensure_admin.py
echo Synchronizing MongoDB indexes...
.venv\Scripts\python.exe manage.py sync_mongo_indexes
if errorlevel 1 exit /b 1
echo.
echo Backend health will be: http://localhost:8010/api/health/
echo Starting Django server...
.venv\Scripts\python.exe manage.py runserver localhost:8010
