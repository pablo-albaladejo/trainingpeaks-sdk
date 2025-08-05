/**
 * TrainingPeaks Athlete Entity
 * Core business entity for TrainingPeaks athlete data
 */

import type { TrainingPeaksAthlete as TrainingPeaksAthleteType } from '@/domain/schemas/entities.schema';

export type TrainingPeaksAthlete = TrainingPeaksAthleteType;

/**
 * Get athlete full name
 */
export const getAthleteFullName = (athlete: TrainingPeaksAthlete): string => {
  return `${athlete.firstName} ${athlete.lastName}`.trim();
};

/**
 * Check if athlete is premium
 */
export const isPremiumAthlete = (athlete: TrainingPeaksAthlete): boolean => {
  return athlete.premiumTrial || new Date(athlete.expireOn) > new Date();
};

/**
 * Check if athlete is coached
 */
export const isCoachedAthlete = (athlete: TrainingPeaksAthlete): boolean => {
  return athlete.coachedBy !== null && athlete.coachedBy !== undefined;
};
