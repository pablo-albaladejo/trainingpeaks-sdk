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
- [ ] **Coverage Artifacts Fallback**: Upload coverage via CI provider using structured approach:
    
    ```yaml
    - name: Upload Coverage Artifacts
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: coverage-reports-${{ github.run_id }}
        path: |
          coverage/**
          **/coverage-final.json
          **/*.lcov
          !**/node_modules/**
          !**/dist/**
          !**/build/**
        if-no-files-found: ignore
        retention-days: 30
        compression-level: 6
    ```
    
    **Permissions & Access:**
    - [ ] Reviewers have repository access; fork PRs don't require extra tokens for upload-artifact, but only repo/org members can download artifacts in private repos
    - [ ] Set `permissions:` block at workflow-level (top of YAML) or job-level (`jobs.<job>.permissions`)
    - [ ] Jobs downloading artifacts include `actions: read`; security scanning jobs add `security-events: write`
    - [ ] Third-party tools (e.g., Codecov) may require additional tokens or org-specific scopes
    
    ```yaml
    # Example workflow-level or job-level permissions (not inside steps)
    permissions:
      actions: read
      contents: read
      security-events: write  # For SARIF uploads
      # id-token: write  # Only if using OIDC
    ```
    
    **Redaction & Scope:**
    - [ ] Coverage HTML may include inlined source code and local absolute paths; verify nothing sensitive is embedded
    - [ ] Use non-HTML reporters by default: configure Vitest with `text-summary`, `lcov`, `json-summary` reporters and set `reportsDirectory` with `all: true`
    - [ ] Only add `html` reporter locally or temporarily when reviewers explicitly request it
    - [ ] Run secrets scan (e.g., gitleaks or GitHub secret scanning) on artifacts before upload
    - [ ] Align exclude patterns (node_modules/dist/build) with artifact excludes
    - [ ] Exclude `.env`, screenshots, logs with secrets/PII/internal hostnames
    - [ ] Mask sensitive data before upload
    
    **Verification in PR:**
    - [ ] Paste Actions run URL (format: https://github.com/<org>/<repo>/actions/runs/<run_id>)
    - [ ] Paste exact artifact name (e.g., coverage-reports-<run_id>)
    - [ ] Include artifact size and file count to catch large uploads
    - [ ] Verify artifacts within suggested size budget (~25MB max) or explain necessity for larger uploads
    - [ ] Confirm retention aligns with repository policy (30+ days)
    
    ```bash
    # Script to locate coverage artifact workflows (rg and grep variants)
    rg -l "upload-artifact" .github/workflows/ | xargs rg -l "coverage"
    grep -R -i -l "upload-artifact" .github/workflows/ | xargs -r grep -R -i -l "coverage" || true
    ```
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
