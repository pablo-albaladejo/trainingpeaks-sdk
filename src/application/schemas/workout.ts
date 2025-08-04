/**
 * Repository Contract Schemas
 * Zod schemas for repository contract types (Application Layer)
 */

import { z } from 'zod';

// WorkoutResponse Schema
export const WorkoutResponseSchema = z.object({
  workout: z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(200),
    date: z.string(),
    duration: z.number().nonnegative().finite(),
    type: z.string().min(1),
    description: z.string().optional(),
  }),
});

// WorkoutsListResponse Schema
export const WorkoutsListResponseSchema = z.object({
  total: z.number().nonnegative().int(),
  workouts: z.array(WorkoutResponseSchema),
});

// WorkoutStats Schema
export const WorkoutStatsSchema = z.object({
  totalWorkouts: z.number().nonnegative().int(),
  totalDistance: z.number().nonnegative().finite(),
  totalDuration: z.number().nonnegative().finite(),
  totalCalories: z.number().nonnegative().finite(),
  averageDistance: z.number().nonnegative().finite(),
  averageDuration: z.number().nonnegative().finite(),
  favoriteType: z.string().min(1),
});

// CreateWorkoutRequest Schema
export const CreateWorkoutRequestSchema = z.object({
  name: z.string().min(1).max(200),
  date: z.string(),
  duration: z.number().nonnegative().finite(),
  type: z.string().min(1),
  description: z.string().optional(),
  distance: z.number().nonnegative().finite().optional(),
  calories: z.number().nonnegative().finite().optional(),
});

// UpdateWorkoutRequest Schema
export const UpdateWorkoutRequestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  date: z.string().optional(),
  duration: z.number().nonnegative().finite().optional(),
  type: z.string().min(1).optional(),
  description: z.string().optional(),
  distance: z.number().nonnegative().finite().optional(),
  calories: z.number().nonnegative().finite().optional(),
});

// WorkoutFilters Schema
export const WorkoutFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  type: z.string().min(1).optional(),
  limit: z.number().positive().int().optional(),
  offset: z.number().nonnegative().int().optional(),
});

// Type exports
export type WorkoutResponse = z.infer<typeof WorkoutResponseSchema>;
export type WorkoutsListResponse = z.infer<typeof WorkoutsListResponseSchema>;
export type WorkoutStats = z.infer<typeof WorkoutStatsSchema>;
export type CreateWorkoutRequest = z.infer<typeof CreateWorkoutRequestSchema>;
export type UpdateWorkoutRequest = z.infer<typeof UpdateWorkoutRequestSchema>;
export type WorkoutFilters = z.infer<typeof WorkoutFiltersSchema>;