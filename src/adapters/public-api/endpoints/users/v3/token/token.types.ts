/**
 * Token Endpoint Types
 * TypeScript types derived from token endpoint schemas
 */

import type { z } from 'zod';

import type {
  RefreshTokenEndpointResponseSchema,
  RefreshTokenRequestSchema,
  TokenEndpointResponseSchema,
  TokenResponseSchema,
  TrainingPeaksTokenResponseSchema,
} from './token.schemas';

// Request Types
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

// Response Types
export type TokenEndpointResponse = z.infer<typeof TokenEndpointResponseSchema>;
export type RefreshTokenEndpointResponse = z.infer<
  typeof RefreshTokenEndpointResponseSchema
>;
export type TrainingPeaksTokenResponse = z.infer<
  typeof TrainingPeaksTokenResponseSchema
>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;

// Utility Types
export type TrainingPeaksToken = TrainingPeaksTokenResponse['token'];
