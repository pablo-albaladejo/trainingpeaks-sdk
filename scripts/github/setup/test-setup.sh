#!/bin/bash

# Test script for the GitHub project setup script
# This script validates the setup script without actually creating resources

set -euo pipefail  # Improved error handling: exit on error, undefined vars, and pipe failures

# Trap to handle unexpected errors
trap 'echo -e "${RED}[ERROR]${NC} Script failed at line $LINENO. Exit code: $?" >&2; exit 1' ERR

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_detail() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Function to test script syntax
test_syntax() {
    echo "Testing script syntax..."
    
    # Check if the setup script exists before testing
    if [ ! -f "scripts/github/setup/setup-github-project.sh" ]; then
        print_error "Setup script not found: scripts/github/setup/setup-github-project.sh"
        return 1
    fi
    
    # Test syntax with better error capture
    if bash -n "scripts/github/setup/setup-github-project.sh" 2>/dev/null; then
        print_success "Script syntax is valid"
    else
        print_error "Script syntax has errors"
        echo "Run 'bash -n scripts/github/setup/setup-github-project.sh' for details"
        return 1
    fi
}

# Function to test script help
test_help() {
    echo "Testing help functionality..."
    
    # Check if the script is executable
    if [ ! -x "scripts/github/setup/setup-github-project.sh" ]; then
        print_error "Setup script is not executable"
        return 1
    fi
    
    # Test help functionality with timeout to prevent hanging
    # Check if timeout command is available
    if command -v timeout >/dev/null 2>&1; then
        if timeout 10s ./scripts/github/setup/setup-github-project.sh --help >/dev/null 2>&1; then
            print_success "Help functionality works"
        else
            local exit_code=$?
            if [ $exit_code -eq 124 ]; then
                print_error "Help functionality timed out"
            else
                print_error "Help functionality failed (exit code: $exit_code)"
            fi
            return 1
        fi
    else
        print_warning "timeout command not available, skipping timeout test"
        if ./scripts/github/setup/setup-github-project.sh --help >/dev/null 2>&1; then
            print_success "Help functionality works"
        else
            print_error "Help functionality failed"
            return 1
        fi
    fi
}

# Function to test configuration files
test_config_files() {
    echo "Testing configuration files..."
    local config_files=(
        ".github/labels.yml"
        ".github/project.yml"
        ".github/ISSUE_TEMPLATE/config.yml"
    )

    local all_exist=true
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Configuration file exists: $file"
        else
            print_error "Configuration file missing: $file"
            all_exist=false
        fi
    done

    if [ "$all_exist" = true ]; then
        print_success "All configuration files are present"
    else
        print_error "Some configuration files are missing"
        return 1
    fi
}

# Function to test labels.yml format
test_labels_format() {
    echo "Testing labels.yml format..."

    if [ ! -f ".github/labels.yml" ]; then
        print_error "labels.yml file not found"
        return 1
    fi

    # Check if file has valid YAML structure
    local label_count=0
    local valid_labels=0

    # Use yq if available for robust YAML parsing
    if command -v yq >/dev/null 2>&1; then
        print_detail "Using yq for robust YAML parsing validation"
        
        # Validate YAML syntax first
        if ! yq eval '.' ".github/labels.yml" >/dev/null 2>&1; then
            print_error "Invalid YAML syntax in labels.yml"
            return 1
        fi
        
        # Get label count using yq
        label_count=$(yq 'length' ".github/labels.yml" 2>/dev/null || echo "0")
        
        # Check each label has required fields
        for ((i=0; i<label_count; i++)); do
            local name=$(yq ".[$i].name" ".github/labels.yml" 2>/dev/null | sed 's/^"//;s/"$//')
            local color=$(yq ".[$i].color" ".github/labels.yml" 2>/dev/null | sed 's/^"//;s/"$//')
            local description=$(yq ".[$i].description" ".github/labels.yml" 2>/dev/null | sed 's/^"//;s/"$//')
            
            if [ -n "$name" ] && [ "$name" != "null" ] && [ -n "$color" ] && [ "$color" != "null" ] && [ -n "$description" ] && [ "$description" != "null" ]; then
                ((valid_labels++))
            fi
        done
    else
        print_warning "yq not found, using fallback bash parsing for YAML validation"
        
        # Fallback to original bash parsing
        while IFS= read -r line; do
            if [[ $line =~ ^[[:space:]]*-[[:space:]]*name:[[:space:]]*\"([^\"]+)\" ]]; then
                ((label_count++))
                if [[ $line =~ color:[[:space:]]*\"([^\"]+)\" ]] && [[ $line =~ description:[[:space:]]*\"([^\"]+)\" ]]; then
                    ((valid_labels++))
                fi
            fi
        done < .github/labels.yml
    fi

    if [ $label_count -gt 0 ]; then
        print_success "Found $label_count labels in configuration"
        if [ $valid_labels -eq $label_count ]; then
            print_success "All labels have valid format (name, color, description)"
        else
            print_warning "Some labels may be missing color or description ($valid_labels/$label_count valid)"
        fi
    else
        print_error "No labels found in configuration"
        return 1
    fi
}

# Function to test project.yml format
test_project_format() {
    echo "Testing project.yml format..."

    if [ ! -f ".github/project.yml" ]; then
        print_error "project.yml file not found"
        return 1
    fi

    # Check for required sections using yq or fallback
    local has_name=false
    local has_columns=false
    local has_views=false

    if command -v yq >/dev/null 2>&1; then
        print_detail "Using yq for project YAML validation"
        
        # Validate YAML syntax first
        if ! yq eval '.' ".github/project.yml" >/dev/null 2>&1; then
            print_error "Invalid YAML syntax in project.yml"
            return 1
        fi
        
        # Check for required fields using yq
        local name=$(yq '.name' ".github/project.yml" 2>/dev/null)
        local columns=$(yq '.columns' ".github/project.yml" 2>/dev/null)
        local views=$(yq '.views' ".github/project.yml" 2>/dev/null)
        
        if [ -n "$name" ] && [ "$name" != "null" ]; then
            has_name=true
        fi
        
        if [ -n "$columns" ] && [ "$columns" != "null" ]; then
            has_columns=true
        fi
        
        if [ -n "$views" ] && [ "$views" != "null" ]; then
            has_views=true
        fi
    else
        print_warning "yq not found, using fallback bash parsing for project YAML validation"
        
        # Fallback to original bash parsing
        while IFS= read -r line; do
            if [[ $line =~ ^name: ]]; then
                has_name=true
            elif [[ $line =~ ^columns: ]]; then
                has_columns=true
            elif [[ $line =~ ^views: ]]; then
                has_views=true
            fi
        done < .github/project.yml
    fi

    # Check required fields (views is optional)
    if [ "$has_name" = true ] && [ "$has_columns" = true ]; then
        if [ "$has_views" = false ]; then
            print_warning "Project configuration is missing optional 'views' field"
        fi
        print_success "Project configuration has required sections"
    else
        local missing=()
        [ "$has_name" = false ] && missing+=("name")
        [ "$has_columns" = false ] && missing+=("columns")
        print_error "Project configuration is missing required sections: ${missing[*]}"
        return 1
    fi
}

# Function to test issue templates
test_issue_templates() {
    echo "Testing issue templates..."

    if [ ! -d ".github/ISSUE_TEMPLATE" ]; then
        print_error "Issue templates directory not found"
        return 1
    fi

    # Use safer find command with proper error handling
    local template_count=0
    if [ -d ".github/ISSUE_TEMPLATE" ]; then
        template_count=$(find ".github/ISSUE_TEMPLATE" -maxdepth 1 \( -name "*.md" -o -name "*.yml" -o -name "*.yaml" \) -type f | wc -l)
    fi

    if [ $template_count -gt 0 ]; then
        print_success "Found $template_count issue templates"

        # Check for config.yml
        if [ -f ".github/ISSUE_TEMPLATE/config.yml" ]; then
            print_success "Issue template configuration exists"
        else
            print_warning "Issue template configuration missing"
        fi
    else
        print_error "No issue templates found"
        return 1
    fi
}

# Function to test script permissions
test_permissions() {
    echo "Testing script permissions..."

    if [ -x "scripts/github/setup/setup-github-project.sh" ]; then
        print_success "Setup script is executable"
    else
        print_error "Setup script is not executable"
        return 1
    fi
}

# Function to test GitHub CLI availability
test_gh_cli() {
    echo "Testing GitHub CLI availability..."

    if command -v gh >/dev/null 2>&1; then
        print_success "GitHub CLI is installed"

        # Check if authenticated (without actually running commands)
        if gh auth status >/dev/null 2>&1; then
            print_success "GitHub CLI is authenticated"
        else
            print_warning "GitHub CLI is not authenticated (run 'gh auth login')"
        fi
    else
        print_warning "GitHub CLI is not installed"
        echo "  Install with: brew install gh (macOS) or sudo apt install gh (Linux)"
    fi
}

# Function to run all tests
run_tests() {
    echo "🧪 Running GitHub Project Setup Script Tests"
    echo "============================================="
    echo

    local tests_passed=0
    local tests_failed=0

    # Array of test functions
    local test_functions=(
        "test_permissions"
        "test_syntax"
        "test_help"
        "test_config_files"
        "test_labels_format"
        "test_project_format"
        "test_issue_templates"
        "test_gh_cli"
    )

    # Run each test with proper error handling
    for test_func in "${test_functions[@]}"; do
        echo "Running: $test_func"
        
        # Temporarily disable exit on error for individual tests
        set +e
        if $test_func; then
            ((tests_passed++))
        else
            ((tests_failed++))
        fi
        set -e
        echo
    done

    # Summary
    echo "📊 Test Summary"
    echo "==============="
    echo "✅ Passed: $tests_passed"
    echo "❌ Failed: $tests_failed"
    echo "📋 Total: $((tests_passed + tests_failed))"
    echo

    if [ $tests_failed -eq 0 ]; then
        print_success "All tests passed! The setup script is ready to use."
        echo
        echo "🚀 To run the setup script:"
        echo "   ./scripts/github/setup/setup-github-project.sh"
        echo
        echo "📚 For more information:"
        echo "   ./scripts/github/setup/setup-github-project.sh --help"
    else
        print_error "Some tests failed. Please fix the issues before using the setup script."
        return 1
    fi
}

# Main execution
main() {
    # Check if we're in the right directory
    if [ ! -f "scripts/github/setup/setup-github-project.sh" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi

    # Run all tests
    run_tests
}

# Run main function
main "$@"
