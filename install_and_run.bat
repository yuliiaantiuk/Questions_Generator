@echo off
echo Installing and Running Application...

echo Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo Installing Python...
    winget install Python.Python.3.9
    timeout /t 5
)

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo Installing Node.js...
    winget install OpenJS.NodeJS
    timeout /t 5
)

echo Starting Python service...
cd python-service
python -m venv .venv
call .venv\Scripts\activate
pip install -r requirements.txt
start cmd /k "uvicorn app:app --host 127.0.0.1 --port 8000 --reload"

echo Starting server...
cd ..\server
npm install
start cmd /k "node server.js"

echo Starting client...
cd ..\client
npm install
start cmd /k "npm run dev"

echo Application is starting... Check the open terminal windows.
echo Instructions:
echo 1. Wait for 3 terminal windows to open
echo 2. Open your browser and go to: http://localhost:3000
echo 3. To stop the application - close all 3 terminal windows
echo
pause