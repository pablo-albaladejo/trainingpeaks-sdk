/**
 * Domain Value Objects Schemas
 * Zod schemas for domain value objects validation and serialization
 */

import { z } from 'zod';

// Credentials Value Object Schema
export const CredentialsSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1),
});

// WorkoutFile Value Object Schema
export const WorkoutFileSchema = z.object({
  fileName: z.string().min(1).max(255),
  content: z.string().min(1),
  mimeType: z.string().min(1).max(100),
});

// WorkoutFileData Value Object Schema
export const WorkoutFileDataSchema = z.object({
  filename: z.string().min(1).max(255),
  content: z.union([
    z.string(),
    z.instanceof(Uint8Array),
    z.instanceof(Buffer),
  ]),
  mimeType: z.string().min(1).max(100),
});

// WorkoutData Value Object Schema
export const WorkoutDataSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  date: z.string().optional(),
  duration: z.number().nonnegative().finite().optional(),
  distance: z.number().nonnegative().finite().optional(),
  type: z.enum(['BIKE', 'RUN', 'SWIM', 'OTHER']).optional(),
  fileData: WorkoutFileDataSchema.optional(),
});

// UserPreferences Value Object Schema
export const UserPreferencesSchema = z.object({
  timezone: z.string().min(1),
  units: z.enum(['metric', 'imperial']),
  language: z.enum(['en', 'es', 'fr', 'de']),
  theme: z.enum(['light', 'dark', 'auto']),
  notifications: z.boolean(),
});

// WorkoutMetadata Value Object Schema
export const WorkoutMetadataSchema = z.object({
  tags: z.array(z.string().min(1)).optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
  weather: z.enum(['sunny', 'cloudy', 'rainy', 'snowy']).optional(),
  temperature: z.number().optional(),
});

// TrainingPeaks Settings Schemas
export const TrainingPeaksAccountSettingsSchema = z.object({
  accountSettingsId: z.number(),
  userType: z.number(),
  isAthlete: z.boolean(),
  headerImageUrl: z.string(),
  headerLink: z.string(),
  helpUrl: z.string(),
  logonFailedUrl: z.string(),
  logOffUrl: z.string(),
  displayTrainingPeaksLogo: z.boolean(),
  coachType: z.number(),
  isCoached: z.boolean(),
  isPremium: z.boolean(),
  accessGroupIds: z.array(z.number()),
  premiumTrial: z.boolean(),
  lastLogon: z.string(),
});

export const TrainingPeaksCalendarSettingsSchema = z.object({
  compactView: z.boolean(),
  showAvailability: z.boolean(),
  showNotes: z.boolean(),
  showWorkouts: z.boolean(),
  showStrengthWorkouts: z.boolean(),
  showNutrition: z.boolean(),
  showMetrics: z.boolean(),
  showSummary: z.boolean(),
  showFitnessFormFatigue: z.boolean(),
  showComplianceColoring: z.boolean(),
  showWeather: z.boolean(),
  orderComplianceBy: z.array(z.string()),
  focusEventId: z.number().nullable(),
  workoutLabelLayout: z.array(z.number()),
  weekSummaryAtpLayout: z.array(z.number()),
  showPayments: z.boolean(),
});

export const TrainingPeaksWorkoutSettingsSchema = z.object({
  layout: z.record(z.string(), z.array(z.number())),
});

export const TrainingPeaksMetricSchema = z.object({
  type: z.number(),
});

export const TrainingPeaksDateOptionsSchema = z.object({
  quickDateSelectOption: z.number().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export const TrainingPeaksDashboardPodSchema = z.object({
  workoutTypeIds: z.array(z.string()).optional(),
  quickDateSelectOption: z.number().optional(),
  showTSSPerDay: z.boolean().optional(),
  showIntensityFactorPerDay: z.boolean().optional(),
  showTSBFill: z.boolean().optional(),
  atlConstant: z.number().optional(),
  atlStartValue: z.number().optional(),
  showSecondAtlSeries: z.boolean().optional(),
  atlConstant2: z.number().optional(),
  atlStartValue2: z.number().optional(),
  ctlConstant: z.number().optional(),
  ctlStartValue: z.number().optional(),
  index: z.number(),
  chartType: z.number(),
  title: z.string().nullable(),
  dateOptions: TrainingPeaksDateOptionsSchema,
  durationUnits: z.number().optional(),
  summaryType: z.number().optional(),
  dateGrouping: z.number().optional(),
  caloriesType: z.number().optional(),
  includeGoalCalories: z.boolean().optional(),
  peakType: z.number().optional(),
  useComparison: z.boolean().optional(),
  displayState: z.number().optional(),
  comparisonDateOptions: TrainingPeaksDateOptionsSchema.optional(),
  tags: z.unknown().optional(),
  showPlanned: z.boolean().optional(),
  hideAverage: z.boolean().optional(),
  units: z.number().nullable().optional(),
  showMarkers: z.boolean().optional(),
  dataFields: z.array(z.number()).optional(),
  powerProfileGrouping: z.number().optional(),
  displayCategoryLabels: z.boolean().optional(),
  displayCaloriesConsumed: z.boolean().optional(),
  displayCaloriesExpended: z.boolean().optional(),
  displayBy: z.number().optional(),
});

export const TrainingPeaksDashboardSettingsSchema = z.object({
  pods: z.array(TrainingPeaksDashboardPodSchema),
  dateOptions: TrainingPeaksDateOptionsSchema,
});

export const TrainingPeaksPromptPreferencesSchema = z.object({
  showPairUnpairModal: z.boolean(),
  showWelcome: z.boolean(),
  showGoalsAssistanceBanner: z.boolean(),
  showUnpairConfirmationModal: z.boolean(),
  'showWhatsNew:CALENDAR_NOTES_ATHLETE': z.boolean(),
  showQuickViewTips: z.boolean(),
  contextMenuTip: z.boolean(),
  showEnterEventModal: z.boolean(),
  showExpandoTips: z.boolean(),
  searchChalkboard: z.boolean(),
  showComplete: z.boolean(),
  recuringNewChip: z.boolean(),
  weatherNewChip: z.boolean(),
  garminMaxStepsWarning: z.boolean(),
});

export const TrainingPeaksPromptChoicesSchema = z.object({
  searchChalkboard: z.string(),
  showEnterEventModal: z.string(),
  showQuickViewTips: z.string(),
  showExpandoTips: z.string(),
  showComplete: z.string(),
  showLandingSelection: z.string(),
});

export const TrainingPeaksPromptDatesSchema = z.object({
  searchChalkboard: z.string(),
  showEnterEventModal: z.string(),
  showQuickViewTips: z.string(),
  showExpandoTips: z.string(),
  showComplete: z.string(),
  showGoalsAssistanceBanner: z.string(),
  autoDismissNotifications: z.string(),
});

export const TrainingPeaksPromptSettingsSchema = z.object({
  promptPreferences: TrainingPeaksPromptPreferencesSchema,
  promptChoices: TrainingPeaksPromptChoicesSchema,
  promptDates: TrainingPeaksPromptDatesSchema,
});

export const TrainingPeaksSettingsSchema = z.object({
  account: TrainingPeaksAccountSettingsSchema,
  calendar: TrainingPeaksCalendarSettingsSchema,
  workout: TrainingPeaksWorkoutSettingsSchema,
  metrics: z.array(TrainingPeaksMetricSchema),
  dashboard: TrainingPeaksDashboardSettingsSchema,
  prompt: TrainingPeaksPromptSettingsSchema,
  general: z.record(z.string(), z.unknown()).optional(),
  experiments: z.record(z.string(), z.unknown()).optional(),
  affiliate: z.record(z.string(), z.unknown()).optional(),
  appleWatch: z.record(z.string(), z.unknown()).optional(),
  privacy: z.record(z.string(), z.unknown()).optional(),
});

// Type exports
export type Credentials = z.infer<typeof CredentialsSchema>;
export type WorkoutFile = z.infer<typeof WorkoutFileSchema>;
export type WorkoutFileData = z.infer<typeof WorkoutFileDataSchema>;
export type WorkoutData = z.infer<typeof WorkoutDataSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type WorkoutMetadata = z.infer<typeof WorkoutMetadataSchema>;

// TrainingPeaks Settings Types
export type TrainingPeaksAccountSettings = z.infer<typeof TrainingPeaksAccountSettingsSchema>;
export type TrainingPeaksCalendarSettings = z.infer<typeof TrainingPeaksCalendarSettingsSchema>;
export type TrainingPeaksWorkoutSettings = z.infer<typeof TrainingPeaksWorkoutSettingsSchema>;
export type TrainingPeaksMetric = z.infer<typeof TrainingPeaksMetricSchema>;
export type TrainingPeaksDateOptions = z.infer<typeof TrainingPeaksDateOptionsSchema>;
export type TrainingPeaksDashboardPod = z.infer<typeof TrainingPeaksDashboardPodSchema>;
export type TrainingPeaksDashboardSettings = z.infer<typeof TrainingPeaksDashboardSettingsSchema>;
export type TrainingPeaksPromptPreferences = z.infer<typeof TrainingPeaksPromptPreferencesSchema>;
export type TrainingPeaksPromptChoices = z.infer<typeof TrainingPeaksPromptChoicesSchema>;
export type TrainingPeaksPromptDates = z.infer<typeof TrainingPeaksPromptDatesSchema>;
export type TrainingPeaksPromptSettings = z.infer<typeof TrainingPeaksPromptSettingsSchema>;
export type TrainingPeaksSettings = z.infer<typeof TrainingPeaksSettingsSchema>;
