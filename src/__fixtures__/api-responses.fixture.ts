/**
 * API Response Fixtures
 * Factory pattern fixtures for creating API response test data using rosie and faker
 *
 * This fixture demonstrates:
 * - API response structures for workout operations
 * - Consistent response patterns across different endpoints
 * - Proper handling of pagination and metadata
 * - Realistic workout data structures
 */

import type {
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  WorkoutFilters,
  WorkoutResponse,
  WorkoutStats,
  WorkoutsListResponse,
} from '@/application/repositories';
import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';
import { randomNumber } from './utils.fixture';

/**
 * WorkoutResponse Builder
 * Creates WorkoutResponse objects with realistic workout data
 */
export const workoutResponseBuilder = new Factory<WorkoutResponse>()
  .attr('id', () => faker.string.uuid())
  .attr('name', () => faker.lorem.words(3))
  .attr('date', () => faker.date.recent().toISOString().split('T')[0])
  .attr('duration', () => randomNumber(300, 10800)) // 5 minutes to 3 hours
  .attr('type', () =>
    faker.helpers.arrayElement(['running', 'cycling', 'swimming', 'strength'])
  )
  .attr('description', () => faker.lorem.sentence())
  .attr('distance', () => randomNumber(1000, 100000)) // 1km to 100km
  .attr('calories', () => randomNumber(100, 2000))
  .attr('createdAt', () => faker.date.recent().toISOString())
  .attr('updatedAt', () => faker.date.recent().toISOString());

/**
 * WorkoutsListResponse Builder
 * Creates WorkoutsListResponse objects with pagination
 */
export const workoutsListResponseBuilder = new Factory<WorkoutsListResponse>()
  .attr('total', () => randomNumber(1, 100))
  .attr('workouts', () =>
    Array.from({ length: randomNumber(1, 10) }, () =>
      workoutResponseBuilder.build()
    )
  )
  .option('totalCount', 5)
  .option('workoutCount', 3)
  .after((response, options) => {
    const workoutCount = options.workoutCount || 3;
    const totalCount = options.totalCount || 5;

    return {
      total: totalCount,
      workouts: Array.from({ length: workoutCount }, () =>
        workoutResponseBuilder.build()
      ),
    };
  });

/**
 * WorkoutStats Builder
 * Creates WorkoutStats objects with realistic statistics
 */
export const workoutStatsBuilder = new Factory<WorkoutStats>()
  .attr('totalWorkouts', () => randomNumber(10, 1000))
  .attr('totalDistance', () => randomNumber(10000, 1000000)) // 10km to 1000km
  .attr('totalDuration', () => randomNumber(36000, 3600000)) // 10 hours to 1000 hours
  .attr('totalCalories', () => randomNumber(10000, 100000))
  .attr('averageDistance', () => randomNumber(5000, 50000))
  .attr('averageDuration', () => randomNumber(1800, 7200)) // 30 minutes to 2 hours
  .attr('favoriteType', () =>
    faker.helpers.arrayElement(['running', 'cycling', 'swimming', 'strength'])
  );

/**
 * CreateWorkoutRequest Builder
 * Creates CreateWorkoutRequest objects for testing
 */
export const createWorkoutRequestBuilder = new Factory<CreateWorkoutRequest>()
  .attr('name', () => faker.lorem.words(3))
  .attr('date', () => faker.date.recent().toISOString().split('T')[0])
  .attr('duration', () => randomNumber(300, 10800))
  .attr('type', () =>
    faker.helpers.arrayElement(['running', 'cycling', 'swimming', 'strength'])
  )
  .attr('description', () => faker.lorem.sentence())
  .attr('distance', () => randomNumber(1000, 100000))
  .attr('calories', () => randomNumber(100, 2000));

/**
 * UpdateWorkoutRequest Builder
 * Creates UpdateWorkoutRequest objects for testing
 */
export const updateWorkoutRequestBuilder = new Factory<UpdateWorkoutRequest>()
  .attr('id', () => faker.string.uuid())
  .attr('name', () => faker.lorem.words(3))
  .attr('date', () => faker.date.recent().toISOString().split('T')[0])
  .attr('duration', () => randomNumber(300, 10800))
  .attr('type', () =>
    faker.helpers.arrayElement(['running', 'cycling', 'swimming', 'strength'])
  )
  .attr('description', () => faker.lorem.sentence())
  .attr('distance', () => randomNumber(1000, 100000))
  .attr('calories', () => randomNumber(100, 2000));

/**
 * WorkoutFilters Builder
 * Creates WorkoutFilters objects for testing
 */
export const workoutFiltersBuilder = new Factory<WorkoutFilters>()
  .attr('dateFrom', () => faker.date.past().toISOString().split('T')[0])
  .attr('dateTo', () => faker.date.future().toISOString().split('T')[0])
  .attr('type', () =>
    faker.helpers.arrayElement(['running', 'cycling', 'swimming', 'strength'])
  )
  .attr('limit', () => randomNumber(10, 50))
  .attr('offset', () => randomNumber(0, 100))
  .option('includeDateRange', true)
  .option('includeType', false)
  .option('includePagination', true)
  .after((filters, options) => {
    return {
      dateFrom: options.includeDateRange ? filters.dateFrom : undefined,
      dateTo: options.includeDateRange ? filters.dateTo : undefined,
      type: options.includeType ? filters.type : undefined,
      limit: options.includePagination ? filters.limit : undefined,
      offset: options.includePagination ? filters.offset : undefined,
    };
  });

/**
 * Predefined Builders for Common API Response Scenarios
 */

/**
 * Empty Workouts List Builder
 * Creates empty workout list responses
 */
export const emptyWorkoutsListBuilder = new Factory()
  .extend(workoutsListResponseBuilder)
  .option('totalCount', 0)
  .option('workoutCount', 0);

/**
 * Single Workout List Builder
 * Creates list responses with a single workout
 */
export const singleWorkoutListBuilder = new Factory()
  .extend(workoutsListResponseBuilder)
  .option('totalCount', 1)
  .option('workoutCount', 1);

/**
 * Running Workout Response Builder
 * Creates workout responses specifically for running workouts
 */
export const runningWorkoutResponseBuilder = new Factory()
  .extend(workoutResponseBuilder)
  .option('type', 'running')
  .option('duration', 3600) // 1 hour
  .option('distance', 10000); // 10km

/**
 * Cycling Workout Response Builder
 * Creates workout responses specifically for cycling workouts
 */
export const cyclingWorkoutResponseBuilder = new Factory()
  .extend(workoutResponseBuilder)
  .option('type', 'cycling')
  .option('duration', 7200) // 2 hours
  .option('distance', 50000); // 50km

/**
 * Swimming Workout Response Builder
 * Creates workout responses specifically for swimming workouts
 */
export const swimmingWorkoutResponseBuilder = new Factory()
  .extend(workoutResponseBuilder)
  .option('type', 'swimming')
  .option('duration', 1800) // 30 minutes
  .option('distance', 1500); // 1.5km

/**
 * Short Workout Response Builder
 * Creates short workout responses for quick tests
 */
export const shortWorkoutResponseBuilder = new Factory()
  .extend(workoutResponseBuilder)
  .option('duration', 900) // 15 minutes
  .option('distance', 2000); // 2km

/**
 * Long Workout Response Builder
 * Creates long workout responses for endurance tests
 */
export const longWorkoutResponseBuilder = new Factory()
  .extend(workoutResponseBuilder)
  .option('duration', 10800) // 3 hours
  .option('distance', 50000); // 50km

/**
 * Helper functions for backward compatibility
 */

export function createMockWorkoutResponse(
  overrides: Partial<WorkoutResponse> = {}
): WorkoutResponse {
  return workoutResponseBuilder.build(overrides);
}

export function createMockWorkoutsListResponse(
  overrides: Partial<WorkoutsListResponse> = {}
): WorkoutsListResponse {
  return workoutsListResponseBuilder.build(overrides);
}

export function createMockWorkoutStats(
  overrides: Partial<WorkoutStats> = {}
): WorkoutStats {
  return workoutStatsBuilder.build(overrides);
}

export function createMockCreateWorkoutRequest(
  overrides: Partial<CreateWorkoutRequest> = {}
): CreateWorkoutRequest {
  return createWorkoutRequestBuilder.build(overrides);
}

export function createMockUpdateWorkoutRequest(
  overrides: Partial<UpdateWorkoutRequest> = {}
): UpdateWorkoutRequest {
  return updateWorkoutRequestBuilder.build(overrides);
}

export function createMockWorkoutFilters(
  overrides: Partial<WorkoutFilters> = {}
): WorkoutFilters {
  return workoutFiltersBuilder.build(overrides);
}
