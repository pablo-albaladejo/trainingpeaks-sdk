import { config } from 'dotenv';

import { createTrainingPeaksSdk } from '@/sdk/training-peaks-sdk';

// Load environment variables from .env file
// This will automatically look for .env in the current working directory
config();

/**
 * Example login implementation using environment variables for credentials
 *
 * Set the following environment variables in your .env file:
 * - TRAININGPEAKS_TEST_USERNAME: Your TrainingPeaks username
 * - TRAININGPEAKS_TEST_PASSWORD: Your TrainingPeaks password
 *
 * Or set them directly in your shell:
 * export TRAININGPEAKS_TEST_USERNAME=your_username
 * export TRAININGPEAKS_TEST_PASSWORD=your_password
 */
const main = async (): Promise<void> => {
  try {
    // Get credentials from environment variables
    const username = process.env.TRAININGPEAKS_TEST_USERNAME;
    const password = process.env.TRAININGPEAKS_TEST_PASSWORD;

    // Validate that credentials are provided
    if (!username || !password) {
      throw new Error(
        'Missing credentials. Please set TRAININGPEAKS_TEST_USERNAME and TRAININGPEAKS_TEST_PASSWORD environment variables in your .env file or shell environment.'
      );
    }

    console.log('Using credentials for user:', username);

    // Create SDK instance with debug logging to see curl commands
    const sdk = createTrainingPeaksSdk({
      debug: {
        enabled: true,
        level: 'debug',
      },
    });

    // Perform login
    const result = await sdk.login({ username, password });

    console.log('Login successful:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Login failed:', error);
    process.exit(1);
  }
};

// Run the example
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
