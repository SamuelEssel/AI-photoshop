#!/bin/sh

echo "Starting AI Design Studio..."

# Start backend in background
echo "Starting backend server..."
node server/index.js &
BACKEND_PID=$!

# Wait a moment
sleep 2

# Start AI service
echo "Starting AI service..."
python3 ai-service/app.py &
AI_PID=$!

# Wait for both processes
wait $BACKEND_PID $AI_PID
