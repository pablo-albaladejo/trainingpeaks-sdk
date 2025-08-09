import { UUID_REGEX } from '@fixtures';
import { describe, expect, it, test, vi } from 'vitest';

import { LoginMethod } from '@/types';

import {
  type AllDomainEvents,
  type AuthenticationFailedEvent,
  createStructuredWorkoutCreatedEvent,
  createUserLoggedInEvent,
  createWorkoutUploadedEvent,
  type DomainEvent,
  type NetworkRequestCompletedEvent,
  type NetworkRequestStartedEvent,
  type UserLoggedInEvent,
  type UserLoggedOutEvent,
  type WorkoutDeletedEvent,
  type WorkoutUploadedEvent,
  type WorkoutUploadFailedEvent,
} from './index';

describe('Domain Events', () => {
  describe('Event Factory Functions', () => {
    describe('createUserLoggedInEvent', () => {
      it('should create a user logged in event with correct properties', () => {
        const userId = 'user123';
        const loginMethod = LoginMethod.USERNAME_PASSWORD;

        const event = createUserLoggedInEvent(userId, loginMethod);

        expect(event).toMatchObject({
          eventType: 'USER_LOGGED_IN',
          aggregateType: 'USER',
          aggregateId: userId,
          eventVersion: 1,
          userId,
          loginMethod,
        });

        expect(event.eventId).toBeDefined();
        expect(typeof event.eventId).toBe('string');
        expect(event.eventId).toMatch(UUID_REGEX);

        expect(event.occurredAt).toBeInstanceOf(Date);
        expect(event.occurredAt.getTime()).toBeLessThanOrEqual(Date.now());
      });

      it('should create unique event IDs for multiple calls', () => {
        const event1 = createUserLoggedInEvent(
          'user1',
          LoginMethod.USERNAME_PASSWORD
        );
        const event2 = createUserLoggedInEvent(
          'user2',
          LoginMethod.USERNAME_PASSWORD
        );

        expect(event1.eventId).not.toBe(event2.eventId);
      });

      it('should handle different login methods', () => {
        const methods = [LoginMethod.USERNAME_PASSWORD, LoginMethod.OAUTH];

        methods.forEach((method) => {
          const event = createUserLoggedInEvent('user123', method);
          expect(event.loginMethod).toBe(method);
        });
      });

      it('should create events with recent timestamps', () => {
        vi.useFakeTimers();
        try {
          const fixedTime = new Date('2024-01-01T12:00:00.000Z');
          vi.setSystemTime(fixedTime);

          const event = createUserLoggedInEvent(
            'user123',
            LoginMethod.USERNAME_PASSWORD
          );

          expect(event.occurredAt.getTime()).toBe(fixedTime.getTime());
        } finally {
          vi.useRealTimers();
        }
      });
    });

    describe('createWorkoutUploadedEvent', () => {
      it('should create a workout uploaded event with correct properties', () => {
        const workoutId = 'workout123';
        const workoutType = 'running';
        const fileName = 'morning_run.gpx';
        const fileSize = 1024;
        const uploadDuration = 5000;

        const event = createWorkoutUploadedEvent(
          workoutId,
          workoutType,
          fileName,
          fileSize,
          uploadDuration
        );

        expect(event).toMatchObject({
          eventType: 'WORKOUT_UPLOADED',
          aggregateType: 'WORKOUT',
          aggregateId: workoutId,
          eventVersion: 1,
          workoutId,
          workoutType,
          fileName,
          fileSize,
          uploadDuration,
        });

        expect(event.eventId).toBeDefined();
        expect(typeof event.eventId).toBe('string');
        expect(event.occurredAt).toBeInstanceOf(Date);
      });

      test.each([
        { fileName: 'ride.tcx', fileSize: 2048, type: 'cycling' },
        { fileName: 'swim.fit', fileSize: 512, type: 'swimming' },
        { fileName: 'workout.gpx', fileSize: 4096, type: 'running' },
      ])(
        'should handle file type $type with size $fileSize',
        ({ fileName, fileSize, type }) => {
          const event = createWorkoutUploadedEvent(
            'workout123',
            type,
            fileName,
            fileSize,
            1000
          );

          expect(event.fileName).toBe(fileName);
          expect(event.fileSize).toBe(fileSize);
          expect(event.workoutType).toBe(type);
        }
      );

      it('should handle zero and large file sizes', () => {
        const zeroSizeEvent = createWorkoutUploadedEvent(
          'w1',
          'running',
          'empty.gpx',
          0,
          100
        );
        expect(zeroSizeEvent.fileSize).toBe(0);

        const largeSizeEvent = createWorkoutUploadedEvent(
          'w2',
          'cycling',
          'large.tcx',
          10_000_000,
          30_000
        );
        expect(largeSizeEvent.fileSize).toBe(10_000_000);
        expect(largeSizeEvent.uploadDuration).toBe(30_000);
      });
    });

    describe('createStructuredWorkoutCreatedEvent', () => {
      it('should create a structured workout created event with correct properties', () => {
        const workoutId = 'structured123';
        const workoutName = 'Interval Training';
        const structureType = 'interval';
        const totalSteps = 8;

        const event = createStructuredWorkoutCreatedEvent(
          workoutId,
          workoutName,
          structureType,
          totalSteps
        );

        expect(event).toMatchObject({
          eventType: 'STRUCTURED_WORKOUT_CREATED',
          aggregateType: 'WORKOUT',
          aggregateId: workoutId,
          eventVersion: 1,
          workoutId,
          workoutName,
          structureType,
          totalSteps,
        });

        expect(event.eventId).toBeDefined();
        expect(typeof event.eventId).toBe('string');
        expect(event.occurredAt).toBeInstanceOf(Date);
      });

      test.each([
        { name: 'Easy Run', type: 'steady', steps: 3 },
        { name: 'Tempo Workout', type: 'tempo', steps: 3 },
        { name: 'Complex Intervals', type: 'interval', steps: 15 },
      ])(
        'should handle $type workout "$name" with $steps steps',
        ({ name, type, steps }) => {
          const event = createStructuredWorkoutCreatedEvent(
            'workout123',
            name,
            type,
            steps
          );

          expect(event.workoutName).toBe(name);
          expect(event.structureType).toBe(type);
          expect(event.totalSteps).toBe(steps);
        }
      );

      it('should handle edge cases for step counts', () => {
        const singleStepEvent = createStructuredWorkoutCreatedEvent(
          'w1',
          'Simple',
          'steady',
          1
        );
        expect(singleStepEvent.totalSteps).toBe(1);

        const manyStepsEvent = createStructuredWorkoutCreatedEvent(
          'w2',
          'Complex',
          'interval',
          100
        );
        expect(manyStepsEvent.totalSteps).toBe(100);
      });
    });
  });

  describe('Type Definitions', () => {
    it('should have DomainEvent base type with required properties', () => {
      // This test ensures the base DomainEvent type structure is correct
      const baseEvent: DomainEvent = {
        eventId: 'test-id',
        occurredAt: new Date(),
        eventType: 'TEST_EVENT',
        aggregateId: 'test-aggregate',
        aggregateType: 'TEST',
        eventVersion: 1,
      };

      expect(baseEvent).toHaveProperty('eventId');
      expect(baseEvent).toHaveProperty('occurredAt');
      expect(baseEvent).toHaveProperty('eventType');
      expect(baseEvent).toHaveProperty('aggregateId');
      expect(baseEvent).toHaveProperty('aggregateType');
      expect(baseEvent).toHaveProperty('eventVersion');
    });

    it('should have UserLoggedInEvent with correct structure', () => {
      const event: UserLoggedInEvent = {
        eventId: 'test-id',
        occurredAt: new Date(),
        eventType: 'USER_LOGGED_IN',
        aggregateId: 'user123',
        aggregateType: 'USER',
        eventVersion: 1,
        userId: 'user123',
        loginMethod: LoginMethod.USERNAME_PASSWORD,
      };

      expect(event.eventType).toBe('USER_LOGGED_IN');
      expect(event.aggregateType).toBe('USER');
      expect(event).toHaveProperty('userId');
      expect(event).toHaveProperty('loginMethod');
    });

    it('should have UserLoggedOutEvent with correct structure', () => {
      const event: UserLoggedOutEvent = {
        eventId: 'test-id',
        occurredAt: new Date(),
        eventType: 'USER_LOGGED_OUT',
        aggregateId: 'user123',
        aggregateType: 'USER',
        eventVersion: 1,
        userId: 'user123',
      };

      expect(event.eventType).toBe('USER_LOGGED_OUT');
      expect(event.aggregateType).toBe('USER');
      expect(event).toHaveProperty('userId');
    });

    it('should have AuthenticationFailedEvent with optional attempted username', () => {
      const eventWithUsername: AuthenticationFailedEvent = {
        eventId: 'test-id',
        occurredAt: new Date(),
        eventType: 'AUTHENTICATION_FAILED',
        aggregateId: 'auth-attempt',
        aggregateType: 'USER',
        eventVersion: 1,
        reason: 'Invalid password',
        attemptedUsername: 'user123',
      };

      const eventWithoutUsername: AuthenticationFailedEvent = {
        eventId: 'test-id',
        occurredAt: new Date(),
        eventType: 'AUTHENTICATION_FAILED',
        aggregateId: 'auth-attempt',
        aggregateType: 'USER',
        eventVersion: 1,
        reason: 'Account locked',
      };

      expect(eventWithUsername).toHaveProperty('attemptedUsername');
      expect(eventWithoutUsername.attemptedUsername).toBeUndefined();
    });

    it('should have workout-related events with correct structures', () => {
      const uploadedEvent: WorkoutUploadedEvent = {
        eventId: 'test-id',
        occurredAt: new Date(),
        eventType: 'WORKOUT_UPLOADED',
        aggregateId: 'workout123',
        aggregateType: 'WORKOUT',
        eventVersion: 1,
        workoutId: 'workout123',
        workoutType: 'running',
        fileName: 'run.gpx',
        fileSize: 1024,
        uploadDuration: 5000,
      };

      const deletedEvent: WorkoutDeletedEvent = {
        eventId: 'test-id',
        occurredAt: new Date(),
        eventType: 'WORKOUT_DELETED',
        aggregateId: 'workout123',
        aggregateType: 'WORKOUT',
        eventVersion: 1,
        workoutId: 'workout123',
      };

      const uploadFailedEvent: WorkoutUploadFailedEvent = {
        eventId: 'test-id',
        occurredAt: new Date(),
        eventType: 'WORKOUT_UPLOAD_FAILED',
        aggregateId: 'upload-attempt',
        aggregateType: 'WORKOUT',
        eventVersion: 1,
        fileName: 'corrupted.gpx',
        errorType: 'PARSE_ERROR',
        errorMessage: 'Invalid XML format',
      };

      expect(uploadedEvent).toHaveProperty('workoutId');
      expect(uploadedEvent).toHaveProperty('fileName');
      expect(uploadedEvent).toHaveProperty('fileSize');
      expect(uploadedEvent).toHaveProperty('uploadDuration');

      expect(deletedEvent).toHaveProperty('workoutId');

      expect(uploadFailedEvent).toHaveProperty('fileName');
      expect(uploadFailedEvent).toHaveProperty('errorType');
      expect(uploadFailedEvent).toHaveProperty('errorMessage');
    });

    it('should have network events with correct structures', () => {
      const startedEvent: NetworkRequestStartedEvent = {
        eventId: 'test-id',
        occurredAt: new Date(),
        eventType: 'NETWORK_REQUEST_STARTED',
        aggregateId: 'request123',
        aggregateType: 'NETWORK',
        eventVersion: 1,
        requestId: 'request123',
        method: 'POST',
        url: 'https://api.example.com/workouts',
        timestamp: Date.now(),
      };

      const completedEvent: NetworkRequestCompletedEvent = {
        eventId: 'test-id',
        occurredAt: new Date(),
        eventType: 'NETWORK_REQUEST_COMPLETED',
        aggregateId: 'request123',
        aggregateType: 'NETWORK',
        eventVersion: 1,
        requestId: 'request123',
        statusCode: 200,
        duration: 1500,
        success: true,
      };

      expect(startedEvent).toHaveProperty('requestId');
      expect(startedEvent).toHaveProperty('method');
      expect(startedEvent).toHaveProperty('url');
      expect(startedEvent).toHaveProperty('timestamp');

      expect(completedEvent).toHaveProperty('requestId');
      expect(completedEvent).toHaveProperty('statusCode');
      expect(completedEvent).toHaveProperty('duration');
      expect(completedEvent).toHaveProperty('success');
    });

    it('should have AllDomainEvents union type that includes all event types', () => {
      // This test ensures the union type is properly defined
      const events: AllDomainEvents[] = [
        createUserLoggedInEvent('user123', LoginMethod.USERNAME_PASSWORD),
        createWorkoutUploadedEvent(
          'workout123',
          'running',
          'run.gpx',
          1024,
          5000
        ),
        createStructuredWorkoutCreatedEvent(
          'structured123',
          'Intervals',
          'interval',
          8
        ),
      ];

      events.forEach((event) => {
        expect(event).toHaveProperty('eventId');
        expect(event).toHaveProperty('eventType');
        expect(event).toHaveProperty('aggregateType');
      });
    });
  });

  describe('Event Consistency', () => {
    it('should generate different event IDs for the same factory function', () => {
      const event1 = createUserLoggedInEvent(
        'same-user',
        LoginMethod.USERNAME_PASSWORD
      );
      const event2 = createUserLoggedInEvent(
        'same-user',
        LoginMethod.USERNAME_PASSWORD
      );

      expect(event1.eventId).not.toBe(event2.eventId);
    });

    it('should create events with consistent version numbers', () => {
      const userEvent = createUserLoggedInEvent(
        'user123',
        LoginMethod.USERNAME_PASSWORD
      );
      const workoutEvent = createWorkoutUploadedEvent(
        'w123',
        'running',
        'run.gpx',
        1024,
        5000
      );
      const structuredEvent = createStructuredWorkoutCreatedEvent(
        's123',
        'Intervals',
        'interval',
        5
      );

      expect(userEvent.eventVersion).toBe(1);
      expect(workoutEvent.eventVersion).toBe(1);
      expect(structuredEvent.eventVersion).toBe(1);
    });

    it('should create events with valid UUID format', () => {
      const events = [
        createUserLoggedInEvent('user123', LoginMethod.USERNAME_PASSWORD),
        createWorkoutUploadedEvent('w123', 'running', 'run.gpx', 1024, 5000),
        createStructuredWorkoutCreatedEvent('s123', 'Intervals', 'interval', 5),
      ];

      events.forEach((event) => {
        expect(event.eventId).toMatch(UUID_REGEX);
      });
    });
  });
});
