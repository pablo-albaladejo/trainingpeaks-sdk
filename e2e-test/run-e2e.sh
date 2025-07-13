#!/bin/bash

# E2E Test Runner for TrainingPeaks SDK
# This script builds the library and runs E2E tests for both ES Modules and CommonJS

set -e  # Exit on any error

echo "🚀 Running E2E Tests for TrainingPeaks SDK"
echo "=========================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if npm is available
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install Node.js and npm."
    exit 1
fi

# Navigate to project root (parent directory)
PROJECT_ROOT="../"
cd "$PROJECT_ROOT"

# Check if the package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the e2e-test directory."
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

echo "🔨 Step 2: Building the library..."
npm run build

echo "📁 Step 3: Checking build output..."
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo "❌ ESM build not found at dist/index.js"
    exit 1
fi

if [ ! -f "dist/index.cjs" ]; then
    echo "❌ CommonJS build not found at dist/index.cjs"
    exit 1
fi

echo "✅ Build output verified"

echo ""
echo "🧪 Step 4: Running E2E tests..."
echo "================================="

# Run ES Modules test
echo "🔍 Testing ES Modules..."
if node e2e-test/test-built-library.mjs; then
    echo "✅ ES Modules test passed"
else
    echo "❌ ES Modules test failed"
    exit 1
fi

echo ""

# Run CommonJS test
echo "🔍 Testing CommonJS..."
if node e2e-test/test-built-library-cjs.cjs; then
    echo "✅ CommonJS test passed"
else
    echo "❌ CommonJS test failed"
    exit 1
fi

echo ""
echo "🎉 All E2E tests passed!"
echo "========================"
echo "✅ ES Modules: Working"
echo "✅ CommonJS: Working"
echo "✅ Build: Successful"
echo "✅ Library: Ready for use"
echo "" 