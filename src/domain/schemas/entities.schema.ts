/**
 * Domain Entities Schemas
 * Zod schemas for domain entities validation and serialization
 */

import { z } from 'zod';

import { WorkoutStructureSchema } from './workout-structure.schema';

// User Entity Schema
export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

// AuthToken Entity Schema
export const AuthTokenSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.string().min(1),
  expiresIn: z.number().nonnegative().finite(),
  expires: z.date(),
  refreshToken: z.string().min(1).optional(),
  scope: z.string().min(1).optional(),
});

// Workout Entity Schema
export const WorkoutSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  date: z.date(),
  duration: z.number().nonnegative().finite(),
  distance: z.number().nonnegative().finite().optional(),
  activityType: z.string().min(1).max(50).optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  fileContent: z.string().optional(),
  fileName: z.string().min(1).max(255).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  structure: WorkoutStructureSchema.optional(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type AuthToken = z.infer<typeof AuthTokenSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
