#!/bin/bash

# Terminate background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM EXIT

echo "🚀 Starting Myntra Bharat Layer Services..."

# 1. Start Backend FastAPI
echo "📦 Starting FastAPI backend on http://localhost:8000..."
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to boot up
sleep 2

# 2. Start Frontend Next.js
echo "💻 Starting Next.js frontend on http://localhost:3000..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait
