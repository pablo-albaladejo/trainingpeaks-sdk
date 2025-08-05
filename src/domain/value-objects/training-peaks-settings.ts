/**
 * TrainingPeaks Settings Value Objects
 * Immutable value objects for TrainingPeaks configuration and settings
 */

import type {
  TrainingPeaksAccountSettings,
  TrainingPeaksCalendarSettings,
  TrainingPeaksDashboardSettings,
  TrainingPeaksDateOptions,
  TrainingPeaksMetric,
  TrainingPeaksPromptSettings,
  TrainingPeaksSettings,
  TrainingPeaksWorkoutSettings,
} from '@/domain/schemas/value-objects.schema';

export type {
  TrainingPeaksAccountSettings,
  TrainingPeaksCalendarSettings,
  TrainingPeaksDashboardSettings,
  TrainingPeaksDateOptions,
  TrainingPeaksMetric,
  TrainingPeaksPromptSettings,
  TrainingPeaksSettings,
  TrainingPeaksWorkoutSettings,
};

// Note: TrainingPeaks Settings are complex configuration objects
// Currently only used for HTTP response validation, not business logic
// Utility functions removed to reduce unused code

/**
 * Check if settings have premium features enabled
 */
export const hasPremiumFeatures = (
  settings: TrainingPeaksSettings
): boolean => {
  return settings.account.isPremium || settings.account.premiumTrial;
};

/**
 * Check if user is an athlete
 */
export const isAthleteAccount = (settings: TrainingPeaksSettings): boolean => {
  return settings.account.isAthlete;
};
