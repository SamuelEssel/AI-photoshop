@echo off
echo ========================================
echo   AI Design Studio - Installation
echo ========================================
echo.

echo [1/4] Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo.

echo [2/4] Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo.

echo [3/4] Setting up environment...
if not exist .env (
    copy .env.example .env
    echo Created .env file from template
) else (
    echo .env file already exists
)
echo.

echo [4/4] Creating data directories...
if not exist data mkdir data
if not exist data\projects mkdir data\projects
if not exist data\uploads mkdir data\uploads
if not exist data\generated mkdir data\generated
echo.

echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Edit .env file and add your API keys (optional)
echo   2. Run start.bat to launch the application
echo.
pause
