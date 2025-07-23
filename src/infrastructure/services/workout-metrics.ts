/**
 * Workout Metrics Service Implementation
 * Provides concrete implementations for workout metrics calculations
 */

import type {
  CalculatePlannedMetrics,
  PlannedWorkoutMetrics,
} from '@/application/services/workout-metrics';
import type { WorkoutStructure } from '@/domain';
import { calculateWorkoutDurationFromStructure } from '@/infrastructure/services/workout-business-logic';
import { IntensityClass } from '@/types';

/**
 * Calculate average intensity from structure
 */
const calculateAverageIntensityFromStructure = (
  structure: WorkoutStructure
): number => {
  const allSteps = structure.structure.flatMap((element) => element.steps);
  const activeSteps = allSteps.filter(
    (step) => step.intensityClass === IntensityClass.ACTIVE
  );

  if (activeSteps.length === 0) return 0;

  const totalIntensity = activeSteps.reduce((sum, step) => {
    const avgTarget =
      step.targets.reduce((targetSum, target) => {
        return targetSum + (target.minValue + target.maxValue) / 2;
      }, 0) / step.targets.length;
    return sum + avgTarget;
  }, 0);

  return totalIntensity / activeSteps.length;
};

/**
 * Get rest steps count from structure
 */
const getRestStepsCount = (structure: WorkoutStructure): number => {
  return structure.structure
    .flatMap((element) => element.steps)
    .filter((step) => step.intensityClass === IntensityClass.REST).length;
};

/**
 * Calculate planned workout metrics from structure
 */
export const calculatePlannedMetrics: CalculatePlannedMetrics = (
  structure: WorkoutStructure
): PlannedWorkoutMetrics => {
  const totalDurationSeconds = calculateWorkoutDurationFromStructure(structure);
  const totalDurationHours = totalDurationSeconds / 3600;
  const averageIntensity = calculateAverageIntensityFromStructure(structure);
  const intensityFactor = averageIntensity / 100;

  // Calculate TSS (Training Stress Score)
  // TSS = (duration in hours) * (intensity factor) * 100
  const tss = totalDurationHours * intensityFactor * 100;

  // Calculate IF (Intensity Factor)
  const ifValue = intensityFactor;

  // Calculate velocity (assuming running, average pace around 4:00/km)
  const velocityMps = 4.17; // meters per second (4:00/km pace)

  // Estimate calories (rough calculation)
  const calories = Math.round(totalDurationHours * 70 * 600 * intensityFactor); // 70kg athlete, 600 cal/hour for running

  // Estimate distance
  const distance = Math.round(velocityMps * totalDurationSeconds);

  // Estimate elevation gain (100m per hour for moderate activity)
  const elevationGain = Math.round(totalDurationHours * 100);

  // Calculate energy (1 calorie = 4.184 kJ)
  const energy = Math.round(calories * 4.184);

  return {
    totalTimePlanned: totalDurationHours,
    tssPlanned: Math.round(tss * 10) / 10, // Round to 1 decimal
    ifPlanned: Math.round(ifValue * 100) / 100, // Round to 2 decimals
    velocityPlanned: Math.round(velocityMps * 1000) / 1000, // Round to 3 decimals
    caloriesPlanned: calories,
    distancePlanned: distance,
    elevationGainPlanned: elevationGain,
    energyPlanned: energy,
  };
};
