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

/**
 * Create immutable TrainingPeaks settings value object
 */
export const createTrainingPeaksSettings = (
  account: TrainingPeaksAccountSettings,
  calendar: TrainingPeaksCalendarSettings,
  workout: TrainingPeaksWorkoutSettings,
  metrics: TrainingPeaksMetric[],
  dashboard: TrainingPeaksDashboardSettings,
  prompt: TrainingPeaksPromptSettings,
  general?: Record<string, unknown>,
  experiments?: Record<string, unknown>,
  affiliate?: Record<string, unknown>,
  appleWatch?: Record<string, unknown>,
  privacy?: Record<string, unknown>
): TrainingPeaksSettings => {
  const settings: TrainingPeaksSettings = {
    account,
    calendar,
    workout,
    metrics,
    dashboard,
    prompt,
    general,
    experiments,
    affiliate,
    appleWatch,
    privacy,
  };

  return Object.freeze(settings);
};

/**
 * Create account settings value object
 */
export const createAccountSettings = (
  accountSettingsId: number,
  userType: number,
  isAthlete: boolean,
  headerImageUrl: string,
  headerLink: string,
  helpUrl: string,
  logonFailedUrl: string,
  logOffUrl: string,
  displayTrainingPeaksLogo: boolean,
  coachType: number,
  isCoached: boolean,
  isPremium: boolean,
  accessGroupIds: number[],
  premiumTrial: boolean,
  lastLogon: string
): TrainingPeaksAccountSettings => {
  const accountSettings: TrainingPeaksAccountSettings = {
    accountSettingsId,
    userType,
    isAthlete,
    headerImageUrl,
    headerLink,
    helpUrl,
    logonFailedUrl,
    logOffUrl,
    displayTrainingPeaksLogo,
    coachType,
    isCoached,
    isPremium,
    accessGroupIds: [...accessGroupIds], // Create copy
    premiumTrial,
    lastLogon,
  };

  return Object.freeze(accountSettings);
};

/**
 * Create calendar settings value object
 */
export const createCalendarSettings = (
  compactView: boolean,
  showAvailability: boolean,
  showNotes: boolean,
  showWorkouts: boolean,
  showStrengthWorkouts: boolean,
  showNutrition: boolean,
  showMetrics: boolean,
  showSummary: boolean,
  showFitnessFormFatigue: boolean,
  showComplianceColoring: boolean,
  showWeather: boolean,
  orderComplianceBy: string[],
  focusEventId: number | null,
  workoutLabelLayout: number[],
  weekSummaryAtpLayout: number[],
  showPayments: boolean
): TrainingPeaksCalendarSettings => {
  const calendarSettings: TrainingPeaksCalendarSettings = {
    compactView,
    showAvailability,
    showNotes,
    showWorkouts,
    showStrengthWorkouts,
    showNutrition,
    showMetrics,
    showSummary,
    showFitnessFormFatigue,
    showComplianceColoring,
    showWeather,
    orderComplianceBy: [...orderComplianceBy], // Create copy
    focusEventId,
    workoutLabelLayout: [...workoutLabelLayout], // Create copy
    weekSummaryAtpLayout: [...weekSummaryAtpLayout], // Create copy
    showPayments,
  };

  return Object.freeze(calendarSettings);
};

/**
 * Create workout settings value object
 */
export const createWorkoutSettings = (
  layout: Record<string, number[]>
): TrainingPeaksWorkoutSettings => {
  // Deep copy the layout object
  const layoutCopy: Record<string, number[]> = {};
  for (const [key, value] of Object.entries(layout)) {
    layoutCopy[key] = [...value];
  }

  const workoutSettings: TrainingPeaksWorkoutSettings = {
    layout: layoutCopy,
  };

  return Object.freeze(workoutSettings);
};

/**
 * Create date options value object
 */
export const createDateOptions = (
  quickDateSelectOption: number | null,
  startDate: string | null,
  endDate: string | null
): TrainingPeaksDateOptions => {
  const dateOptions: TrainingPeaksDateOptions = {
    quickDateSelectOption,
    startDate,
    endDate,
  };

  return Object.freeze(dateOptions);
};

/**
 * Create metric value object
 */
export const createMetric = (type: number): TrainingPeaksMetric => {
  const metric: TrainingPeaksMetric = {
    type,
  };

  return Object.freeze(metric);
};

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

/**
 * Check if user is coached
 */
export const isCoachedAccount = (settings: TrainingPeaksSettings): boolean => {
  return settings.account.isCoached;
};

/**
 * Get user type from settings
 */
export const getUserType = (settings: TrainingPeaksSettings): number => {
  return settings.account.userType;
};

/**
 * Get access group IDs
 */
export const getAccessGroupIds = (
  settings: TrainingPeaksSettings
): number[] => {
  return [...settings.account.accessGroupIds]; // Return copy
};
