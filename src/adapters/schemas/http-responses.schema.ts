/**
 * HTTP Response Schemas
 * Zod schemas for HTTP API response validation and serialization (Adapters Layer)
 */

import { z } from 'zod';

import { TrainingPeaksAthleteSchema } from '@/domain/schemas/entities.schema';
import {
  TrainingPeaksSettingsSchema,
  UserPreferencesSchema,
} from '@/domain/schemas/value-objects.schema';

// UserResponse Schema
export const UserResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string().uuid(),
    username: z.string().min(1),
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    preferences: z.object({
      timezone: z.string().min(1),
      language: z.enum(['en', 'es', 'fr', 'de']),
      units: z.enum(['metric', 'imperial']),
    }),
  }),
});

// ErrorResponse Schema
export const ErrorResponseSchema = z.object({
  success: z.boolean().refine((val) => val === false, {
    message: 'Success must be false for error response',
  }),
  error: z.string().min(1),
});

// TokenResponse Schema
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
      expires: z.string().datetime().optional(),
    }),
  }),
  headers: z.record(z.string(), z.string()),
  cookies: z.array(z.string()),
});

// TokenResponseWithoutExpiration Schema
export const TokenResponseWithoutExpirationSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  data: z.object({
    token: z.object({
      access_token: z.string().min(1),
      token_type: z.string().min(1),
      refresh_token: z.string().min(1).optional(),
      scope: z.string().optional(),
    }),
  }),
  headers: z.record(z.string(), z.string()),
  cookies: z.array(z.string()),
});

// TokenResponseWithZeroExpiration Schema
export const TokenResponseWithZeroExpirationSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  data: z.object({
    token: z.object({
      access_token: z.string().min(1),
      token_type: z.string().min(1),
      expires_in: z
        .number()
        .refine((val) => val === 0, { message: 'Expires in must be 0' }),
      refresh_token: z.string().min(1).optional(),
      scope: z.string().optional(),
    }),
  }),
  headers: z.record(z.string(), z.string()),
  cookies: z.array(z.string()),
});

// UserInfoResponse Schema
export const UserInfoResponseSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  data: z.object({
    user: z.object({
      userId: z.string().uuid(),
      username: z.string().min(1),
      name: z.string().min(1),
      preferences: UserPreferencesSchema,
    }),
  }),
  headers: z.record(z.string(), z.string()),
  cookies: z.array(z.string()),
});

// LoginPageResponse Schema
export const LoginPageResponseSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  data: z.string().min(1), // HTML content
  headers: z.record(z.string(), z.string()),
  cookies: z.array(z.string()),
});

// LoginResponse Schema
export const LoginResponseSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  data: z.string(),
  headers: z.record(z.string(), z.string()),
  cookies: z.array(z.string()),
});

// UserApiResponse Schema
export const UserApiResponseSchema = z.object({
  user: z.object({
    userId: z.string().uuid(),
    username: z.string().min(1),
    name: z.string().min(1),
    preferences: UserPreferencesSchema,
  }),
});

// UserStorageData Schema
export const UserStorageDataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

// AuthTokenStorageData Schema (for serialization with ISO date strings)
export const AuthTokenStorageDataSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.string().min(1),
  expiresAt: z.string().datetime(), // ISO date string for storage
  refreshToken: z.string().min(1).optional(),
});

// TrainingPeaks API Response Schemas
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

export const TrainingPeaksUserResponseSchema = z.object({
  user: z.object({
    userId: z.number(),
    settings: TrainingPeaksSettingsSchema,
    athletes: z.array(TrainingPeaksAthleteSchema),
    personId: z.number(),
    accountSettingsId: z.number(),
    userName: z.string(),
    email: z.string().email(),
    isEmailVerified: z.boolean(),
    firstName: z.string(),
    lastName: z.string(),
    userType: z.number(),
    userIdentifierHash: z.string(),
    expireDate: z.string(),
    premiumTrial: z.boolean(),
    premiumTrialDaysRemaining: z.number(),
    lastLogon: z.string(),
    numberOfVisits: z.number(),
    created: z.string(),
    age: z.number(),
    birthday: z.string(),
    gender: z.string(),
    dateFormat: z.string(),
    timeZone: z.string(),
    units: z.number(),
    temperatureUnit: z.number(),
    windSpeedUnit: z.number(),
    allowMarketingEmails: z.boolean(),
    address: z.string().nullable(),
    address2: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    zipCode: z.string().nullable(),
    country: z.string().nullable(),
    phone: z.string().nullable(),
    cellPhone: z.string().nullable(),
    language: z.string(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    personPhotoUrl: z.string().nullable(),
    affiliateId: z.number(),
    isAthlete: z.boolean(),
    fullName: z.string(),
  }),
  accountStatus: z.object({
    status: z.number(),
    lockedOut: z.boolean(),
    demoExpired: z.boolean(),
    pastDue: z.boolean(),
    pastDueAccountSetup: z.boolean(),
    tooManyBasicAthletes: z.boolean(),
    isAthlete: z.boolean(),
    isCoachedAthlete: z.boolean(),
    isCoach: z.boolean(),
    isCoachingGroupOwner: z.boolean(),
    athleteInZuoraSystem: z.boolean(),
    lockedOutOfMobile: z.boolean(),
    coachingGroupId: z.number().nullable(),
    coachingGroupOwnerId: z.number().nullable(),
    billingTier: z.number(),
    maximumBasicAthletes: z.number(),
    paymentRequired: z.boolean(),
  }),
});

// Type exports
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type TokenResponseWithoutExpiration = z.infer<
  typeof TokenResponseWithoutExpirationSchema
>;
export type TokenResponseWithZeroExpiration = z.infer<
  typeof TokenResponseWithZeroExpirationSchema
>;
export type UserInfoResponse = z.infer<typeof UserInfoResponseSchema>;
export type LoginPageResponse = z.infer<typeof LoginPageResponseSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type UserApiResponse = z.infer<typeof UserApiResponseSchema>;
export type UserStorageData = z.infer<typeof UserStorageDataSchema>;
export type AuthTokenStorageData = z.infer<typeof AuthTokenStorageDataSchema>;

// TrainingPeaks API Response Types
export type TrainingPeaksTokenResponse = z.infer<
  typeof TrainingPeaksTokenResponseSchema
>;
export type TrainingPeaksUserResponse = z.infer<
  typeof TrainingPeaksUserResponseSchema
>;
export type TrainingPeaksUser = TrainingPeaksUserResponse['user'];
