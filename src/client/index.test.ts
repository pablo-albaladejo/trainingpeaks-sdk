/**
 * TrainingPeaks Client Tests
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { TrainingPeaksConfigFixture } from '../__fixtures__/trainingPeaksConfig.fixture';
import { randomNumber } from '../__fixtures__/utils.fixture';
import { TrainingPeaksClient } from './index';

describe('TrainingPeaksClient', () => {
  let client: TrainingPeaksClient;

  beforeEach(() => {
    client = new TrainingPeaksClient();
  });

  describe('constructor', () => {
    it('should create a client with default configuration', () => {
      // Arrange
      const expectedConfig = TrainingPeaksConfigFixture.default();

      // Act
      const actualConfig = client.getConfig();

      // Assert
      expect(actualConfig.baseUrl).toStrictEqual(expectedConfig.baseUrl);
      expect(actualConfig.timeout).toStrictEqual(expectedConfig.timeout);
      expect(actualConfig.debug).toStrictEqual(expectedConfig.debug);
    });

    it('should create a client with custom configuration', () => {
      // Arrange
      const customConfig = TrainingPeaksConfigFixture.random();

      // Act
      const customClient = new TrainingPeaksClient(customConfig);
      const actualConfig = customClient.getConfig();

      // Assert
      expect(actualConfig.baseUrl).toStrictEqual(customConfig.baseUrl);
      expect(actualConfig.timeout).toStrictEqual(customConfig.timeout);
      expect(actualConfig.debug).toStrictEqual(customConfig.debug);
    });
  });

  describe('getAuth', () => {
    it('should return authentication module', () => {
      // Arrange
      // No specific arrangement needed

      // Act
      const auth = client.getAuth();

      // Assert
      expect(auth).toBeDefined();
      expect(typeof auth.login).toStrictEqual('function');
      expect(typeof auth.logout).toStrictEqual('function');
      expect(typeof auth.isAuthenticated).toStrictEqual('function');
    });
  });

  describe('getWorkoutUploader', () => {
    it('should return workout uploader module', () => {
      // Arrange
      // No specific arrangement needed

      // Act
      const uploader = client.getWorkoutUploader();

      // Assert
      expect(uploader).toBeDefined();
      expect(typeof uploader.uploadWorkout).toStrictEqual('function');
      expect(typeof uploader.getUploadStatus).toStrictEqual('function');
    });
  });

  describe('isReady', () => {
    it('should return false when not authenticated', () => {
      // Arrange
      // Client is not authenticated by default

      // Act
      const isReady = client.isReady();

      // Assert
      expect(isReady).toStrictEqual(false);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      // Arrange
      const newTimeout = randomNumber(5000, 20000);
      const newConfig = { timeout: newTimeout };
      const originalBaseUrl = client.getConfig().baseUrl;

      // Act
      client.updateConfig(newConfig);
      const updatedConfig = client.getConfig();

      // Assert
      expect(updatedConfig.timeout).toStrictEqual(newTimeout);
      expect(updatedConfig.baseUrl).toStrictEqual(originalBaseUrl); // Should keep existing values
    });

    it('should preserve existing config values when updating', () => {
      // Arrange
      const initialConfig = TrainingPeaksConfigFixture.random();
      const clientWithConfig = new TrainingPeaksClient(initialConfig);
      const partialUpdate = { debug: !initialConfig.debug };

      // Act
      clientWithConfig.updateConfig(partialUpdate);
      const updatedConfig = clientWithConfig.getConfig();

      // Assert
      expect(updatedConfig.debug).toStrictEqual(partialUpdate.debug);
      expect(updatedConfig.baseUrl).toStrictEqual(initialConfig.baseUrl);
      expect(updatedConfig.timeout).toStrictEqual(initialConfig.timeout);
    });
  });
});
