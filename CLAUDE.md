# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Building and Development
- `npm run build` - Build both ESM and CJS versions using TypeScript + tsc-alias
- `npm run build:esm` - Build ESM version only
- `npm run build:cjs` - Build CommonJS version only  
- `npm run dev` - Start TypeScript compiler in watch mode
- `npm run clean` - Remove build artifacts (dist, dist-cjs)

### Testing
- `npm test` or `npm run test:unit` - Run unit tests with Vitest (excludes integration tests)
- `npm run test:integration` - Run integration tests (*.integ-test.ts files)
- `npm run test:coverage` - Run tests with coverage reporting
- `npm run test:e2e` - Run end-to-end tests in e2e-test/ directory
- `npm run test:junit` - Generate JUnit XML report for CI

### Code Quality
- `npm run lint` - ESLint with zero warnings policy (--max-warnings=0)
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without changes
- `npm run check-imports` - Validate import structure using bash script

### Release Process
- `npm run pre-release` - Complete pre-release validation (clean, format, lint, imports, build, test)
- `npm run release` - Semantic release
- `npm run release:dry-run` - Preview release without publishing

## Architecture Overview

This is a TypeScript SDK for TrainingPeaks API integration following **Clean Architecture** principles with hexagonal architecture (ports & adapters). The project uses a **function-based approach** rather than traditional classes for better testability and functional composition.

### Core Architecture Layers

```
src/
├── adapters/          # External integrations (HTTP, storage, serialization)
├── application/       # Business logic orchestration and contracts
├── domain/           # Core business entities and rules
├── infrastructure/   # Concrete implementations of application contracts
└── shared/          # Common utilities and types
```

### Key Architectural Patterns

#### Ports & Adapters Pattern
- **Application layer**: Contains only contracts, types, and interfaces (ports)
- **Infrastructure layer**: Contains all concrete implementations (adapters)
- **Use function types** instead of grouped interfaces for service contracts

#### Repository Pattern
- Domain layer defines repository interfaces
- Adapters layer provides concrete implementations
- Application layer orchestrates through contracts only

#### Function-Based Services
Application services use individual function types:
```typescript
// ✅ CORRECT: Individual function types
export type validateUserId = (userId: string) => void;
export type validateEmail = (email: string) => void;

// ❌ AVOID: Grouped interface patterns
export type UserValidationService = {
  validateUserId: (userId: string) => void;
  validateEmail: (email: string) => void;
};
```

## Project Structure Details

### `/src/adapters/` - External Integrations
- `client/` - Main client implementation with handlers for specific operations
- `http/` - HTTP clients and authentication adapters
- `storage/` - Memory storage adapters
- `serialization/` - Data transformation and serialization
- `constants/` - API endpoints, HTTP methods, status codes
- `errors/` - HTTP and serialization error types

### `/src/application/` - Business Logic Contracts
- `services/` - Service contract definitions (function types only)
- `repositories/` - Repository interface definitions
- `use-cases/` - Business use case orchestrations

### `/src/domain/` - Core Business Logic
- `entities/` - Core business entities (User, Workout, AuthToken)
- `value-objects/` - Immutable value objects (Credentials, WorkoutFile)
- `schemas/` - Zod validation schemas for entities and API data
- `errors/` - Domain-specific error types
- `builders/` - Workout structure builders

### `/src/infrastructure/` - Concrete Implementations
- `services/` - Concrete implementations of application service contracts

## Development Guidelines

### Testing Strategy
- **Unit tests**: Use `.test.ts` suffix, focus on individual functions/classes
- **Integration tests**: Use `.integ-test.ts` suffix, test feature workflows
- **Test fixtures**: Located in `src/__fixtures__/` using Rosie factory pattern
- **E2E tests**: Located in `e2e-test/` directory for testing built packages

### Path Aliases (TypeScript)
```typescript
"@/*"              // src/*
"@adapters/*"      // src/adapters/*  
"@application/*"   // src/application/*
"@domain/*"        // src/domain/*
"@infrastructure/*" // src/infrastructure/*
"@fixtures/*"      // src/__fixtures__/*
"@types/*"         // src/types/*
```

### Import Validation
- Run `npm run check-imports` to validate import structure
- Project enforces clean architecture import rules via bash script

### Build Configuration
- **Dual Package**: Supports both ESM and CommonJS exports
- **TypeScript paths**: Uses tsc-alias for proper path resolution in builds
- **Bundle optimization**: Separate builds for different module systems

### Error Handling
- Domain errors in `domain/errors/`
- HTTP errors in `adapters/errors/`
- Use structured error codes and messages
- All errors extend base SDK error types

## Code Quality Standards
- **ESLint**: Zero warnings policy enforced
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Coverage**: Automatic threshold updates, excludes fixtures and tests
- **Import structure**: Validated via custom bash script

## Key Dependencies
- **Runtime**: axios, axios-cookiejar-support, playwright-core, zod, rosie
- **Testing**: vitest, @faker-js/faker
- **Build**: typescript, tsc-alias, semantic-release
- **Validation**: zod for schema validation
- **HTTP**: axios with cookie jar support for session management

## Cursor Rules Integration
The project includes comprehensive Cursor rules in `.cursor/rules/` covering:
- Clean architecture patterns
- TypeScript coding standards  
- Unit testing with Vitest
- HTTP client patterns
- Validation patterns using Zod
- Development workflow guidelines

Refer to `.cursor/rules/README.md` for detailed rule descriptions and usage patterns.