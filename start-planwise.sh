#!/bin/bash

# PlanWise Startup Script
# This script ensures we're in the correct directory and starts the app

echo "🚀 Starting PlanWise Application..."

# Navigate to the correct directory
cd "/Users/sanilmanaktala/Desktop/New App/leave-tracking-frontend"

# Verify we're in the right place
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please check the directory path."
    exit 1
fi

echo "✅ Found package.json in correct directory"
echo "📁 Current directory: $(pwd)"

# Kill any existing React processes
echo "🔄 Stopping any existing React processes..."
pkill -f "react-scripts start" 2>/dev/null || true

# Wait a moment
sleep 2

# Start the app on port 3006
echo "🚀 Starting PlanWise on http://localhost:3006..."
echo "📱 Backend: Production (https://leave-tracking-backend.onrender.com)"
echo "🌐 Frontend: http://localhost:3006"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

PORT=3006 npm start
