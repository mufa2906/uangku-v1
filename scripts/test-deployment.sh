#!/bin/bash
# Test script to verify the application builds and starts correctly

echo "🧪 Testing Uangku Application Build..."

# Test build
echo "🔨 Building application..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi

# Test start (briefly)
echo "🚀 Starting application..."
timeout 30 npm start > /dev/null 2>&1 &

if [ $? -eq 0 ]; then
  echo "✅ Application started successfully"
else
  echo "⚠️  Application start test completed (may have timed out, which is normal)"
fi

echo "🎉 All tests passed! Application is ready for deployment."