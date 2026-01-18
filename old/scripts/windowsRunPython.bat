@echo off
cd %cd%
cd ..
echo %cd%\index.html
python -m http.server
pause