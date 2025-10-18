#!/bin/bash
# Deployment script for Uangku application

echo "🚀 Deploying Uangku Application..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root directory."
  exit 1
fi

# Check Node.js version
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "   Node.js version: $NODE_VERSION"

# Check if required environment variables are set
echo "🔐 Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  Warning: DATABASE_URL is not set. Please set it before deploying."
fi

if [ -z "$BETTER_AUTH_SECRET" ]; then
  echo "⚠️  Warning: BETTER_AUTH_SECRET is not set. Please set it before deploying."
fi

if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
  echo "⚠️  Warning: NEXT_PUBLIC_APP_URL is not set. Please set it before deploying."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run TypeScript check
echo "📝 Checking TypeScript types..."
npx tsc --noEmit

# Run build
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  echo ""
  echo "🎉 Deployment preparation complete!"
  echo "   Next steps:"
  echo "   1. Set your environment variables:"
  echo "      DATABASE_URL=your_postgresql_connection_string"
  echo "      BETTER_AUTH_SECRET=your_secret_key_for_authentication"
  echo "      NEXT_PUBLIC_APP_URL=https://yourdomain.com"
  echo "   2. Deploy to your preferred platform (Vercel, Netlify, etc.)"
  echo "   3. Configure custom domain and HTTPS"
  echo "   4. Test in production environment"
else
  echo "❌ Build failed. Please check the errors above."
  exit 1
fi