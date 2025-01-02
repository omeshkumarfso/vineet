@echo off
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    cd "C:\Program Files\Google\Chrome\Application"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    cd "C:\Program Files (x86)\Google\Chrome\Application"
) else (
    echo Chrome is not installed in the default locations.
    pause
    exit
)
start chrome.exe --remote-debugging-port=9222 --user-data-dir="C:\chrome_dev_profile"
cmd
