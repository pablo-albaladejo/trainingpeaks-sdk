/**
 * Workouts API Client
 * Handles all workout-related API endpoints
 * Example of how to extend the base API client for new entities
 */

import { API_ENDPOINTS, HTTP_STATUS } from '@/adapters/constants';
import type { WorkoutRepository } from '@/application/repositories';
import type {
  AuthToken,
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  WorkoutFilters,
  WorkoutResponse,
  WorkoutsListResponse,
  WorkoutStats,
} from '@/domain/schemas';
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
    this.logger.debug('🏃 Workouts API: Creating workout', {
      workoutName: workoutData.name,
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

      this.logger.debug('🏃 Workouts API: Workout created successfully', {
        workoutName: workoutData.name,
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

    this.logRequest('PUT', endpoint);

    try {
      const response = await this.httpClient.put<WorkoutResponse>(
        endpoint,
        workoutData,
        headers
      );
      this.logResponse('PUT', endpoint, response.status);

      this.logger.debug('🏃 Workouts API: Workout updated successfully', {
        workoutId: workoutData.id,
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
    this.logger.debug('🏃 Workouts API: Deleting workout', {
      workoutId,
    });

    const endpoint = this.buildEndpointWithId(
      API_ENDPOINTS.WORKOUTS.WORKOUTS,
      workoutId
    );
    const headers = this.getAuthHeaders(token);

    this.logRequest('DELETE', endpoint);

    try {
      const response = await this.httpClient.delete(endpoint, headers);
      this.logResponse('DELETE', endpoint, response.status);

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
    this.logger.debug('🏃 Workouts API: Getting workout stats', { filters });

    const endpoint = this.buildEndpoint(
      `${API_ENDPOINTS.WORKOUTS.WORKOUTS}/stats`,
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

      this.logger.debug(
        '🏃 Workouts API: Workout stats retrieved successfully'
      );

      return response.data;
    } catch (error) {
      this.logError('GET', endpoint, error as Error);
      throw error;
    }
  }
}
