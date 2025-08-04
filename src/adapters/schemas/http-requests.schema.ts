/**
 * HTTP Request Schemas
 * Zod schemas for HTTP API request validation (Adapters Layer)
 */

import { z } from 'zod';

// LoginRequest Schema
export const LoginRequestSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1),
});

// RefreshTokenRequest Schema
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

// ApiConfig Schema
export const ApiConfigSchema = z.object({
  baseURL: z.string().url(),
  timeout: z.number().positive().optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

// Type exports
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type ApiConfig = z.infer<typeof ApiConfigSchema>;
