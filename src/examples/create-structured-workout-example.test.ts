/**
 * Tests for Structured Workout Example
 */

import { describe, expect, it } from 'vitest';
import {
  calculateWorkoutMetrics,
  convertToApiFormat,
  createExampleStructuredWorkout,
} from './create-structured-workout-example';

describe('Structured Workout Example', () => {
  it('should create workout structure matching real API call', () => {
    const workoutStructure = createExampleStructuredWorkout();
    const metrics = calculateWorkoutMetrics(workoutStructure);

    // Verify structure matches the real API call
    expect(workoutStructure.structure).toHaveLength(5);
    expect(workoutStructure.getTotalDuration()).toBe(2440); // Total duration from real call
    expect(metrics.totalTimePlanned).toBeCloseTo(2440 / 3600, 3); // Convert seconds to hours
    expect(metrics.tssPlanned).toBeGreaterThan(0);
    expect(metrics.ifPlanned).toBeGreaterThan(0);
    expect(metrics.velocityPlanned).toBeGreaterThan(0);
  });

  it('should convert to API format correctly', () => {
    const workoutStructure = createExampleStructuredWorkout();
    const apiFormat = convertToApiFormat(workoutStructure);

    expect(apiFormat.structure).toHaveLength(5);
    expect(apiFormat.primaryLengthMetric).toBe('duration');
    expect(apiFormat.primaryIntensityMetric).toBe('percentOfThresholdPace');
    expect(apiFormat.primaryIntensityTargetOrRange).toBe('range');
  });

  it('should have correct element types', () => {
    const workoutStructure = createExampleStructuredWorkout();

    const stepElements = workoutStructure.getStepElements();
    const repetitionElements = workoutStructure.getRepetitions();

    expect(stepElements).toHaveLength(3); // 3 step elements
    expect(repetitionElements).toHaveLength(2); // 2 repetition elements
  });

  it('should have correct step counts', () => {
    const workoutStructure = createExampleStructuredWorkout();

    const allSteps = workoutStructure.getAllSteps();
    const activeSteps = workoutStructure.getActiveSteps();
    const restSteps = workoutStructure.getRestSteps();

    expect(allSteps.length).toBeGreaterThan(0);
    expect(activeSteps.length).toBeGreaterThan(0);
    expect(restSteps.length).toBeGreaterThan(0);
  });
});
