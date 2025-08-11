# Local GitHub Actions Testing

This document explains how to test GitHub Actions workflows locally before pushing to CI/CD.

## Overview

We provide two approaches for local testing:

1. **Native Script Approach** (`scripts/local-ci.sh`) - Runs the same commands as CI without containerization
2. **act Approach** (`scripts/local-act.sh`) - Simulates the full GitHub Actions environment using Docker

## Quick Start

```bash
# Test validation job natively
./scripts/local-ci.sh validate

# Test with act (full simulation)  
./scripts/local-act.sh validate

# Test complete pipeline
./scripts/local-ci.sh all
```

## Native Script Approach (Recommended for Development)

### Usage

```bash
# Run specific jobs
./scripts/local-ci.sh validate           # Validation only
./scripts/local-ci.sh test-matrix        # Tests only  
./scripts/local-ci.sh security           # Security checks
./scripts/local-ci.sh build-analyze      # Build and E2E
./scripts/local-ci.sh changelog          # Changelog validation
./scripts/local-ci.sh all               # Complete pipeline

# Specify Node version (default: 20)
./scripts/local-ci.sh test-matrix 18
```

### What Each Job Tests

- **validate**: `npm run validate:all` (linting, type checking, import validation)
- **test-matrix**: Unit and integration tests + coverage
- **security**: `npm audit` + dependency signature verification  
- **build-analyze**: Build, E2E tests, bundle analysis
- **changelog**: Git diff-based changelog validation

### Limitations

- No matrix testing across OS/Node versions (runs on current environment)
- Requires Node.js 20+ (project minimum requirement)
- No TruffleHog secret scanning (GitHub Action only)
- Simplified changelog validation (no PR context)

## act Approach (Full Simulation)

### Prerequisites

```bash
# Install act
brew install act  # macOS
# or see: https://github.com/nektos/act#installation

# Verify installation
act --version
```

### Configuration Files

The project includes pre-configured act settings:

- **`.actrc`**: Platform mappings and container settings
- **`.env.act`**: Environment variables for local execution

### Usage

```bash
# Run specific jobs
./scripts/local-act.sh validate
./scripts/local-act.sh test-matrix
./scripts/local-act.sh security
./scripts/local-act.sh build-analyze
./scripts/local-act.sh changelog-validation

# Dry run (see what would execute)
./scripts/local-act.sh validate true

# Direct act usage
act --job validate                    # Run validation job
act --list                           # List available jobs  
act --dry-run --job test-matrix      # Dry run test job
```

### First Run Notes

- Docker images will be downloaded automatically (~1-2GB)
- Initial run takes 5-10 minutes for image pulls
- Subsequent runs are much faster

### Limitations

- Matrix jobs run only once (not across multiple OS/Node versions)
- Simulates Node.js 20+ environment (project requirement)
- Some secrets/environment variables may not be available
- Windows/macOS runners simulated with Linux containers
- Release job cannot run locally (requires GitHub context)

## Comparing Approaches

| Feature | Native Script | act |
|---------|---------------|-----|
| **Speed** | ⚡ Very fast | 🐌 Slower (Docker) |
| **Accuracy** | 📊 ~80% match | 🎯 ~95% match |
| **Setup** | ✅ None required | 🔧 Docker + act install |
| **Environment** | 🏠 Local environment | 📦 Containerized |
| **Debugging** | 🐛 Easy | 🔍 Harder |
| **Resource Usage** | 💡 Light | 🔋 Heavy |

## Recommended Workflow

1. **Development**: Use native scripts for quick feedback
   ```bash
   ./scripts/local-ci.sh validate  # Quick lint/type check
   ./scripts/local-ci.sh test      # Run tests
   ```

2. **Pre-commit**: Run full native pipeline
   ```bash
   ./scripts/local-ci.sh all       # Complete verification
   ```

3. **Complex debugging**: Use act for exact CI simulation
   ```bash
   ./scripts/local-act.sh validate # Exact CI environment
   ```

4. **Final verification**: Push to feature branch and verify CI passes

## Troubleshooting

### Native Script Issues

```bash
# Dependency issues
npm ci                              # Clean install

# Node version mismatch (project requires 20+)
nvm use 20                         # Switch to Node 20

# Permission denied
chmod +x scripts/local-ci.sh       # Make executable
```

### act Issues

```bash
# Docker not running
docker info                        # Verify Docker is running

# Permission denied
chmod +x scripts/local-act.sh      # Make executable  

# Image pull issues
act --pull                         # Force image update

# Container architecture issues
act --container-architecture linux/amd64
```

### Common Failures

- **Integration tests fail**: Check if required test environment is set up
- **Bundle analysis missing**: `build:analyze` script may not exist
- **Changelog validation**: Requires git history context

## Integration with Development Workflow

Add to your `.git/hooks/pre-push` for automatic validation:

```bash
#!/bin/bash
echo "Running local CI validation..."
./scripts/local-ci.sh validate
if [ $? -ne 0 ]; then
    echo "Local CI validation failed. Push aborted."
    exit 1
fi
```

## Performance Tips

### Native Scripts
- Run specific jobs instead of `all` during development
- Use `npm run test:unit` directly for fastest feedback
- Cache `node_modules` between runs

### act
- Use `--dry-run` to validate workflow syntax
- Keep Docker images updated: `act --pull`
- Use `--reuse` flag to reuse containers
- Limit to specific jobs to save time

## Related Documentation

- [GitHub Actions Workflow](../.github/workflows/main.yml)
- [Package Scripts](../package.json) 
- [Clean Architecture Testing](./clean-architecture.md#testing-strategy)