import {
  createWorkoutRequestBuilder,
  emptyWorkoutsListBuilder,
  runningWorkoutResponseBuilder,
  singleWorkoutListBuilder,
  updateWorkoutRequestBuilder,
  workoutFiltersBuilder,
  workoutResponseBuilder,
  workoutsListResponseBuilder,
  workoutStatsBuilder,
} from '@fixtures';
import { describe, expect, it } from 'vitest';

import {
  type CreateWorkoutRequest,
  CreateWorkoutRequestSchema,
  type UpdateWorkoutRequest,
  UpdateWorkoutRequestSchema,
  type WorkoutFilters,
  WorkoutFiltersSchema,
  type WorkoutResponse,
  WorkoutResponseSchema,
  type WorkoutsListResponse,
  WorkoutsListResponseSchema,
  type WorkoutStats,
  WorkoutStatsSchema,
} from './workout';

describe('Application Workout Schemas', () => {
  describe('WorkoutResponseSchema', () => {
    it('should validate valid workout response', () => {
      const validWorkout = workoutResponseBuilder.build();

      expect(() => WorkoutResponseSchema.parse(validWorkout)).not.toThrow();
    });

    it('should validate workout response without optional description', () => {
      const validWorkout = workoutResponseBuilder.build({
        workout: workoutResponseBuilder.build().workout,
      });
      // Remove description if it exists
      delete validWorkout.workout.description;

      expect(() => WorkoutResponseSchema.parse(validWorkout)).not.toThrow();
    });

    it('should reject workout with empty id', () => {
      const invalidWorkout = workoutResponseBuilder.build();
      invalidWorkout.workout.id = '';

      expect(() => WorkoutResponseSchema.parse(invalidWorkout)).toThrow();
    });

    it('should reject workout with negative duration', () => {
      const invalidWorkout = workoutResponseBuilder.build();
      invalidWorkout.workout.duration = -100;

      expect(() => WorkoutResponseSchema.parse(invalidWorkout)).toThrow();
    });

    it('should reject workout with name exceeding 200 characters', () => {
      const invalidWorkout = workoutResponseBuilder.build();
      invalidWorkout.workout.name = 'A'.repeat(201);

      expect(() => WorkoutResponseSchema.parse(invalidWorkout)).toThrow();
    });
  });

  describe('WorkoutsListResponseSchema', () => {
    it('should validate valid workouts list response', () => {
      const validResponse = workoutsListResponseBuilder.build({
        totalCount: 2,
        workoutCount: 2,
      });

      expect(() =>
        WorkoutsListResponseSchema.parse(validResponse)
      ).not.toThrow();
    });

    it('should validate empty workouts list', () => {
      const validResponse = emptyWorkoutsListBuilder.build();

      expect(() =>
        WorkoutsListResponseSchema.parse(validResponse)
      ).not.toThrow();
    });

    it('should reject negative total', () => {
      const invalidResponse = emptyWorkoutsListBuilder.build();
      invalidResponse.total = -1;

      expect(() => WorkoutsListResponseSchema.parse(invalidResponse)).toThrow();
    });

    it('should reject non-integer total', () => {
      const invalidResponse = emptyWorkoutsListBuilder.build();
      invalidResponse.total = 1.5;

      expect(() => WorkoutsListResponseSchema.parse(invalidResponse)).toThrow();
    });
  });

  describe('WorkoutStatsSchema', () => {
    it('should validate valid workout stats', () => {
      const validStats = workoutStatsBuilder.build();

      expect(() => WorkoutStatsSchema.parse(validStats)).not.toThrow();
    });

    it('should reject negative values', () => {
      const invalidStats = workoutStatsBuilder.build();
      invalidStats.totalWorkouts = -1;

      expect(() => WorkoutStatsSchema.parse(invalidStats)).toThrow();
    });

    it('should reject non-integer totalWorkouts', () => {
      const invalidStats = workoutStatsBuilder.build();
      invalidStats.totalWorkouts = 10.5;

      expect(() => WorkoutStatsSchema.parse(invalidStats)).toThrow();
    });

    it('should reject empty favoriteType', () => {
      const invalidStats = workoutStatsBuilder.build();
      invalidStats.favoriteType = '';

      expect(() => WorkoutStatsSchema.parse(invalidStats)).toThrow();
    });
  });

  describe('CreateWorkoutRequestSchema', () => {
    it('should validate valid create workout request', () => {
      const validRequest = createWorkoutRequestBuilder.build();

      expect(() =>
        CreateWorkoutRequestSchema.parse(validRequest)
      ).not.toThrow();
    });

    it('should validate request without optional fields', () => {
      const validRequest = createWorkoutRequestBuilder.build();
      // Remove optional fields
      delete validRequest.description;
      delete validRequest.distance;
      delete validRequest.calories;

      expect(() =>
        CreateWorkoutRequestSchema.parse(validRequest)
      ).not.toThrow();
    });

    it('should reject empty name', () => {
      const invalidRequest = createWorkoutRequestBuilder.build();
      invalidRequest.name = '';

      expect(() => CreateWorkoutRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject name exceeding 200 characters', () => {
      const invalidRequest = createWorkoutRequestBuilder.build();
      invalidRequest.name = 'A'.repeat(201);

      expect(() => CreateWorkoutRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject negative duration', () => {
      const invalidRequest = createWorkoutRequestBuilder.build();
      invalidRequest.duration = -100;

      expect(() => CreateWorkoutRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject negative distance', () => {
      const invalidRequest = createWorkoutRequestBuilder.build();
      invalidRequest.distance = -10;

      expect(() => CreateWorkoutRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject negative calories', () => {
      const invalidRequest = createWorkoutRequestBuilder.build();
      invalidRequest.calories = -500;

      expect(() => CreateWorkoutRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('UpdateWorkoutRequestSchema', () => {
    it('should validate valid update workout request', () => {
      const validRequest = updateWorkoutRequestBuilder.build();

      expect(() =>
        UpdateWorkoutRequestSchema.parse(validRequest)
      ).not.toThrow();
    });

    it('should validate request with only id', () => {
      const validRequest = updateWorkoutRequestBuilder.build();
      // Keep only the id field
      const idOnlyRequest = { id: validRequest.id };

      expect(() =>
        UpdateWorkoutRequestSchema.parse(idOnlyRequest)
      ).not.toThrow();
    });

    it('should validate request with partial updates', () => {
      const validRequest = updateWorkoutRequestBuilder.build();
      // Keep only some fields
      const partialRequest = {
        id: validRequest.id,
        name: 'Updated Name',
        duration: 5400,
      };

      expect(() =>
        UpdateWorkoutRequestSchema.parse(partialRequest)
      ).not.toThrow();
    });

    it('should reject empty id', () => {
      const invalidRequest = updateWorkoutRequestBuilder.build();
      invalidRequest.id = '';

      expect(() => UpdateWorkoutRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject empty name when provided', () => {
      const invalidRequest = updateWorkoutRequestBuilder.build();
      invalidRequest.name = '';

      expect(() => UpdateWorkoutRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject negative duration when provided', () => {
      const invalidRequest = updateWorkoutRequestBuilder.build();
      invalidRequest.duration = -100;

      expect(() => UpdateWorkoutRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('WorkoutFiltersSchema', () => {
    it('should validate valid workout filters', () => {
      const validFilters = workoutFiltersBuilder.build({
        includeDateRange: true,
        includeType: true,
        includePagination: true,
      });

      expect(() => WorkoutFiltersSchema.parse(validFilters)).not.toThrow();
    });

    it('should validate empty filters', () => {
      const validFilters = workoutFiltersBuilder.build({
        includeDateRange: false,
        includeType: false,
        includePagination: false,
      });

      expect(() => WorkoutFiltersSchema.parse(validFilters)).not.toThrow();
    });

    it('should validate filters with some fields', () => {
      const validFilters = workoutFiltersBuilder.build({
        includeDateRange: false,
        includeType: true,
        includePagination: true,
      });
      validFilters.limit = 5;

      expect(() => WorkoutFiltersSchema.parse(validFilters)).not.toThrow();
    });

    it('should reject empty type when provided', () => {
      const invalidFilters = workoutFiltersBuilder.build({
        includeType: true,
      });
      invalidFilters.type = '';

      expect(() => WorkoutFiltersSchema.parse(invalidFilters)).toThrow();
    });

    it('should reject negative limit', () => {
      const invalidFilters = workoutFiltersBuilder.build({
        includePagination: true,
      });
      invalidFilters.limit = -1;

      expect(() => WorkoutFiltersSchema.parse(invalidFilters)).toThrow();
    });

    it('should reject non-integer limit', () => {
      const invalidFilters = workoutFiltersBuilder.build({
        includePagination: true,
      });
      invalidFilters.limit = 10.5;

      expect(() => WorkoutFiltersSchema.parse(invalidFilters)).toThrow();
    });

    it('should reject negative offset', () => {
      const invalidFilters = workoutFiltersBuilder.build({
        includePagination: true,
      });
      invalidFilters.offset = -1;

      expect(() => WorkoutFiltersSchema.parse(invalidFilters)).toThrow();
    });

    it('should reject non-integer offset', () => {
      const invalidFilters = workoutFiltersBuilder.build({
        includePagination: true,
      });
      invalidFilters.offset = 10.5;

      expect(() => WorkoutFiltersSchema.parse(invalidFilters)).toThrow();
    });
  });

  describe('Type inference', () => {
    it('should correctly infer types from schemas', () => {
      // This test ensures type exports work correctly
      const workoutResponse: WorkoutResponse =
        runningWorkoutResponseBuilder.build();
      const workoutsListResponse: WorkoutsListResponse =
        singleWorkoutListBuilder.build();
      const workoutStats: WorkoutStats = workoutStatsBuilder.build();
      const createRequest: CreateWorkoutRequest =
        createWorkoutRequestBuilder.build();
      const updateRequest: UpdateWorkoutRequest =
        updateWorkoutRequestBuilder.build();
      const filters: WorkoutFilters = workoutFiltersBuilder.build({
        includePagination: true,
      });

      // If these compile without errors, type inference works
      expect(workoutResponse.workout.id).toBeDefined();
      expect(workoutsListResponse.total).toBeDefined();
      expect(workoutStats.totalWorkouts).toBeDefined();
      expect(createRequest.name).toBeDefined();
      expect(updateRequest.id).toBeDefined();
      expect(filters.limit).toBeDefined();
    });
  });
});
