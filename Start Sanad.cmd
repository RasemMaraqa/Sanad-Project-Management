@echo off
title Sanad Project Manager
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Start-Sanad.ps1"
if errorlevel 1 pause
