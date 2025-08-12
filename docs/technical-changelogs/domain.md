# Domain Layer Technical Changelog

> Format reference: [Technical Changelog Guidelines](./README.md)

## [Unreleased]

### Added
### Changed
- **Builder Pattern Refactoring**: Converted 3 domain builder classes (`WorkoutStepBuilder`, `WorkoutStructureBuilder`, `WorkoutStructureElementBuilder`) to functional patterns with immutable state
  - Introduced new functional builder types (`WorkoutStepBuilderState`, `WorkoutStructureBuilderState`, `WorkoutStructureElementBuilderState`)
  - Added functional builder functions (`createWorkoutStepBuilder`, `withName`, `withDuration`, etc.)
  - Maintained backward compatibility with legacy class-based builders marked as `@deprecated`
  - **Rationale**: Align with Clean Architecture principles by removing classes from domain layer, improve testability through immutability, enable better composition through functional approach
  - **Impact**: Enhanced compliance with "functions over classes" pattern, improved type safety, better functional programming support
  - **Migration**: New code should use functional builders, existing code continues to work but should migrate gradually
### Deprecated
- **Legacy Domain Builders**: Class-based builders (`WorkoutStepBuilder`, `WorkoutStructureBuilder`, `WorkoutStructureElementBuilder`) are now deprecated in favor of functional patterns
  - Maintained full backward compatibility
  - Will be removed in future major version
### Removed
### Fixed
### Security

## [2024-08-10] - Initial Technical Changelog Setup

**Metadata**:
- **PR**: N/A (Initial setup)
- **Author**: System Setup
- **Related Issues**: Technical documentation standardization
- **Breaking Change**: No
- **Migration Guide**: N/A

### Added
- Created technical changelog for domain layer tracking
- Established format for documenting entity changes, business rules, and value object evolution  
- Centralized documentation structure for better accessibility

### Context

**Why**: Document core business logic decisions and rationale, track entity and value object design evolution, preserve context for domain modeling decisions

**Impact**: Better understanding of business rule implementations, improved documentation of domain model evolution, enhanced context for future domain refactoring

**Trade-offs**: Additional maintenance effort for keeping domain changelogs current vs. centralized documentation approach for better accessibility