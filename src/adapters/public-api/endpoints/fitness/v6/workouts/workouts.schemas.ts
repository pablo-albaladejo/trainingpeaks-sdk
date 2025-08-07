/**
 * Workouts API Schemas
 * Zod validation schemas for fitness/v6/workouts endpoints
 */

import { z } from 'zod';

/**
 * Schema for single workout item from API
 */
export const ApiWorkoutItemSchema = z.object({
  workoutId: z.number(),
  athleteId: z.number(),
  title: z.string(),
  workoutTypeValueId: z.number(),
  code: z.string().nullable(),
  workoutDay: z.string(),
  startTime: z.string().nullable(),
  startTimePlanned: z.string().nullable(),
  isItAnOr: z.boolean(),
});

/**
 * Schema for workouts list API response
 */
export const GetWorkoutsListApiResponseSchema = z.array(ApiWorkoutItemSchema);

/**
 * Schema for request parameters
 */
export const GetWorkoutsListParamsSchema = z.object({
  athleteId: z.string(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format'),
});
