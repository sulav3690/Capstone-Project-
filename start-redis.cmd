@echo off
cd /d "%~dp0tools\redis"
redis-server.exe --port 6379
