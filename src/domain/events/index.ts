/**
 * Domain Events
 *
 * Events that represent important business occurrences in the domain.
 * These events can be used for logging, notifications, or triggering side effects.
 */

// Base Domain Event
export interface DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly eventVersion: number;
}

// Authentication Events
export interface UserLoggedInEvent extends DomainEvent {
  readonly eventType: 'USER_LOGGED_IN';
  readonly aggregateType: 'USER';
  readonly userId: string;
  readonly loginMethod: 'web' | 'credentials';
}

export interface UserLoggedOutEvent extends DomainEvent {
  readonly eventType: 'USER_LOGGED_OUT';
  readonly aggregateType: 'USER';
  readonly userId: string;
}

export interface AuthenticationFailedEvent extends DomainEvent {
  readonly eventType: 'AUTHENTICATION_FAILED';
  readonly aggregateType: 'USER';
  readonly reason: string;
  readonly attemptedUsername?: string;
}

// Workout Events
export interface WorkoutUploadedEvent extends DomainEvent {
  readonly eventType: 'WORKOUT_UPLOADED';
  readonly aggregateType: 'WORKOUT';
  readonly workoutId: string;
  readonly workoutType: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly uploadDuration: number;
}

export interface WorkoutDeletedEvent extends DomainEvent {
  readonly eventType: 'WORKOUT_DELETED';
  readonly aggregateType: 'WORKOUT';
  readonly workoutId: string;
}

export interface StructuredWorkoutCreatedEvent extends DomainEvent {
  readonly eventType: 'STRUCTURED_WORKOUT_CREATED';
  readonly aggregateType: 'WORKOUT';
  readonly workoutId: string;
  readonly workoutName: string;
  readonly structureType: string;
  readonly totalSteps: number;
}

export interface WorkoutUploadFailedEvent extends DomainEvent {
  readonly eventType: 'WORKOUT_UPLOAD_FAILED';
  readonly aggregateType: 'WORKOUT';
  readonly fileName: string;
  readonly errorType: string;
  readonly errorMessage: string;
}

// Network Events
export interface NetworkRequestStartedEvent extends DomainEvent {
  readonly eventType: 'NETWORK_REQUEST_STARTED';
  readonly aggregateType: 'NETWORK';
  readonly requestId: string;
  readonly method: string;
  readonly url: string;
  readonly timestamp: number;
}

export interface NetworkRequestCompletedEvent extends DomainEvent {
  readonly eventType: 'NETWORK_REQUEST_COMPLETED';
  readonly aggregateType: 'NETWORK';
  readonly requestId: string;
  readonly statusCode: number;
  readonly duration: number;
  readonly success: boolean;
}

// Type union for all domain events
export type AllDomainEvents =
  | UserLoggedInEvent
  | UserLoggedOutEvent
  | AuthenticationFailedEvent
  | WorkoutUploadedEvent
  | WorkoutDeletedEvent
  | StructuredWorkoutCreatedEvent
  | WorkoutUploadFailedEvent
  | NetworkRequestStartedEvent
  | NetworkRequestCompletedEvent;

// Event factory helpers
export const createUserLoggedInEvent = (
  userId: string,
  loginMethod: 'web' | 'credentials'
): UserLoggedInEvent => ({
  eventId: crypto.randomUUID(),
  occurredAt: new Date(),
  eventType: 'USER_LOGGED_IN',
  aggregateId: userId,
  aggregateType: 'USER',
  eventVersion: 1,
  userId,
  loginMethod,
});

export const createWorkoutUploadedEvent = (
  workoutId: string,
  workoutType: string,
  fileName: string,
  fileSize: number,
  uploadDuration: number
): WorkoutUploadedEvent => ({
  eventId: crypto.randomUUID(),
  occurredAt: new Date(),
  eventType: 'WORKOUT_UPLOADED',
  aggregateId: workoutId,
  aggregateType: 'WORKOUT',
  eventVersion: 1,
  workoutId,
  workoutType,
  fileName,
  fileSize,
  uploadDuration,
});

export const createStructuredWorkoutCreatedEvent = (
  workoutId: string,
  workoutName: string,
  structureType: string,
  totalSteps: number
): StructuredWorkoutCreatedEvent => ({
  eventId: crypto.randomUUID(),
  occurredAt: new Date(),
  eventType: 'STRUCTURED_WORKOUT_CREATED',
  aggregateId: workoutId,
  aggregateType: 'WORKOUT',
  eventVersion: 1,
  workoutId,
  workoutName,
  structureType,
  totalSteps,
});
