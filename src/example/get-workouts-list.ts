import { config } from 'dotenv';

import { createTrainingPeaksSdk } from '@/sdk/training-peaks-sdk';

// Load environment variables from .env file
// This will automatically look for .env in the current working directory
config();

/**
 * Example implementation for getting workouts list using the TrainingPeaks SDK
 *
 * Set the following environment variables in your .env file:
 * - TRAININGPEAKS_TEST_USERNAME: Your TrainingPeaks username
 * - TRAININGPEAKS_TEST_PASSWORD: Your TrainingPeaks password
 * - TRAININGPEAKS_TEST_ATHLETE_ID: The athlete ID to get workouts for (optional, defaults to example ID)
 *
 * Or set them directly in your shell:
 * export TRAININGPEAKS_TEST_USERNAME=your_username
 * export TRAININGPEAKS_TEST_PASSWORD=your_password
 * export TRAININGPEAKS_TEST_ATHLETE_ID=your_athlete_id
 */
const main = async (): Promise<void> => {
  try {
    // Get credentials from environment variables
    const username = process.env.TRAININGPEAKS_TEST_USERNAME;
    const password = process.env.TRAININGPEAKS_TEST_PASSWORD;
    const athleteId = process.env.TRAININGPEAKS_TEST_ATHLETE_ID; // Optional - will use current user's ID if not provided

    // Validate that credentials are provided
    if (!username || !password) {
      throw new Error(
        'Missing credentials. Please set TRAININGPEAKS_TEST_USERNAME and TRAININGPEAKS_TEST_PASSWORD environment variables in your .env file or shell environment.'
      );
    }

    console.log('Using credentials for user:', username);
    if (athleteId) {
      console.log('Getting workouts for athlete ID:', athleteId);
    } else {
      console.log(
        'Getting workouts for current user (athlete ID will be determined from session)'
      );
    }

    // Create SDK instance with debug logging to see curl commands
    const sdk = createTrainingPeaksSdk({
      debug: {
        enabled: true,
        level: 'debug',
      },
    });

    // First, login to TrainingPeaks
    console.log('\n🔐 Logging in to TrainingPeaks...');
    await sdk.login({ username, password });
    console.log('✅ Login successful');

    // Get workouts list for the specified date range
    const startDate = '2025-01-01'; // Example start date
    const endDate = '2025-12-31'; // Example end date

    console.log(`\n📋 Getting workouts from ${startDate} to ${endDate}...`);
    const workouts = await sdk.getWorkoutsList(
      athleteId ? { athleteId, startDate, endDate } : { startDate, endDate }
    );

    console.log('✅ Workouts retrieved successfully');
    console.log(`📊 Found ${workouts.length} workouts\n`);

    // Display workout information
    if (workouts.length > 0) {
      workouts.forEach((workout, index) => {
        console.log(`🏋️  Workout ${index + 1}:`);
        console.log(`   ID: ${workout.workoutId}`);
        console.log(`   Title: ${workout.title}`);
        console.log(`   Date: ${workout.workoutDay}`);
        console.log(`   Start Time: ${workout.startTime || 'Not specified'}`);
        console.log(
          `   Planned Start: ${workout.startTimePlanned || 'Not specified'}`
        );
        console.log(`   Type ID: ${workout.workoutTypeValueId}`);
        console.log(`   Code: ${workout.code || 'No code'}`);
        console.log(`   Is OR: ${workout.isItAnOr}`);
        console.log('');
      });
    } else {
      console.log('📭 No workouts found for the specified date range.');
    }

    // Logout when done
    console.log('🚪 Logging out...');
    await sdk.logout();
    console.log('✅ Logout successful');

    console.log('\n🎉 Example completed successfully!');
  } catch (error) {
    // Ensure error is properly typed before re-throwing
    if (error instanceof Error) {
      throw error;
    } else {
      // Wrap non-Error objects and preserve original as cause
      const wrappedError = new Error(String(error));
      (wrappedError as Error & { cause?: unknown }).cause = error;
      throw wrappedError;
    }
  }
};

// Run the example
main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
