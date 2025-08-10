# Adapters Layer Technical Changelog

## [2024-08-10] - Architecture Consolidation

### Changed
- Consolidated infrastructure layer concepts into adapters layer
- Updated documentation to reflect actual 3-layer architecture (Domain, Application, Adapters)
- Merged concrete implementations and external integrations under single adapters layer

### Why
- Infrastructure layer never existed in actual codebase, only in documentation
- Simplified architecture reflects actual implementation structure
- Reduces confusion between documented vs actual architecture

### Migration
- **Import Path Changes**: Update any imports that referenced "infrastructure" to use "adapters"
  ```typescript
  // Before
  import { createHttpClient } from '@infrastructure/http';
  
  // After  
  import { createHttpClient } from '@adapters/http';
  ```
- **Alias Updates**: Path aliases `@infrastructure/*` now map to `@adapters/*`
- **Documentation**: All references to "Infrastructure layer" are now "Adapters layer"

**Migration Codemod**: Automated migration script available to convert existing codebases:
```bash
# Run the migration codemod to update imports automatically
npx @trainingpeaks-sdk/migrate-infrastructure-to-adapters src/
# Options: --dry-run (preview changes), --ignore-patterns (exclude files)
```

### Impact
- Clearer mental model for developers
- Documentation now matches implementation reality
- Simplified dependency flow and project structure

## [2024-08-10] - Initial Structure

### Changed
- Created technical changelog for adapters layer tracking
- Established format for documenting HTTP client, repository, external integrations, and concrete implementations

### Why
- Centralize technical documentation for better visibility
- Track architectural decisions and implementation rationale
- Provide context for future developers and maintainers

### Impact
- Improved documentation and knowledge sharing
- Better tracking of technical debt and refactoring decisions
- Enhanced code review process

### Trade-offs
- Additional maintenance overhead for keeping changelogs updated
- Chose centralized directory over folder-level files for better discoverability