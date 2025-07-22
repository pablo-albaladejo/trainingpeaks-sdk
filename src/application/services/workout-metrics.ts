/**
 * Workout Metrics Application Services
 * Contracts for calculating workout metrics from structure
 */

import type { WorkoutStructure } from '@/domain';

/**
 * Planned workout metrics calculated from structure
 */
export type PlannedWorkoutMetrics = {
  /** Total time planned in hours */
  totalTimePlanned: number;
  /** Training Stress Score planned */
  tssPlanned: number;
  /** Intensity Factor planned */
  ifPlanned: number;
  /** Velocity planned in m/s */
  velocityPlanned: number;
  /** Calories planned */
  caloriesPlanned: number;
  /** Distance planned in meters */
  distancePlanned: number;
  /** Elevation gain planned in meters */
  elevationGainPlanned: number;
  /** Energy planned in kJ */
  energyPlanned: number;
};

/**
 * Calculate planned metrics from workout structure
 */
export type CalculatePlannedMetrics = (
  structure: WorkoutStructure,
  athleteWeight?: number,
  activityType?: 'BIKE' | 'RUN' | 'SWIM' | 'OTHER'
) => PlannedWorkoutMetrics;

/**
 * Calculate TSS (Training Stress Score) from structure
 */
export type CalculateTSS = (
  structure: WorkoutStructure,
  athleteWeight?: number
) => number;

/**
 * Calculate IF (Intensity Factor) from structure
 */
export type CalculateIntensityFactor = (structure: WorkoutStructure) => number;

/**
 * Calculate velocity from structure
 */
export type CalculateVelocity = (
  structure: WorkoutStructure,
  activityType?: 'BIKE' | 'RUN' | 'SWIM' | 'OTHER'
) => number;

/**
 * Calculate calories from structure
 */
export type CalculateCalories = (
  structure: WorkoutStructure,
  athleteWeight: number,
  activityType?: 'BIKE' | 'RUN' | 'SWIM' | 'OTHER'
) => number;

/**
 * Calculate distance from structure
 */
export type CalculateDistance = (
  structure: WorkoutStructure,
  activityType?: 'BIKE' | 'RUN' | 'SWIM' | 'OTHER'
) => number;

/**
 * Calculate elevation gain from structure
 */
export type CalculateElevationGain = (structure: WorkoutStructure) => number;

/**
 * Calculate energy from structure
 */
export type CalculateEnergy = (
  structure: WorkoutStructure,
  athleteWeight?: number
) => number;
