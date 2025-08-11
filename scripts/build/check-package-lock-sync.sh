#!/bin/bash

# Check if package.json and package-lock.json are synchronized
# This script ensures that the lock file is up to date with package.json

set -e

echo "🔍 Checking package.json and package-lock.json synchronization..."

# Check if package-lock.json exists
if [ ! -f "package-lock.json" ]; then
  echo "❌ package-lock.json not found. Run 'npm install' to generate it."
  exit 1
fi

# Create a temporary directory for comparison
temp_dir=$(mktemp -d)
trap "rm -rf $temp_dir" EXIT

# Copy current package-lock.json for comparison
cp package-lock.json "$temp_dir/package-lock.json.current"

# Generate a fresh package-lock.json based on current package.json
npm install --package-lock-only --silent

# Compare the generated lock file with the existing one
if ! diff -q package-lock.json "$temp_dir/package-lock.json.current" > /dev/null; then
  echo "❌ package-lock.json is out of sync with package.json"
  echo "   The lock file doesn't match the current package.json dependencies."
  echo "   Run 'npm install' to synchronize them."
  
  # Restore original lock file
  cp "$temp_dir/package-lock.json.current" package-lock.json
  exit 1
fi

echo "✅ package.json and package-lock.json are synchronized"