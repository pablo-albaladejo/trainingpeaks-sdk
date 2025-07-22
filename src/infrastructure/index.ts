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
  logDebug,
  logError,
  logInfo,
  logWarn,
  logWithLevel,
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

// Error handling - Individual functions
export {
  classifyErrorSeverity,
  createError,
  enrichErrorContext,
  getErrorCodeFromError,
  getStatusCodeFromError,
  handleError,
  handleSuccess,
  retryOperation,
  validateResult,
  wrapAsyncOperation,
} from './services/error-handler';

// Error handling - Backward compatibility
export {
  createErrorHandlerService,
  type ErrorHandlerService,
} from './services/error-handler';

// HTTP handlers
export { createAuthHandler } from './http/auth-handler';
