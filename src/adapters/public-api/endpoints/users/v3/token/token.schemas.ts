/**
 * Token Endpoint Schemas
 * Zod schemas for token-related API requests and responses
 */

import { z } from 'zod';

/**
 * GET /users/v3/token - Get authentication token
 */
export const TokenEndpointResponseSchema = z.object({
  success: z.boolean(),
  token: z.object({
    access_token: z.string().min(1),
    token_type: z.string(),
    expires_in: z.number(),
    expires: z.string(), // ISO date string
    refresh_token: z.string().optional(),
    scope: z.string().optional(),
  }),
});

/**
 * POST /users/v3/token/refresh - Refresh authentication token request
 */
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

/**
 * POST /users/v3/token/refresh - Refresh authentication token
 */
export const RefreshTokenEndpointResponseSchema = TokenEndpointResponseSchema;

/**
 * Enhanced TrainingPeaks Token Response Schema
 */
export const TrainingPeaksTokenResponseSchema = z.object({
  success: z.boolean(),
  token: z.object({
    access_token: z.string().min(1),
    token_type: z.string(),
    expires_in: z.number(),
    refresh_token: z.string(),
    scope: z.string(),
    expires: z.string(),
  }),
});

/**
 * Token Response with HTTP metadata
 */
export const TokenResponseSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  data: z.object({
    token: z.object({
      access_token: z.string().min(1),
      token_type: z.string().min(1),
      expires_in: z.number().int().positive(),
      refresh_token: z.string().min(1).optional(),
      scope: z.string().optional(),
      expires: z.string().optional(),
    }),
  }),
  headers: z.record(z.string(), z.string()),
  cookies: z.array(z.string()),
});
