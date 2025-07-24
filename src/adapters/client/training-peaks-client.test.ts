/**
 * TrainingPeaks Client Tests
 * Tests for the new functional client implementation
 */

import { faker } from '@faker-js/faker';
import { describe, expect, it, vi } from 'vitest';
import { createTrainingPeaksClient } from './training-peaks-client';

// Mock the dependencies
vi.mock('@/application/use-cases/login', () => ({
  executeLoginUseCase: vi.fn(() => vi.fn()),
}));

vi.mock('@/application/use-cases/get-user', () => ({
  executeGetUserUseCase: vi.fn(() => vi.fn()),
}));

vi.mock('@/adapters/services/auth-service', () => ({
  createAuthService: vi.fn(() => ({
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  })),
}));

vi.mock('@/adapters/repositories/auth-repository', () => ({
  createAuthRepository: vi.fn(() => ({})),
}));

vi.mock('@/adapters/repositories/workout-repository', () => ({
  createWorkoutRepository: vi.fn(() => ({})),
}));

vi.mock('@/config', () => ({
  getSDKConfig: vi.fn(() => ({
    urls: { apiBaseUrl: 'https://api.trainingpeaks.com' },
    timeouts: { apiAuth: 5000 },
    debug: {
      enabled: false,
      logAuth: false,
      logNetwork: false,
      logBrowser: false,
    },
  })),
}));

describe('createTrainingPeaksClient', () => {
  it('should create a client instance with all required methods', () => {
    const client = createTrainingPeaksClient();

    expect(client).toBeDefined();
    expect(typeof client.login).toBe('function');
    expect(typeof client.getUser).toBe('function');
  });

  it('should accept configuration options', () => {
    const config = {
      apiKey: faker.string.uuid(),
      baseUrl: faker.internet.url(),
      
    };

    expect(() => createTrainingPeaksClient(config)).not.toThrow();
  });
});
