#!/bin/bash

echo "🚀 Starting Next.js Secrets Management POC..."

# Wait for the application to be ready
echo "⏳ Waiting for application to start..."
sleep 5

# Initialize the application
echo "🔧 Initializing application..."
curl -X POST http://localhost:3000/api/init \
  -H "Content-Type: application/json" \
  --retry 3 \
  --retry-delay 2 \
  --retry-connrefused

if [ $? -eq 0 ]; then
  echo "✅ Application initialized successfully"
else
  echo "⚠️ Application initialization failed, will retry on first request"
fi

# Health check
echo "🏥 Performing health check..."
curl -X GET http://localhost:3000/api/init \
  --retry 3 \
  --retry-delay 2 \
  --retry-connrefused

if [ $? -eq 0 ]; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
fi

echo "🎯 Application startup complete" 