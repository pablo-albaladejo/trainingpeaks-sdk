/**
 * Infrastructure Layer Exports
 * Exports all infrastructure implementations
 */

// Auth services
export {
  getCurrentToken,
  getCurrentUser,
  getUserId,
  isAuthenticated,
  login,
  logout,
} from './services/auth-application';

export {
  getTimeUntilExpiration,
  getTimeUntilRefresh,
  isTokenExpired,
  isTokenValid,
  shouldRefreshToken,
} from './services/auth-validation';

// Logger services
export {
  consoleOutputTarget,
  createLoggerService,
  createLoggerWithTarget,
  createSilentLogger,
  silentOutputTarget,
} from './services/logger';

// Workout services
export { deleteWorkout } from './services/workout-management';

export {
  createStructuredWorkout as createStructuredWorkoutManager,
  deleteWorkout as deleteWorkoutManager,
  getWorkout,
  getWorkoutRepository,
  getWorkoutStats,
  listWorkouts,
  searchWorkouts,
  uploadWorkoutFromFile,
  uploadWorkout as uploadWorkoutManager,
} from './services/workout-manager';

export {
  getWorkout as getWorkoutQuery,
  listWorkouts as listWorkoutsQuery,
} from './services/workout-query';

export {
  buildStructureFromSimpleElements,
  generateWorkoutId,
  getMimeTypeFromFileName,
  mapWorkoutTypeToActivityType,
} from './services/workout-utility';

export {
  validateListWorkoutsFilters,
  validateWorkoutFile,
  validateWorkoutId,
} from './services/workout-validation';

// Error handling
export {
  ErrorSeverity,
  createErrorHandlerService,
  type ApiResponse,
  type ErrorContext,
  type ErrorHandlerConfig,
  type ErrorHandlerService,
  type ErrorResponse,
  type SuccessResponse,
} from './services/error-handler';

// HTTP handlers
export { createAuthHandler } from './http/auth-handler';
