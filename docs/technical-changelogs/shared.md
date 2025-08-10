---
pr: null  # No PR for initial setup
date: "2024-08-10"
author: "System Setup"
related_issues: "Technical documentation standardization"
breaking_change: false
migration_guide: "N/A"
scope: "shared"
component: "utilities"
links:
  - "https://github.com/pablo-albaladejo/trainingpeaks-sdk/issues/documentation"
---

# Shared Utilities Technical Changelog

This changelog tracks shared utilities and cross-cutting concerns. **Cross-cutting concerns** include logging, validation, error handling, request ID generation, session utilities, and other functionality that spans multiple architectural layers.

## [2024-08-10] - Initial Structure

### Added
- Created technical changelog for shared utilities and cross-cutting concerns
- Established format for documenting common utilities, types, and helper functions
- Centralized tracking approach for better visibility across the codebase

### Why
- Track evolution of shared utilities and their impact across layers
- Document cross-cutting concern decisions (logging, validation, error utilities, etc.)
- Provide context for utility function design and implementation

### Impact
- Better understanding of shared utility evolution
- Improved documentation of cross-layer dependencies
- Enhanced context for utility refactoring and optimization

### Trade-offs
- Additional documentation overhead for utility changes
- Centralized tracking approach chosen for better visibility across the codebase

## [2024-08-10] - Mandatory Label System Implementation

### Added
- **MANDATORY labeling requirements** for all GitHub issues and PRs
- New `github-labels-rule.mdc` Cursor rule with comprehensive labeling patterns
- Automated label validation logic for issue creation workflow
- Script `scripts/fix-issue-labels.sh` for bulk label application
- Component labels: `component: auth`, `component: client`, `component: api`, `component: workouts`
- Architecture labels: `architecture: domain`, `architecture: application`, `architecture: adapters`, `architecture: infrastructure`
- Updated issue creation workflow with mandatory label validation

### Changed
- **Updated CLAUDE.md**: Added mandatory labeling requirements to issue creation workflow
- **Updated workflow-issue-creation.mdc**: Added mandatory label generation logic with validation
- **Updated README.md**: Documented new `github-labels-rule.mdc` with priority indicators
- Applied proper labels to all 30 existing open issues (issues #25-#54)

### Why
- **Project Organization**: Enable accurate filtering and categorization of issues
- **Sprint Planning**: Support effort estimation and priority-based planning
- **Automated Workflows**: Enable label-triggered automation and routing
- **Metrics and Reporting**: Generate consistent project analytics
- **Quality Gates**: Prevent unlabeled issues from disrupting project organization

### Impact
- **Breaking Change**: All new issues MUST have proper labels (type, priority, effort minimum)
- **Workflow Enhancement**: Issue creation now validates and requires appropriate labels
- **Project Standards**: Consistent labeling across all project issues and PRs
- **Team Productivity**: Better issue filtering and sprint planning capabilities

### Technical Implementation
```typescript
// Required labels (3 minimum for issues):
const requiredLabels = {
  type: ['type: enhancement', 'type: bug', 'type: refactor', 'type: documentation', 'type: testing', 'type: performance', 'type: security', 'type: infrastructure'],
  priority: ['priority: critical', 'priority: high', 'priority: medium', 'priority: low'],
  effort: ['effort: small', 'effort: medium', 'effort: large', 'effort: epic']
};
```

### Enforcement
- **Cursor Rules**: `github-labels-rule.mdc` enforces labeling standards
- **Issue Creation Workflow**: Validates labels before creation
- **Bulk Correction Script**: `scripts/fix-issue-labels.sh` applied to existing issues
- **Quality Gates**: Contract testing and other workflows require proper labeling

### Migration Guide
- **Existing Issues**: All issues (#25-#54) have been retroactively labeled
- **New Issues**: Must use issue creation workflow with label validation  
- **Component Labels**: Use `component:` prefix for specific functionality areas
- **Architecture Labels**: Use `architecture:` prefix for Clean Architecture layers

### Contract Testing Integration
- Added to issue #54 as mandatory requirement for API endpoint changes
- Contract tests (`npm run test:contract`) now part of quality gates
- Schema validation requirements integrated with labeling system