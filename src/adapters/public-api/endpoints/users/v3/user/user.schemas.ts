/**
 * User Endpoint Schemas
 * Zod schemas for user-related API requests and responses
 */

import { z } from 'zod';

import { TrainingPeaksAthleteSchema } from '@/domain/schemas/entities.schema';
import {
  TrainingPeaksSettingsSchema,
  UserPreferencesSchema,
} from '@/domain/schemas/value-objects.schema';

/**
 * GET /users/v3/user - Get user profile
 */
export const UserProfileEndpointResponseSchema = z.object({
  user: z.object({
    userId: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    fullName: z.string().optional(),
    email: z.string().min(1),
    userName: z.string(),
    personPhotoUrl: z.string().nullable().optional(),
    timeZone: z.string().optional(),
    language: z.string().optional(),
    units: z.number().optional(), // 1 = metric, 0 = imperial
    dateFormat: z.string().optional(),
    temperatureUnit: z.union([z.string(), z.number()]).optional(),
    settings: z.unknown().optional(), // Complex nested structure
    athletes: z.array(z.unknown()).optional(), // Array of athlete objects
  }),
});

/**
 * PUT /users/v3/user - Update user profile
 */
export const UpdateUserProfileEndpointResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

/**
 * GET /users/v3/preferences - Get user preferences
 */
export const UserPreferencesEndpointResponseSchema = z.object({
  timeZone: z.string().optional(),
  language: z.string().optional(),
  units: z.number().optional(),
  dateFormat: z.string().optional(),
  temperatureUnit: z.union([z.string(), z.number()]).optional(),
});

/**
 * PUT /users/v3/preferences - Update user preferences
 */
export const UpdateUserPreferencesEndpointResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

/**
 * Enhanced TrainingPeaks User Response Schema
 */
export const TrainingPeaksUserResponseSchema = z.object({
  user: z.object({
    userId: z.number(),
    settings: TrainingPeaksSettingsSchema,
    athletes: z.array(TrainingPeaksAthleteSchema),
    personId: z.number(),
    accountSettingsId: z.number(),
    userName: z.string(),
    email: z.string().min(1),
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

/**
 * User Info Response with HTTP metadata
 */
export const UserInfoResponseSchema = z.object({
  status: z.number(),
  statusText: z.string(),
  data: z.object({
    user: z.object({
      userId: z.string().min(1),
      username: z.string().min(1),
      name: z.string().min(1),
      preferences: UserPreferencesSchema,
    }),
  }),
  headers: z.record(z.string(), z.string()),
  cookies: z.array(z.string()),
});
