#!/bin/bash

# Project Maintenance Script - Comprehensive project health check and sync
# Usage: ./scripts/github/project-maintenance.sh [options]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_header() {
    echo -e "${PURPLE}🚀${NC} $1"
}

print_detail() {
    echo -e "${CYAN}📋${NC} $1"
}

# Function to show help
show_help() {
    cat << EOF
Project Maintenance Script

Comprehensive GitHub project health check and maintenance operations.

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --help, -h              Show this help message
    --sync-issues          Sync repository issues to project
    --verify-views         Verify project view configurations
    --check-labels         Check and report label usage
    --health-report        Generate comprehensive project health report
    --all                  Run all maintenance tasks
    --fix                  Attempt to fix detected issues

MAINTENANCE TASKS:
    1. Issue Synchronization   - Ensure all repo issues are in project
    2. View Configuration      - Verify project views are optimally configured
    3. Label Analysis         - Check label usage and consistency
    4. Health Reporting       - Generate comprehensive project status
    5. Automated Fixes        - Attempt to resolve common issues

EXAMPLES:
    $0 --all                    # Run complete maintenance check
    $0 --sync-issues --fix      # Sync issues and fix problems
    $0 --health-report          # Generate project health report

EOF
}

# Function to sync issues to project
sync_issues() {
    print_header "Synchronizing Repository Issues"
    
    # Check script existence before execution
    if [[ ! -f "./scripts/github/sync-issues-to-project.sh" ]]; then
        print_error "Script not found: ./scripts/github/sync-issues-to-project.sh"
        return 1
    fi
    
    if ./scripts/github/sync-issues-to-project.sh --force; then
        print_success "Issue synchronization completed"
    else
        print_error "Issue synchronization failed"
        return 1
    fi
}

# Function to verify project views
verify_views() {
    print_header "Verifying Project View Configuration"
    
    # Check script existence before execution
    if [[ ! -f "./scripts/github/verify-views.sh" ]]; then
        print_error "Script not found: ./scripts/github/verify-views.sh"
        return 1
    fi
    
    if ./scripts/github/verify-views.sh; then
        print_success "View verification completed"
    else
        print_warning "View configuration needs attention"
    fi
}

# Function to analyze label usage
analyze_labels() {
    print_header "Analyzing Label Usage"
    
    print_info "Fetching label statistics..."
    
    # Get all issues with labels
    ISSUE_LABELS=$(gh issue list \
        --repo pablo-albaladejo/trainingpeaks-sdk \
        --limit 100 \
        --state all \
        --json number,labels \
        --jq '.[] | {number, labels: [.labels[].name]}')
    
    # Generate label usage report
    print_detail "Label Usage Report:"
    echo "$ISSUE_LABELS" | jq -r '
    .labels[] // empty' | sort | uniq -c | sort -nr | head -20 | while read count label; do
        echo "  $label: $count issues"
    done
    
    # Check for unlabeled issues
    UNLABELED_COUNT=$(echo "$ISSUE_LABELS" | jq -r 'select(.labels | length == 0) | .number' | wc -l)
    
    if [ "$UNLABELED_COUNT" -gt 0 ]; then
        print_warning "Found $UNLABELED_COUNT issues without labels"
        if [ "$FIX_ISSUES" = "true" ]; then
            print_info "Consider adding appropriate labels to improve organization"
        fi
    else
        print_success "All issues have appropriate labels"
    fi
}

# Function to generate health report
generate_health_report() {
    print_header "Project Health Report"
    echo "===================="
    
    # Get basic project stats
    OPEN_ISSUES=$(gh issue list --repo pablo-albaladejo/trainingpeaks-sdk --state open --json number --jq length)
    CLOSED_ISSUES=$(gh issue list --repo pablo-albaladejo/trainingpeaks-sdk --state closed --json number --jq length)
    TOTAL_ISSUES=$((OPEN_ISSUES + CLOSED_ISSUES))
    
    # Get priority breakdown
    CRITICAL_ISSUES=$(gh issue list --repo pablo-albaladejo/trainingpeaks-sdk --state open --label "priority: critical" --json number --jq length)
    HIGH_ISSUES=$(gh issue list --repo pablo-albaladejo/trainingpeaks-sdk --state open --label "priority: high" --json number --jq length)
    MEDIUM_ISSUES=$(gh issue list --repo pablo-albaladejo/trainingpeaks-sdk --state open --label "priority: medium" --json number --jq length)
    LOW_ISSUES=$(gh issue list --repo pablo-albaladejo/trainingpeaks-sdk --state open --label "priority: low" --json number --jq length)
    
    # Calculate completion rate
    if [ "$TOTAL_ISSUES" -gt 0 ]; then
        COMPLETION_RATE=$(echo "scale=1; $CLOSED_ISSUES * 100 / $TOTAL_ISSUES" | bc)
    else
        COMPLETION_RATE="0.0"
    fi
    
    echo "📊 Issue Statistics:"
    echo "  Total Issues: $TOTAL_ISSUES"
    echo "  Open Issues: $OPEN_ISSUES"
    echo "  Closed Issues: $CLOSED_ISSUES"
    echo "  Completion Rate: $COMPLETION_RATE%"
    echo
    
    echo "🎯 Priority Breakdown (Open Issues):"
    echo "  🔴 Critical: $CRITICAL_ISSUES"
    echo "  🟠 High: $HIGH_ISSUES" 
    echo "  🟡 Medium: $MEDIUM_ISSUES"
    echo "  🟢 Low: $LOW_ISSUES"
    echo
    
    # Get type breakdown
    BUG_ISSUES=$(gh issue list --repo pablo-albaladejo/trainingpeaks-sdk --state open --label "type: bug" --json number --jq length)
    FEATURE_ISSUES=$(gh issue list --repo pablo-albaladejo/trainingpeaks-sdk --state open --label "type: enhancement" --json number --jq length)
    REFACTOR_ISSUES=$(gh issue list --repo pablo-albaladejo/trainingpeaks-sdk --state open --label "type: refactor" --json number --jq length)
    TEST_ISSUES=$(gh issue list --repo pablo-albaladejo/trainingpeaks-sdk --state open --label "type: testing" --json number --jq length)
    DOC_ISSUES=$(gh issue list --repo pablo-albaladejo/trainingpeaks-sdk --state open --label "type: documentation" --json number --jq length)
    
    echo "📝 Type Breakdown (Open Issues):"
    echo "  🐛 Bugs: $BUG_ISSUES"
    echo "  ✨ Features: $FEATURE_ISSUES"
    echo "  ♻️ Refactoring: $REFACTOR_ISSUES"
    echo "  🧪 Testing: $TEST_ISSUES"
    echo "  📚 Documentation: $DOC_ISSUES"
    echo
    
    # Project health score calculation
    local health_score=100
    
    # Deduct points for critical issues
    health_score=$((health_score - CRITICAL_ISSUES * 10))
    
    # Deduct points for high number of open issues
    if [ "$OPEN_ISSUES" -gt 30 ]; then
        health_score=$((health_score - 10))
    fi
    
    # Add points for good completion rate
    if (( $(echo "$COMPLETION_RATE > 70" | bc -l) )); then
        health_score=$((health_score + 5))
    fi
    
    # Ensure score doesn't go below 0
    if [ "$health_score" -lt 0 ]; then
        health_score=0
    fi
    
    echo "🏥 Project Health Score: $health_score/100"
    
    if [ "$health_score" -ge 80 ]; then
        print_success "Project health is excellent!"
    elif [ "$health_score" -ge 60 ]; then
        print_warning "Project health is good but could be improved"
    else
        print_error "Project health needs attention"
    fi
    
    echo
    echo "🔗 Quick Links:"
    echo "  Repository: https://github.com/pablo-albaladejo/trainingpeaks-sdk"
    echo "  Project Board: https://github.com/users/pablo-albaladejo/projects/9"
    echo "  Issues: https://github.com/pablo-albaladejo/trainingpeaks-sdk/issues"
}

# Function to suggest improvements
suggest_improvements() {
    print_header "Improvement Suggestions"
    
    # Check for stale issues
    STALE_ISSUES=$(gh issue list \
        --repo pablo-albaladejo/trainingpeaks-sdk \
        --state open \
        --json number,updatedAt \
        --jq '.[] | select((.updatedAt | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime) < (now - (30 * 24 * 3600))) | .number' | wc -l)
    
    if [ "$STALE_ISSUES" -gt 0 ]; then
        print_warning "Found $STALE_ISSUES issues not updated in 30+ days"
        print_detail "Consider reviewing and closing or updating stale issues"
    fi
    
    # Check for missing milestones
    NO_MILESTONE=$(gh issue list \
        --repo pablo-albaladejo/trainingpeaks-sdk \
        --state open \
        --json number,milestone \
        --jq '.[] | select(.milestone == null) | .number' | wc -l)
    
    if [ "$NO_MILESTONE" -gt 5 ]; then
        print_warning "$NO_MILESTONE issues without milestones"
        print_detail "Consider organizing issues into milestones for better planning"
    fi
    
    # Check for missing assignees on critical issues
    UNASSIGNED_CRITICAL=$(gh issue list \
        --repo pablo-albaladejo/trainingpeaks-sdk \
        --state open \
        --label "priority: critical" \
        --json number,assignees \
        --jq '.[] | select(.assignees | length == 0) | .number' | wc -l)
    
    if [ "$UNASSIGNED_CRITICAL" -gt 0 ]; then
        print_error "$UNASSIGNED_CRITICAL critical issues without assignees"
        print_detail "Critical issues should be assigned to ensure ownership"
    fi
}

# Main function
main() {
    # Parse command line arguments
    SYNC_ISSUES=false
    VERIFY_VIEWS=false
    CHECK_LABELS=false
    HEALTH_REPORT=false
    RUN_ALL=false
    FIX_ISSUES=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --sync-issues)
                SYNC_ISSUES=true
                shift
                ;;
            --verify-views)
                VERIFY_VIEWS=true
                shift
                ;;
            --check-labels)
                CHECK_LABELS=true
                shift
                ;;
            --health-report)
                HEALTH_REPORT=true
                shift
                ;;
            --all)
                RUN_ALL=true
                shift
                ;;
            --fix)
                FIX_ISSUES=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # If no specific task selected, default to health report
    if [ "$SYNC_ISSUES" = false ] && [ "$VERIFY_VIEWS" = false ] && [ "$CHECK_LABELS" = false ] && [ "$HEALTH_REPORT" = false ] && [ "$RUN_ALL" = false ]; then
        HEALTH_REPORT=true
    fi
    
    print_header "GitHub Project Maintenance"
    echo "Project: TrainingPeaks SDK Development"
    echo "Date: $(date)"
    echo
    
    # Run requested tasks
    if [ "$RUN_ALL" = true ] || [ "$SYNC_ISSUES" = true ]; then
        sync_issues
        echo
    fi
    
    if [ "$RUN_ALL" = true ] || [ "$VERIFY_VIEWS" = true ]; then
        verify_views
        echo
    fi
    
    if [ "$RUN_ALL" = true ] || [ "$CHECK_LABELS" = true ]; then
        analyze_labels
        echo
    fi
    
    if [ "$RUN_ALL" = true ] || [ "$HEALTH_REPORT" = true ]; then
        generate_health_report
        echo
    fi
    
    if [ "$RUN_ALL" = true ]; then
        suggest_improvements
        echo
    fi
    
    print_success "Maintenance tasks completed!"
}

# Check if bc is available for calculations
if ! command -v bc >/dev/null 2>&1; then
    print_error "bc calculator is required but not installed"
    print_info "Install with: brew install bc (macOS) or apt install bc (Ubuntu)"
    exit 1
fi

# Run main function
main "$@"