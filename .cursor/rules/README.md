---
description: NPM library development rules and guidelines for maintaining consistent architecture and quality standards
globs: **/*.ts,**/*.js,**/*.mjs
alwaysApply: false
---

# NPM Library Development Rules

This directory contains Cursor rules specifically designed for developing npm libraries using TypeScript and following
clean architecture principles.

## Overview

These rules are adapted from the main project rules but specifically tailored for npm library development. They focus
on:

- **Clean Architecture**: Domain-driven design without AWS-specific components
- **Library-Specific Patterns**: HTTP clients, validation, and external integrations
- **NPM Publishing**: Best practices for library distribution and versioning
- **API Design**: Public API design and backward compatibility

For comprehensive product context and business objectives, see [PRODUCT.md](../../PRODUCT.md).

## Available Rules

### 🎯 Scope & Focus

#### [`scope-limitation.mdc`](./scope-limitation.mdc) ⚠️ **CRITICAL PRIORITY**

- **Mandatory scope limitation rule** - highest priority
- Strictly limits modifications to only the specific feature requested in the prompt
- Prevents unnecessary refactoring, improvements, or "while we're at it" changes
- Enforces focused development on exact user requirements
- Pre and post-modification checklists for compliance
- Exception handling for legitimate scope expansions

### 🏗️ Architecture & Design

#### `project-architecture.mdc`

- Clean architecture principles for libraries
- Hexagonal architecture (ports & adapters)
- Project structure and organization
- Dependency inversion patterns
- Library export structure
- Use case orchestration patterns

#### `typescript-coding-standards.mdc`

- TypeScript best practices for libraries
- Public API design patterns
- Error handling and type safety
- Documentation standards

### 🧪 Testing & Quality

#### `unit-test-rule.mdc`

- Testing patterns using Vitest
- Mocking strategies for libraries
- Test organization and fixtures
- Coverage requirements
- E2E testing for npm packages
- Rosie factory patterns for test data

#### `contract-testing-rule.mdc` 🔗 **API VALIDATION**

- **MANDATORY for API endpoint changes** - Contract tests must pass before merge
- TrainingPeaks API endpoint validation against Zod schemas
- HTTP status code and error response verification
- API change detection and SDK adaptation protocols
- Schema evolution tracking and backward compatibility
- CI integration with automated issue creation on API changes

#### `code-review-rule.mdc`

- Code review checklist for libraries
- API design review criteria
- Backward compatibility checks
- Performance considerations

#### `github-labels-rule.mdc` 🏷️ **MANDATORY LABELING**

- **REQUIRED for ALL issues/PRs** - No unlabeled issues allowed
- Mandatory type, priority, and effort labels for issues
- Automatic label validation via GitHub Actions
- Label lifecycle management and project board integration
- CLI commands and maintenance scripts for bulk operations

### 🔧 Development Workflow

#### `development-workflow.mdc`

- Project setup and configuration
- Build tools and bundling
- Publishing workflow
- GitHub Actions CI/CD for libraries
- GitHub project management (issues, PRs)
- Integration testing patterns
- **Mandatory changelog requirements and validation**

#### **Development Workflows (NEW)** 📋

**Comprehensive workflow automation for issue-driven development:**

##### [`workflows-overview.mdc`](./workflows-overview.mdc) - **Master Reference**
- Complete overview of all 5 development workflows  
- Integration patterns and command reference
- End-to-end development flow diagrams
- Best practices and usage examples

##### [`workflow-issue-driven-development.mdc`](./workflow-issue-driven-development.mdc)
- **Trigger**: `@issue-dev [URL]`, `@analyze-issue`, `@implement-plan`
- Complete lifecycle from GitHub issue analysis to PR creation
- Clean Architecture compliance validation
- Automatic branch creation and quality gates

##### [`workflow-issue-creation.mdc`](./workflow-issue-creation.mdc)  
- **Trigger**: `@create-issue`, `@refine-requirements`, `@generate-issue`
- Collaborative issue creation through iterative refinement
- Automatic template selection and GitHub issue generation
- Requirements validation and acceptance criteria definition

##### [`workflow-pr-review.mdc`](./workflow-pr-review.mdc)
- **Trigger**: `@review-pr [URL]`, `@check-requirements`, `@architecture-review`
- Comprehensive PR review against original issue requirements
- Code quality, testing, and documentation validation
- Structured feedback with actionable recommendations

##### [`workflow-technical-debt-analysis.mdc`](./workflow-technical-debt-analysis.mdc)
- **Trigger**: `@analyze-debt`, `@debt-module [path]`, `@debt-report`
- Architecture violations and code smell detection
- Health score calculation and improvement roadmaps
- Automatic issue creation for critical debt items

##### [`workflow-documentation-sync.mdc`](./workflow-documentation-sync.mdc)
- **Trigger**: `@sync-docs`, `@check-docs [path]`, `@update-api-docs`
- API documentation accuracy validation
- Code example compilation and maintenance
- Technical changelog completeness verification

**Integration Features:**
- **Quality Gates**: ESLint, TypeScript, tests, imports validation
- **Architecture Validation**: Clean Architecture compliance checks
- **Project Standards**: Function-based services, mandatory testing
- **Traceability**: Issue → Development → PR → Review workflow

#### [`changelog-management.mdc`](./changelog-management.mdc)

- Dual changelog system (root + [technical changelogs](../../docs/technical-changelogs/README.md))
- Changelog generation rules and formats
- Pre-commit validation hooks with [concrete implementations](./changelog-management.mdc#git-hooks)
- Technical decision documentation
- User-facing change tracking

##### Installing Git Hooks

This project uses **Husky** for Git hook management. To enable the changelog validation hooks:

1. **Install dependencies** (includes Husky setup):
   ```bash
   npm install
   ```

2. **Verify Husky installation**:
   ```bash
   # Check hooks are installed
   ls -la .husky/
   # Should show pre-commit and pre-push files
   ```

3. **Manual hook verification**:
   ```bash
   # Test pre-commit hook
   .husky/pre-commit
   
   # Test pre-push hook  
   .husky/pre-push
   ```

4. **CI Environment Setup and Verification**:
   
   In CI environments, verify that Husky is properly configured:
   
   ```bash
   # 1. Ensure Husky files exist and are executable
   test -f .husky/pre-commit && echo "✅ pre-commit exists" || echo "❌ pre-commit missing"
   test -x .husky/pre-commit && echo "✅ pre-commit executable" || echo "❌ pre-commit not executable"
   test -f .husky/pre-push && echo "✅ pre-push exists" || echo "❌ pre-push missing"
   test -x .husky/pre-push && echo "✅ pre-push executable" || echo "❌ pre-push not executable"
   
   # 2. Confirm package.json contains prepare script
   grep -q '"prepare".*"husky"' package.json && echo "✅ prepare script found" || echo "❌ prepare script missing"
   
   # 3. Check that CI environment doesn't disable Husky
   [ "$HUSKY" = "0" ] && echo "⚠️  HUSKY is disabled" || echo "✅ HUSKY is enabled"
   
   # 4. Complete verification script
   bash -c '
     set -euo pipefail
     echo "=== Husky CI Verification ==="
     all_good=true
     
     # Check hook files
     for hook in pre-commit pre-push; do
       if [[ -f .husky/$hook && -x .husky/$hook ]]; then
         echo "✅ $hook: exists and executable"
       else
         echo "❌ $hook: missing or not executable"
         all_good=false
       fi
     done
     
     # Check prepare script with robust JSON parsing
     if command -v jq >/dev/null 2>&1; then
       # Use jq for JSON-safe parsing
       if jq -e ".scripts.prepare | contains(\"husky\")" package.json >/dev/null 2>&1; then
         echo "✅ package.json: prepare script configured (verified with jq)"
       else
         echo "❌ package.json: prepare script missing or invalid (verified with jq)"
         all_good=false
       fi
     else
       # Fallback to grep if jq is not available
       echo "ℹ️  jq not available, falling back to grep"
       if grep -q "\"prepare\".*\"husky\"" package.json 2>/dev/null; then
         echo "✅ package.json: prepare script configured (grep fallback)"
       else
         echo "❌ package.json: prepare script missing (grep fallback)"
         all_good=false
       fi
     fi
     
     # Check environment
     if [[ "${HUSKY:-}" == "0" ]]; then
       echo "⚠️  Environment: HUSKY is disabled"
       all_good=false
     else
       echo "✅ Environment: HUSKY is enabled"
     fi
     
     if $all_good; then
       echo "🎉 Husky setup verified successfully"
       exit 0
     else
       echo "💥 Husky setup has issues"
       exit 1
     fi
   '
   ```

##### Technical Changelog Files

Verify all referenced changelog files exist:
```bash
# Check technical changelog structure
find docs/technical-changelogs/ -name "*.md" | sort

# Verify all expected files are present
missing_files=false

if [ ! -f "docs/technical-changelogs/README.md" ]; then
  echo "❌ Missing: docs/technical-changelogs/README.md (main documentation file)"
  missing_files=true
else
  echo "✅ Found: docs/technical-changelogs/README.md"
fi

for component in adapters application domain shared; do
  if [ ! -f "docs/technical-changelogs/$component.md" ]; then
    echo "❌ Missing: docs/technical-changelogs/$component.md"
    missing_files=true
  else
    echo "✅ Found: docs/technical-changelogs/$component.md"
  fi
done

# Exit with error if any files are missing
if [ "$missing_files" = "true" ]; then
  echo "💥 CI FAILURE: Required documentation files are missing"
  exit 1
else
  echo "🎉 All required documentation files are present"
fi
```

### 🔌 External Integrations

#### `http-client-patterns.mdc`

- HTTP client architecture
- Request/response handling
- Error handling and retry logic
- Interceptors and middleware

#### `validation-patterns.mdc`

- Input validation using Zod
- Schema composition and reuse
- Error handling patterns
- Performance optimization

#### `validation-requirements.mdc` 🚨 **MANDATORY**

- **MANDATORY** validation pipeline enforcement
- Comprehensive `npm run validate:all` requirement
- Zero-error quality gate policy
- Pre-commit validation requirements
- Error resolution workflow and priorities

## How to Use These Rules

### 1. Apply to Your Project

Copy the rules to your project's `.cursor/rules` directory:

```bash
cp -r .cursor/rules/npm-library/* your-project/.cursor/rules/
```

### 2. Configure Your Project

Update your project configuration to match the patterns:

```json
// package.json
{
    "name": "your-library",
    "version": "1.0.0",
    "main": "dist/index.js",
    "module": "dist/index.mjs",
    "types": "dist/index.d.ts",
    "exports": {
        ".": {
            "import": "./dist/index.mjs",
            "require": "./dist/index.js",
            "types": "./dist/index.d.ts"
        }
    },
    "scripts": {
        "build": "tsup",
        "test": "vitest",
        "lint": "eslint src",
        "type-check": "tsc --noEmit"
    }
}
```

### 3. Follow the Architecture

Organize your code according to the clean architecture pattern:

```
src/
├── adapters/           # External integrations
│   ├── http/          # HTTP clients
│   ├── validation/    # Input validation
│   └── serialization/ # Data transformation
├── application/       # Business logic
│   ├── services/      # Use case implementations
│   ├── repositories/  # Repository interfaces
│   └── useCases/      # Business use cases
├── domain/           # Core business logic
│   ├── entities/     # Domain entities
│   ├── valueObjects/ # Value objects
│   └── repositories/ # Repository interfaces
└── shared/           # Shared utilities
    ├── types/        # Common types
    ├── utils/        # Utility functions
    └── errors/       # Error handling
```

### 4. Implement HTTP Client

Use the HTTP client patterns for external API integrations:

```typescript
// src/adapters/http/HttpClient.ts
import { BaseHttpClient, HttpClientConfig } from './BaseHttpClient';

export class MyHttpClient extends BaseHttpClient {
    // Implementation
}

// src/index.ts
export { MyHttpClient } from './adapters/http/HttpClient';
export { UserService } from './application/services/UserService';
```

### 5. Add Validation

Implement input validation using the validation patterns:

```typescript
// src/adapters/validation/schemas.ts
import { z } from 'zod';

export const UserSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
});

// src/application/services/UserService.ts
export class UserService {
    createUser(input: unknown): User {
        const validatedInput = UserSchema.parse(input);
        // Implementation
    }
}
```

## Key Differences from Main Project

### No AWS Components

- Removed Lambda handlers, SQS, and AWS-specific patterns
- Focus on HTTP clients and external API integrations
- Simplified deployment and testing

### Library-Specific Patterns

- Public API design and export management
- Configuration validation and defaults
- Error handling for library consumers
- Documentation and examples

### Publishing Workflow

- NPM publishing best practices
- Version management and changelog
- Bundle optimization and tree-shaking
- TypeScript declaration files

## Best Practices

### 1. Public API Design

- Keep the public API minimal and focused
- Use clear, descriptive names
- Provide sensible defaults
- Export error types for user handling

### 2. Error Handling

- Define specific error types
- Provide meaningful error messages
- Include error codes for programmatic handling
- Document error scenarios

### 3. Configuration

- Use configuration objects with defaults
- Validate configuration on initialization
- Support environment variables
- Provide clear documentation

### 4. Testing

- Test the public API thoroughly
- Mock external dependencies
- Use realistic test data
- Maintain high coverage

### 5. Documentation

- Comprehensive README with examples
- JSDoc comments for all public functions
- Type definitions for all exports
- Migration guides for breaking changes

## Example Implementation

Here's a complete example of how to structure a library following these rules:

```typescript
// src/domain/entities/User.ts
export class User {
    constructor(
        private readonly _id: string,
        private readonly _email: string,
        private readonly _name: string,
    ) {}

    get id(): string {
        return this._id;
    }
    get email(): string {
        return this._email;
    }
    get name(): string {
        return this._name;
    }
}

// src/domain/repositories/UserRepository.ts
export interface UserRepository {
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<void>;
}

// src/application/services/UserService.ts
export class UserService {
    constructor(private userRepository: UserRepository) {}

    async createUser(input: CreateUserInput): Promise<User> {
        const user = new User(input.id, input.email, input.name);
        await this.userRepository.save(user);
        return user;
    }
}

// src/adapters/http/HttpUserRepository.ts
export class HttpUserRepository implements UserRepository {
    constructor(private httpClient: HttpClient) {}

    async findById(id: string): Promise<User | null> {
        const response = await this.httpClient.get(`/users/${id}`);
        return response ? User.fromResponse(response) : null;
    }
}

// src/index.ts
export { UserService } from './application/services/UserService';
export { User } from './domain/entities/User';
export { UserRepository } from './domain/repositories/UserRepository';
export { HttpUserRepository } from './adapters/http/HttpUserRepository';
export { ValidationError } from './shared/errors/ValidationError';
```

## Contributing

When contributing to a library using these rules:

1. Follow the clean architecture principles
2. Write comprehensive tests
3. Update documentation
4. Ensure backward compatibility
5. Follow the code review checklist

## Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
