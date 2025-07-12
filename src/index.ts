/**
 * TrainingPeaks SDK
 * A TypeScript SDK for interacting with the TrainingPeaks API
 */

export { TrainingPeaksAuth } from './auth';
export { TrainingPeaksClient } from './client';
export * from './errors';
export * from './types';
export { WorkoutUploader } from './workout';

// Default export
export { TrainingPeaksClient as default } from './client';
