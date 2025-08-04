/**
 * User Mappers
 * Maps between TrainingPeaks API responses and domain entities
 */

import type { User } from '@/domain';
import type { TrainingPeaksUser } from '@/adapters/schemas/http-responses.schema';

/**
 * Maps TrainingPeaks API user response to domain User entity
 */
export const mapTPUserToUser = (
  tpUser: TrainingPeaksUser
): User => {
  return {
    id: tpUser.userId.toString(),
    name: tpUser.fullName || 
          `${tpUser.firstName} ${tpUser.lastName}`.trim(),
    avatar: tpUser.personPhotoUrl || undefined,
    preferences: {
      timezone: tpUser.timeZone,
      language: tpUser.language,
      units: tpUser.units === 1 ? 'metric' : 'imperial',
      dateFormat: tpUser.dateFormat,
      temperatureUnit: tpUser.temperatureUnit,
      email: tpUser.email,
    },
  };
};

/**
 * Maps multiple TrainingPeaks users to domain users
 */
export const mapTPUsersToUsers = (
  tpUsers: TrainingPeaksUser[]
): User[] => {
  return tpUsers.map(mapTPUserToUser);
};

/**
 * Safe mapper that handles potentially undefined TrainingPeaks user
 */
export const mapTPUserToUserSafe = (
  tpUser: TrainingPeaksUser | undefined | null
): User | null => {
  if (!tpUser) {
    return null;
  }
  return mapTPUserToUser(tpUser);
};