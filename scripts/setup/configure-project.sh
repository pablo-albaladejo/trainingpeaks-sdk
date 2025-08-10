#!/bin/bash

# Project Configuration Script
# Sets up the project with dynamic configuration values

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}🔧${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_header() {
    echo -e "${BLUE}🚀 Project Configuration Setup${NC}"
    echo "=================================="
    echo
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Must be run from project root (package.json not found)"
    exit 1
fi

print_header

print_step "Checking for existing configuration..."

# Check if .env.project exists
if [ ! -f ".env.project" ]; then
    print_warning ".env.project not found"
    
    if [ -f ".env.project.example" ]; then
        echo "Would you like to copy .env.project.example to .env.project? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            cp .env.project.example .env.project
            print_success "Created .env.project from example"
            print_warning "Please edit .env.project with your project details before continuing"
            echo
            echo "Key values to update:"
            echo "- PROJECT_NAME"
            echo "- PROJECT_TITLE"
            echo "- AUTHOR_NAME and AUTHOR_EMAIL"
            echo "- REPO_OWNER and REPO_NAME"
            echo "- GITHUB_USERNAME"
            echo
            echo "After editing .env.project, run this script again:"
            echo "  npm run setup:project"
            exit 0
        else
            print_warning "Using environment variables and defaults"
        fi
    else
        print_error ".env.project.example not found"
        print_error "Please create .env.project with your configuration"
        exit 1
    fi
else
    print_success ".env.project found"
fi

print_step "Generating project configuration files..."

# Run the configuration generator
if command -v tsx >/dev/null 2>&1; then
    tsx scripts/build/generate-all-configs.ts
else
    print_error "tsx not found. Please install it:"
    print_error "  npm install -g tsx"
    exit 1
fi

print_step "Validating generated configuration..."

# Check if all expected files were generated
expected_files=(
    "package.json"
    ".github/CODEOWNERS"
    ".github/dependabot.yml"
    ".github/labels.yml"
    ".github/workflows/ci.yml"
    ".github/workflows/release.yml"
    "commitlint.config.cjs"
    "release.config.cjs"
)

missing_files=()
for file in "${expected_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    print_success "All configuration files generated successfully!"
else
    print_warning "Some configuration files were not generated:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
fi

print_step "Next steps"
echo
echo "Your project has been configured with dynamic values!"
echo
echo "Recommended actions:"
echo "1. 📝 Review the generated configuration files"
echo "2. 🔍 Check the git diff to see what changed"
echo "3. 🏷️  Sync GitHub labels: npm run sync:labels"
echo "4. 💾 Commit the configuration changes"
echo "5. 🧪 Test the CI/CD pipeline with a test commit"
echo
echo "Configuration commands:"
echo "  npm run generate:config  - Regenerate all config files"
echo "  npm run validate:config  - Validate current configuration"
echo "  npm run sync:labels      - Sync GitHub labels from config"
echo
print_success "Project configuration completed!"