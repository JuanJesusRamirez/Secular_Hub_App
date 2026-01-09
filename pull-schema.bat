@echo off
REM Read DATABASE_URL from .env.local and set it
for /f "delims== tokens=1,2" %%a in (.env.local) do (
    if "%%a"=="DATABASE_URL" set "%%a=%%b"
)

echo DATABASE_URL is set to: %DATABASE_URL%

REM Now run Prisma commands
cd /d "%~dp0"
npx prisma db pull
