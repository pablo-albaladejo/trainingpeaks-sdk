#!/bin/bash

# Script to create GitHub issue and automatically add it to the project
# Usage: ./scripts/github/create-issue.sh --title "Issue Title" --body "Issue Body" --label "label1,label2"

# Error handling implemented explicitly below

# Configuration - can be overridden by environment variables or command line
PROJECT_NUMBER="${PROJECT_NUMBER:-9}"
PROJECT_OWNER="${PROJECT_OWNER:-pablo-albaladejo}"
REPO_OWNER="${REPO_OWNER:-pablo-albaladejo}"
REPO_NAME="${REPO_NAME:-trainingpeaks-sdk}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Pre-checks
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed. Please install it first."
    exit 1
fi

if ! gh auth status &> /dev/null; then
    print_error "GitHub CLI is not authenticated. Please run 'gh auth login' first."
    exit 1
fi

# Parse command line arguments
TITLE=""
BODY=""
LABELS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --title)
            TITLE="$2"
            shift 2
            ;;
        --body)
            BODY="$2"
            shift 2
            ;;
        --label|--labels)
            LABELS="$2"
            shift 2
            ;;
        --repo-owner)
            REPO_OWNER="$2"
            shift 2
            ;;
        --repo-name)
            REPO_NAME="$2"
            shift 2
            ;;
        --project-owner)
            PROJECT_OWNER="$2"
            shift 2
            ;;
        --project-number)
            PROJECT_NUMBER="$2"
            shift 2
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Usage: $0 --title 'Issue Title' --body 'Issue Body' [--label 'label1,label2'] [--repo-owner OWNER] [--repo-name NAME] [--project-owner OWNER] [--project-number NUM]"
            exit 1
            ;;
    esac
done

# Validate required parameters
if [ -z "$TITLE" ]; then
    print_error "Title is required"
    echo "Usage: $0 --title 'Issue Title' --body 'Issue Body' --label 'label1,label2'"
    exit 1
fi

if [ -z "$BODY" ]; then
    print_error "Body is required"
    echo "Usage: $0 --title 'Issue Title' --body 'Issue Body' --label 'label1,label2'"
    exit 1
fi

print_info "Creating issue: $TITLE"

# Create the issue
if [ -n "$LABELS" ]; then
    # Split comma-separated labels into individual --label flags
    LABEL_ARGS=""
    IFS=',' read -ra LABEL_ARRAY <<< "$LABELS"
    for label in "${LABEL_ARRAY[@]}"; do
        LABEL_ARGS="$LABEL_ARGS --label $(echo "$label" | xargs)"
    done
    if ! ISSUE_URL=$(gh issue create \
        --title "$TITLE" \
        --body "$BODY" \
        $LABEL_ARGS \
        --repo "$REPO_OWNER/$REPO_NAME" 2>&1); then
        print_error "Failed to create issue with labels: $ISSUE_URL"
        exit 1
    fi
else
    if ! ISSUE_URL=$(gh issue create \
        --title "$TITLE" \
        --body "$BODY" \
        --repo "$REPO_OWNER/$REPO_NAME" 2>&1); then
        print_error "Failed to create issue: $ISSUE_URL"
        exit 1
    fi
fi

print_success "Issue created: $ISSUE_URL"

# Extract issue number from URL
ISSUE_NUMBER=$(echo "$ISSUE_URL" | grep -o '[0-9]*$')

print_info "Adding issue #$ISSUE_NUMBER to project board"

# Add issue to project
gh project item-add $PROJECT_NUMBER \
    --owner $PROJECT_OWNER \
    --url "$ISSUE_URL"

if [ $? -eq 0 ]; then
    print_success "Issue #$ISSUE_NUMBER added to project board successfully"
    print_info "Issue URL: $ISSUE_URL"
    print_info "Project: https://github.com/users/$PROJECT_OWNER/projects/$PROJECT_NUMBER"
else
    print_error "Failed to add issue to project board"
    print_info "Issue created but not added to project: $ISSUE_URL"
    exit 1
fi