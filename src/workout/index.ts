/**
 * TrainingPeaks Workout Uploader Module
 */

import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { TrainingPeaksAuth } from '../auth';
import {
  AuthenticationError,
  NetworkError,
  UploadError,
  ValidationError,
} from '../errors';
import {
  TrainingPeaksConfig,
  UploadResponse,
  WorkoutData,
  WorkoutType,
} from '../types';

export class WorkoutUploader {
  private httpClient: AxiosInstance;
  private auth: TrainingPeaksAuth;
  private config: TrainingPeaksConfig;

  constructor(auth: TrainingPeaksAuth, config: TrainingPeaksConfig) {
    this.auth = auth;
    this.config = config;
    this.httpClient = axios.create({
      baseURL: config.baseUrl || 'https://www.trainingpeaks.com',
      timeout: config.timeout || 30000, // Longer timeout for file uploads
      headers: {
        'User-Agent': 'TrainingPeaks-SDK/1.0.0',
      },
    });
  }

  /**
   * Upload a workout file to TrainingPeaks
   * @param workoutData - Workout data to upload
   * @returns Upload response
   */
  public async uploadWorkout(
    workoutData: WorkoutData
  ): Promise<UploadResponse> {
    if (!this.auth.isAuthenticated()) {
      throw new AuthenticationError('Not authenticated');
    }

    this.validateWorkoutData(workoutData);

    try {
      const formData = new FormData();

      // Add workout metadata
      formData.append('name', workoutData.name);
      formData.append('date', workoutData.date);
      formData.append('duration', workoutData.duration.toString());
      formData.append('type', workoutData.type);

      if (workoutData.description) {
        formData.append('description', workoutData.description);
      }

      if (workoutData.distance) {
        formData.append('distance', workoutData.distance.toString());
      }

      // Add file data if provided
      if (workoutData.fileData) {
        const fileBuffer =
          workoutData.fileData.content instanceof Uint8Array
            ? Buffer.from(workoutData.fileData.content)
            : Buffer.from(workoutData.fileData.content, 'base64');

        formData.append('file', fileBuffer, {
          filename: workoutData.fileData.filename,
          contentType: workoutData.fileData.mimeType,
        });
      }

      const token = this.auth.getToken();
      if (!token) {
        throw new AuthenticationError('No authentication token available');
      }

      const response = await this.httpClient.post(
        '/api/workouts/upload',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `${token.tokenType} ${token.accessToken}`,
          },
        }
      );

      return {
        id: response.data.id,
        status: response.data.status,
        message: response.data.message,
        workoutId: response.data.workoutId,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new AuthenticationError('Authentication token expired');
        }
        if (error.response?.status === 400) {
          throw new ValidationError(
            `Invalid workout data: ${error.response.data?.message || error.message}`
          );
        }
        if (error.response?.status === 413) {
          throw new UploadError('File too large');
        }
        throw new NetworkError(`Upload failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get upload status
   * @param uploadId - Upload ID to check
   * @returns Upload status
   */
  public async getUploadStatus(uploadId: string): Promise<UploadResponse> {
    if (!this.auth.isAuthenticated()) {
      throw new AuthenticationError('Not authenticated');
    }

    try {
      const token = this.auth.getToken();
      if (!token) {
        throw new AuthenticationError('No authentication token available');
      }

      const response = await this.httpClient.get(
        `/api/workouts/upload/${uploadId}`,
        {
          headers: {
            Authorization: `${token.tokenType} ${token.accessToken}`,
          },
        }
      );

      return {
        id: response.data.id,
        status: response.data.status,
        message: response.data.message,
        workoutId: response.data.workoutId,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new AuthenticationError('Authentication token expired');
        }
        if (error.response?.status === 404) {
          throw new ValidationError('Upload not found');
        }
        throw new NetworkError(`Failed to get upload status: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate workout data before upload
   * @param workoutData - Workout data to validate
   */
  private validateWorkoutData(workoutData: WorkoutData): void {
    if (!workoutData.name || workoutData.name.trim().length === 0) {
      throw new ValidationError('Workout name is required');
    }

    if (!workoutData.date) {
      throw new ValidationError('Workout date is required');
    }

    if (workoutData.duration <= 0) {
      throw new ValidationError('Workout duration must be positive');
    }

    if (workoutData.distance !== undefined && workoutData.distance < 0) {
      throw new ValidationError('Workout distance cannot be negative');
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(workoutData.date)) {
      throw new ValidationError('Invalid date format. Use YYYY-MM-DD');
    }

    // Validate file data if provided
    if (workoutData.fileData) {
      if (
        !workoutData.fileData.filename ||
        workoutData.fileData.filename.trim().length === 0
      ) {
        throw new ValidationError('File name is required');
      }

      if (!workoutData.fileData.content) {
        throw new ValidationError('File content is required');
      }

      if (
        !workoutData.fileData.mimeType ||
        workoutData.fileData.mimeType.trim().length === 0
      ) {
        throw new ValidationError('File MIME type is required');
      }
    }
  }

  /**
   * Create workout data from file
   * @param filename - File name
   * @param content - File content
   * @param mimeType - File MIME type
   * @param metadata - Additional workout metadata
   * @returns Workout data object
   */
  public createWorkoutFromFile(
    filename: string,
    content: Uint8Array | string,
    mimeType: string,
    metadata: Partial<WorkoutData>
  ): WorkoutData {
    const defaultDate = new Date().toISOString().split('T')[0];
    return {
      name: metadata.name || filename,
      description: metadata.description,
      date: metadata.date || defaultDate,
      duration: metadata.duration || 0,
      distance: metadata.distance,
      type: metadata.type || WorkoutType.OTHER,
      fileData: {
        filename,
        content,
        mimeType,
      },
    } as WorkoutData;
  }
}
