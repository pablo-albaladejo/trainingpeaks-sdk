# Test Files Directory

This directory contains sample workout files for integration testing.

## File Types

- **GPX**: GPS Exchange Format files for GPS-based workouts
- **TCX**: Training Center XML files from Garmin devices
- **FIT**: Flexible and Interoperable Data Transfer files

## Usage

These files are used by the integration tests to validate actual file upload functionality. The integration tests create test files dynamically, but you can also place real workout files here for more comprehensive testing.

## Environment Setup

Before running integration tests, ensure you have:

1. Copied `.env.example` to `.env`
2. Filled in your TrainingPeaks credentials
3. Configured the test environment variables

## Running Integration Tests

```bash
# Run only integration tests
npm run test:integration

# Run all tests (unit + integration)
npm run test:all

# Watch integration tests
npm run test:watch:integration
```

## Security

**⚠️ Important**: Never commit real credentials or sensitive workout data to version control. Use test accounts and anonymized data for integration testing.
