#!/bin/bash

# GitHub Project Setup Script
# This script automates the setup of the GitHub project for the TrainingPeaks SDK

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}🔧${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_detail() {
    echo -e "${CYAN}ℹ️${NC} $1"
}

print_header() {
    echo -e "${PURPLE}🚀${NC} $1"
}

# Function to show help
show_help() {
    cat << EOF
GitHub Project Setup Script

This script automates the setup of the GitHub project for the TrainingPeaks SDK.

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --help, -h          Show this help message
    --skip-validation   Skip validation checks
    --non-interactive   Run in non-interactive mode (no prompts, use defaults)
    --repo REPO         Repository name (default: current directory name)
    --owner OWNER       Repository owner (default: authenticated user)

PREREQUISITES:
    - GitHub CLI (gh) installed and authenticated
    - Repository access permissions

EXAMPLES:
    $0                                    # Setup with default settings
    $0 --repo my-repo --owner my-org     # Setup for specific repo/owner
    $0 --skip-validation                 # Skip validation checks
    $0 --non-interactive                 # Run without prompts (CI friendly)

WHAT THIS SCRIPT CREATES:
    - GitHub project board with custom fields (views/columns require manual setup)
    - Comprehensive label system for issue categorization  
    - Initial project setup issues and epics
    - Dependabot configuration and security automation

NOTE: Views and columns must be created manually due to GitHub API limitations.
See setup-project-views.md for detailed instructions.

For more information, see scripts/github/setup/README.md

EOF
}

# Function to check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check if GitHub CLI is installed
    if ! command -v gh >/dev/null 2>&1; then
        print_error "GitHub CLI (gh) is not installed."
        echo
        echo "Please install GitHub CLI:"
        echo "  macOS: brew install gh"
        echo "  Linux: sudo apt install gh (Ubuntu/Debian)"
        echo "  Windows: winget install GitHub.cli"
        echo "  Or visit: https://cli.github.com/"
        exit 1
    fi
    
    # Check if jq is installed
    if ! command -v jq >/dev/null 2>&1; then
        print_error "jq is not installed. jq is required for parsing JSON responses."
        echo
        echo "Please install jq:"
        echo "  macOS: brew install jq"
        echo "  Linux: sudo apt install jq (Ubuntu/Debian)"
        echo "  Windows: winget install jqlang.jq"
        exit 1
    fi
    
    # Check if yq is available (optional, with warning)
    if ! command -v yq >/dev/null 2>&1; then
        print_warning "yq is not installed. Label fallback will be used for some operations."
    fi
    
    print_success "Prerequisites check completed"
}

# Function to check GitHub CLI authentication
check_gh_auth() {
    print_step "Checking GitHub CLI authentication..."
    
    if ! gh auth status >/dev/null 2>&1; then
        print_error "GitHub CLI is not authenticated. Please run 'gh auth login' first."
        echo
        echo "To authenticate:"
        echo "1. Run: gh auth login"
        echo "2. Follow the prompts to authenticate with GitHub"
        echo "3. Ensure you have appropriate permissions for the repository"
        exit 1
    fi
    
    local auth_status=$(gh auth status -t | grep -o 'Logged in to [^ ]* as [^ ]*' | awk '{print $NF}')
    print_success "GitHub CLI is authenticated as: $auth_status"
}

# Function to validate repository access
validate_repo_access() {
    print_step "Validating repository access..."
    
    local repo_owner="${OWNER:-$(gh api user -q .login)}"
    local repo_name="${REPO:-$(basename "$PWD")}"
    
    if ! gh repo view "$repo_owner/$repo_name" >/dev/null 2>&1; then
        print_error "Cannot access repository: $repo_owner/$repo_name"
        echo
        echo "Please ensure:"
        echo "1. The repository exists"
        echo "2. You have access permissions"
        echo "3. You're authenticated with the correct account"
        exit 1
    fi
    
    print_success "Repository access validated: $repo_owner/$repo_name"
}

# Function to check if project already exists
check_existing_project() {
    if [ -f ".github/project-id.txt" ]; then
        print_warning "Project ID file already exists (.github/project-id.txt)"
        
        if [ "$NON_INTERACTIVE" = true ]; then
            print_detail "Non-interactive mode: Using existing project"
            return 0
        fi
        
        echo
        echo "Options:"
        echo "1. Use existing project"
        echo "2. Create new project"
        echo "3. Exit"
        echo
        read -p "Choose an option (1-3): " choice
        
        case $choice in
            1)
                print_detail "Using existing project"
                return 0
                ;;
            2)
                print_detail "Creating new project"
                rm -f .github/project-id.txt
                ;;
            3)
                print_detail "Exiting"
                exit 0
                ;;
            *)
                print_error "Invalid choice. Exiting."
                exit 1
                ;;
        esac
    fi
}

# Function to create GitHub project
create_project() {
    print_step "Creating GitHub project..."
    
    local repo_owner="${OWNER:-$(gh api user -q .login)}"
    local repo_name="${REPO:-$(basename "$PWD")}"
    
    # Get owner node ID for project creation (user or organization)
    local owner_node_id=$(gh api graphql -f query='
        query($login: String!) {
            user(login: $login) {
                id
            }
        }
    ' -f login="$repo_owner" -q '.data.user.id' 2>/dev/null)
    
    # If user query fails, try organization
    if [ -z "$owner_node_id" ] || [ "$owner_node_id" = "null" ]; then
        owner_node_id=$(gh api graphql -f query='
            query($login: String!) {
                organization(login: $login) {
                    id
                }
            }
        ' -f login="$repo_owner" -q '.data.organization.id' 2>/dev/null)
    fi
    
    if [ -z "$owner_node_id" ] || [ "$owner_node_id" = "null" ]; then
        print_error "Failed to get owner node ID for $repo_owner"
        exit 1
    fi
    
    # Create project
    local project_output=$(gh api graphql -f query='
        mutation($title: String!, $ownerId: ID!) {
            createProjectV2(input: {
                title: $title,
                ownerId: $ownerId
            }) {
                projectV2 {
                    id
                    title
                }
            }
        }
    ' -f title="TrainingPeaks SDK Development" -f ownerId="$owner_node_id")
    
    local project_id=$(echo "$project_output" | jq -r '.data.createProjectV2.projectV2.id')
    
    if [ "$project_id" = "null" ] || [ -z "$project_id" ]; then
        print_error "Failed to create project"
        echo "Response: $project_output"
        exit 1
    fi
    
    # Save project ID
    mkdir -p .github
    echo "$project_id" > .github/project-id.txt
    
    print_success "Project created successfully!"
    print_detail "Project ID: $project_id"
    
    # Get project URL
    local project_url=$(gh api graphql -f query='
        query($id: ID!) {
            node(id: $id) {
                ... on ProjectV2 {
                    url
                }
            }
        }
    ' -f id="$project_id" -q '.data.node.url')
    
    if [ "$project_url" != "null" ] && [ -n "$project_url" ]; then
        print_success "Project URL: $project_url"
    fi
}

# Function to create project views
create_project_views() {
    print_step "Creating project views..."
    
    print_warning "Project views must be created manually due to GitHub API limitations"
    print_detail "Please create the following views in your GitHub project:"
    echo
    echo "1. 📊 Project Overview (Board layout)"
    echo "2. 📋 Backlog (Board layout)"
    echo "3. 🔄 In Progress (Board layout)"
    echo "4. ✅ Done (Board layout)"
    echo "5. 🚀 Roadmap (Table layout)"
    echo
    print_detail "You can create these views in the GitHub web interface"
}

# Function to create project columns
create_project_columns() {
    print_step "Creating project columns..."
    
    print_warning "Project columns must be created manually due to GitHub API limitations"
    print_detail "Please create the following columns in your GitHub project:"
    echo
    echo "1. 📋 Backlog"
    echo "2. 🔍 To Do"
    echo "3. 🔄 In Progress"
    echo "4. 👀 Review"
    echo "5. ✅ Done"
    echo
    print_detail "You can create these columns in the GitHub web interface"
}

# Function to create custom project fields
create_custom_fields() {
    print_step "Creating custom project fields..."
    
    local project_id=$(cat .github/project-id.txt)
    
    # Create Status field (try to get existing field ID first)
    print_detail "Setting up Status field..."
    local status_field_id=$(gh api graphql -f query='query($projectId: ID!) { node(id: $projectId) { ... on ProjectV2 { fields(first: 20) { nodes { ... on ProjectV2SingleSelectField { id name } } } } } }' -f projectId="$project_id" --jq '.data.node.fields.nodes[] | select(.name == "Status") | .id' 2>/dev/null || echo "")
    
    if [ -n "$status_field_id" ]; then
        # Update existing Status field
        gh api graphql -f query='mutation { updateProjectV2Field(input: { fieldId: "'$status_field_id'", name: "Status", singleSelectOptions: [{ name: "📋 Backlog", color: GRAY, description: "Issues that need to be triaged and prioritized" }, { name: "🔍 To Do", color: BLUE, description: "Issues ready to be worked on" }, { name: "🔄 In Progress", color: YELLOW, description: "Issues currently being worked on" }, { name: "👀 Review", color: ORANGE, description: "Issues waiting for review" }, { name: "✅ Done", color: GREEN, description: "Completed issues" }] }) { projectV2Field { ... on ProjectV2SingleSelectField { id name } } } }' > /dev/null 2>&1 || print_warning "Could not update Status field"
    else
        # Create new Status field if none exists
        gh api graphql -f query='mutation { createProjectV2Field(input: { projectId: "'$project_id'", name: "Status", dataType: SINGLE_SELECT, singleSelectOptions: [{ name: "📋 Backlog", color: GRAY, description: "Issues that need to be triaged and prioritized" }, { name: "🔍 To Do", color: BLUE, description: "Issues ready to be worked on" }, { name: "🔄 In Progress", color: YELLOW, description: "Issues currently being worked on" }, { name: "👀 Review", color: ORANGE, description: "Issues waiting for review" }, { name: "✅ Done", color: GREEN, description: "Completed issues" }] }) { projectV2Field { ... on ProjectV2SingleSelectField { id name } } } }' > /dev/null 2>&1 || print_warning "Could not create Status field"
    fi
    
    # Create Priority field
    print_detail "Creating Priority field..."
    gh api graphql -f query='mutation { createProjectV2Field(input: { projectId: "'$project_id'", name: "Priority", dataType: SINGLE_SELECT, singleSelectOptions: [{ name: "🔴 Critical", color: RED, description: "Critical priority issues" }, { name: "🟠 High", color: ORANGE, description: "High priority issues" }, { name: "🟡 Medium", color: YELLOW, description: "Medium priority issues" }, { name: "🟢 Low", color: GREEN, description: "Low priority issues" }] }) { projectV2Field { ... on ProjectV2SingleSelectField { id name } } } }' > /dev/null 2>&1 || print_warning "Could not create Priority field (may already exist)"
    
    # Create Type field
    print_detail "Creating Type field..."
    gh api graphql -f query='mutation { createProjectV2Field(input: { projectId: "'$project_id'", name: "Type", dataType: SINGLE_SELECT, singleSelectOptions: [{ name: "🐛 Bug", color: RED, description: "Bug fixes and issues" }, { name: "✨ Feature", color: BLUE, description: "New features and enhancements" }, { name: "♻️ Refactor", color: PURPLE, description: "Code refactoring and improvements" }, { name: "📚 Documentation", color: GREEN, description: "Documentation updates" }, { name: "🧪 Testing", color: YELLOW, description: "Testing and test coverage" }] }) { projectV2Field { ... on ProjectV2SingleSelectField { id name } } } }' > /dev/null 2>&1 || print_warning "Could not create Type field (may already exist)"
    
    # Create Effort field
    print_detail "Creating Effort field..."
    gh api graphql -f query='mutation { createProjectV2Field(input: { projectId: "'$project_id'", name: "Effort", dataType: SINGLE_SELECT, singleSelectOptions: [{ name: "🟢 Small", color: GREEN, description: "Small tasks (1-2 hours)" }, { name: "🟡 Medium", color: YELLOW, description: "Medium priority issues" }, { name: "🟠 Large", color: ORANGE, description: "Large tasks (1-3 days)" }, { name: "🔴 Epic", color: RED, description: "Epic tasks (1+ weeks)" }] }) { projectV2Field { ... on ProjectV2SingleSelectField { id name } } } }' > /dev/null 2>&1 || print_warning "Could not create Effort field (may already exist)"
    
    print_success "Custom fields creation completed"
}

# Function to create labels
create_labels() {
    print_step "Creating labels..."
    
    if [ ! -f ".github/labels.yml" ]; then
        print_error "Labels configuration file not found: .github/labels.yml"
        return 1
    fi
    
    local created_count=0
    local skipped_count=0
    local failed_count=0
    
    # Check if yq is available for better YAML parsing
    if command -v yq >/dev/null 2>&1; then
        print_detail "Using yq for robust YAML parsing"
        
        # Get number of labels
        local labels_count=$(yq '.[] | length' .github/labels.yml 2>/dev/null || yq 'length' .github/labels.yml 2>/dev/null || echo "0")
        
        # Process each label using yq
        for ((i=0; i<labels_count; i++)); do
            local label_name=$(yq ".[$i].name" .github/labels.yml 2>/dev/null | sed 's/^"//;s/"$//')
            local color=$(yq ".[$i].color" .github/labels.yml 2>/dev/null | sed 's/^"//;s/"$//')
            local description=$(yq ".[$i].description" .github/labels.yml 2>/dev/null | sed 's/^"//;s/"$//')
            
            # Skip if label name is empty or null
            if [ -z "$label_name" ] || [ "$label_name" = "null" ]; then
                continue
            fi
            
            # Check if label already exists
            if gh label list | grep -q "^$label_name[[:space:]]"; then
                print_detail "Label already exists: $label_name"
                ((skipped_count++))
                continue
            fi
            
            # Create label with proper error handling
            if gh label create "$label_name" --color "$color" --description "$description" >/dev/null 2>&1; then
                print_success "Created label: $label_name"
                ((created_count++))
            else
                print_error "Failed to create label: $label_name"
                ((failed_count++))
            fi
        done
    else
        print_warning "yq not found, using fallback bash parsing (less robust)"
        
        # Fallback to original bash-based parsing
        while IFS= read -r line; do
            if [[ $line =~ ^[[:space:]]*-[[:space:]]*name:[[:space:]]*\"([^\"]+)\" ]]; then
                local label_name="${BASH_REMATCH[1]}"
                
                # Check if label already exists
                if gh label list | grep -q "^$label_name[[:space:]]"; then
                    print_detail "Label already exists: $label_name"
                    ((skipped_count++))
                    continue
                fi
                
                # Extract color and description
                local color=""
                local description=""
                
                # Read next lines for color and description
                local color_line=$(grep -A 1 "name:[[:space:]]*\"$label_name\"" .github/labels.yml | grep "color:" || true)
                local desc_line=$(grep -A 2 "name:[[:space:]]*\"$label_name\"" .github/labels.yml | grep "description:" || true)
                
                if [[ $color_line =~ color:[[:space:]]*\"([^\"]+)\" ]]; then
                    color="${BASH_REMATCH[1]}"
                fi
                
                if [[ $desc_line =~ description:[[:space:]]*\"([^\"]+)\" ]]; then
                    description="${BASH_REMATCH[1]}"
                fi
                
                # Create label
                if gh label create "$label_name" --color "$color" --description "$description" >/dev/null 2>&1; then
                    print_success "Created label: $label_name"
                    ((created_count++))
                else
                    print_error "Failed to create label: $label_name"
                    ((failed_count++))
                fi
            fi
        done < .github/labels.yml
    fi
    
    print_success "Labels creation completed:"
    print_detail "Created: $created_count, Skipped: $skipped_count, Failed: $failed_count"
}

# Function to create initial issues
create_initial_issues() {
    print_step "Creating initial project setup issues..."
    
    local repo_owner="${OWNER:-$(gh api user -q .login)}"
    local repo_name="${REPO:-$(basename "$PWD")}"
    
    # Create project setup epic
    local epic_issue=$(gh issue create \
        --title "🚀 Project Setup and Initial Configuration" \
        --body "## Project Setup Epic

This epic tracks the initial setup and configuration of the TrainingPeaks SDK project.

### Tasks
- [ ] Set up project structure
- [ ] Configure development environment
- [ ] Set up CI/CD pipeline
- [ ] Create initial documentation
- [ ] Set up testing framework

### Acceptance Criteria
- [ ] Project structure follows clean architecture principles
- [ ] Development environment is fully configured
- [ ] CI/CD pipeline is operational
- [ ] Basic documentation is in place
- [ ] Testing framework is configured

### Labels
- priority: high
- type: epic
- component: project-setup" \
        --label "priority: high,type: epic,component: project-setup" \
        --repo "$repo_owner/$repo_name")
    
    local epic_number=$(echo "$epic_issue" | grep -o '[0-9]*$')
    
    if [ -n "$epic_number" ]; then
        print_success "Created project setup epic: #$epic_number"
        
        # Add to project if project ID exists
        if [ -f ".github/project-id.txt" ]; then
            local project_id=$(cat .github/project-id.txt)
            if gh project item-add "$project_id" --content-id "$epic_number" >/dev/null 2>&1; then
                print_detail "Added epic to project board"
            fi
        fi
    fi
    
    # Create additional setup issues
    local setup_issues=(
        "🔧 Development Environment Setup: Configure development tools and dependencies"
        "📚 Documentation Setup: Create initial project documentation"
        "🧪 Testing Framework Setup: Configure testing infrastructure"
        "🚀 CI/CD Pipeline Setup: Set up continuous integration and deployment"
        "🏗️ Project Structure Setup: Organize code according to clean architecture"
    )
    
    for issue_title in "${setup_issues[@]}"; do
        local issue=$(gh issue create \
            --title "$issue_title" \
            --body "## $issue_title

This issue tracks the setup and configuration of $issue_title.

### Tasks
- [ ] Identify requirements
- [ ] Research best practices
- [ ] Implement solution
- [ ] Test configuration
- [ ] Document setup process

### Labels
- priority: medium
- type: task
- component: project-setup" \
            --label "priority: medium,type: task,component: project-setup" \
            --repo "$repo_owner/$repo_name")
        
        local issue_number=$(echo "$issue" | grep -o '[0-9]*$')
        
        if [ -n "$issue_number" ]; then
            print_success "Created issue: #$issue_number - $issue_title"
            
            # Add to project if project ID exists
            if [ -f ".github/project-id.txt" ]; then
                local project_id=$(cat .github/project-id.txt)
                if gh project item-add "$project_id" --content-id "$issue_number" >/dev/null 2>&1; then
                    print_detail "Added issue to project board"
                fi
            fi
        fi
    done
}

# Function to setup automation
setup_automation() {
    print_step "Setting up project automation..."
    
    local repo_owner="${OWNER:-$(gh api user -q .login)}"
    local repo_name="${REPO:-$(basename "$PWD")}"
    
    # Enable Dependabot
    if [ -d ".github" ]; then
        mkdir -p .github
        
        cat > .github/dependabot.yml << EOF
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "$repo_owner"
    assignees:
      - "$repo_owner"
    commit-message:
      prefix: "chore"
      prefix-development: "chore"
      include: "scope"
EOF
        
        print_success "Dependabot configuration created"
    fi
    
    # Enable automated security fixes
    if gh repo edit "$repo_owner/$repo_name" --enable-auto-merge --enable-security-and-analysis >/dev/null 2>&1; then
        print_success "Automated security fixes enabled"
    else
        print_warning "Could not enable automated security fixes (may require admin access)"
    fi
    
    # Check for GitHub Actions workflows
    if [ -d ".github/workflows" ]; then
        print_success "GitHub Actions workflows directory exists"
        print_detail "Consider adding CI/CD workflows for automated testing and deployment"
    else
        print_warning "GitHub Actions workflows directory not found"
        print_detail "Consider creating .github/workflows/ for CI/CD automation"
    fi
}

# Function to validate setup
validate_setup() {
    print_step "Validating setup..."
    
    local validation_passed=true
    
    # Check if project ID file exists
    if [ ! -f ".github/project-id.txt" ]; then
        print_error "Project ID file not found: .github/project-id.txt"
        validation_passed=false
    else
        print_success "Project ID file exists"
    fi
    
    # Check if labels configuration exists
    if [ ! -f ".github/labels.yml" ]; then
        print_error "Labels configuration not found: .github/labels.yml"
        validation_passed=false
    else
        print_success "Labels configuration exists"
    fi
    
    # Check if issue templates exist
    if [ ! -d ".github/ISSUE_TEMPLATE" ]; then
        print_warning "Issue templates directory not found: .github/ISSUE_TEMPLATE"
    else
        print_success "Issue templates directory exists"
    fi
    
    # Check if workflows directory exists
    if [ ! -d ".github/workflows" ]; then
        print_warning "Workflows directory not found: .github/workflows"
    else
        print_success "Workflows directory exists"
    fi
    
    if [ "$validation_passed" = true ]; then
        print_success "Setup validation passed!"
    else
        print_error "Setup validation failed. Please check the errors above."
        return 1
    fi
}

# Function to show next steps
show_next_steps() {
    print_header "Setup Complete! 🎉"
    echo
    echo "Your GitHub project has been set up successfully!"
    echo
    echo "Next steps:"
    echo "1. 📋 Visit your project board to organize issues"
    echo "2. 🏷️ Review and customize labels as needed"
    echo "3. 📝 Create additional issues using the templates"
    echo "4. 🔄 Set up project views and columns manually"
    echo "5. 🚀 Start development work!"
    echo
    echo "Useful GitHub CLI commands:"
    echo "  gh project view                    # View project details"
    echo "  gh issue list                      # List all issues"
    echo "  gh issue create                    # Create new issue"
    echo "  gh label list                      # List all labels"
    echo "  gh repo view                       # View repository details"
    echo
    echo "For more information, see scripts/github/setup/README.md"
}

# Main function
main() {
    # Parse command line arguments
    SKIP_VALIDATION=false
    NON_INTERACTIVE=false
    REPO=""
    OWNER=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --skip-validation)
                SKIP_VALIDATION=true
                shift
                ;;
            --non-interactive)
                NON_INTERACTIVE=true
                shift
                ;;
            --repo)
                REPO="$2"
                shift 2
                ;;
            --owner)
                OWNER="$2"
                shift 2
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    print_header "GitHub Project Setup Script"
    echo "=================================="
    echo
    
    # Run setup steps
    check_prerequisites
    check_gh_auth
    validate_repo_access
    check_existing_project
    
    # Only create project if it doesn't exist
    if [ ! -f ".github/project-id.txt" ]; then
        create_project
    else
        print_success "Using existing project: $(cat .github/project-id.txt)"
    fi
    
    create_project_views
    create_project_columns
    create_custom_fields
    create_labels
    create_initial_issues
    setup_automation
    
    # Validate setup unless skipped
    if [ "$SKIP_VALIDATION" = false ]; then
        validate_setup
    fi
    
    show_next_steps
}

# Run main function
main "$@"
