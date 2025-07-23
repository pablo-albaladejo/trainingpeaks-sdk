/**
 * Workout Integration Tests
 * Tests the full workout operations flow between client and infrastructure
 */

import {
  StructureElementBuilder,
  WorkoutStepBuilder,
  WorkoutStructureBuilder,
} from '@/infrastructure/services/workout-builder';
import { TrainingPeaksClient } from '@/training-peaks-client';
import { ActivityType, ElementType, IntensityClass, LengthUnit } from '@/types';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('Workout Integration Tests', () => {
  let client: TrainingPeaksClient;
  let isAuthenticated = false;

  beforeEach(async () => {
    // Create client with test configuration
    client = new TrainingPeaksClient();
    process.stdout.write('🔧 Client created successfully\n');

    // Authenticate for workout tests
    if (!isAuthenticated) {
      const username = process.env.TRAININGPEAKS_TEST_USERNAME!;
      const password = process.env.TRAININGPEAKS_TEST_PASSWORD!;

      process.stdout.write(
        `🔐 Attempting authentication with username: ${username}\n`
      );

      try {
        const loginResult = await client.login(username, password);
        process.stdout.write(JSON.stringify(loginResult, null, 2));
        isAuthenticated = true;
        process.stdout.write('✅ Authentication successful\n');
      } catch (error) {
        process.stdout.write(
          `❌ Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`
        );
        console.warn(
          'Authentication failed for workout tests, some tests may be skipped'
        );
      }
    }
  });

  afterEach(async () => {
    // Clean up after each test
    if (client?.isAuthenticated()) {
      await client.logout();
      isAuthenticated = false;
    }
  });

  describe('Structured Workout Upload and Read', () => {
    it('should upload a structured workout and read it back', async () => {
      process.stdout.write('🚀 Starting test...\n');
      process.stdout.write(`isAuthenticated: ${client.isAuthenticated()}\n`);

      // Force test to show logs
      process.stdout.write(
        `🔍 Test is running, authentication status: ${client.isAuthenticated()}\n`
      );

      // Skip if not authenticated
      if (!client.isAuthenticated()) {
        process.stdout.write('❌ Skipping test: not authenticated\n');
        throw new Error('Test skipped: not authenticated');
      }

      process.stdout.write(
        '✅ Authentication successful, proceeding with test...\n'
      );

      const workoutManager = client.getWorkoutManager();
      process.stdout.write('🏋️ Workout manager obtained\n');

      const step7 = new WorkoutStepBuilder()
        .name("3' caminando + gel")
        .duration(3) // 3 minutes
        .intensity(IntensityClass.REST)
        .target(60, 70)
        .build();

      const stepElement = new StructureElementBuilder()
        .type(ElementType.STEP)
        .length(3, LengthUnit.MINUTE)
        .steps([step7])
        .timeRange(1600, 1780) // 3 minutes = 180 seconds
        .build();

      const workoutStructure = new WorkoutStructureBuilder()
        .addElement(stepElement)
        .build();

      process.stdout.write('📤 Uploading structured workout...\n');

      // Upload the structured workout using the current interface
      const uploadResult = await workoutManager.createStructuredWorkout({
        name: 'Test Workout',
        description: 'Test workout created during integration testing',
        structure: workoutStructure,
        targetDate: new Date('2025-07-12T00:00:00'),
        activityType: ActivityType.RUN,
        estimatedDuration: 50, // ~50 minutes
        customFields: {
          athleteId: 5818494, // Using the provided athlete ID
          workoutTypeValueId: 3,
          tssPlanned: 72.8,
          ifPlanned: 0.89,
          velocityPlanned: 3.1783333333333332,
        },
      });

      process.stdout.write(
        `📤 Upload result: ${JSON.stringify(uploadResult, null, 2)}\n`
      );

      // Assert upload was successful
      expect(uploadResult.success).toBe(true);
      expect(uploadResult.workoutId).toBeDefined();
      expect(uploadResult.workoutId).not.toBe('');

      process.stdout.write('📖 Reading workout back...\n');

      // Read the workout back
      const readResult = await workoutManager.getWorkout(
        uploadResult.workoutId
      );

      process.stdout.write(
        `📖 Read result: ${JSON.stringify(readResult, null, 2)}\n`
      );

      // Assert read was successful
      expect(readResult).toBeDefined();
      expect(readResult?.name).toBeDefined();
      expect(readResult?.description).toBeDefined();

      process.stdout.write(
        '✅ Structured workout upload and read test completed successfully\n'
      );
    }, 60000);
  });
});
