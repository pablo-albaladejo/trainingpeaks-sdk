# Application Layer Technical Changelog

## [Unreleased]

### Changed
- **Type System Refactoring**: Converted 7 interfaces to types for improved consistency
  - `RequestOptions` (http-client.ts) - HTTP client configuration
  - `WorkoutAggregate` (workout-aggregate.ts) - Domain aggregate type
  - `HttpErrorResponse`, `HttpErrorContext`, `HttpError` (http-error.ts) - Error handling types
  - `RetryConfig` (retry-handler.ts) - HTTP retry configuration  
  - `CurlRequestData` (curl-generator.ts) - Debug utility type
  - **Rationale**: Align with "types over interfaces" architectural pattern, improve consistency across codebase
  - **Impact**: Better type inference, consistent patterns, improved developer experience
  - **Migration**: No breaking changes, existing code continues to work without modification

## [2024-08-10] - Initial Structure

### Changed
- Created technical changelog for application layer tracking
- Established format for documenting service contracts, use cases, and business logic orchestration

### Why
- Centralize documentation of application layer architectural decisions
- Track evolution of service contracts and interfaces
- Provide context for business logic changes and patterns

### Impact
- Improved visibility into application layer design decisions
- Better tracking of interface changes and their implications
- Enhanced understanding of business logic evolution

### Trade-offs
- Additional documentation overhead
- Centralized approach chosen over distributed folder-level changelogs for consistency