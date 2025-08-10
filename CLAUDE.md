# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

**Building & Development**: `npm run build` (ESM+CJS), `npm run build:esm`, `npm run build:cjs`, `npm run dev`, `npm run clean`

**Testing**: `npm test`, `npm run test:integration`, `npm run test:contract`, `npm run test:coverage`, `npm run test:e2e`, `npm run test:junit`

**Code Quality**: `npm run lint` (zero warnings), `npm run lint:fix`, `npm run format`, `npm run format:check`, `npm run check-imports`

**Release**: `npm run pre-release`, `npm run release`, `npm run release:dry-run`

## Architecture Overview

TypeScript SDK for TrainingPeaks API using **Clean Architecture** with hexagonal architecture (ports & adapters). Uses **function-based services** rather than classes for better testability.

See [PRODUCT.md](./PRODUCT.md) for product context.

### Core Architecture Layers
```
src/
├── adapters/          # External integrations and concrete implementations
├── application/       # Business logic orchestration and contracts
├── domain/           # Core business entities and rules
└── shared/          # Common utilities and types
```

### Key Patterns
- **Ports & Adapters**: Application layer contains only contracts, adapters contain implementations
- **Repository Pattern**: Domain defines function types, adapters implement
- **Function-Based Services**: Use individual function types, NOT grouped interfaces

```typescript
// ✅ CORRECT: Individual function types
export type validateUserId = (userId: string) => void;
export type validateEmail = (email: string) => void;

// ❌ AVOID: Grouped interfaces
export type UserValidationService = {
  validateUserId: (userId: string) => void;
  validateEmail: (email: string) => void;
};
```

## Project Structure
- **`/src/adapters/`**: `services/`, `http/`, `storage/`, `constants/`, `errors/`, `public-api/`
- **`/src/application/`**: `services/`, `ports/`, `use-cases/`
- **`/src/domain/`**: `entities/`, `value-objects/`, `schemas/`, `errors/`, `builders/`

## Development Guidelines

### Changelog Management
**Two changelog types:**
1. **Root-Level** (`CHANGELOG.md`): User-facing changes, releases, breaking changes
2. **Technical** (`docs/technical-changelogs/`): Implementation details, architectural decisions

**Rules:**
- Update relevant technical changelog for ANY code change
- Update root changelog for user-facing changes
- Include reasoning, trade-offs, migration notes

### Testing Strategy
- **MANDATORY**: Every line of implementing logic MUST have unit tests
- **Unit tests**: `.test.ts` suffix, comprehensive coverage including edge cases
- **Integration tests**: `.integ-test.ts` suffix for workflows
- **Contract tests**: `.contract-test.ts` suffix for API endpoint validation
- **Test fixtures**: `src/__fixtures__/` using Rosie factory pattern
- **E2E tests**: `e2e-test/` directory

#### Contract Testing Requirements
**MANDATORY for API endpoint changes**: When adding or modifying any API endpoint integration:
- **Contract tests MUST pass** before merge - validates actual API responses against schemas
- **Schema validation required** - Zod schemas must match real TrainingPeaks API responses
- **Error code validation** - HTTP status codes and error responses must be validated
- **Response structure verification** - All fields, types, and nested objects must be verified
- **Update contract tests** when API contracts change - failing tests indicate API changes that need SDK updates
- **Command**: `npm run test:contract` must pass for all endpoint modifications

### Path Aliases
```typescript
"@/*" → src/*
"@adapters/*" → src/adapters/*  
"@application/*" → src/application/*
"@domain/*" → src/domain/*
"@fixtures/*" → src/__fixtures__/*
```

### Quality Standards
- **ESLint**: Zero warnings policy
- **TypeScript**: Strict mode enabled
- **Import validation**: `npm run check-imports`
- **Dual package**: ESM + CommonJS support
- **MANDATORY VALIDATION**: All implementations MUST pass `npm run validate:all` and resolve ALL errors

## Key Dependencies
**Runtime**: axios, axios-cookiejar-support, playwright-core, zod, rosie
**Build/Test**: typescript, tsc-alias, vitest, @faker-js/faker, semantic-release

## Important Files
- [`PRODUCT.md`](./PRODUCT.md) - Product vision and features
- [`docs/clean-architecture.md`](./docs/clean-architecture.md) - Architecture guide
- [`README.md`](./README.md) - Technical documentation
- [`.cursor/rules/README.md`](./.cursor/rules/README.md) - Cursor rule descriptions

## Issue-Driven Development Workflow

Automated workflow where Claude analyzes GitHub issues, creates implementation plans, manages branches, and generates PRs.

### Process
1. **Issue Analysis**: Provide GitHub issue URL → Claude analyzes requirements and proposes plan
2. **Development**: Upon approval → Create feature branch, implement solution, run quality checks
3. **Pull Request**: Create PR with comprehensive documentation and testing instructions

### Branch Naming
- `feat/issue-{number}-{brief-description}` - New features
- `fix/issue-{number}-{brief-description}` - Bug fixes  
- `refactor/issue-{number}-{brief-description}` - Code refactoring
- `docs/issue-{number}-{brief-description}` - Documentation
- `test/issue-{number}-{brief-description}` - Test improvements

### Quality Gates
✅ ESLint (zero warnings) ✅ TypeScript compilation ✅ Unit test coverage ✅ Integration tests ✅ Contract tests ✅ Import validation ✅ ESM/CJS builds ✅ **MANDATORY**: `npm run validate:all` passes with zero errors

## Issue Creation Workflow

Collaborative issue creation with requirement refinement and automatic GitHub issue generation.

### Process
1. **Requirements Gathering**: Provide initial concept → Claude asks clarifying questions
2. **Validation**: Review complete requirements summary → Approve or request modifications  
3. **Creation**: Auto-create GitHub issue with proper template, labels, and project board assignment

### 🚨 MANDATORY Labeling Requirements
**ALL ISSUES MUST BE CREATED WITH PROPER LABELS** - No unlabeled issues allowed.

**Required Labels (3 minimum):**
- **Type**: `type: enhancement`, `type: bug`, `type: refactor`, `type: documentation`, `type: testing`, `type: performance`, `type: security`
- **Priority**: `priority: critical`, `priority: high`, `priority: medium`, `priority: low`  
- **Effort**: `effort: small` (<1 day), `effort: medium` (1-3 days), `effort: large` (3-7 days), `effort: epic` (>1 week)

**Optional Labels:**
- **Architecture**: `architecture: domain`, `architecture: application`, `architecture: adapters`
- **Component**: `component: auth`, `component: api`, `component: client`, `component: testing`

### Available Templates
- **feature-request.md**, **bug-fix.md**, **refactor.md**, **documentation.md**, **performance.md**, **testing.md**, **security.md**

## Pull Request Review Workflow

Comprehensive PR reviews analyzing implementation against issue requirements, code quality, and project standards.

### Process  
1. **Analysis**: Provide PR URL → Claude fetches linked issue, validates requirements coverage
2. **Quality Assessment**: Architecture compliance, testing validation, documentation review
3. **Structured Feedback**: Detailed report with actionable recommendations and priority classification

### Review Categories
- **Compliance**: Issue requirements, acceptance criteria fulfillment
- **Technical**: Clean Architecture adherence, code quality, performance, security
- **Quality Assurance**: Test coverage, documentation completeness, build readiness

### Quality Metrics
- Requirements coverage percentage
- Architecture compliance score  
- Test coverage completeness
- Documentation completeness score

## Technical Debt Analysis Workflow

Identifies code smells, architecture violations, and improvement opportunities based on Clean Architecture and project standards.

### Process
1. **Analysis**: Request scope (module/codebase) → Claude scans for anti-patterns and violations
2. **Classification**: Debt categorized by impact/effort with health score
3. **Issue Generation**: Auto-create GitHub issues for improvement items
4. **Roadmap**: Strategic debt reduction planning with priority ordering

### Debt Categories Detected
- **Architecture**: Domain logic in adapters, grouped interfaces, cross-layer violations
- **TypeScript**: `any` usage, missing strict compliance, type assertion overuse
- **Testing**: Missing unit tests, coverage gaps, anti-patterns
- **Organization**: Import violations, path alias misuse, circular dependencies

### Quality Integration
Leverages ESLint rules, TypeScript config, `npm run check-imports`, test coverage requirements, and Clean Architecture validation.

## Documentation Sync Workflow

Automatic documentation synchronization analyzing codebase against existing docs to identify inconsistencies and generate updates.

### Process
1. **Audit**: Compare docs with actual implementation → Identify outdated/missing documentation
2. **Analysis**: Review API docs, README.md, technical changelogs, code comments
3. **Updates**: Generate updated documentation following project standards
4. **Validation**: Ensure completeness and accuracy with maintenance planning

### Review Areas
- **API Documentation**: Function signatures, parameters, error handling examples
- **README.md**: Installation instructions, usage examples, feature descriptions
- **Technical Changelogs**: Recent changes, architecture decisions, migration notes
- **Code Documentation**: JSDoc/TSDoc comments, inline documentation

### Quality Gates
- ✅ API examples compile successfully ✅ Documentation matches interfaces ✅ Changelogs updated per PR ✅ Breaking changes documented ✅ **MANDATORY**: `npm run validate:all` passes with zero errors

## ⚠️ CRITICAL SCOPE LIMITATION RULE
**MANDATORY**: Only modify the EXACT feature/component explicitly requested.

**ALLOWED minimal changes** (only when strictly necessary):
- Type definitions required for compilation
- Essential configuration tweaks  
- Documentation tied to the change
- Test fixtures for new functionality

**DO NOT**: Refactor unrelated code, update dependencies, modify unrelated configs, add unrequested improvements, change unrelated tests/docs.

**FOLLOW-UP**: Create separate issues for discovered improvements outside scope.

This rule has CRITICAL PRIORITY. See `.cursor/rules/scope-limitation.mdc` for details.