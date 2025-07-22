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

// Type exports
export type Credentials = z.infer<typeof CredentialsSchema>;
export type WorkoutFile = z.infer<typeof WorkoutFileSchema>;
