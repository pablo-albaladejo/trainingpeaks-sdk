#!/bin/bash

# TrainingPeaks SDK E2E Test Runner
# Based on integration test patterns

set -e  # Exit on any error

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variables
check_environment() {
    print_status "Checking environment setup..."
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        print_error "package.json not found. Please run this script from the e2e-test directory."
        exit 1
    fi
    
    # Check if .env file exists in parent directory
    if [[ ! -f "../.env" ]]; then
        print_warning ".env file not found in project root"
        print_status "Tests will load credentials from .env file automatically"
        print_status "If .env file is missing, tests will skip authentication"
        print_status "Create .env file in project root with your TrainingPeaks credentials:"
        print_status "  TRAININGPEAKS_TEST_USERNAME=your-test-username"
        print_status "  TRAININGPEAKS_TEST_PASSWORD=your-test-password"
        echo
    else
        print_success ".env file found in project root"
    fi
    
    # Check for required environment variables (will be loaded from .env by tests)
    if [[ -z "$TRAININGPEAKS_TEST_USERNAME" || -z "$TRAININGPEAKS_TEST_PASSWORD" ]]; then
        print_warning "TRAININGPEAKS_TEST_USERNAME and/or TRAININGPEAKS_TEST_PASSWORD not set in environment"
        print_status "Tests will load credentials from .env file automatically"
        print_status "If credentials are missing from .env, tests will skip authentication"
        echo
    else
        print_success "TrainingPeaks credentials found in environment variables"
    fi
    
    # Check for optional environment variables
    if [[ -n "$TRAININGPEAKS_WEB_HEADLESS" ]]; then
        print_status "Web headless mode: $TRAININGPEAKS_WEB_HEADLESS"
    fi
    
    if [[ -n "$TRAININGPEAKS_WEB_TIMEOUT" ]]; then
        print_status "Web timeout: ${TRAININGPEAKS_WEB_TIMEOUT}ms"
    fi
    
    echo
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed or not in PATH"
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed or not in PATH"
        exit 1
    fi
    
    # Check if node_modules exists
    if [[ ! -d "node_modules" ]]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    print_success "Dependencies check passed"
    echo
}

# Function to build the library
build_library() {
    print_status "Building library..."
    
    # Go to parent directory to build
    cd ..
    
    if [[ ! -d "dist" ]]; then
        print_status "Building library for the first time..."
        npm run build
    else
        print_status "Library already built, checking if rebuild is needed..."
        # Check if source files are newer than dist
        if [[ $(find src -newer dist -type f | wc -l) -gt 0 ]]; then
            print_status "Source files changed, rebuilding..."
            npm run build
        else
            print_success "Library is up to date"
        fi
    fi
    
    # Go back to e2e-test directory
    cd e2e-test
    
    echo
}

# Function to run a test
run_test() {
    local test_name="$1"
    local test_file="$2"
    local description="$3"
    
    print_status "Running $test_name..."
    print_status "Description: $description"
    echo
    
    if node "$test_file"; then
        print_success "$test_name completed successfully"
    else
        print_error "$test_name failed"
        return 1
    fi
    
    echo
}

# Function to run all tests
run_all_tests() {
    print_status "Starting E2E test suite..."
    echo
    
    local failed_tests=0
    
    # Test 1: Basic E2E Test (ESM)
    if run_test "Basic E2E Test (ESM)" "test-built-library.mjs" "Tests basic functionality with ES modules"; then
        print_success "✅ Basic E2E Test (ESM) passed"
    else
        print_error "❌ Basic E2E Test (ESM) failed"
        ((failed_tests++))
    fi
    
    # Test 2: Basic E2E Test (CommonJS)
    if run_test "Basic E2E Test (CommonJS)" "test-built-library.cjs" "Tests basic functionality with CommonJS"; then
        print_success "✅ Basic E2E Test (CommonJS) passed"
    else
        print_error "❌ Basic E2E Test (CommonJS) failed"
        ((failed_tests++))
    fi
    
    # Test 3: Advanced Workflow Test
    if run_test "Advanced Workflow Test" "advanced-workflow-test.mjs" "Tests complete user workflow"; then
        print_success "✅ Advanced Workflow Test passed"
    else
        print_error "❌ Advanced Workflow Test failed"
        ((failed_tests++))
    fi
    
    # Test 4: Compatibility Test
    if run_test "Compatibility Test" "compatibility-test.mjs" "Tests compatibility and edge cases"; then
        print_success "✅ Compatibility Test passed"
    else
        print_error "❌ Compatibility Test failed"
        ((failed_tests++))
    fi
    
    echo
    print_status "E2E Test Suite Summary"
    print_status "======================"
    
    if [[ $failed_tests -eq 0 ]]; then
        print_success "🎉 All tests passed! ($((${#test_files[@]} - failed_tests))/$((4)) tests)"
        print_success "✅ SDK is ready for production use"
        return 0
    else
        print_error "❌ $failed_tests test(s) failed"
        print_error "Please check the output above for details"
        return 1
    fi
}

# Function to show usage
show_usage() {
    echo "TrainingPeaks SDK E2E Test Runner"
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  --help, -h          Show this help message"
    echo "  --basic             Run only basic tests"
    echo "  --advanced          Run only advanced workflow test"
    echo "  --compatibility     Run only compatibility test"
    echo "  --check-env         Check environment setup only"
    echo "  --build-only        Build library only"
    echo
    echo "Environment Variables:"
    echo "  TRAININGPEAKS_TEST_USERNAME    TrainingPeaks test username"
    echo "  TRAININGPEAKS_TEST_PASSWORD    TrainingPeaks test password"
    echo "  TRAININGPEAKS_WEB_HEADLESS     Browser headless mode (default: true)"
    echo "  TRAININGPEAKS_WEB_TIMEOUT      Browser timeout in ms (default: 30000)"
    echo
    echo "Examples:"
    echo "  $0                                    # Run all tests"
    echo "  $0 --basic                           # Run only basic tests"
    echo "  TRAININGPEAKS_WEB_HEADLESS=false $0  # Run with visible browser"
}

# Main execution
main() {
    # Parse command line arguments
    case "${1:-}" in
        --help|-h)
            show_usage
            exit 0
            ;;
        --check-env)
            check_environment
            exit 0
            ;;
        --build-only)
            check_dependencies
            build_library
            exit 0
            ;;
        --basic)
            check_environment
            check_dependencies
            build_library
            run_test "Basic E2E Test (ESM)" "test-built-library.mjs" "Tests basic functionality with ES modules"
            run_test "Basic E2E Test (CommonJS)" "test-built-library.cjs" "Tests basic functionality with CommonJS"
            exit $?
            ;;
        --advanced)
            check_environment
            check_dependencies
            build_library
            run_test "Advanced Workflow Test" "advanced-workflow-test.mjs" "Tests complete user workflow"
            exit $?
            ;;
        --compatibility)
            check_environment
            check_dependencies
            build_library
            run_test "Compatibility Test" "compatibility-test.mjs" "Tests compatibility and edge cases"
            exit $?
            ;;
        "")
            # No arguments, run all tests
            check_environment
            check_dependencies
            build_library
            run_all_tests
            exit $?
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@" 