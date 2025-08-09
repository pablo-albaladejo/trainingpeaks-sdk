# TrainingPeaks SDK Examples

This directory contains example implementations demonstrating how to use the TrainingPeaks SDK.

## Prerequisites

1. **Environment Variables**: Create a `.env` file in the project root with your TrainingPeaks credentials:

```env
TRAININGPEAKS_TEST_USERNAME=your_username
TRAININGPEAKS_TEST_PASSWORD=your_password
TRAININGPEAKS_TEST_ATHLETE_ID=your_athlete_id  # Optional for get-workouts-list example
```

**⚠️ Important Security Notes**: 
- **Never commit credentials**: Always add all environment files to your `.gitignore` to prevent committing sensitive credentials to version control.
- **Use environment variables**: Never hardcode credentials directly in your source code.
- **Limit access**: Only grant the minimum necessary permissions to accounts used with the SDK.
- **Rotate credentials**: Regularly update your TrainingPeaks passwords and API credentials.
- **Secure storage**: Store production credentials in secure secret management systems, not in plain text files.
- **Debug logs security**: Debug logs may contain sensitive request details such as tokens and Authorization headers. Redact these secrets from debug logs and never share such logs publicly to maintain security.

**Recommended .gitignore entries:**
```gitignore
# Environment files
.env
.env.local
.env.development
.env.production
.env.*.local

# Keep example file (with placeholder values only)
!.env.example
```

**Create a safe .env.example file:** Commit a sanitized `.env.example` file with placeholder values and no real secrets for safe sharing and onboarding.

2. **Build the SDK**: Make sure the SDK is built before running examples:

```bash
npm run build
```

## Loading Environment Variables

Since tsx does not auto-load .env files, you have two options:

**Option 1: Auto-load with tsx**
```bash
npx tsx -r dotenv/config src/example/login.ts
npx tsx -r dotenv/config src/example/get-workouts-list.ts
```

**Option 2: Export variables manually**
```bash
export TRAININGPEAKS_TEST_USERNAME=your_username
export TRAININGPEAKS_TEST_PASSWORD=your_password
export TRAININGPEAKS_TEST_ATHLETE_ID=your_athlete_id

# Then run examples normally
npx tsx src/example/login.ts
npx tsx src/example/get-workouts-list.ts
```

## Available Examples

### 1. Login Example (`login.ts`)

Demonstrates basic authentication with TrainingPeaks.

**Usage:**
```bash
npx tsx src/example/login.ts
```

**What it does:**
- Loads credentials from environment variables
- Creates SDK instance with debug logging
- Performs login and displays the session information
- Shows curl commands for API requests (when debug is enabled)

### 2. Get Workouts List Example (`get-workouts-list.ts`)

Demonstrates how to retrieve workouts for an athlete between specific dates.

**Usage:**
```bash
npx tsx src/example/get-workouts-list.ts
```

**What it does:**
- Loads credentials and athlete ID from environment variables
- Logs in to TrainingPeaks
- Retrieves workouts for the specified date range (defaults to 2025-04-07 to 2025-04-08)
- Displays detailed workout information
- Logs out when complete

**Example Output:**
```
Using credentials for user: your_username
Getting workouts for athlete ID: [REDACTED]

🔐 Logging in to TrainingPeaks...
✅ Login successful

📋 Getting workouts from 2025-04-07 to 2025-04-08...
✅ Workouts retrieved successfully
📊 Found 1 workouts

🏋️  Workout 1:
   ID: [REDACTED]
   Title: Strength
   Date: 2025-04-07T00:00:00
   Start Time: 2025-04-07T19:43:44
   Planned Start: Not specified
   Type ID: 9
   Code: No code
   Is OR: false

🚪 Logging out...
✅ Logout successful

🎉 Example completed successfully!
```

## Customizing Examples

### Modifying Date Range

In `get-workouts-list.ts`, you can modify the date range:

```typescript
const startDate = '2025-01-01'; // Your start date
const endDate = '2025-01-31';   // Your end date
```

### Using Different Athlete ID

Set the `TRAININGPEAKS_TEST_ATHLETE_ID` environment variable, or modify the default in the code:

```typescript
const athleteId = process.env.TRAININGPEAKS_TEST_ATHLETE_ID;
if (!athleteId) {
  throw new Error('TRAININGPEAKS_TEST_ATHLETE_ID environment variable is required');
}
```

### Enabling/Disabling Debug Logging

Debug logging shows the actual HTTP requests (including curl commands):

```typescript
const sdk = createTrainingPeaksSdk({
  debug: {
    enabled: true,    // Set to false to disable debug logging
    level: 'debug',   // Options: 'debug', 'info', 'warn', 'error'
  },
});
```

**Security Note:** Debug logs in this example have been sanitized to redact sensitive headers like `Authorization` and `Set-Cookie`. In production environments, ensure that debug logging is disabled or properly configured to avoid exposing sensitive information.

## Error Handling

All examples include comprehensive error handling:

- Missing environment variables
- Authentication failures
- API request failures
- Network errors

If an example fails, check:

1. Your credentials are correct and set in the `.env` file
2. Your TrainingPeaks account has access to the specified athlete ID
3. The date range contains workouts
4. Your network connection is working

## API Endpoint Information

The get-workouts-list example uses the TrainingPeaks API endpoint:
- **URL**: `/fitness/v6/athletes/{athleteId}/workouts/{startDate}/{endDate}`
- **Method**: GET
- **Authentication**: Bearer token (handled automatically by the SDK)
- **Date Format**: YYYY-MM-DD

## Contributing

When adding new examples:

1. Follow the existing code style and structure
2. Include comprehensive error handling
3. Add documentation in this README
4. Use environment variables for sensitive data
5. Include the `/* eslint-disable no-console */` comment at the top