#!/bin/bash
# Local CI testing script - mirrors GitHub Actions workflow steps

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${GREEN}[LOCAL CI]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[LOCAL CI]${NC} $1"
}

print_error() {
    echo -e "${RED}[LOCAL CI]${NC} $1"
}

# Parse command line arguments
JOB_NAME=${1:-"all"}
NODE_VERSION=${2:-"20"}

print_step "Running local CI simulation for job: $JOB_NAME (Node $NODE_VERSION)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Function to run validation job locally
run_validate() {
    print_step "🔍 Running validation job locally..."
    
    print_step "Installing dependencies..."
    npm ci
    
    print_step "Running validation suite..."
    npm run validate:all
    
    print_step "✅ Validation completed successfully"
}

# Function to run test matrix locally
run_test_matrix() {
    print_step "🧪 Running test matrix locally..."
    
    print_step "Installing dependencies..."
    npm ci
    
    print_step "Running unit tests..."
    npm run test:unit
    
    print_step "Running integration tests..."
    npm run test:integration
    
    # Only generate coverage for Node 20
    if [ "$NODE_VERSION" = "20" ]; then
        print_step "Generating coverage report..."
        npm run test:coverage
    fi
    
    print_step "✅ Test matrix completed successfully"
}

# Function to run security checks locally
run_security() {
    print_step "🔒 Running security checks locally..."
    
    print_step "Installing dependencies..."
    npm ci
    
    print_step "Running security audit..."
    npm audit --audit-level=moderate
    
    print_step "Verifying dependency signatures..."
    npm audit signatures
    
    print_warning "Note: TruffleHog secret scanning is not run locally. Use the GitHub Action for full security scanning."
    
    print_step "✅ Security checks completed successfully"
}

# Function to run build and analyze locally
run_build_analyze() {
    print_step "🔨 Running build and analyze locally..."
    
    print_step "Installing dependencies..."
    npm ci
    
    print_step "Building package..."
    npm run build
    
    print_step "Running E2E tests..."
    npm run test:e2e
    
    # Try to run bundle analysis if available
    print_step "Running bundle analysis (if available)..."
    if npm run build:analyze 2>/dev/null; then
        print_step "Bundle analysis completed"
    else
        print_warning "Bundle analysis script not available, skipping"
    fi
    
    print_step "✅ Build and analyze completed successfully"
}

# Function to run changelog validation locally
run_changelog_validation() {
    print_step "📝 Running changelog validation locally..."
    
    print_warning "Note: Changelog validation requires git history comparison."
    print_warning "This is a simplified local version - full validation runs in CI."
    
    # Check if there are any source file changes in the current branch
    if git diff --name-only HEAD~1 2>/dev/null | grep -q '^src/'; then
        print_step "Source files changed, checking for changelog updates..."
        
        # Check if any changelog files were modified
        if git diff --name-only HEAD~1 2>/dev/null | grep -q 'CHANGELOG.md'; then
            print_step "✅ Changelog updates detected"
        else
            print_warning "No changelog updates found. Consider updating relevant changelogs."
        fi
    else
        print_step "No source files changed, skipping changelog validation"
    fi
    
    print_step "✅ Changelog validation completed"
}

# Main execution logic
case $JOB_NAME in
    "validate")
        run_validate
        ;;
    "test-matrix" | "test")
        run_test_matrix
        ;;
    "security")
        run_security
        ;;
    "build-analyze" | "build")
        run_build_analyze
        ;;
    "changelog-validation" | "changelog")
        run_changelog_validation
        ;;
    "all")
        print_step "🚀 Running complete local CI pipeline..."
        run_validate
        run_test_matrix
        run_security
        run_build_analyze
        run_changelog_validation
        print_step "🎉 Complete local CI pipeline finished successfully!"
        ;;
    *)
        print_error "Unknown job: $JOB_NAME"
        echo "Available jobs: validate, test-matrix, security, build-analyze, changelog-validation, all"
        exit 1
        ;;
esac

print_step "🏁 Local CI simulation completed for job: $JOB_NAME"