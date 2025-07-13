/**
 * List Workouts Use Case
 * Handles retrieving a list of workouts
 */

import { Workout } from '@/domain/entities/workout';
import { WorkoutRepository } from '@/domain/repositories/workout';

export interface ListWorkoutsRequest {
  startDate?: Date;
  endDate?: Date;
  activityType?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export class ListWorkoutsUseCase {
  constructor(private readonly workoutRepository: WorkoutRepository) {}

  public async execute(request: ListWorkoutsRequest = {}): Promise<Workout[]> {
    // Apply default pagination
    const filters = {
      ...request,
      limit: request.limit || 20,
      offset: request.offset || 0,
    };

    // Validate date range
    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      throw new Error('Start date must be before end date');
    }

    // Validate pagination
    if (filters.limit && filters.limit > 100) {
      throw new Error('Limit cannot exceed 100 workouts');
    }

    if (filters.offset && filters.offset < 0) {
      throw new Error('Offset cannot be negative');
    }

    return await this.workoutRepository.listWorkouts(filters);
  }
}
