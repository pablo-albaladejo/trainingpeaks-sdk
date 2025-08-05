/**
 * User API Mappers
 * Maps between TrainingPeaks API responses and domain entities
 */

import type { UserProfileEndpointResponse } from '@/adapters/public-api/endpoints/users/v3/user';
import { createUser, type User } from '@/domain';

/**
 * Maps TrainingPeaks API user response to domain User entity
 */
export const mapTPUserToUser = (
  tpUser: UserProfileEndpointResponse['user']
): User => {
  const userName =
    tpUser.fullName || `${tpUser.firstName} ${tpUser.lastName}`.trim();
  const preferences = {
    timezone: tpUser.timeZone,
    language: tpUser.language,
    units: tpUser.units === 1 ? 'metric' : 'imperial',
    dateFormat: tpUser.dateFormat,
    temperatureUnit: tpUser.temperatureUnit,
    email: tpUser.email,
  };

  return createUser(
    tpUser.userId.toString(),
    userName,
    tpUser.personPhotoUrl || undefined,
    preferences
  );
};

/**
 * Maps multiple TrainingPeaks users to domain users
 */
export const mapTPUsersToUsers = (
  tpUsers: UserProfileEndpointResponse['user'][]
): User[] => {
  return tpUsers.map(mapTPUserToUser);
};

/**
 * Safe mapper that handles potentially undefined TrainingPeaks user
 */
export const mapTPUserToUserSafe = (
  tpUser: UserProfileEndpointResponse['user'] | undefined | null
): User | null => {
  if (!tpUser) {
    return null;
  }
  return mapTPUserToUser(tpUser);
};
