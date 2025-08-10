# GitHub Configuration

This directory contains all the GitHub-specific configuration files for the TrainingPeaks SDK project.

## 📁 File Structure

```
.github/
├── ISSUE_TEMPLATE/           # Issue templates for different types
│   ├── bug-fix.md           # Bug fix template
│   ├── feature-request.md   # Feature request template
│   ├── refactor.md          # Refactor template
│   ├── documentation.md     # Documentation template
│   ├── testing.md           # Testing template
│   ├── performance.md       # Performance template
│   ├── security.md          # Security template
│   ├── infrastructure.md    # Infrastructure template
│   └── config.yml           # Template configuration
├── workflows/                # GitHub Actions workflows
│   └── ci.yml              # Continuous Integration workflow
├── project.yml              # GitHub project configuration
├── labels.yml               # Issue and PR labels
├── dependabot.yml           # Automated dependency updates
├── commitlint.config.js     # Commit message validation
├── CODEOWNERS              # Code ownership rules
└── README.md               # This file
```

## 🎯 Issue Templates

### Available Templates

1. **🐛 Bug Fix** - For reporting and fixing bugs
2. **✨ Feature Request** - For requesting new features
3. **🔧 Refactor** - For code refactoring requests
4. **📚 Documentation** - For documentation updates
5. **🧪 Testing** - For testing improvements
6. **⚡ Performance** - For performance optimizations
7. **🔒 Security** - For security issues and improvements

### Template Features

- **AI-Ready**: All templates contain detailed information for AI agents
- **Structured**: Consistent format across all issue types
- **Comprehensive**: Include all necessary details for implementation
- **Automated**: Pre-filled labels and assignees

## 🏗️ Project Management

### GitHub Project

The project is configured with:

- **Columns**: Backlog, Ready, In Progress, Review, Done, Won't Do
- **Views**: Overview, Architecture & Quality, Performance & Security, Testing & Quality
- **Workflows**: Development workflow with state transitions

### Labels

Comprehensive labeling system including:

- **Priority**: Critical, High, Medium, Low
- **Type**: Bug, Enhancement, Refactor, Documentation, Testing, Performance, Security
- **Status**: Needs Triage, Ready, In Progress, Blocked, Needs Review, Needs Testing
- **Architecture**: Domain, Application, Adapters, Shared
- **Component**: Authentication, Workouts, Users, HTTP Client, Storage, Validation, Logging, Testing
- **Effort**: Small, Medium, Large, Epic
- **Release**: Next, Future, Patch, Minor, Major

## 🚀 CI/CD Pipeline

### GitHub Actions

- **CI Workflow**: Runs on push to main/develop and PRs
- **Security Scanning**: Automated security audits and secret detection
- **Bundle Analysis**: Bundle size analysis for PRs
- **Changelog Validation**: Ensures changelogs are updated with code changes

### Automated Processes

- **Dependabot**: Weekly dependency updates
- **Release Automation**: Automated releases on tag push
- **NPM Publishing**: Automatic NPM package publishing

## 📝 Commit Standards

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer(s)]
```

### Commit Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `chore`: Build/tooling changes
- `ci`: CI/CD changes
- `security`: Security improvements
- `breaking`: Breaking changes

### Validation

- **Commitlint**: Validates commit message format
- **Husky**: Git hooks for pre-commit validation
- **Lint-staged**: Runs linters on staged files

## 🔒 Security

### Security Policy

- **Vulnerability Reporting**: Email security@trainingpeaks.com
- **Supported Versions**: 1.x.x versions
- **Disclosure Policy**: 48-hour response time
- **Security Tools**: npm audit, ESLint security rules, CodeQL

### Security Features

- **Automated Scanning**: Security audits in CI
- **Secret Detection**: Prevents secrets from being committed
- **Dependency Monitoring**: Automated vulnerability scanning
- **Access Control**: CODEOWNERS for sensitive areas

## 🧪 Testing & Quality

### Testing Standards

- **Framework**: Vitest
- **Coverage**: High test coverage required
- **Fixtures**: Rosie Factory for test data
- **Isolation**: Independent tests
- **Validation**: Automated test validation in CI

### Quality Gates

- **Linting**: ESLint with project-specific rules
- **Type Checking**: TypeScript strict mode
- **Formatting**: Prettier for consistent code style
- **Build Validation**: Ensures package builds correctly

## 📚 Documentation

### Documentation Standards

- **Language**: English only
- **Format**: Markdown
- **Structure**: Consistent organization
- **Examples**: Practical code examples
- **Links**: Valid internal and external links

### Required Updates

- **Code Changes**: Update relevant documentation
- **Changelogs**: Update both root and folder changelogs
- **API Changes**: Update API documentation
- **Examples**: Update code examples

## 🚀 Getting Started

### For Contributors

1. **Fork** the repository
2. **Clone** your fork
3. **Install** dependencies: `npm install`
4. **Run** tests: `npm test`
5. **Create** issues using templates
6. **Submit** PRs following guidelines

### For Maintainers

1. **Review** issues and PRs
2. **Manage** project boards
3. **Monitor** CI/CD pipelines
4. **Update** labels and templates
5. **Release** new versions

## 🔧 Configuration

### Customization

- **Labels**: Modify `.github/labels.yml`
- **Templates**: Update issue templates in `.github/ISSUE_TEMPLATE/`
- **Workflows**: Modify `.github/workflows/`
- **Project**: Update `.github/project.yml`

### Environment Variables

Required secrets for CI/CD:

- `NPM_TOKEN`: For NPM publishing
- `CODECOV_TOKEN`: For coverage reporting

## 📞 Support

- **Issues**: Use GitHub issues with templates
- **Discussions**: Use GitHub discussions
- **Security**: Email security@trainingpeaks.com
- **Documentation**: Check project docs first

## 🔄 Updates

This configuration is regularly updated to:

- **Improve** developer experience
- **Enhance** automation
- **Maintain** security standards
- **Follow** GitHub best practices

---

For more information, see the main project [README](../README.md) and [CONTRIBUTING](../CONTRIBUTING.md) guide.
