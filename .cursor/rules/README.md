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

#### `code-review-rule.mdc`

- Code review checklist for libraries
- API design review criteria
- Backward compatibility checks
- Performance considerations

### 🔧 Development Workflow

#### `development-workflow.mdc`

- Project setup and configuration
- Build tools and bundling
- Publishing workflow
- GitHub Actions CI/CD for libraries
- GitHub project management (issues, PRs)
- Integration testing patterns
- **Mandatory changelog requirements and validation**

#### [`changelog-management.mdc`](./changelog-management.mdc)

- Dual changelog system (root + [technical changelogs](../docs/technical-changelogs/README.md))
- Changelog generation rules and formats
- Pre-commit validation hooks with concrete implementations
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

4. **CI Environment Setup**:
   ```bash
   # In CI, Husky hooks are automatically available after npm install
   # No additional setup required for GitHub Actions or similar CI systems
   ```

##### Technical Changelog Files

Verify all referenced changelog files exist:
```bash
# Check technical changelog structure
find docs/technical-changelogs/ -name "*.md" | sort

# Verify all expected files are present
for component in adapters application domain infrastructure shared; do
  if [ ! -f "docs/technical-changelogs/$component.md" ]; then
    echo "Missing: docs/technical-changelogs/$component.md"
  fi
done
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
