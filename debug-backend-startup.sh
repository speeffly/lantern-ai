#!/bin/bash

echo "🔍 Backend Startup Diagnostics"
echo "================================"

echo "📁 Current directory:"
pwd

echo "📦 Node.js version:"
node --version

echo "📦 NPM version:"
npm --version

echo "📁 Backend directory exists:"
ls -la backend/ | head -5

echo "📦 Package.json exists:"
ls -la backend/package.json

echo "📁 Node modules exist:"
ls -la backend/node_modules/ | head -3

echo "📁 Dist directory exists:"
ls -la backend/dist/ | head -5

echo "🔧 Environment file exists:"
ls -la backend/.env

echo "🌐 Port 3002 usage:"
lsof -ti:3002 || echo "Port 3002 is free"

echo "🔧 Try building backend:"
cd backend && npm run build

echo "🚀 Try starting backend:"
cd backend && timeout 5s npm run dev || echo "Backend start attempt completed"