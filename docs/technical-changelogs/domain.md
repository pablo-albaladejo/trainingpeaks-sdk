# Domain Layer Technical Changelog

> Format reference: [Technical Changelog Guidelines](./README.md)

## [Unreleased]

### Added
### Changed
- **Builder Pattern Refactoring**: Converted 3 domain builder classes to pure functional patterns with immutable state
  - Introduced functional builder types (`WorkoutStepBuilderState`, `WorkoutStructureBuilderState`, `WorkoutStructureElementBuilderState`)
  - Added functional builder functions (`createWorkoutStepBuilder`, `withName`, `withDuration`, etc.)
  - Updated all template implementations to use functional builders
  - **Rationale**: Align with Clean Architecture principles by removing all classes from domain layer, improve testability through immutability, enable better composition through functional approach
  - **Impact**: 100% compliance with "functions over classes" pattern, enhanced type safety, better functional programming support, eliminated object instantiation overhead
  - **Migration**: Breaking change - migrate from class-based to functional builders
### Removed
- **Legacy Domain Builder Classes**: Removed class-based builders (`WorkoutStepBuilder`, `WorkoutStructureBuilder`, `WorkoutStructureElementBuilder`)
  - **Breaking Change**: Code using `new WorkoutStepBuilder()` must migrate to functional API
  - **Migration Path**: Replace `new WorkoutStepBuilder().name('x').build()` with `buildWorkoutStep(withName(createWorkoutStepBuilder(), 'x'))`
  - All workout templates updated to use functional builders
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