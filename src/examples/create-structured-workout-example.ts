/**
 * Example: Creating a Structured Workout
 * Demonstrates how to use the new Zod-based value objects
 * to create the structure from the real API call
 */

import {
  WorkoutLength,
  WorkoutStep,
  WorkoutStructure,
  WorkoutStructureElement,
  WorkoutTarget,
} from '@/domain/value-objects/workout-structure';

/**
 * Example: Recreate the structure from the real API call
 * This matches the structure sent in the curl request
 */
export function createExampleStructuredWorkout() {
  // 1. Create the first repetition element (4x30" progresivo + 40" suave)
  const repetition1Steps = [
    // 30" progresivo
    WorkoutStep.create(
      '30" progresivo',
      WorkoutLength.create(30, 'second'),
      [WorkoutTarget.create(90, 100)],
      'active'
    ),
    // 40" suave
    WorkoutStep.create(
      '40" suave',
      WorkoutLength.create(40, 'second'),
      [WorkoutTarget.create(70, 80)],
      'rest'
    ),
  ];

  const repetition1Element = WorkoutStructureElement.create(
    'repetition',
    WorkoutLength.create(4, 'repetition'),
    repetition1Steps,
    0, // begin
    280 // end (4 * (30 + 40) = 280)
  );

  // 2. Create the second repetition element (4x2' ritmo + 90" rec + 1' más rápido + 60" rec)
  const repetition2Steps = [
    // 2' ritmo
    WorkoutStep.create(
      "2' ritmo",
      WorkoutLength.create(120, 'second'),
      [WorkoutTarget.create(90, 95)],
      'active'
    ),
    // 90" rec
    WorkoutStep.create(
      '90" rec',
      WorkoutLength.create(90, 'second'),
      [WorkoutTarget.create(65, 75)],
      'rest'
    ),
    // 1' más rápido
    WorkoutStep.create(
      "1' más rápido",
      WorkoutLength.create(60, 'second'),
      [WorkoutTarget.create(95, 105)],
      'active'
    ),
    // 60" rec
    WorkoutStep.create(
      '60" rec',
      WorkoutLength.create(60, 'second'),
      [WorkoutTarget.create(65, 75)],
      'rest'
    ),
  ];

  const repetition2Element = WorkoutStructureElement.create(
    'repetition',
    WorkoutLength.create(4, 'repetition'),
    repetition2Steps,
    280, // begin
    1600 // end (280 + 4 * (120 + 90 + 60 + 60) = 280 + 4 * 330 = 280 + 1320 = 1600)
  );

  // 3. Create the step element (3' caminando + gel)
  const step1Element = WorkoutStructureElement.create(
    'step',
    WorkoutLength.create(180, 'second'),
    [
      WorkoutStep.create(
        "3' caminando + gel",
        WorkoutLength.create(180, 'second'),
        [WorkoutTarget.create(60, 70)],
        'rest'
      ),
    ],
    1600, // begin
    1780 // end (1600 + 180)
  );

  // 4. Create the step element (1' progresivo)
  const step2Element = WorkoutStructureElement.create(
    'step',
    WorkoutLength.create(60, 'second'),
    [
      WorkoutStep.create(
        "1' progresivo",
        WorkoutLength.create(60, 'second'),
        [WorkoutTarget.create(80, 95)],
        'active'
      ),
    ],
    1780, // begin
    1840 // end (1780 + 60)
  );

  // 5. Create the step element (10' suave)
  const step3Element = WorkoutStructureElement.create(
    'step',
    WorkoutLength.create(600, 'second'),
    [
      WorkoutStep.create(
        "10' suave",
        WorkoutLength.create(600, 'second'),
        [WorkoutTarget.create(70, 80)],
        'coolDown'
      ),
    ],
    1840, // begin
    2440 // end (1840 + 600)
  );

  // 6. Create the polyline (from the real API call)
  const polyline = [
    [0.0, 0.0],
    [0.0, 1.0],
    [0.024194, 1.0],
    [0.024194, 0.0],
    [0.056452, 0.0],
    [0.056452, 1.0],
    [0.153226, 1.0],
    [0.153226, 0.0],
    [0.225806, 0.0],
    [0.225806, 1.0],
    [0.274194, 1.0],
    [0.274194, 0.0],
    [0.322581, 0.0],
    [0.467742, 0.0],
    [0.467742, 1.0],
    [0.516129, 1.0],
    [0.516129, 0.0],
    [0.516129, 0.696],
    [1.0, 0.696],
    [1.0, 0.0],
  ];

  // 7. Create the complete workout structure
  const workoutStructure = WorkoutStructure.create(
    [
      repetition1Element,
      repetition2Element,
      step1Element,
      step2Element,
      step3Element,
    ],
    polyline,
    'duration',
    'percentOfThresholdPace',
    'range'
  );

  return workoutStructure;
}

/**
 * Example: Calculate metrics from the structure
 */
export function calculateWorkoutMetrics(structure: WorkoutStructure) {
  const totalDuration = structure.getTotalDuration();
  const totalDurationHours = totalDuration / 3600;
  const averageIntensity = structure.calculateAverageIntensity();

  // Calculate TSS (Training Stress Score)
  // TSS = (duration in hours) * (intensity factor) * 100
  const intensityFactor = averageIntensity / 100; // Normalize to 0-1
  const tss = totalDurationHours * intensityFactor * 100;

  // Calculate IF (Intensity Factor)
  const ifValue = intensityFactor;

  // Calculate velocity (assuming running, average pace around 4:00/km)
  const velocityMps = 4.17; // meters per second (4:00/km pace)

  return {
    totalTimePlanned: totalDurationHours,
    tssPlanned: Math.round(tss * 10) / 10, // Round to 1 decimal
    ifPlanned: Math.round(ifValue * 100) / 100, // Round to 2 decimals
    velocityPlanned: Math.round(velocityMps * 1000) / 1000, // Round to 3 decimals
    totalDurationSeconds: totalDuration,
    averageIntensity,
    stepCount: structure.getAllSteps().length,
    repetitionCount: structure.getRepetitions().length,
    activeStepCount: structure.getActiveSteps().length,
    restStepCount: structure.getRestSteps().length,
  };
}

/**
 * Example: Convert to API format (replaces toApiFormat)
 */
export function convertToApiFormat(structure: WorkoutStructure) {
  return structure.toData();
}

/**
 * Example: Usage demonstration
 */
export function demonstrateUsage() {
  console.log('🏃‍♂️ Creating structured workout...');

  // Create the workout structure
  const workoutStructure = createExampleStructuredWorkout();

  // Calculate metrics
  const metrics = calculateWorkoutMetrics(workoutStructure);

  // Convert to API format
  const apiFormat = convertToApiFormat(workoutStructure);

  console.log('✅ Workout structure created successfully!');
  console.log('📊 Metrics:', metrics);
  console.log('🔗 Structure elements:', workoutStructure.structure.length);
  console.log(
    '⏱️ Total duration:',
    workoutStructure.getTotalDuration(),
    'seconds'
  );
  console.log(
    '🎯 Average intensity:',
    workoutStructure.calculateAverageIntensity()
  );

  return {
    structure: workoutStructure,
    metrics,
    apiFormat,
  };
}

// Example usage - Tests moved to separate test file
