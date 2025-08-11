#!/bin/bash

# Script to verify project view configurations
# Usage: ./scripts/github/verify-views.sh [OPTIONS]

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

# Function to show help
show_help() {
    cat << EOF
Project Views Verification Script

This script verifies GitHub project view configurations and displays project structure.

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --help, -h          Show this help message
    --user USER         GitHub username (default: current authenticated user) 
    --project-id ID     GitHub project number (default: 9)

EXAMPLES:
    $0                                    # Verify with default settings
    $0 --user myuser --project-id 5      # Verify specific user project
    $0 --help                            # Show this help message

PREREQUISITES:
    - GitHub CLI (gh) installed and authenticated
    - Project access permissions

EOF
}

# Parse command line arguments
USER=""
PROJECT_ID="9"

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --user)
            USER="$2"
            shift 2
            ;;
        --project-id)
            PROJECT_ID="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1" >&2
            show_help >&2
            exit 1
            ;;
    esac
done

# Get authenticated user if not specified
if [ -z "$USER" ]; then
    USER=$(gh api user -q .login)
    if [ -z "$USER" ]; then
        print_warning "Could not determine authenticated user"
        exit 1
    fi
fi

print_info "Checking project view configurations..."
print_info "User: $USER, Project ID: $PROJECT_ID"

# Query project views
VIEWS_DATA=$(gh api graphql -f query='
query($user: String!, $projectId: Int!) {
  user(login: $user) {
    projectV2(number: $projectId) {
      title
      views(first: 10) {
        nodes {
          id
          name
          layout
          visibleFields(first: 20) {
            nodes {
              ... on ProjectV2Field {
                name
                dataType
              }
            }
          }
        }
      }
    }
  }
}' -f user="$USER" -F projectId="$PROJECT_ID")

echo "$VIEWS_DATA" | jq -r '
.data.user.projectV2.views.nodes[] | 
"
🎯 View: \(.name)
   Layout: \(.layout)
   Fields: \([.visibleFields.nodes[].name] | join(", "))
"'

print_info "Recommended field configuration:"
echo ""
echo "📋 Board View should have:"
echo "   - Title, Status, Priority, Type, Effort, Labels"
echo ""
echo "🚀 Roadmap View should have:"
echo "   - Title, Status, Priority, Type, Effort, Repository"
echo ""

# Count total issues in project  
ISSUE_COUNT=$(gh api graphql -f query='
query($user: String!, $projectId: Int!) {
  user(login: $user) {
    projectV2(number: $projectId) {
      items(first: 100) {
        totalCount
      }
    }
  }
}' -f user="$USER" -F projectId="$PROJECT_ID" | jq -r '.data.user.projectV2.items.totalCount')

print_success "Project has $ISSUE_COUNT items total"

# Show project URL
print_info "Project URL: https://github.com/users/$USER/projects/$PROJECT_ID"