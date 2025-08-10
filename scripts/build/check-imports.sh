#!/bin/bash

# Script to validate import structure following clean architecture principles
# This script ensures proper dependency flow: adapters -> application -> domain

set -eo pipefail

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Check if project root exists
if [ ! -f "package.json" ]; then
    print_error "Must be run from project root (package.json not found)"
    exit 1
fi

print_info "Validating import structure following clean architecture..."

# Track violations
VIOLATIONS=0

# Function to check forbidden imports
check_forbidden_imports() {
    local layer=$1
    local pattern=$2
    local description=$3
    
    print_info "Checking $description..."
    
    local files=$(find src/$layer -name "*.ts" -not -name "*.test.ts" -not -name "*.integ-test.ts" 2>/dev/null || true)
    
    if [ -z "$files" ]; then
        print_info "No files found in src/$layer/"
        return
    fi
    
    local violations=$(grep -rn "$pattern" src/$layer/ --include="*.ts" --exclude="*.test.ts" --exclude="*.integ-test.ts" --exclude="*.contract-test.ts" --exclude="*.e2e-test.ts" 2>/dev/null || true)
    
    if [ ! -z "$violations" ]; then
        print_error "Found forbidden imports in $layer layer:"
        echo "$violations" | while IFS= read -r line; do
            echo "  $line"
        done
        VIOLATIONS=$((VIOLATIONS + 1))
    else
        print_success "$description passed"
    fi
}

# Check domain layer - should not import from application or adapters
check_forbidden_imports "domain" "from ['\"]@/(adapters|application)" "Domain layer independence"

# Check application layer - should not import from adapters  
check_forbidden_imports "application" "from ['\"]@/adapters" "Application layer independence from adapters"

# Check for circular dependencies
print_info "Checking for actual circular dependencies..."

# Check for circular dependency violations (domain importing upward)
check_circular_dependency() {
    local from_layer="$1"
    local to_layer="$2"
    local description="$3"
    
    local violations=$(find "src/$from_layer" -name "*.ts" -not -name "*.test.ts" -not -name "*.integ-test.ts" -not -name "*.contract-test.ts" -not -name "*.e2e-test.ts" -exec grep -l "from.*@/$to_layer" {} \; 2>/dev/null || true)
    if [ ! -z "$violations" ]; then
        print_error "Found circular dependency: $description"
        echo "$violations" | while IFS= read -r file; do
            echo "  $file"
            grep -n "from.*@/$to_layer" "$file" 2>/dev/null
        done
        VIOLATIONS=$((VIOLATIONS + 1))
    fi
}

check_circular_dependency "domain" "application" "Domain importing from Application"
check_circular_dependency "domain" "adapters" "Domain importing from Adapters"

# Check for correct usage of path aliases
print_info "Checking path alias usage..."

# Find imports that should use aliases but don't
relative_imports=$(find src -name "*.ts" -exec grep -l "from ['\"]\\.\\..*/" {} \; 2>/dev/null || true)

if [ ! -z "$relative_imports" ]; then
    print_warning "Found relative imports that could use path aliases:"
    echo "$relative_imports" | while IFS= read -r file; do
        grep -n "from ['\"]\\.\\..*/" "$file" 2>/dev/null || true
    done
    print_info "Consider using @/* aliases instead of relative imports"
fi

# Check for proper layer exports
print_info "Checking layer exports..."

# Configurable layers - update based on actual project structure
layers=("adapters" "application" "domain" "shared")

for layer in "${layers[@]}"; do
    if [ -d "src/$layer" ] && [ ! -f "src/$layer/index.ts" ]; then
        print_warning "Layer src/$layer/ missing index.ts export file"
    fi
done

# Final summary
echo ""
if [ $VIOLATIONS -eq 0 ]; then
    print_success "All import structure checks passed! 🎉"
    exit 0
else
    print_error "Found $VIOLATIONS import structure violations"
    echo ""
    print_info "Import rules:"
    echo "  • Domain layer: No imports from application or adapters"
    echo "  • Application layer: No imports from adapters" 
    echo "  • Adapters layer: Can import from application and domain"
    echo "  • Use @/* path aliases instead of relative imports"
    echo "  • Each layer should have an index.ts export file"
    exit 1
fi