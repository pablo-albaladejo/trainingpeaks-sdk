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
        await client.login(username, password);
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

      // Create a simple structured workout using the builder
      const warmupStep = new WorkoutStepBuilder()
        .name('Warmup')
        .duration(10)
        .intensity(IntensityClass.WARM_UP)
        .target(120, 140)
        .build();

      const intervalStep = new WorkoutStepBuilder()
        .name('Interval')
        .duration(5)
        .intensity(IntensityClass.ACTIVE)
        .target(160, 180)
        .build();

      const recoveryStep = new WorkoutStepBuilder()
        .name('Recovery')
        .duration(3)
        .intensity(IntensityClass.REST)
        .target(120, 140)
        .build();

      const cooldownStep = new WorkoutStepBuilder()
        .name('Cooldown')
        .duration(5)
        .intensity(IntensityClass.COOL_DOWN)
        .target(120, 140)
        .build();

      const workoutElement = new StructureElementBuilder()
        .type(ElementType.STEP)
        .length(23, LengthUnit.MINUTE) // Total duration: 10 + 5 + 3 + 5 = 23 minutes
        .steps([warmupStep, intervalStep, recoveryStep, cooldownStep])
        .timeRange(0, 23 * 60) // 23 minutes in seconds
        .build();

      const workoutStructure = new WorkoutStructureBuilder()
        .addElement(workoutElement)
        .build();

      process.stdout.write('📤 Uploading structured workout...\n');

      // Upload the structured workout
      const uploadResult = await workoutManager.createStructuredWorkout({
        name: 'Integration Test Structured Workout',
        description: 'Test workout created during integration testing',
        activityType: ActivityType.RUN,
        targetDate: new Date(),
        structure: workoutStructure,
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
