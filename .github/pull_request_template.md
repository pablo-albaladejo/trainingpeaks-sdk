## 📝 Pull Request Description

### 🎯 Overview

[Brief description of what this PR accomplishes]

### 🔗 Related Issues

Closes #[issue-number]
Related to #[issue-number]

### 👥 Contributor Type

Select the appropriate contributor label for this PR:

- [ ] `good first issue` - Great for newcomers
- [ ] `help wanted` - Extra attention is needed  
- [ ] `first-time contributor` - First contribution to this repository
- [ ] `core contributor` - Regular contributor to this project

### 📋 Changes Made

- [ ] [Specific change 1]
- [ ] [Specific change 2]
- [ ] [Specific change 3]

### 🏗️ Technical Details

- **Architecture layer**: [Domain/Application/Adapters]
- **Files modified**: [List of modified files]
- **New files created**: [List of new files]
- **Breaking changes**: [Yes/No - if yes, describe]

### 🧪 Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated (if applicable)
- [ ] All tests pass
- [ ] Test coverage maintained/improved
- [ ] Fixtures updated (if applicable)

**Coverage Changes**:
- **Overall coverage**: [Current %] → [New %] (Δ [+/-]%)
- **Statements**: [Current %] → [New %] (Δ [+/-]%)
- **Branches**: [Current %] → [New %] (Δ [+/-]%)
- **Functions**: [Current %] → [New %] (Δ [+/-]%)

**Coverage Reports** (sources and reviewer access):
- [ ] Codecov report: [Link to Codecov PR comment/dashboard - generated from coverage files uploaded during CI]
- [ ] CI artifacts: [Link to CI coverage report artifacts - HTML reports from npm run test:coverage, verify reviewer access]
- [ ] **Fallback**: Use CI provider artifacts (not repository commits) with 30-day minimum retention, ensure reviewer access, redact sensitive data before upload
- [ ] Coverage thresholds: **Statements ≥ X%**, **Branches ≥ Y%**, **Functions ≥ Z%**, **Lines ≥ W%** [PASS/FAIL - replace X,Y,Z,W with actual thresholds from vitest.config.ts]
- [ ] **Vitest coverage output**: Run command and paste text output in collapsible block (adjust for pnpm/yarn as needed):

    ```bash
    npm run test:coverage -- --coverage.reporter=text --coverage.reporter=html
    ```

    <details>
    <summary>Coverage Report</summary>
    
    ```
    [Paste coverage text output here - shows coverage summary and uncovered lines]
    ```
    
    </details>
    
    Note: Verify the repository defines a test:coverage script and Vitest coverage thresholds in package.json and vitest config

### 📚 Documentation

- [ ] Code comments added/updated
- [ ] README updated (if applicable)
- [ ] API documentation updated (if applicable)
- [ ] Changelogs updated (both root and folder level)

### 🔧 Code Quality

- [ ] Code follows project standards
- [ ] Code follows [Clean Architecture patterns](.cursor/rules/clean-architecture.mdc)
- [ ] TypeScript standards followed per [TypeScript guide](.cursor/rules/typescript.mdc)
- [ ] ESLint passes
- [ ] Prettier formatting applied
- [ ] No console.log statements (logger used instead)

### ⚠️ Breaking Changes

[If applicable, describe breaking changes and migration guide]

### 📊 Performance Impact

- **Bundle size**: [Impact on bundle size]
- **Performance**: [Performance improvements/degradation]
- **Memory usage**: [Memory impact]

### 🔍 Review Checklist

- [ ] Code is readable and well-structured
- [ ] Error handling is appropriate
- [ ] Logging is appropriate
- [ ] Security considerations addressed
- [ ] No hardcoded values
- [ ] Dependencies are appropriate

### 🚀 Deployment Notes

[Any special deployment considerations]

**Rollback Plan**:
- **Rollback strategy**: [How to rollback this change if needed]
- **Rollback commands**: [Specific commands or steps for rollback]
- **Recovery time**: [Expected time to complete rollback]
- **Risk assessment**: [Risk level of rollback procedure]

### 📝 Additional Notes

[Any other information reviewers should know]
