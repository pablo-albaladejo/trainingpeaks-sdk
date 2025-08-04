/**
 * Domain Schemas Index
 * Centralized exports for pure domain schemas and types only
 */

// Entity schemas and types
export {
  type AuthToken,
  AuthTokenSchema,
  type User,
  UserSchema,
  type Workout,
  WorkoutSchema,
  type TrainingPeaksAthlete,
  TrainingPeaksAthleteSchema,
} from './entities.schema';

// Value object schemas and types
export {
  type Credentials,
  CredentialsSchema,
  type UserPreferences,
  UserPreferencesSchema,
  type WorkoutData,
  WorkoutDataSchema,
  type WorkoutFile,
  type WorkoutFileData,
  WorkoutFileDataSchema,
  WorkoutFileSchema,
  type WorkoutMetadata,
  WorkoutMetadataSchema,
  type TrainingPeaksSettings,
  TrainingPeaksSettingsSchema,
  type TrainingPeaksAccountSettings,
  TrainingPeaksAccountSettingsSchema,
  type TrainingPeaksCalendarSettings,
  TrainingPeaksCalendarSettingsSchema,
  type TrainingPeaksWorkoutSettings,
  TrainingPeaksWorkoutSettingsSchema,
  type TrainingPeaksDashboardSettings,
  TrainingPeaksDashboardSettingsSchema,
  type TrainingPeaksPromptSettings,
  TrainingPeaksPromptSettingsSchema,
  type TrainingPeaksMetric,
  TrainingPeaksMetricSchema,
  type TrainingPeaksDateOptions,
  TrainingPeaksDateOptionsSchema,
} from './value-objects.schema';

// Workout structure schemas and types
export {
  type WorkoutElementType,
  WorkoutElementTypeSchema,
  type WorkoutIntensityClass,
  WorkoutIntensityClassSchema,
  type WorkoutIntensityMetric,
  WorkoutIntensityMetricSchema,
  type WorkoutIntensityTargetType,
  WorkoutIntensityTargetTypeSchema,
  type WorkoutLength,
  type WorkoutLengthMetric,
  WorkoutLengthMetricSchema,
  WorkoutLengthSchema,
  type WorkoutLengthUnit,
  WorkoutLengthUnitSchema,
  type WorkoutStep,
  WorkoutStepSchema,
  type WorkoutStructure,
  type WorkoutStructureElement,
  WorkoutStructureElementSchema,
  WorkoutStructureSchema,
  type WorkoutTarget,
  WorkoutTargetSchema,
} from './workout-structure.schema';
