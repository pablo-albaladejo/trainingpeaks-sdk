/**
 * Workout Entrypoint Test Fixtures
 * Factory pattern fixtures for creating workout entrypoint test data using rosie and faker
 *
 * This fixture demonstrates:
 * - WorkoutListItem response objects for API testing
 * - GetWorkoutsListCommand objects for testing commands
 * - Session objects for authentication testing
 * - Mock dependencies for entrypoint testing
 */

import { faker } from '@faker-js/faker';
import { Factory } from 'rosie';

import type { Session } from '@/application/ports/session-storage';
import type { WorkoutListItem } from '@/domain/repositories/workout-repository';
import type {
  GetWorkoutsListCommand,
  WorkoutEntrypointDependencies,
} from '@/entrypoints/workout/types';

import { authTokenBuilder, sessionBuilder, userBuilder } from './auth.fixture';
import { randomNumber } from './utils.fixture';

/**
 * WorkoutListItem Builder
 * Creates WorkoutListItem objects matching the TrainingPeaks API response structure
 */
export const workoutListItemBuilder = new Factory<WorkoutListItem>()
  .attr('workoutId', () => randomNumber(1000000, 9999999))
  .attr('athleteId', () => randomNumber(1000000, 9999999))
  .attr('title', () => faker.lorem.words(2))
  .attr('workoutTypeValueId', () => randomNumber(1, 20))
  .attr('code', () => (faker.datatype.boolean() ? faker.string.alpha(3) : null))
  .attr('workoutDay', () => faker.date.recent().toISOString())
  .attr('startTime', () =>
    faker.datatype.boolean() ? faker.date.recent().toISOString() : null
  )
  .attr('startTimePlanned', () =>
    faker.datatype.boolean() ? faker.date.recent().toISOString() : null
  )
  .attr('isItAnOr', () => faker.datatype.boolean())
  .option('athleteId', undefined)
  .option('workoutType', undefined)
  .option('includeCode', false)
  .option('includeStartTime', true)
  .option('includeStartTimePlanned', false)
  .after((workout, options) => {
    const workoutTypeMap = {
      strength: 9,
      running: 1,
      cycling: 2,
      swimming: 3,
      other: 10,
    };

    return {
      workoutId: workout.workoutId,
      athleteId: options.athleteId || workout.athleteId,
      title: workout.title,
      workoutTypeValueId:
        options.workoutType &&
        workoutTypeMap[options.workoutType as keyof typeof workoutTypeMap]
          ? workoutTypeMap[options.workoutType as keyof typeof workoutTypeMap]
          : workout.workoutTypeValueId,
      code: options.includeCode ? workout.code : null,
      workoutDay: workout.workoutDay,
      startTime: options.includeStartTime ? workout.startTime : null,
      startTimePlanned: options.includeStartTimePlanned
        ? workout.startTimePlanned
        : null,
      isItAnOr: workout.isItAnOr,
    };
  });

/**
 * GetWorkoutsListCommand Builder
 * Creates GetWorkoutsListCommand objects for testing
 */
export const getWorkoutsListCommandBuilder =
  new Factory<GetWorkoutsListCommand>()
    .attr('startDate', () => faker.date.past().toISOString().split('T')[0]!)
    .attr('endDate', () => faker.date.future().toISOString().split('T')[0]!)
    .attr('athleteId', () => faker.string.numeric(7))
    .option('includeAthleteId', true)
    .option('startDate', undefined)
    .option('endDate', undefined)
    .option('athleteId', undefined)
    .after((command, options) => {
      // If includeAthleteId is explicitly false, return undefined for athleteId
      const shouldIncludeAthleteId = options.includeAthleteId !== false;

      return {
        athleteId: shouldIncludeAthleteId
          ? options.athleteId !== undefined
            ? options.athleteId
            : command.athleteId
          : undefined,
        startDate:
          options.startDate !== undefined
            ? options.startDate
            : command.startDate,
        endDate:
          options.endDate !== undefined ? options.endDate : command.endDate,
      };
    });

/**
 * Session Builder for Workout Entrypoint Tests
 * Extends the auth session builder with workout-specific defaults
 */
export const workoutSessionBuilder = new Factory<Session>()
  .extend(sessionBuilder)
  .option('userId', '3120341')
  .option('userName', 'Test User')
  .option('tokenType', 'Bearer')
  .option('expiresInMinutes', 60)
  .after((session, options) => {
    const token = authTokenBuilder.build({
      tokenType: options.tokenType,
      expiresIn: (options.expiresInMinutes || 60) * 60,
      expires: new Date(
        Date.now() + (options.expiresInMinutes || 60) * 60 * 1000
      ),
    });

    const user = userBuilder.build({
      id: options.userId,
      name: options.userName,
    });

    return {
      token,
      user,
    };
  });

/**
 * Mock Dependencies Builder
 * Creates mock WorkoutEntrypointDependencies objects for testing
 * Note: This returns the structure but callers need to apply vi.fn() to methods
 */
export const mockWorkoutDependenciesBuilder =
  new Factory<WorkoutEntrypointDependencies>()
    .attr('logger', () => ({
      info: (message: string, ...args: unknown[]) => {
        // Stub implementation - parameters unused
        void message;
        void args;
      },
      error: (message: string, ...args: unknown[]) => {
        // Stub implementation - parameters unused
        void message;
        void args;
      },
      warn: (message: string, ...args: unknown[]) => {
        // Stub implementation - parameters unused
        void message;
        void args;
      },
      debug: (message: string, ...args: unknown[]) => {
        // Stub implementation - parameters unused
        void message;
        void args;
      },
    }))
    .attr('tpRepository', () => ({
      login: () => Promise.resolve({} as any),
      logout: () => Promise.resolve(),
      getWorkoutsList: () => Promise.resolve([] as any),
    }))
    .attr('sessionStorage', () => ({
      get: () => Promise.resolve(null),
      set: () => Promise.resolve(),
      clear: () => Promise.resolve(),
    }));

/**
 * Predefined Builders for Common Workout Entrypoint Test Scenarios
 */

/**
 * Strength Workout Item Builder
 * Creates workout list items for strength training
 */
export const strengthWorkoutItemBuilder = new Factory<WorkoutListItem>()
  .extend(workoutListItemBuilder)
  .option('workoutType', 'strength')
  .option('title', 'Strength')
  .option('includeStartTime', true)
  .option('includeStartTimePlanned', false);

/**
 * Running Workout Item Builder
 * Creates workout list items for running
 */
export const runningWorkoutItemBuilder = new Factory<WorkoutListItem>()
  .extend(workoutListItemBuilder)
  .option('workoutType', 'running')
  .option('title', 'Morning Run')
  .option('includeStartTime', true)
  .option('includeStartTimePlanned', true);

/**
 * API Response Array Builder
 * Creates arrays of WorkoutListItem for API response testing
 */
type WorkoutListBuilderOptions = {
  athleteId?: number;
  workoutType?: number;
};

export const workoutListResponseBuilder = new Factory<
  readonly WorkoutListItem[]
>()
  .option('count', 1)
  .option('workoutType', undefined)
  .option('athleteId', undefined)
  .after((_, options) => {
    const count = options.count || 1;
    const builderOptions: WorkoutListBuilderOptions = {};

    if (options.athleteId) {
      builderOptions.athleteId = options.athleteId;
    }
    if (options.workoutType) {
      builderOptions.workoutType = options.workoutType;
    }

    return Array.from({ length: count }, () =>
      workoutListItemBuilder.build(builderOptions)
    );
  });

/**
 * Command Builder for Date Range Testing
 * Creates commands with specific date ranges
 */
export const dateRangeCommandBuilder = new Factory<GetWorkoutsListCommand>()
  .extend(getWorkoutsListCommandBuilder)
  .option('startDate', '2025-04-07')
  .option('endDate', '2025-04-08')
  .option('includeAthleteId', false);

/**
 * Command Builder with Athlete ID
 * Creates commands with specific athlete ID
 */
export const athleteSpecificCommandBuilder =
  new Factory<GetWorkoutsListCommand>()
    .extend(getWorkoutsListCommandBuilder)
    .option('athleteId', '9999999')
    .option('includeAthleteId', true)
    .option('startDate', '2025-04-07')
    .option('endDate', '2025-04-08');

/**
 * Helper functions for creating test data
 */



/**
 * Creates a session for workout entrypoint testing
 */
export const createWorkoutSession = () => {
  return workoutSessionBuilder.build();
};
