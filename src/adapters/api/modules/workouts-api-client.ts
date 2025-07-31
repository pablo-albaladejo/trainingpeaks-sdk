/**
 * Workouts API Client
 * Handles all workout-related API endpoints
 * Example of how to extend the base API client for new entities
 */

import { API_ENDPOINTS, HTTP_STATUS } from '@/adapters/constants';
import type {
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  WorkoutFilters,
  WorkoutRepository,
  WorkoutResponse,
  WorkoutsListResponse,
  WorkoutStats,
} from '@/application/repositories';
import type { AuthToken } from '@/domain';
import { BaseApiClient, type EntityApiConfig } from '../base-api-client';

/**
 * Workouts API Client - implements WorkoutRepository interface
 * Handles only HTTP operations, no business logic
 */
export class WorkoutsApiClient
  extends BaseApiClient
  implements WorkoutRepository
{
  constructor(config: Omit<EntityApiConfig, 'entity'>) {
    super({
      ...config,
      entity: API_ENDPOINTS.ENTITIES.WORKOUTS,
      version: config.version || 'v1',
    });
  }

  /**
   * Get list of workouts with optional filters
   * Returns raw API response data
   */
  async getWorkouts(
    token: AuthToken,
    filters?: WorkoutFilters
  ): Promise<WorkoutsListResponse> {
    this.logger.debug('🏃 Workouts API: Getting workouts list', { filters });

    const endpoint = this.buildEndpoint(
      API_ENDPOINTS.WORKOUTS.WORKOUTS,
      filters as Record<string, string>
    );
    const headers = this.getAuthHeaders(token);

    this.logRequest('GET', endpoint);

    try {
      const response = await this.httpClient.get<WorkoutsListResponse>(
        endpoint,
        headers
      );
      this.logResponse('GET', endpoint, response.status);

      if (response.status !== HTTP_STATUS.OK) {
        throw new Error(`Failed to get workouts: ${response.statusText}`);
      }

      this.logger.debug(
        '🏃 Workouts API: Workouts list retrieved successfully',
        {
          total: response.data.total,
          count: response.data.workouts.length,
        }
      );

      return response.data;
    } catch (error) {
      this.logError('GET', endpoint, error as Error);
      throw error;
    }
  }

  /**
   * Get workout by ID
   * Returns raw API response data
   */
  async getWorkoutById(token: AuthToken, id: string): Promise<WorkoutResponse> {
    this.logger.debug('🏃 Workouts API: Getting workout by ID', {
      workoutId: id,
    });

    const endpoint = this.buildEndpointWithId(
      API_ENDPOINTS.WORKOUTS.WORKOUTS,
      id
    );
    const headers = this.getAuthHeaders(token);

    this.logRequest('GET', endpoint);

    try {
      const response = await this.httpClient.get<WorkoutResponse>(
        endpoint,
        headers
      );
      this.logResponse('GET', endpoint, response.status);

      if (response.status !== HTTP_STATUS.OK) {
        throw new Error(`Failed to get workout: ${response.statusText}`);
      }

      this.logger.debug('🏃 Workouts API: Workout retrieved successfully', {
        workoutId: id,
      });
      return response.data;
    } catch (error) {
      this.logError('GET', endpoint, error as Error);
      throw error;
    }
  }

  /**
   * Create new workout
   * Returns raw API response data
   */
  async createWorkout(
    token: AuthToken,
    workoutData: CreateWorkoutRequest
  ): Promise<WorkoutResponse> {
    this.logger.debug('🏃 Workouts API: Creating new workout', {
      name: workoutData.name,
    });

    const endpoint = this.buildEndpoint(API_ENDPOINTS.WORKOUTS.WORKOUTS);
    const headers = this.getAuthHeaders(token);

    this.logRequest('POST', endpoint);

    try {
      const response = await this.httpClient.post<WorkoutResponse>(
        endpoint,
        workoutData,
        headers
      );
      this.logResponse('POST', endpoint, response.status);

      if (response.status !== HTTP_STATUS.CREATED) {
        throw new Error(`Failed to create workout: ${response.statusText}`);
      }

      this.logger.debug('🏃 Workouts API: Workout created successfully', {
        workoutId: response.data.workout.id,
      });
      return response.data;
    } catch (error) {
      this.logError('POST', endpoint, error as Error);
      throw error;
    }
  }

  /**
   * Update existing workout
   * Returns raw API response data
   */
  async updateWorkout(
    token: AuthToken,
    workoutData: UpdateWorkoutRequest
  ): Promise<WorkoutResponse> {
    this.logger.debug('🏃 Workouts API: Updating workout', {
      workoutId: workoutData.id,
    });

    const endpoint = this.buildEndpointWithId(
      API_ENDPOINTS.WORKOUTS.WORKOUTS,
      workoutData.id
    );
    const headers = this.getAuthHeaders(token);

    // Remove id from update data as it's in the URL
    const { id, ...updateData } = workoutData;

    this.logRequest('PUT', endpoint);

    try {
      const response = await this.httpClient.put<WorkoutResponse>(
        endpoint,
        updateData,
        headers
      );
      this.logResponse('PUT', endpoint, response.status);

      if (response.status !== HTTP_STATUS.OK) {
        throw new Error(`Failed to update workout: ${response.statusText}`);
      }

      this.logger.debug('🏃 Workouts API: Workout updated successfully', {
        workoutId: id,
      });
      return response.data;
    } catch (error) {
      this.logError('PUT', endpoint, error as Error);
      throw error;
    }
  }

  /**
   * Delete workout
   */
  async deleteWorkout(token: AuthToken, workoutId: string): Promise<void> {
    this.logger.debug('🏃 Workouts API: Deleting workout', { workoutId });

    const endpoint = this.buildEndpointWithId(
      API_ENDPOINTS.WORKOUTS.WORKOUTS,
      workoutId
    );
    const headers = this.getAuthHeaders(token);

    this.logRequest('DELETE', endpoint);

    try {
      const response = await this.httpClient.delete(endpoint, headers);
      this.logResponse('DELETE', endpoint, response.status);

      if (response.status !== HTTP_STATUS.NO_CONTENT) {
        throw new Error(`Failed to delete workout: ${response.statusText}`);
      }

      this.logger.debug('🏃 Workouts API: Workout deleted successfully', {
        workoutId,
      });
    } catch (error) {
      this.logError('DELETE', endpoint, error as Error);
      throw error;
    }
  }

  /**
   * Get workout statistics
   * Returns raw API response data
   */
  async getWorkoutStats(
    token: AuthToken,
    filters?: WorkoutFilters
  ): Promise<WorkoutStats> {
    this.logger.debug('🏃 Workouts API: Getting workout statistics', {
      filters,
    });

    const endpoint = this.buildEndpoint(
      'workouts/stats',
      filters as Record<string, string>
    );
    const headers = this.getAuthHeaders(token);

    this.logRequest('GET', endpoint);

    try {
      const response = await this.httpClient.get<WorkoutStats>(
        endpoint,
        headers
      );
      this.logResponse('GET', endpoint, response.status);

      if (response.status !== 200) {
        throw new Error(`Failed to get workout stats: ${response.statusText}`);
      }

      this.logger.debug(
        '🏃 Workouts API: Workout statistics retrieved successfully'
      );
      return response.data;
    } catch (error) {
      this.logError('GET', endpoint, error as Error);
      throw error;
    }
  }
}
