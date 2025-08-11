---
name: 🧪 Testing
about: Request testing improvements or new test coverage
title: '[TEST] '
labels: ['testing', 'needs-triage']
assignees: ''
---

## 🧪 Testing: [Descriptive Title]

### 🎯 Testing Overview
[Brief description of what testing needs to be implemented or improved]

### 📋 Testing Requirements
- **Type**: [Unit tests, integration tests, E2E tests, performance tests]
- **Scope**: [What specific functionality to test]
- **Coverage target**: [Desired test coverage percentage]

### 🏗️ Technical Requirements
- **Testing framework**: [Vitest]
- **Test utilities**: [Fixtures, builders, mocks]
- **Environment**: [Node.js, browser, etc.]
- **Dependencies**: [Testing libraries needed]

### 📝 Implementation Details
- **Files to test**: [Specific files and functions]
- **Test scenarios**: [List of test cases to cover]
- **Fixtures needed**: [Test data requirements]
- **Mock requirements**: [External dependencies to mock]

### 🔧 Testing Standards
- **Fixture pattern**: Use Rosie Factory for test data
- **Test isolation**: Each test should be independent
- **Naming convention**: Test files named after function being tested
- **Coverage**: All logic paths must be tested

### 🧪 Test Structure
- **Test organization**: [How to organize tests]
- **Setup/teardown**: [Test lifecycle requirements]
- **Data management**: [How to handle test data]
- **Assertions**: [What to assert and how]

### 📚 Test Scenarios
- **Happy path**: [Normal operation scenarios]
- **Edge cases**: [Boundary conditions]
- **Error cases**: [Error handling scenarios]
- **Performance**: [Performance test scenarios]

### ✅ Acceptance Criteria
- [ ] All specified test scenarios implemented
- [ ] Test coverage meets target requirements
- [ ] Tests pass consistently
- [ ] Fixtures properly configured
- [ ] No flaky tests
- [ ] Changelogs updated if applicable

### 🔍 Quality Requirements
- **Reliability**: [Tests should be stable]
- **Maintainability**: [Easy to update and maintain]
- **Performance**: [Tests run in reasonable time]
- **Clarity**: [Tests are easy to understand]

### 📊 Success Metrics
- **Coverage**: [Test coverage percentage]
- **Reliability**: [Test pass rate]
- **Performance**: [Test execution time]
- **Maintainability**: [Ease of test updates]

### 🚀 Additional Considerations
- **CI/CD integration**: [How tests integrate with pipeline]
- **Parallel execution**: [Test parallelization requirements]
- **Debugging**: [How to debug failing tests]
- **Documentation**: [Test documentation requirements]
