/**
 * TrainingPeaks API Endpoints
 * Centralized exports for all endpoint modules
 * High cohesion: Each endpoint contains its API calls, schemas, and types together
 */

// Users API v3 Endpoints
export * from './users/v3/token';
export * from './users/v3/user';

// Login Endpoint
export * from './login';

// Fitness API v6 Endpoints
export * from './fitness/v6/workouts';
