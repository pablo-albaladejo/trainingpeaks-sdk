/**
 * Domain Schemas Index
 * Centralized exports for pure domain schemas and types only
 */

// Entity schemas and types
export {
  type AuthToken,
  AuthTokenSchema,
  type TrainingPeaksAthlete,
  TrainingPeaksAthleteSchema,
  type User,
  UserSchema,
  type Workout,
  WorkoutSchema,
} from './entities.schema';

// Value object schemas and types
export {
  type Credentials,
  CredentialsSchema,
  type TrainingPeaksAccountSettings,
  TrainingPeaksAccountSettingsSchema,
  type TrainingPeaksCalendarSettings,
  TrainingPeaksCalendarSettingsSchema,
  type TrainingPeaksDashboardSettings,
  TrainingPeaksDashboardSettingsSchema,
  type TrainingPeaksDateOptions,
  TrainingPeaksDateOptionsSchema,
  type TrainingPeaksMetric,
  TrainingPeaksMetricSchema,
  type TrainingPeaksPromptSettings,
  TrainingPeaksPromptSettingsSchema,
  type TrainingPeaksSettings,
  TrainingPeaksSettingsSchema,
  type TrainingPeaksWorkoutSettings,
  TrainingPeaksWorkoutSettingsSchema,
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
