#!/bin/bash

# Fix issue labels - Add missing mandatory labels to all open issues
# Based on issue titles and content, automatically assign appropriate labels

echo "🏷️  Fixing issue labels..."

# Function to add labels to an issue
add_labels_to_issue() {
    local issue_number=$1
    local labels=$2
    
    echo "  Adding labels to issue #$issue_number: $labels"
    gh issue edit "$issue_number" --add-label "$labels"
}

# Issue #53: Type definition validation system
add_labels_to_issue 53 "type: refactor,priority: medium,effort: small,architecture: domain"

# Issue #52: README code examples testing  
add_labels_to_issue 52 "type: testing,priority: medium,effort: small,component: documentation"

# Issue #51: Example code validation test suite
add_labels_to_issue 51 "type: testing,priority: medium,effort: small,component: documentation"

# Issue #50: JSDoc completion for public APIs
add_labels_to_issue 50 "type: documentation,priority: medium,effort: small,component: api"

# Issue #49: Error handling test coverage completion
add_labels_to_issue 49 "type: testing,priority: medium,effort: small,architecture: adapters"

# Issue #48: Schema validation comprehensive testing
add_labels_to_issue 48 "type: testing,priority: medium,effort: small,architecture: domain"

# Issue #47: Test fixture standardization
add_labels_to_issue 47 "type: refactor,priority: medium,effort: small,component: testing"

# Issue #46: API endpoint comprehensive unit testing
add_labels_to_issue 46 "type: testing,priority: medium,effort: small,architecture: adapters"

# Issue #45: Workout repository integration testing
add_labels_to_issue 45 "type: testing,priority: medium,effort: small,component: workouts"

# Issue #44: Auth repository integration test suite
add_labels_to_issue 44 "type: testing,priority: medium,effort: small,component: auth"

# Issue #43: Response caching mechanism
add_labels_to_issue 43 "type: enhancement,priority: medium,effort: medium,component: client"

# Issue #42: Memory usage monitoring utility
add_labels_to_issue 42 "type: enhancement,priority: medium,effort: small,type: performance"

# Issue #41: Request timeout handling service
add_labels_to_issue 41 "type: enhancement,priority: medium,effort: small,component: client"

# Issue #40: Connection pooling configuration
add_labels_to_issue 40 "type: enhancement,priority: medium,effort: small,component: client"

# Issue #39: HTTP retry logic enhancement
add_labels_to_issue 39 "type: enhancement,priority: medium,effort: small,component: client"

# Issue #38: Credentials value object unit tests
add_labels_to_issue 38 "type: testing,priority: high,effort: small,architecture: domain"

# Issue #37: Workout entity validation testing
add_labels_to_issue 37 "type: testing,priority: high,effort: small,architecture: domain"

# Issue #36: Error code standardization implementation
add_labels_to_issue 36 "type: refactor,priority: high,effort: small,architecture: domain"

# Issue #35: AuthToken validation insufficient
add_labels_to_issue 35 "type: bug,priority: high,effort: small,architecture: domain"

# Issue #34: User entity comprehensive unit testing
add_labels_to_issue 34 "type: testing,priority: high,effort: small,architecture: domain"

# Issue #33: Fix domain layer import violations
add_labels_to_issue 33 "type: refactor,priority: high,effort: small,architecture: domain"

# Issue #32: Workout metadata mapper enhancement
add_labels_to_issue 32 "type: refactor,priority: high,effort: small,architecture: adapters"

# Issue #31: Workout file format detection utility
add_labels_to_issue 31 "type: enhancement,priority: high,effort: small,component: workouts"

# Issue #30: Batch workout validation service
add_labels_to_issue 30 "type: refactor,priority: high,effort: small,architecture: domain"

# Issue #29: Workout search by text content
add_labels_to_issue 29 "type: enhancement,priority: high,effort: medium,component: workouts"

# Issue #28: Workout activity type filtering
add_labels_to_issue 28 "type: enhancement,priority: high,effort: small,component: workouts"

# Issue #27: Workout date range filtering service
add_labels_to_issue 27 "type: enhancement,priority: high,effort: medium,component: workouts"

# Issue #26: Missing secure cookie flags enforcement
add_labels_to_issue 26 "type: bug,priority: critical,effort: small,component: auth,type: security"

# Issue #25: Session validation edge case testing
add_labels_to_issue 25 "type: testing,priority: critical,effort: small,component: auth"

echo "✅ Issue labels updated successfully!"

# Verify the changes
echo ""
echo "🔍 Checking remaining unlabeled issues..."
gh issue list --json number,labels,title --jq '.[] | select((.labels | map(.name) | contains(["type: enhancement", "type: bug", "type: refactor", "type: documentation", "type: testing", "type: performance", "type: security", "type: infrastructure"]) | not) or (.labels | map(.name) | contains(["priority: critical", "priority: high", "priority: medium", "priority: low"]) | not) or (.labels | map(.name) | contains(["effort: small", "effort: medium", "effort: large", "effort: epic"]) | not)) | "\(.number): \(.title)"'

echo ""
echo "🎉 Label standardization complete!"