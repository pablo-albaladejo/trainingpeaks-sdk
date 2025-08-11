#!/bin/bash
# act wrapper script for running GitHub Actions locally

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${GREEN}[ACT]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[ACT]${NC} $1"
}

print_error() {
    echo -e "${RED}[ACT]${NC} $1"
}

# Check if act is installed 
if ! command -v act &> /dev/null; then
    print_error "act is not installed. Please install it first:"
    echo "  macOS: brew install act"
    echo "  Linux: https://github.com/nektos/act#installation"
    exit 1
fi

# Parse arguments
JOB_NAME=${1:-"validate"}
DRY_RUN=${2:-"false"}

# Available jobs from the workflow
AVAILABLE_JOBS=(
    "validate"
    "test-matrix" 
    "security"
    "build-analyze"
    "changelog-validation"
)

print_usage() {
    echo "Usage: $0 [job] [dry-run]"
    echo ""
    echo "Available jobs:"
    for job in "${AVAILABLE_JOBS[@]}"; do
        echo "  - $job"
    done
    echo ""
    echo "Examples:"
    echo "  $0 validate                    # Run validation job"
    echo "  $0 test-matrix                 # Run test matrix job"  
    echo "  $0 validate true               # Dry run validation job"
    echo "  $0                             # Run validation job (default)"
}

# Validate job name
if [[ ! " ${AVAILABLE_JOBS[@]} " =~ " ${JOB_NAME} " ]]; then
    print_error "Invalid job name: $JOB_NAME"
    print_usage
    exit 1
fi

# Check if workflow file exists
WORKFLOW_FILE=".github/workflows/main.yml"
if [ ! -f "$WORKFLOW_FILE" ]; then
    print_error "Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

print_step "Running GitHub Action job '$JOB_NAME' locally with act..."

# Build act command
ACT_CMD="act"

# Add job filter
ACT_CMD="$ACT_CMD --job $JOB_NAME"

# Add environment file
if [ -f ".env.act" ]; then
    ACT_CMD="$ACT_CMD --env-file .env.act"
fi

# Add dry run flag if requested
if [ "$DRY_RUN" = "true" ]; then
    ACT_CMD="$ACT_CMD --dry-run"
    print_warning "Running in dry-run mode (no actual execution)"
fi

# Add verbose output in dry run
if [ "$DRY_RUN" = "true" ]; then
    ACT_CMD="$ACT_CMD --verbose"
fi

# Add platform mappings
ACT_CMD="$ACT_CMD --platform ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest"

print_step "Executing: $ACT_CMD"
print_warning "Note: This will download Docker images on first run (may take several minutes)"

# Execute the command
eval $ACT_CMD

if [ $? -eq 0 ]; then
    print_step "✅ Successfully completed job '$JOB_NAME'"
else
    print_error "❌ Job '$JOB_NAME' failed"
    exit 1
fi