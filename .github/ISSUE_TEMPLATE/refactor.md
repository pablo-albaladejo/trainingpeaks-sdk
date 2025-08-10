---
name: 🔧 Refactor
about: Request code refactoring or architectural improvements
title: '[REFACTOR] '
labels: ['refactor', 'needs-triage']
assignees: ''
---

## 🔧 Refactor: [Descriptive Title]

### 🎯 Refactor Overview
[Brief description of what needs to be refactored and why]

### 📍 Current Implementation
- **Files affected**: [List of files to refactor]
- **Current approach**: [Description of current implementation]
- **Problems identified**: [Issues with current code]

### 🏗️ Target Architecture
- **Desired approach**: [Description of new implementation]
- **Architecture principles**: [Clean architecture guidelines to follow]
- **Patterns to apply**: [Design patterns to implement]

### 📝 Technical Requirements
- **TypeScript**: Use only types, no interfaces
- **Functional approach**: Use functional patterns, no classes
- **Dependency injection**: Pass dependencies as parameters
- **Separation of concerns**: Maintain clear layer boundaries

### 🔧 Implementation Details
- **Files to modify**: [Specific files and changes]
- **New files to create**: [If applicable]
- **Dependencies to update**: [Package changes needed]
- **Breaking changes**: [Yes/No - if yes, describe]

### 🧪 Testing Requirements
- **Test coverage**: [Ensure all logic is tested]
- **Fixture updates**: [Update test fixtures if needed]
- **Integration tests**: [Verify refactor doesn't break integration]
- **Performance tests**: [If performance is affected]

### 📚 Refactoring Benefits
- **Code quality**: [How this improves code quality]
- **Maintainability**: [Maintenance improvements]
- **Performance**: [Performance gains/losses]
- **Testability**: [Testing improvements]

### ⚠️ Risks and Considerations
- **Breaking changes**: [Potential breaking changes]
- **Migration path**: [How users migrate to new code]
- **Rollback plan**: [How to rollback if needed]
- **Performance impact**: [Performance considerations]

### ✅ Acceptance Criteria
- [ ] Code refactored according to requirements
- [ ] All existing tests pass
- [ ] New tests added for refactored logic
- [ ] Changelogs updated
- [ ] Code follows project standards
- [ ] No new warnings or errors
- [ ] Performance maintained or improved

### 📊 Success Metrics
- **Code complexity**: [Target complexity reduction]
- **Test coverage**: [Maintain or improve coverage]
- **Bundle size**: [Impact on bundle size]
- **Build time**: [Impact on build performance]
