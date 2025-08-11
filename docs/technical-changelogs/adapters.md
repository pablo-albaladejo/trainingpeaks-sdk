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

## Repository-wide Migration Codemod

Use these commands to update all import paths:
```bash
set -euo pipefail
# IMPORTANT: Commit or stash changes, run these commands from the repo root, and use a dedicated branch

# 1. Verify available tools and options
npx @trainingpeaks-sdk/migrate-infrastructure-to-adapters --help

# 2. Run with --dry-run first to preview changes
npx -y @trainingpeaks-sdk/migrate-infrastructure-to-adapters@latest src/ --dry-run --include="*.ts,*.tsx,*.js,*.jsx,*.mts,*.cts,*.d.ts"

# 3. Apply the migration after reviewing changes
npx -y @trainingpeaks-sdk/migrate-infrastructure-to-adapters@latest src/ --include="*.ts,*.tsx,*.js,*.jsx,*.mts,*.cts,*.d.ts,*.stories.*" --ignore-patterns="**/*.test.*,**/*.spec.*"

# 4. Alternative: Use ripgrep and sed for direct file replacement
rg -0 -l "@infrastructure" src/ | xargs -0 sed -i.bak 's|@infrastructure|@adapters|g'
# Remove backup files after verification
# Remove only migration-created backups (be specific to avoid deleting unrelated .bak files)
find src/ -name '*.bak' -newer .git/HEAD -print0 | xargs -0 rm -f 2>/dev/null || true

# 5. Validation checklist after migration:
# 1. Check tsconfig paths safely
for config in tsconfig.json tsconfig.*.json; do
  [ -f "$config" ] && jq -r '.compilerOptions.paths // {} | keys[] | select(contains("@infrastructure"))' "$config" 2>/dev/null
done || echo "No @infrastructure paths found"

# 2. Search source, test, story and build/config files excluding artifacts
rg -n "@infrastructure" --glob '!*node_modules/*' --glob '!*dist/*' --glob '!*build/*' --glob '*.{config,conf}.{js,ts,json}' -t ts -t tsx -t js -t jsx -t json

# 3. Final TypeScript typecheck to ensure no broken imports
npx tsc --noEmit
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