@echo off
echo Starting ALPR System in development mode...

REM Stop any running containers
docker-compose down

REM Remove old containers and volumes
docker-compose rm -f
docker volume rm alpr-system_mysql_data 2>nul

REM Create necessary directories
if not exist uploads mkdir uploads
if not exist logs mkdir logs
if not exist static mkdir static

REM Start the services
docker-compose up --build

REM Keep the window open if there's an error
pause 