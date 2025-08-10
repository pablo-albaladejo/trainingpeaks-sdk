# Technical Changelogs

This directory contains detailed technical changelogs for major SDK components. These changelogs track architectural decisions, implementation details, and technical rationale behind code changes.

## Structure

- [`adapters.md`](./adapters.md) - External integrations and HTTP client changes
- [`application.md`](./application.md) - Business logic orchestration and service contracts
- [`domain.md`](./domain.md) - Core entities, value objects, and business rules
- [`infrastructure.md`](./infrastructure.md) - Concrete implementations and utilities
- [`shared.md`](./shared.md) - Common utilities and cross-cutting concerns

## Purpose

Unlike the root `CHANGELOG.md` which tracks user-facing changes, these technical changelogs provide:

- Implementation details and rationale
- Architectural decisions and trade-offs
- Technical debt documentation
- Refactoring notes and patterns
- Internal API changes
- Performance optimizations

## Usage

When making changes to code in specific layers, update the corresponding technical changelog with:

1. **What changed** - Brief description of the modification
2. **Why it changed** - Reasoning and problem being solved
3. **Impact** - Who/what is affected by the change
4. **Trade-offs** - Alternative approaches considered

## Format

```markdown
## [YYYY-MM-DD] - Change Description

### Changed
- Brief description of what changed

### Why
- Reasoning behind the change
- Problem it solves
- Context and motivation

### Impact
- Affected components or systems
- Performance implications
- Breaking changes (if any)

### Trade-offs
- Alternative approaches considered
- Pros and cons of chosen approach
```