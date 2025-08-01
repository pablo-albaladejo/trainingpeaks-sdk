/**
 * Domain Value Objects Schemas
 * Zod schemas for domain value objects validation and serialization
 */

import { z } from 'zod';

// Credentials Value Object Schema
export const CredentialsSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1),
});

// WorkoutFile Value Object Schema
export const WorkoutFileSchema = z.object({
  fileName: z.string().min(1).max(255),
  content: z.string().min(1),
  mimeType: z.string().min(1).max(100),
});

// WorkoutFileData Value Object Schema
export const WorkoutFileDataSchema = z.object({
  filename: z.string().min(1).max(255),
  content: z.union([
    z.string(),
    z.instanceof(Uint8Array),
    z.instanceof(Buffer),
  ]),
  mimeType: z.string().min(1).max(100),
});

// WorkoutData Value Object Schema
export const WorkoutDataSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  date: z.string().optional(),
  duration: z.number().nonnegative().finite().optional(),
  distance: z.number().nonnegative().finite().optional(),
  type: z.enum(['BIKE', 'RUN', 'SWIM', 'OTHER']).optional(),
  fileData: WorkoutFileDataSchema.optional(),
});

// UserPreferences Value Object Schema
export const UserPreferencesSchema = z.object({
  timezone: z.string().min(1),
  units: z.enum(['metric', 'imperial']),
  language: z.enum(['en', 'es', 'fr', 'de']),
  theme: z.enum(['light', 'dark', 'auto']),
  notifications: z.boolean(),
});

// WorkoutMetadata Value Object Schema
export const WorkoutMetadataSchema = z.object({
  tags: z.array(z.string().min(1)).optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
  weather: z.enum(['sunny', 'cloudy', 'rainy', 'snowy']).optional(),
  temperature: z.number().optional(),
});

// Type exports
export type Credentials = z.infer<typeof CredentialsSchema>;
export type WorkoutFile = z.infer<typeof WorkoutFileSchema>;
export type WorkoutFileData = z.infer<typeof WorkoutFileDataSchema>;
export type WorkoutData = z.infer<typeof WorkoutDataSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type WorkoutMetadata = z.infer<typeof WorkoutMetadataSchema>;
