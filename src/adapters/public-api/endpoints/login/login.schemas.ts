/**
 * Login Endpoint Schemas
 * Zod schemas for login-related API requests and responses
 */

import { z } from 'zod';

/**
 * POST /login - Login form submission request
 */
export const LoginRequestSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1),
});

/**
 * POST /login - Login form submission response
 */
export const LoginEndpointResponseSchema = z.string().min(1); // HTML response

/**
 * Login Page Response with HTTP metadata
 */
export const LoginPageResponseSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  data: z.string().min(1), // HTML content
  headers: z.record(z.string(), z.string()),
  cookies: z.array(z.string()),
});

/**
 * Login Response with HTTP metadata
 */
export const LoginResponseSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  data: z.string(),
  headers: z.record(z.string(), z.string()),
  cookies: z.array(z.string()),
});
