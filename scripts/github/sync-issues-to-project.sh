#!/bin/bash

# Script to sync repository issues with GitHub project
# Usage: ./scripts/github/sync-issues-to-project.sh [options]

set -e

# Configuration
PROJECT_NUMBER=9
PROJECT_OWNER="pablo-albaladejo" 
REPO_OWNER="pablo-albaladejo"
REPO_NAME="trainingpeaks-sdk"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_header() {
    echo -e "${PURPLE}🚀${NC} $1"
}

# Function to show help
show_help() {
    cat << EOF
GitHub Issues to Project Sync Script

Synchronizes repository issues with GitHub project, ensuring all issues are properly tracked.

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --help, -h          Show this help message
    --dry-run          Show what would be synced without making changes
    --force            Force sync even if no changes detected
    --filter FILTER    Sync only issues matching filter (open, closed, all)
    --limit LIMIT      Limit number of issues to process (default: 100)

EXAMPLES:
    $0                              # Sync all open issues to project
    $0 --dry-run                    # Preview sync without changes
    $0 --filter closed --limit 50   # Sync last 50 closed issues
    $0 --force                      # Force full resync

WHAT THIS SCRIPT DOES:
    - Fetches all repository issues (open/closed)
    - Checks which issues are already in the project
    - Adds missing issues to the project
    - Reports sync statistics and any errors
    - Optionally removes issues that no longer exist

For more information, see scripts/github-setup/README.md

EOF
}

# Function to get project ID
get_project_id() {
    if [ -f ".github/project-id.txt" ]; then
        PROJECT_ID=$(cat .github/project-id.txt)
        print_info "Using project ID from file: $PROJECT_ID"
    else
        # Try to get project ID from API
        PROJECT_ID=$(gh api graphql -f query='
        query($owner: String!, $number: Int!) {
          user(login: $owner) {
            projectV2(number: $number) {
              id
            }
          }
        }
        ' -f owner="$PROJECT_OWNER" -F number="$PROJECT_NUMBER" -q '.data.user.projectV2.id' 2>/dev/null || echo "")
        
        if [ -z "$PROJECT_ID" ]; then
            print_error "Could not find project ID. Make sure project exists and you have access."
            exit 1
        fi
        
        # Save project ID for future use
        mkdir -p .github
        echo "$PROJECT_ID" > .github/project-id.txt
        print_success "Project ID saved to .github/project-id.txt"
    fi
}

# Function to get all repository issues
get_repository_issues() {
    print_info "Fetching repository issues..."
    
    local filter_state="$1"
    local limit_count="$2"
    
    if [ "$filter_state" = "all" ]; then
        REPO_ISSUES=$(gh issue list \
            --repo "$REPO_OWNER/$REPO_NAME" \
            --limit "$limit_count" \
            --state all \
            --json number,title,state,url)
    else
        REPO_ISSUES=$(gh issue list \
            --repo "$REPO_OWNER/$REPO_NAME" \
            --limit "$limit_count" \
            --state "$filter_state" \
            --json number,title,state,url)
    fi
    
    local issue_count=$(echo "$REPO_ISSUES" | jq length)
    print_success "Found $issue_count repository issues"
}

# Function to get issues currently in project
get_project_issues() {
    print_info "Fetching issues currently in project..."
    
    PROJECT_ISSUES=$(gh api graphql -f query='
    query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          items(first: 100) {
            nodes {
              id
              content {
                ... on Issue {
                  number
                  title
                  state
                  url
                }
              }
            }
          }
        }
      }
    }
    ' -f projectId="$PROJECT_ID" --jq '.data.node.items.nodes[] | select(.content.number != null) | {itemId: .id, number: .content.number, title: .content.title, state: .content.state, url: .content.url}')
    
    local project_issue_count=$(echo "$PROJECT_ISSUES" | jq -s length)
    print_success "Found $project_issue_count issues in project"
}

# Function to compare and find missing issues
find_missing_issues() {
    print_info "Analyzing issues to sync..."
    
    # Get issue numbers currently in project
    PROJECT_ISSUE_NUMBERS=$(echo "$PROJECT_ISSUES" | jq -r '.number' 2>/dev/null | sort -n || echo "")
    
    # Find repository issues not in project
    MISSING_ISSUES=$(echo "$REPO_ISSUES" | jq --argjson project_numbers "$(echo "$PROJECT_ISSUE_NUMBERS" | jq -R . | jq -s 'map(tonumber)')" '
    map(select(.number as $num | $project_numbers | index($num) == null))')
    
    local missing_count=$(echo "$MISSING_ISSUES" | jq length)
    
    if [ "$missing_count" -gt 0 ]; then
        print_warning "Found $missing_count issues not in project"
        
        if [ "$DRY_RUN" = "true" ]; then
            print_info "Issues that would be added to project:"
            echo "$MISSING_ISSUES" | jq -r '.[] | "  #\(.number): \(.title) (\(.state))"'
        fi
    else
        print_success "All repository issues are already in project"
    fi
}

# Function to add missing issues to project
sync_missing_issues() {
    if [ "$DRY_RUN" = "true" ]; then
        print_info "DRY RUN: Would add $missing_count issues to project"
        return
    fi
    
    local missing_count=$(echo "$MISSING_ISSUES" | jq length)
    
    if [ "$missing_count" -eq 0 ]; then
        print_success "No issues to sync"
        return
    fi
    
    print_info "Adding $missing_count issues to project..."
    
    local added_count=0
    local failed_count=0
    
    echo "$MISSING_ISSUES" | jq -c '.[]' | while read -r issue; do
        local issue_number=$(echo "$issue" | jq -r '.number')
        local issue_title=$(echo "$issue" | jq -r '.title')
        local issue_url=$(echo "$issue" | jq -r '.url')
        
        print_info "Adding issue #$issue_number: $issue_title"
        
        if gh project item-add "$PROJECT_NUMBER" \
            --owner "$PROJECT_OWNER" \
            --url "$issue_url" >/dev/null 2>&1; then
            print_success "Added issue #$issue_number to project"
            ((added_count++))
        else
            print_error "Failed to add issue #$issue_number"
            ((failed_count++))
        fi
        
        # Rate limiting - add small delay
        sleep 0.5
    done
    
    print_success "Sync completed: $added_count added, $failed_count failed"
}

# Function to find orphaned project items (issues that no longer exist)
find_orphaned_items() {
    if [ "$CHECK_ORPHANED" != "true" ]; then
        return
    fi
    
    print_info "Checking for orphaned project items..."
    
    # Get repository issue numbers
    REPO_ISSUE_NUMBERS=$(echo "$REPO_ISSUES" | jq -r '.number' | sort -n)
    
    # Find project issues not in repository
    ORPHANED_ITEMS=$(echo "$PROJECT_ISSUES" | jq --argjson repo_numbers "$(echo "$REPO_ISSUE_NUMBERS" | jq -R . | jq -s 'map(tonumber)')" '
    select(.number as $num | $repo_numbers | index($num) == null)')
    
    local orphaned_count=$(echo "$ORPHANED_ITEMS" | jq -s length)
    
    if [ "$orphaned_count" -gt 0 ]; then
        print_warning "Found $orphaned_count orphaned items in project"
        
        if [ "$DRY_RUN" = "true" ]; then
            print_info "Orphaned items that could be removed:"
            echo "$ORPHANED_ITEMS" | jq -s -r '.[] | "  #\(.number): \(.title) (Item ID: \(.itemId))"'
        else
            print_warning "Use --remove-orphaned flag to remove orphaned items"
        fi
    else
        print_success "No orphaned items found"
    fi
}

# Function to generate sync report
generate_report() {
    print_header "Issue Sync Report"
    echo "=================================="
    echo
    
    local total_repo_issues=$(echo "$REPO_ISSUES" | jq length)
    local total_project_issues=$(echo "$PROJECT_ISSUES" | jq -s length)
    local missing_count=$(echo "$MISSING_ISSUES" | jq length)
    
    echo "📊 Statistics:"
    echo "  Repository issues: $total_repo_issues"
    echo "  Project issues: $total_project_issues"
    echo "  Missing from project: $missing_count"
    
    if [ "$CHECK_ORPHANED" = "true" ]; then
        local orphaned_count=$(echo "$ORPHANED_ITEMS" | jq -s length)
        echo "  Orphaned in project: $orphaned_count"
    fi
    
    echo
    echo "🔗 Links:"
    echo "  Repository: https://github.com/$REPO_OWNER/$REPO_NAME/issues"
    echo "  Project: https://github.com/users/$PROJECT_OWNER/projects/$PROJECT_NUMBER"
    echo
    
    if [ "$missing_count" -eq 0 ]; then
        print_success "✨ Project is fully synchronized!"
    else
        print_info "Use --force to sync missing issues"
    fi
}

# Main function
main() {
    # Parse command line arguments
    DRY_RUN=false
    FORCE_SYNC=false
    FILTER_STATE="open"
    LIMIT_COUNT=100
    CHECK_ORPHANED=false
    REMOVE_ORPHANED=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE_SYNC=true
                shift
                ;;
            --filter)
                FILTER_STATE="$2"
                shift 2
                ;;
            --limit)
                LIMIT_COUNT="$2"
                shift 2
                ;;
            --check-orphaned)
                CHECK_ORPHANED=true
                shift
                ;;
            --remove-orphaned)
                REMOVE_ORPHANED=true
                CHECK_ORPHANED=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    print_header "GitHub Issues to Project Sync"
    echo "Repository: $REPO_OWNER/$REPO_NAME"
    echo "Project: $PROJECT_OWNER/projects/$PROJECT_NUMBER"
    echo "Filter: $FILTER_STATE issues (limit: $LIMIT_COUNT)"
    
    if [ "$DRY_RUN" = "true" ]; then
        print_warning "DRY RUN MODE - No changes will be made"
    fi
    
    echo
    
    # Execute sync steps
    get_project_id
    get_repository_issues "$FILTER_STATE" "$LIMIT_COUNT"
    get_project_issues
    find_missing_issues
    
    if [ "$FORCE_SYNC" = "true" ] || [ "$DRY_RUN" = "true" ]; then
        sync_missing_issues
    fi
    
    find_orphaned_items
    generate_report
}

# Run main function
main "$@"