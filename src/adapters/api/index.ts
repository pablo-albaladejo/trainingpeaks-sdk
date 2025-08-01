/**
 * API Adapters
 * Modular API client architecture for TrainingPeaks SDK
 */

// Base API client
export * from './base-api-client';

// Entity-specific API clients
export * from './modules/users-api-client';
export * from './modules/workouts-api-client';

// Main API client
export {
  TrainingPeaksApiClient,
  createTrainingPeaksApiClient,
} from './training-peaks-api-client';

// Legacy adapter (for backward compatibility)
export { TrainingPeaksApiClient as LegacyTrainingPeaksApiClient } from './public-api-adapter';
