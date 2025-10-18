@echo off
REM Deployment script for Uangku application

echo 🚀 Deploying Uangku Application...

REM Check if we're in the correct directory
if not exist "package.json" (
  echo ❌ Error: package.json not found. Please run this script from the project root directory.
  exit /b 1
)

REM Check Node.js version
echo 🔍 Checking Node.js version...
node --version

REM Check if required environment variables are set
echo 🔐 Checking environment variables...
if "%DATABASE_URL%"=="" (
  echo ⚠️  Warning: DATABASE_URL is not set. Please set it before deploying.
)

if "%BETTER_AUTH_SECRET%"=="" (
  echo ⚠️  Warning: BETTER_AUTH_SECRET is not set. Please set it before deploying.
)

if "%NEXT_PUBLIC_APP_URL%"=="" (
  echo ⚠️  Warning: NEXT_PUBLIC_APP_URL is not set. Please set it before deploying.
)

REM Install dependencies
echo 📦 Installing dependencies...
npm ci

REM Run TypeScript check
echo 📝 Checking TypeScript types...
npx tsc --noEmit

REM Run build
echo 🔨 Building application...
npm run build

if %ERRORLEVEL% EQU 0 (
  echo ✅ Build successful!
  echo.
  echo 🎉 Deployment preparation complete!
  echo    Next steps:
  echo    1. Set your environment variables:
  echo       DATABASE_URL=your_postgresql_connection_string
  echo       BETTER_AUTH_SECRET=your_secret_key_for_authentication
  echo       NEXT_PUBLIC_APP_URL=https://yourdomain.com
  echo    2. Deploy to your preferred platform (Vercel, Netlify, etc.)
  echo    3. Configure custom domain and HTTPS
  echo    4. Test in production environment
) else (
  echo ❌ Build failed. Please check the errors above.
  exit /b 1
)