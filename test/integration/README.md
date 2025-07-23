# TrainingPeaks Integration Tests

This directory contains integration tests for the TrainingPeaks client, organized by function and using proper test data fixtures.

## Test Organization

Tests are separated into individual files for each client function:

- `client-creation.integ-test.ts` - Client instantiation and configuration
- `login.integ-test.ts` - Authentication functionality
- `get-user.integ-test.ts` - User data retrieval
- `is-authenticated.integ-test.ts` - Authentication state checking
- `get-user-id.integ-test.ts` - User ID retrieval
- `state-management.integ-test.ts` - Cross-function state consistency

## Test Data Fixtures

### Credentials Fixtures (`src/__fixtures__/credentials.fixture.ts`)

**Simple Data (using Faker):**

- `createValidCredentials()` - Random valid-looking credentials
- `createInvalidCredentials()` - Random invalid credentials
- `createEmptyCredentials()` - Empty username/password
- `createMalformedCredentials()` - Credentials with special characters
- `createLongCredentials()` - Very long credentials
- `createSpecialCharacterCredentials()` - Credentials with special chars

**Complex Data (using Rosie Factory):**

- `CredentialsFactory` - Factory for complex credential objects with additional fields

**Environment-based Data:**

- `getRealCredentials()` - Real credentials from environment variables

**Helper Functions:**

- `createCredentialsForScenario(scenario)` - Get credentials for specific test scenarios
- `getTestCredentials()` - Collection of all credential types

### Response Fixtures (`src/__fixtures__/client-responses.fixture.ts`)

**Simple Data (using Faker):**

- `createSuccessResponse()` - Mock successful response
- `createErrorResponse()` - Mock error response
- `createEmptyResponse()` - Mock empty response

**Complex Data (using Rosie Factory):**

- `UserResponseFactory` - Factory for user response objects
- `ErrorResponseFactory` - Factory for error response objects

**Helper Functions:**

- `createResponseForScenario(scenario)` - Get response for specific scenarios
- `createMockLoginResponse(success)` - Mock login response
- `createMockGetUserResponse(success)` - Mock getUser response

## Environment Setup

### 1. Create Environment File

Copy the example environment file from the root directory:

```bash
cp .env.example .env
```

### 2. Configure Real Credentials

Edit the root `.env` file and add your actual TrainingPeaks test credentials:

```env
TRAININGPEAKS_TEST_USERNAME=your_actual_test_username
TRAININGPEAKS_TEST_PASSWORD=your_actual_test_password
```

### 3. Load Environment Variables

The tests will automatically load environment variables from the root `.env` file.

## Running Tests

### Run All Integration Tests

```bash
npm run test:integration
```

### Run Specific Test File

```bash
npm run test:integration -- login.integ-test.ts
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## Test Patterns

### Success Cases

Tests that verify successful operations using real credentials from environment variables:

```typescript
it('should handle successful login with real credentials', async () => {
  const realCredentials = getRealCredentials();
  const result = await client.login(
    realCredentials.username,
    realCredentials.password
  );

  if (result.success) {
    expect(client.isAuthenticated()).toBe(true);
  } else {
    expect(client.isAuthenticated()).toBe(false);
  }
});
```

### Error Cases

Tests that verify error handling using generated test data:

```typescript
it('should handle invalid credentials', async () => {
  const credentials = createInvalidCredentials();
  const result = await client.login(credentials.username, credentials.password);

  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});
```

### Edge Cases

Tests that verify boundary conditions:

```typescript
it('should handle malformed credentials', async () => {
  const credentials = createMalformedCredentials();
  const result = await client.login(credentials.username, credentials.password);

  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});
```

## Best Practices

1. **Use Fixtures**: Always use fixtures instead of hardcoded test data
2. **Environment Variables**: Use real credentials from environment for success cases
3. **Generated Data**: Use Faker for simple data, Rosie for complex data
4. **Conditional Testing**: Handle both success and failure scenarios in tests
5. **State Consistency**: Verify that client state remains consistent across operations
6. **Independent Tests**: Each test should be independent and not rely on other tests

## Adding New Tests

1. **Create Fixtures**: Add new fixture functions to the appropriate fixture file
2. **Use Existing Patterns**: Follow the established patterns for success/error/edge cases
3. **Environment Variables**: Use `getRealCredentials()` for real integration testing
4. **Generated Data**: Use `createCredentialsForScenario()` for different test scenarios

## Troubleshooting

### Environment Variables Not Loading

- Ensure `.env` file exists in the root directory
- Check that variable names match exactly
- Verify file permissions

### Tests Failing with Real Credentials

- Verify credentials are valid
- Check network connectivity
- Ensure TrainingPeaks API is accessible

### Fixture Import Errors

- Check that fixtures are properly exported from `src/__fixtures__/index.ts`
- Verify import paths are correct
- Ensure all dependencies are installed
