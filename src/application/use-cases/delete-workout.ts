/**
 * Delete Workout Use Case
 * Handles workout deletion
 */

import { WorkoutRepository } from '@/domain/repositories/workout';

export interface DeleteWorkoutRequest {
  workoutId: string;
}

export class DeleteWorkoutUseCase {
  constructor(private readonly workoutRepository: WorkoutRepository) {}

  public async execute(request: DeleteWorkoutRequest): Promise<boolean> {
    if (!request.workoutId || request.workoutId.trim().length === 0) {
      throw new Error('Workout ID is required');
    }

    // First check if workout exists
    const existingWorkout = await this.workoutRepository.getWorkout(
      request.workoutId
    );
    if (!existingWorkout) {
      throw new Error(`Workout not found: ${request.workoutId}`);
    }

    // Delete the workout
    return await this.workoutRepository.deleteWorkout(request.workoutId);
  }
}
