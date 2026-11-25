@echo off
setlocal
chcp 65001 >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\iniciar.ps1" %*
set "SAIL_CODIGO_SAIDA=%errorlevel%"
if not "%SAIL_CODIGO_SAIDA%"=="0" echo Nao foi possivel iniciar. Confira a mensagem acima.
pause
exit /b %SAIL_CODIGO_SAIDA%
