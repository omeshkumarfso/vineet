@echo off
echo Downloading Node.js...

:: Check if Node.js is already installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Downloading...
    :: Change to a temporary directory
    cd %temp%

    :: Download Node.js installer
    curl -o nodejs.msi https://nodejs.org/dist/v22.12.0/node-v22.12.0-x64.msi

    :: Install Node.js
    msiexec /i nodejs.msi /quiet /norestart

    :: Clean up installer
    del nodejs.msi

    :: Go back to the project directory
    cd /d %~dp0
) else (
    echo Node.js is already installed.
)

:: Run npm install in the current directory
echo Running npm install...
npm install

echo Done!
pause
