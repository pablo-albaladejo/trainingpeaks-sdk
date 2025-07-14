/**
 * Workout Handler
 * Demonstrates dependency injection at infrastructure boundary
 * This is where all implementations are composed and injected into use cases
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type { WorkoutCreationService } from '@/application/services/workout-creation';
import type { WorkoutManagementService } from '@/application/services/workout-management';
import type { WorkoutQueryService } from '@/application/services/workout-query';
import type { WorkoutService } from '@/application/services/workout-service';
import type { WorkoutUtilityService } from '@/application/services/workout-utility';
import type { WorkoutValidationService } from '@/application/services/workout-validation';

// Import IMPLEMENTATIONS from infrastructure
import { createWorkoutCreationService } from '@/infrastructure/services/workout-creation';
import { createWorkoutManagementService } from '@/infrastructure/services/workout-management';
import { createWorkoutQueryService } from '@/infrastructure/services/workout-query';
import { createWorkoutService } from '@/infrastructure/services/workout-service';
import { createWorkoutUtilityService } from '@/infrastructure/services/workout-utility';
import { createWorkoutValidationService } from '@/infrastructure/services/workout-validation';

// Import use cases
import { createCreateStructuredWorkoutUseCase } from '@/application/use-cases/create-structured-workout';
import { createDeleteWorkoutUseCase } from '@/application/use-cases/delete-workout';
import { createGetWorkoutUseCase } from '@/application/use-cases/get-workout';
import { createListWorkoutsUseCase } from '@/application/use-cases/list-workouts';
import { createUploadWorkoutUseCase } from '@/application/use-cases/upload-workout';

/**
 * Workout Handler Factory
 * Demonstrates proper dependency injection at infrastructure boundary
 */
export const createWorkoutHandler = (dependencies: {
  workoutRepository: WorkoutRepository;
  logger?: any; // Logger interface would be defined in application layer
}) => {
  // 🔧 DEPENDENCY INJECTION - COMPOSE IMPLEMENTATIONS

  // Create service implementations
  const validationService: WorkoutValidationService =
    createWorkoutValidationService();
  const utilityService: WorkoutUtilityService = createWorkoutUtilityService();
  const creationService: WorkoutCreationService = createWorkoutCreationService(
    dependencies.workoutRepository,
    validationService,
    utilityService
  );
  const queryService: WorkoutQueryService = createWorkoutQueryService(
    dependencies.workoutRepository,
    validationService
  );
  const managementService: WorkoutManagementService =
    createWorkoutManagementService(
      dependencies.workoutRepository,
      validationService
    );

  // Create unified workout service
  const workoutService: WorkoutService = createWorkoutService(
    dependencies.workoutRepository
  );

  // 🎯 COMPOSE USE CASES WITH INJECTED DEPENDENCIES

  const createStructuredWorkoutUseCase =
    createCreateStructuredWorkoutUseCase(workoutService);
  const uploadWorkoutUseCase = createUploadWorkoutUseCase(workoutService);
  const getWorkoutUseCase = createGetWorkoutUseCase(workoutService);
  const listWorkoutsUseCase = createListWorkoutsUseCase(workoutService);
  const deleteWorkoutUseCase = createDeleteWorkoutUseCase(workoutService);

  // 🌐 RETURN HTTP HANDLERS

  return {
    /**
     * POST /workouts/structured
     * Create a structured workout
     */
    createStructuredWorkout: async (request: any) => {
      try {
        const result = await createStructuredWorkoutUseCase.execute(
          request.body
        );
        return {
          statusCode: result.success ? 201 : 400,
          body: JSON.stringify(result),
        };
      } catch (error) {
        dependencies.logger?.error('Error creating structured workout', {
          error,
          request,
        });
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            message: 'Internal server error',
            errors: [error instanceof Error ? error.message : 'Unknown error'],
          }),
        };
      }
    },

    /**
     * POST /workouts/upload
     * Upload a workout file
     */
    uploadWorkout: async (request: any) => {
      try {
        const result = await uploadWorkoutUseCase.execute(request.body);
        return {
          statusCode: result.success ? 201 : 400,
          body: JSON.stringify(result),
        };
      } catch (error) {
        dependencies.logger?.error('Error uploading workout', {
          error,
          request,
        });
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            message: 'Internal server error',
            errors: [error instanceof Error ? error.message : 'Unknown error'],
          }),
        };
      }
    },

    /**
     * GET /workouts/:id
     * Get workout by ID
     */
    getWorkout: async (request: any) => {
      try {
        const workout = await getWorkoutUseCase.execute(request.params.id);
        return {
          statusCode: 200,
          body: JSON.stringify(workout),
        };
      } catch (error) {
        dependencies.logger?.error('Error getting workout', { error, request });
        return {
          statusCode: 404,
          body: JSON.stringify({
            success: false,
            message: 'Workout not found',
            errors: [error instanceof Error ? error.message : 'Unknown error'],
          }),
        };
      }
    },

    /**
     * GET /workouts
     * List workouts with filters
     */
    listWorkouts: async (request: any) => {
      try {
        const workouts = await listWorkoutsUseCase.execute(request.query);
        return {
          statusCode: 200,
          body: JSON.stringify(workouts),
        };
      } catch (error) {
        dependencies.logger?.error('Error listing workouts', {
          error,
          request,
        });
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            message: 'Internal server error',
            errors: [error instanceof Error ? error.message : 'Unknown error'],
          }),
        };
      }
    },

    /**
     * DELETE /workouts/:id
     * Delete workout by ID
     */
    deleteWorkout: async (request: any) => {
      try {
        const result = await deleteWorkoutUseCase.execute(request.params.id);
        return {
          statusCode: result ? 204 : 404,
          body: result
            ? ''
            : JSON.stringify({
                success: false,
                message: 'Workout not found',
              }),
        };
      } catch (error) {
        dependencies.logger?.error('Error deleting workout', {
          error,
          request,
        });
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            message: 'Internal server error',
            errors: [error instanceof Error ? error.message : 'Unknown error'],
          }),
        };
      }
    },
  };
};

/**
 * Example of how to use the handler in a real application
 */
export const exampleUsage = () => {
  // This would be called at the application bootstrap/main entry point
  // Create infrastructure dependencies (database, logger, etc.)
  // const database = await createDatabaseConnection();
  // const logger = createLogger();
  // const workoutRepository = createWorkoutRepository(database);
  // Create handler with dependencies
  // const workoutHandler = createWorkoutHandler({
  //   workoutRepository,
  //   logger,
  // });
  // Use handler in HTTP framework (Express, Koa, etc.)
  // app.post('/workouts/structured', workoutHandler.createStructuredWorkout);
  // app.post('/workouts/upload', workoutHandler.uploadWorkout);
  // app.get('/workouts/:id', workoutHandler.getWorkout);
  // app.get('/workouts', workoutHandler.listWorkouts);
  // app.delete('/workouts/:id', workoutHandler.deleteWorkout);
};
