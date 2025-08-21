#!/bin/bash

# Drone Dashboard Deployment Script
# For small startup deployment

set -e  # Exit on any error

echo "🚀 Starting Drone Dashboard Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version check passed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false

# Run linting
print_status "Running code quality checks..."
npm run lint

# Run tests
print_status "Running tests..."
npm run test:run

# Build the application
print_status "Building application..."
npm run build

# Check if build was successful
if [ ! -d ".next" ]; then
    print_error "Build failed - .next directory not found"
    exit 1
fi

print_success "Build completed successfully"

# Setup database
print_status "Setting up database..."
npx prisma generate
npx prisma db push

# Check health endpoints
print_status "Testing health endpoints..."
npm run start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test health endpoint
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Health endpoint is responding"
else
    print_warning "Health endpoint test failed (server might not be fully started)"
fi

# Stop the test server
kill $SERVER_PID 2>/dev/null || true

print_success "🎉 Deployment completed successfully!"
print_status "To start the application:"
print_status "  npm run start"
print_status ""
print_status "Health check endpoints:"
print_status "  http://localhost:3000/api/health"
print_status "  http://localhost:3000/api/health/database"
print_status "  http://localhost:3000/api/health/websocket"
print_status ""
print_status "Application will be available at:"
print_status "  http://localhost:3000 (Next.js)"
print_status "  ws://localhost:3003 (WebSocket)"
