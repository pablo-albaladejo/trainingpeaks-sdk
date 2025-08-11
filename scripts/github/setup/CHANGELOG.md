# Changelog

All notable changes to the GitHub Project Setup Script will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2024-01-15 - Custom Fields Automation

### Added
- **Custom Fields Automation**: Added automatic creation of Status, Priority, Type, and Effort fields
- **GraphQL API Integration**: Enhanced script to use GitHub GraphQL API for advanced project configuration
- **Field Management**: Automatic setup of project fields with predefined options and colors

### Why
- Manual field creation is time-consuming and error-prone
- GitHub API limitations prevent full automation of views and columns
- Custom fields provide better issue organization and tracking

### Impact
- **Developers**: Faster project setup with consistent field structure
- **Productivity**: Reduced manual configuration time
- **Consistency**: Standardized field options across projects

### Technical Details
- Added `create_custom_fields()` function to setup script
- Uses GitHub GraphQL API for field creation and updates
- Predefined field options with emojis and colors
- Handles existing fields gracefully

### Dependencies
- GitHub GraphQL API access
- Project V2 permissions
- Existing project ID file

## [1.0.0] - 2024-01-15 - Initial Creation and Organization

### Added

- **GitHub Project Setup Script**: Comprehensive automation script for setting up GitHub projects
- **Test Script**: Validation script to test setup script functionality without creating resources
- **Documentation**: Comprehensive README with usage instructions and troubleshooting
- **Directory Organization**: Moved all GitHub setup related files to `scripts/github/setup/` directory

### Changed

- **File Organization**: Restructured files into dedicated `scripts/github/setup/` directory for better organization
- **Path References**: Updated all script references to use new directory structure
- **Documentation**: Updated README paths and references to reflect new structure

### Why

- Better organization of scripts by functionality
- Clearer separation of concerns
- Easier maintenance and discovery of related files
- Follows project structure best practices

### Impact

- **Developers**: Better organized script structure
- **Maintainability**: Clearer file organization
- **Usability**: Easier to find and use GitHub setup tools

### Technical Details

- Created `scripts/github/setup/` directory
- Moved `setup-github-project.sh` to setup directory
- Moved `test-setup.sh` to setup directory
- Moved `README.md` to setup directory
- Created `CHANGELOG.md` for tracking changes

### Dependencies

- GitHub CLI (gh) for API interactions
- jq for JSON parsing
- Bash shell environment
- Repository access permissions

### Usage Examples

```bash
# Run setup script from new location
./scripts/github/setup/setup-github-project.sh

# Run test script from new location
./scripts/github/setup/test-setup.sh

# Get help
./scripts/github/setup/setup-github-project.sh --help
```

### Next Steps

- **Testing**: Validate all scripts work from new location
- **Documentation**: Update main README references
- **Integration**: Ensure CI/CD workflows use correct paths
- **Enhancement**: Add support for more GitHub features
- **Documentation**: Create video tutorials and examples
