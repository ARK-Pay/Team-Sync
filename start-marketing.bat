@echo off
echo Starting Team-Sync and Marketing applications...

echo Starting Marketing application on port 3002...
start cmd /k "cd marketing && npm run start-windows"

echo Starting Team-Sync application...
start cmd /k "cd client && npm start"

echo Both applications should be starting now.
echo Main application will be available at: http://localhost:3000
echo Marketing application will be available at: http://localhost:3002
