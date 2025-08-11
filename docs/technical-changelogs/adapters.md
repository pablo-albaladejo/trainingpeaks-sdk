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

**Repository-wide Migration Codemod**: Use these commands to update all import paths:
```bash
# IMPORTANT: Commit or stash changes before running migration commands

# 1. Verify available tools and options
npm view @trainingpeaks-sdk/migrate-infrastructure-to-adapters versions --json
npm view @trainingpeaks-sdk/migrate-infrastructure-to-adapters --json | grep -E "(bin|cli|flags)"

# 2. Run with --dry-run first to preview changes
npx -y @trainingpeaks-sdk/migrate-infrastructure-to-adapters@latest src/ --dry-run

# 3. Apply the migration after reviewing changes
npx -y @trainingpeaks-sdk/migrate-infrastructure-to-adapters@latest src/ --ignore-patterns="**/*.test.*,**/*.spec.*"

# 4. Alternative: Use ripgrep and sed for direct file replacement
rg -l "@infrastructure/" src/ | xargs sed -i 's/@infrastructure\//@adapters\//g'
rg -l "from ['\"]@infrastructure/" src/ | xargs sed -i "s/from \(['\"]@\)infrastructure\//from \\1adapters\//g"

# 5. Validation checklist after migration:
grep -r "paths.*@infrastructure" tsconfig*.json vitest.config.ts  # Update path aliases
find src/ -name "*.test.*" -exec grep -l "@infrastructure" {} \; # Check remaining test references
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