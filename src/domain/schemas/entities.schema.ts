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
  username: z.string().min(1).max(100),
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

// TrainingPeaks Athlete Entity Schema
export const TrainingPeaksAthleteSchema = z.object({
  athleteId: z.number().positive(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  cellPhone: z.string().nullable().optional(),
  age: z.number().nonnegative().optional(),
  athleteType: z.number(),
  userType: z.number(),
  lastPlannedWorkout: z.string().nullable().optional(),
  settings: z.unknown().optional(),
  personPhotoUrl: z.string().url().nullable().optional(),
  coachedBy: z.number().nullable().optional(),
  userName: z.string().min(1),
  lastUpgradeOn: z.string().nullable().optional(),
  downgradeAllowed: z.boolean().default(false),
  expireOn: z.string(),
  premiumTrial: z.boolean().default(false),
  premiumTrialDaysRemaining: z.number().nonnegative().default(0),
  downgradeAllowedOn: z.string().optional(),
  workoutIndexState: z.number().default(0),
  prCalcState: z.number().default(0),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type AuthToken = z.infer<typeof AuthTokenSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type TrainingPeaksAthlete = z.infer<typeof TrainingPeaksAthleteSchema>;
