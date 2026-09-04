@echo off
title Install Sanad Desktop Launcher
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Install-Sanad-Shortcut.ps1"
if errorlevel 1 pause
