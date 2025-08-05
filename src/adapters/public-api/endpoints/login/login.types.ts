/**
 * Login Endpoint Types
 * TypeScript types derived from login endpoint schemas
 */

import type { z } from 'zod';

import type {
  LoginEndpointResponseSchema,
  LoginPageResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
} from './login.schemas';

// Request Types
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Response Types
export type LoginEndpointResponse = z.infer<typeof LoginEndpointResponseSchema>;
export type LoginPageResponse = z.infer<typeof LoginPageResponseSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
