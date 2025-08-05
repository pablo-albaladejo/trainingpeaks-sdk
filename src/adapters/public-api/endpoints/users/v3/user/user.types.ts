/**
 * User Endpoint Types
 * TypeScript types derived from user endpoint schemas
 */

import type { z } from 'zod';

import type {
  TrainingPeaksUserResponseSchema,
  UpdateUserPreferencesEndpointResponseSchema,
  UpdateUserProfileEndpointResponseSchema,
  UserInfoResponseSchema,
  UserPreferencesEndpointResponseSchema,
  UserProfileEndpointResponseSchema,
} from './user.schemas';

// Response Types
export type UserProfileEndpointResponse = z.infer<
  typeof UserProfileEndpointResponseSchema
>;
export type UpdateUserProfileEndpointResponse = z.infer<
  typeof UpdateUserProfileEndpointResponseSchema
>;
export type UserPreferencesEndpointResponse = z.infer<
  typeof UserPreferencesEndpointResponseSchema
>;
export type UpdateUserPreferencesEndpointResponse = z.infer<
  typeof UpdateUserPreferencesEndpointResponseSchema
>;
export type TrainingPeaksUserResponse = z.infer<
  typeof TrainingPeaksUserResponseSchema
>;
export type UserInfoResponse = z.infer<typeof UserInfoResponseSchema>;

// Utility Types
export type TrainingPeaksUser = TrainingPeaksUserResponse['user'];
export type UserAccountStatus = TrainingPeaksUserResponse['accountStatus'];
