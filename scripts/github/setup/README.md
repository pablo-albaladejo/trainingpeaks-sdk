# GitHub Project Setup Script

This script automates the setup of the GitHub project for the TrainingPeaks SDK, creating a comprehensive project management environment.

## 🚀 Features

- **Automatic Project Creation**: Creates a GitHub project board with proper configuration
- **Label Management**: Automatically creates all necessary labels from configuration
- **Issue Templates**: Sets up initial project setup issues
- **Project Automation**: Enables Dependabot and security features
- **Validation**: Comprehensive setup validation and error checking
- **User Experience**: Interactive prompts and detailed progress reporting

## 📋 Prerequisites

Before running the script, ensure you have:

- **GitHub CLI (gh)** installed and authenticated
- **Repository access permissions** for the target repository
- **Node.js >= 18.0.0 and npm >= 8.0.0** for dependency management
- **jq** for JSON parsing (usually pre-installed on macOS/Linux)

### Installing GitHub CLI

```bash
# macOS
brew install gh

# Linux (Ubuntu/Debian)
sudo apt install gh

# Windows
winget install GitHub.cli

# Or visit: https://cli.github.com/
```

### Authenticating with GitHub

```bash
gh auth login
# Follow the prompts to authenticate
```

## 🎯 What It Creates

The script automatically sets up:

### 1. Project Board

- GitHub Project V2 board with proper naming
- Project ID stored in `.github/project-id.txt`

### 2. Label System

- **Priority Labels**: Critical, High, Medium, Low
- **Type Labels**: Bug, Feature, Epic, Task, Documentation
- **Status Labels**: In Progress, Review, Blocked, Ready
- **Component Labels**: Frontend, Backend, Infrastructure, Testing
- **Effort Labels**: Small, Medium, Large, Epic
- **Quality Labels**: Good First Issue, Help Wanted, Documentation
- **Release Labels**: Breaking Change, Enhancement, Fix

### 3. Initial Issues

- Project setup epic with comprehensive tasks
- Development environment setup issue
- Documentation setup issue
- Testing framework setup issue
- CI/CD pipeline setup issue
- Project structure setup issue

### 4. Automation

- Dependabot configuration for npm dependencies
- Automated security fixes (when possible)
- GitHub Actions workflow recommendations

## 🚀 Usage

### Basic Usage

```bash
# Run from the repository root
./scripts/github/setup/setup-github-project.sh
```

### Advanced Options

```bash
# Skip validation checks
./scripts/github/setup/setup-github-project.sh --skip-validation

# Specify repository and owner
./scripts/github/setup/setup-github-project.sh --repo my-repo --owner my-org

# Show help
./scripts/github/setup/setup-github-project.sh --help
```

### Examples

```bash
# Setup for current repository
./scripts/github/setup/setup-github-project.sh

# Setup for specific repository
./scripts/github/setup/setup-github-project.sh --repo trainingpeaks-sdk --owner myusername

# Quick setup without validation
./scripts/github/setup/setup-github-project.sh --skip-validation
```

## ⚙️ Configuration Files

The script uses several configuration files:

### `.github/labels.yml`

Defines all labels with colors and descriptions.

### `.github/project.yml`

Defines project structure and Status field options. Note: Views defined here are reference-only and require manual creation in the GitHub web interface.

### `.github/ISSUE_TEMPLATE/`

Contains issue templates for different request types.

## 🔧 Project Views

After running the script, you'll need to manually create these views in GitHub (Board layout views automatically create columns based on the field you group by):

1. **📋 Development Board** (Board layout)
2. **🚀 Product Roadmap** (Table layout)
3. **🏗️ Architecture & Quality** (Board layout) *(optional)*
4. **🧪 Testing Dashboard** (Table layout) *(optional)*

See [setup-project-views.md](./setup-project-views.md) for detailed manual creation instructions.

## 📊 Project Columns

Manually create these columns in your project:

1. **📋 Backlog**
2. **🔍 To Do**
3. **🔄 In Progress**
4. **👀 Review**
5. **✅ Done**

## ✅ Validation

The script validates:

- Project ID file creation
- Labels configuration existence
- Issue templates directory
- Workflows directory
- GitHub CLI authentication
- Repository access permissions

## 🐛 Troubleshooting

### Common Issues

**"GitHub CLI is not authenticated"**

```bash
gh auth login
```

**"Cannot access repository"**

- Check repository permissions
- Verify authentication with correct account
- Ensure repository exists

**"Failed to create project"**

- Check GitHub API rate limits
- Verify repository access permissions
- Ensure GitHub CLI is up to date

**"Labels creation failed"**

- Check `.github/labels.yml` format
- Verify repository permissions
- Check for duplicate label names

### Debug Mode

For detailed debugging, you can modify the script to add `set -x` at the beginning.

## 🔄 Updating Existing Setup

If you need to update an existing setup:

1. **Use existing project**: Choose option 1 when prompted
2. **Create new project**: Choose option 2 to start fresh
3. **Manual updates**: Edit configuration files and re-run specific functions

## 📚 Related Documentation

- [GitHub CLI Documentation](https://cli.github.com/)
- [GitHub Projects V2 API](https://docs.github.com/en/graphql/reference/objects#projectv2)
- [GitHub Labels API](https://docs.github.com/en/rest/issues/labels)
- [TrainingPeaks SDK Documentation](../../README.md)

## 🤝 Contributing

To contribute to this script:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines

- Follow bash scripting best practices
- Add comprehensive error handling
- Include helpful error messages
- Test with different scenarios
- Update documentation for changes

## 📄 License

This script is part of the TrainingPeaks SDK project and follows the same license terms.

## 🆘 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review GitHub CLI documentation
3. Open an issue in the repository
4. Check the main project README

---

**Note**: This script is designed for the TrainingPeaks SDK project but can be adapted for other projects by modifying the configuration files.
