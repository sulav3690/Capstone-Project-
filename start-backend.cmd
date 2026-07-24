@echo off
cd /d "%~dp0backend"
if not exist ".venv\Scripts\python.exe" (
  python -m venv .venv
  .venv\Scripts\python.exe -m pip install -r requirements.txt
)
.venv\Scripts\python.exe manage.py sync_mongo_indexes
if errorlevel 1 exit /b 1
.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
