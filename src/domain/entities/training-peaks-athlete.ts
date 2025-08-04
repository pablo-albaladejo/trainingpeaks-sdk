/**
 * TrainingPeaks Athlete Entity
 * Core business entity for TrainingPeaks athlete data
 */

import { ValidationError } from '@/domain/errors/domain-errors';
import type { TrainingPeaksAthlete as TrainingPeaksAthleteType } from '@/domain/schemas/entities.schema';

export type TrainingPeaksAthlete = TrainingPeaksAthleteType;

/**
 * Create a new TrainingPeaks Athlete entity with domain invariants
 */
export const createTrainingPeaksAthlete = (
  athleteId: number,
  firstName: string,
  lastName: string,
  email: string,
  userName: string,
  athleteType: number,
  userType: number,
  expireOn: string,
  phone?: string | null,
  cellPhone?: string | null,
  age?: number,
  lastPlannedWorkout?: string | null,
  settings?: unknown,
  personPhotoUrl?: string | null,
  coachedBy?: number | null,
  lastUpgradeOn?: string | null,
  downgradeAllowed?: boolean,
  premiumTrial?: boolean,
  premiumTrialDaysRemaining?: number,
  downgradeAllowedOn?: string,
  workoutIndexState?: number,
  prCalcState?: number
): TrainingPeaksAthlete => {
  // Validate invariants
  if (athleteId <= 0) {
    throw new ValidationError(
      'Athlete ID must be a positive number',
      'athleteId'
    );
  }

  if (!firstName || firstName.trim().length === 0) {
    throw new ValidationError('First name cannot be empty', 'firstName');
  }

  if (!lastName || lastName.trim().length === 0) {
    throw new ValidationError('Last name cannot be empty', 'lastName');
  }

  if (!email || email.trim().length === 0) {
    throw new ValidationError('Email cannot be empty', 'email');
  }

  if (!userName || userName.trim().length === 0) {
    throw new ValidationError('Username cannot be empty', 'userName');
  }

  // Validate email format
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format', 'email');
  }

  if (personPhotoUrl && !isValidUrl(personPhotoUrl)) {
    throw new ValidationError(
      'Person photo URL must be a valid URL',
      'personPhotoUrl'
    );
  }

  return {
    athleteId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    phone,
    cellPhone,
    age,
    athleteType,
    userType,
    lastPlannedWorkout,
    settings,
    personPhotoUrl,
    coachedBy,
    userName: userName.trim(),
    lastUpgradeOn,
    downgradeAllowed: downgradeAllowed ?? false,
    expireOn,
    premiumTrial: premiumTrial ?? false,
    premiumTrialDaysRemaining: premiumTrialDaysRemaining ?? 0,
    downgradeAllowedOn,
    workoutIndexState: workoutIndexState ?? 0,
    prCalcState: prCalcState ?? 0,
  };
};

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

/**
 * Get remaining premium trial days
 */
export const getRemainingTrialDays = (
  athlete: TrainingPeaksAthlete
): number => {
  if (!athlete.premiumTrial) return 0;
  return Math.max(0, athlete.premiumTrialDaysRemaining);
};

/**
 * Check if athlete can downgrade
 */
export const canDowngrade = (athlete: TrainingPeaksAthlete): boolean => {
  if (!athlete.downgradeAllowed) return false;
  if (!athlete.downgradeAllowedOn) return true;
  return new Date(athlete.downgradeAllowedOn) <= new Date();
};

/**
 * Helper function to validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Helper function to validate URL format
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
