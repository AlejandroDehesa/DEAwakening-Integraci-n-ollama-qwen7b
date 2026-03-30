@echo off
setlocal

cd /d "%~dp0"

if not exist "backend\package.json" (
  echo [ERROR] No se encontro backend\package.json
  pause
  exit /b 1
)

if not exist "frontend\package.json" (
  echo [ERROR] No se encontro frontend\package.json
  pause
  exit /b 1
)

if not exist "backend\node_modules" (
  echo [INFO] Instalando dependencias del backend...
  cd /d "%~dp0backend"
  call npm install
  cd /d "%~dp0"
)

if not exist "frontend\node_modules" (
  echo [INFO] Instalando dependencias del frontend...
  cd /d "%~dp0frontend"
  call npm install
  cd /d "%~dp0"
)

start "DEAwakening Backend" cmd /k "cd /d ""%~dp0backend"" && npm run dev"
start "DEAwakening Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

timeout /t 4 /nobreak >nul
start "" "http://localhost:5173/"
start "" "http://localhost:5173/events"
start "" "http://localhost:5173/admin"
start "" "http://localhost:5000/api/status"

echo.
echo Backend:  http://localhost:5000/api/status
echo Frontend: http://localhost:5173
echo.
echo Se han abierto dos ventanas de terminal.
exit /b 0
