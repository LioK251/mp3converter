@echo off
REM Always run from the folder this BAT lives in
cd /d "%~dp0"

REM Call the correct Python file (fix the typo!)
python "%~dp0app_gui.py"

pause
