/**
 * API Endpoints Constants
 * Centralized definition of API endpoints used across the application
 */

export const API_ENDPOINTS = {
  // Entity names
  ENTITIES: {
    USERS: 'users',
    WORKOUTS: 'workouts',
  },
  // Users API
  USERS: {
    TOKEN: 'token',
    TOKEN_REFRESH: 'token/refresh',
    USER: 'user',
    PREFERENCES: 'preferences',
    SETTINGS: 'settings',
  },
  // Workouts API
  WORKOUTS: {
    WORKOUTS: 'workouts',
  },
} as const;

export type ApiEndpointPath =
  (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS][keyof (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]];
