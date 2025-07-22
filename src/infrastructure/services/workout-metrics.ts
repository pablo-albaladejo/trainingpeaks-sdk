/**
 * Workout Metrics Infrastructure Services
 * Implementations for calculating workout metrics from structure
 */

import type {
  CalculateCalories,
  CalculateDistance,
  CalculateElevationGain,
  CalculateEnergy,
  CalculateIntensityFactor,
  CalculatePlannedMetrics,
  CalculateTSS,
  CalculateVelocity,
  PlannedWorkoutMetrics,
} from '@/application/services/workout-metrics';
import type { WorkoutStructure } from '@/domain/value-objects/workout-structure';

/**
 * Activity type constants
 */
const ACTIVITY_TYPES = {
  BIKE: 'BIKE',
  RUN: 'RUN',
  SWIM: 'SWIM',
  OTHER: 'OTHER',
} as const;

/**
 * Default velocity values by activity type (m/s)
 */
const DEFAULT_VELOCITIES = {
  [ACTIVITY_TYPES.BIKE]: 8.33, // ~30 km/h
  [ACTIVITY_TYPES.RUN]: 3.33, // ~12 km/h
  [ACTIVITY_TYPES.SWIM]: 1.11, // ~4 km/h
  [ACTIVITY_TYPES.OTHER]: 2.78, // ~10 km/h
};

/**
 * Calorie burn rates by activity type (calories/kg/hour)
 */
const CALORIE_BURN_RATES = {
  [ACTIVITY_TYPES.BIKE]: 400,
  [ACTIVITY_TYPES.RUN]: 600,
  [ACTIVITY_TYPES.SWIM]: 500,
  [ACTIVITY_TYPES.OTHER]: 300,
};

/**
 * Energy conversion factors (kJ per calorie)
 */
const ENERGY_CONVERSION = 4.184; // 1 calorie = 4.184 kJ

/**
 * Calculate TSS (Training Stress Score) from structure
 */
export const calculateTSS: CalculateTSS = (
  structure: WorkoutStructure,
  athleteWeight: number = 70
): number => {
  const totalDurationHours = structure.getTotalDuration() / 3600;
  const intensityFactor = structure.calculateAverageIntensity() / 100;

  // TSS = (duration in hours) * (intensity factor) * 100
  const tss = totalDurationHours * intensityFactor * 100;

  // Adjust for athlete weight (heavier athletes work harder)
  const weightAdjustment = Math.sqrt(athleteWeight / 70);

  return Math.round(tss * weightAdjustment * 10) / 10;
};

/**
 * Calculate IF (Intensity Factor) from structure
 */
export const calculateIntensityFactor: CalculateIntensityFactor = (
  structure: WorkoutStructure
): number => {
  const averageIntensity = structure.calculateAverageIntensity();

  // IF is normalized intensity (0-1)
  const intensityFactor = averageIntensity / 100;

  return Math.round(intensityFactor * 100) / 100;
};

/**
 * Calculate velocity from structure
 */
export const calculateVelocity: CalculateVelocity = (
  structure: WorkoutStructure,
  activityType: 'BIKE' | 'RUN' | 'SWIM' | 'OTHER' = 'RUN'
): number => {
  // For now, return default velocity based on activity type
  // In a real implementation, this would analyze the structure
  // and calculate based on intensity targets and duration
  const baseVelocity = DEFAULT_VELOCITIES[activityType];

  // Adjust velocity based on average intensity
  const intensityFactor = structure.calculateAverageIntensity() / 100;
  const adjustedVelocity = baseVelocity * (0.7 + 0.6 * intensityFactor); // 70-130% of base

  return Math.round(adjustedVelocity * 1000) / 1000;
};

/**
 * Calculate calories from structure
 */
export const calculateCalories: CalculateCalories = (
  structure: WorkoutStructure,
  athleteWeight: number,
  activityType: 'BIKE' | 'RUN' | 'SWIM' | 'OTHER' = 'RUN'
): number => {
  const totalDurationHours = structure.getTotalDuration() / 3600;
  const burnRate = CALORIE_BURN_RATES[activityType];

  // Base calories = duration * weight * burn rate
  const baseCalories = totalDurationHours * athleteWeight * burnRate;

  // Adjust for intensity
  const intensityFactor = structure.calculateAverageIntensity() / 100;
  const intensityMultiplier = 0.8 + 0.4 * intensityFactor; // 80-120% of base

  const adjustedCalories = baseCalories * intensityMultiplier;

  return Math.round(adjustedCalories);
};

/**
 * Calculate distance from structure
 */
export const calculateDistance: CalculateDistance = (
  structure: WorkoutStructure,
  activityType: 'BIKE' | 'RUN' | 'SWIM' | 'OTHER' = 'RUN'
): number => {
  const totalDurationSeconds = structure.getTotalDuration();
  const velocity = calculateVelocity(structure, activityType);

  // Distance = velocity * time
  const distanceMeters = velocity * totalDurationSeconds;

  return Math.round(distanceMeters);
};

/**
 * Calculate elevation gain from structure
 */
export const calculateElevationGain: CalculateElevationGain = (
  structure: WorkoutStructure
): number => {
  // For now, return a reasonable estimate based on duration
  // In a real implementation, this would analyze the polyline
  // and calculate actual elevation changes

  const totalDurationHours = structure.getTotalDuration() / 3600;

  // Estimate elevation gain: ~100m per hour for moderate activity
  const estimatedElevationGain = totalDurationHours * 100;

  return Math.round(estimatedElevationGain);
};

/**
 * Calculate energy from structure
 */
export const calculateEnergy: CalculateEnergy = (
  structure: WorkoutStructure,
  athleteWeight: number = 70
): number => {
  const calories = calculateCalories(structure, athleteWeight);

  // Convert calories to kJ
  const energyKJ = calories * ENERGY_CONVERSION;

  return Math.round(energyKJ);
};

/**
 * Calculate all planned metrics from workout structure
 */
export const calculatePlannedMetrics: CalculatePlannedMetrics = (
  structure: WorkoutStructure,
  athleteWeight: number = 70,
  activityType: 'BIKE' | 'RUN' | 'SWIM' | 'OTHER' = 'RUN'
): PlannedWorkoutMetrics => {
  const totalDurationHours = structure.getTotalDuration() / 3600;
  const tss = calculateTSS(structure, athleteWeight);
  const intensityFactor = calculateIntensityFactor(structure);
  const velocity = calculateVelocity(structure, activityType);
  const calories = calculateCalories(structure, athleteWeight, activityType);
  const distance = calculateDistance(structure, activityType);
  const elevationGain = calculateElevationGain(structure);
  const energy = calculateEnergy(structure, athleteWeight);

  return {
    totalTimePlanned: Math.round(totalDurationHours * 1000) / 1000,
    tssPlanned: tss,
    ifPlanned: intensityFactor,
    velocityPlanned: velocity,
    caloriesPlanned: calories,
    distancePlanned: distance,
    elevationGainPlanned: elevationGain,
    energyPlanned: energy,
  };
};
