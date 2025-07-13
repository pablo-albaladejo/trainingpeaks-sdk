/**
 * Get Workout Use Case
 * Handles retrieving workout information
 */

import { Workout } from '../../domain/entities/workout';
import { WorkoutRepository } from '../../domain/repositories/workout';

export interface GetWorkoutRequest {
  workoutId: string;
}

export class GetWorkoutUseCase {
  constructor(private readonly workoutRepository: WorkoutRepository) {}

  public async execute(request: GetWorkoutRequest): Promise<Workout> {
    if (!request.workoutId || request.workoutId.trim().length === 0) {
      throw new Error('Workout ID is required');
    }

    const workout = await this.workoutRepository.getWorkout(request.workoutId);

    if (!workout) {
      throw new Error(`Workout not found: ${request.workoutId}`);
    }

    return workout;
  }
}
