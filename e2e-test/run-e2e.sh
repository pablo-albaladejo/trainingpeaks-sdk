#!/bin/bash

# E2E Test Runner for TrainingPeaks SDK
# This script builds the library and runs comprehensive E2E tests for both ES Modules and CommonJS
# Based on integration test patterns

set -e  # Exit on any error

echo "🚀 Running Comprehensive E2E Tests for TrainingPeaks SDK"
echo "======================================================="
echo "Based on integration test patterns and best practices"
echo ""

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

if [ ! -f "dist/index.d.ts" ]; then
    echo "❌ TypeScript definitions not found at dist/index.d.ts"
    exit 1
fi

echo "✅ Build output verified"

echo ""
echo "🧪 Step 4: Running Basic E2E tests..."
echo "====================================="

# Run ES Modules basic test
echo "🔍 Testing ES Modules (Basic)..."
if node e2e-test/test-built-library.mjs; then
    echo "✅ ES Modules basic test passed"
else
    echo "❌ ES Modules basic test failed"
    exit 1
fi

echo ""

# Run CommonJS basic test
echo "🔍 Testing CommonJS (Basic)..."
if node e2e-test/test-built-library-cjs.cjs; then
    echo "✅ CommonJS basic test passed"
else
    echo "❌ CommonJS basic test failed"
    exit 1
fi

echo ""
echo "🚀 Step 5: Running Advanced E2E tests..."
echo "======================================="

# Run Advanced E2E test (ES Modules only for now)
echo "🔍 Testing Advanced Workflow (ES Modules)..."
if node e2e-test/advanced-workflow-test.mjs; then
    echo "✅ Advanced workflow test passed"
else
    echo "❌ Advanced workflow test failed"
    exit 1
fi

echo ""
echo "🔧 Step 6: Running Compatibility tests..."
echo "========================================"

# Run Compatibility test
echo "🔍 Testing SDK Compatibility (ES Modules)..."
if node e2e-test/compatibility-test.mjs; then
    echo "✅ Compatibility test passed"
else
    echo "❌ Compatibility test failed"
    exit 1
fi

echo ""
echo "🎉 All E2E tests passed!"
echo "========================"
echo "✅ ES Modules (Basic): Working"
echo "✅ CommonJS (Basic): Working"
echo "✅ Advanced Workflow: Working"
echo "✅ Compatibility: Working"
echo "✅ Build: Successful"
echo "✅ Library: Ready for npm distribution"
echo ""
echo "📊 Test Summary:"
echo "================"
echo "• Basic functionality tests: 2/2 passed"
echo "• Advanced workflow tests: 1/1 passed"
echo "• Compatibility tests: 1/1 passed"
echo "• Build verification: ✅"
echo "• Import/export tests: ✅"
echo "• Configuration validation: ✅"
echo "• Authentication flow: ✅"
echo "• Workout management: ✅"
echo "• Error handling: ✅"
echo "• Type safety: ✅"
echo "• State management: ✅"
echo "• Configuration overrides: ✅"
echo ""
echo "🚀 SDK is ready for npm publication!"
echo "====================================="
echo ""
echo "📋 Test Coverage:"
echo "================"
echo "• Package import/export compatibility"
echo "• Configuration management and overrides"
echo "• Authentication state management"
echo "• API surface verification"
echo "• Workout manager interface"
echo "• Type safety validation"
echo "• Error handling scenarios"
echo "• Method chaining and state persistence"
echo "• Real usage workflow simulation"
echo "" 