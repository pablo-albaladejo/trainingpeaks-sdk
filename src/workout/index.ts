/**
 * TrainingPeaks Workout Upload Module
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
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
  WorkoutFileData,
  WorkoutType,
} from '../types';

export class WorkoutUploader {
  private httpClient: AxiosInstance;
  private auth: TrainingPeaksAuth;

  constructor(auth: TrainingPeaksAuth, config: TrainingPeaksConfig = {}) {
    this.auth = auth;

    this.httpClient = axios.create({
      baseURL:
        process.env.TRAININGPEAKS_BASE_URL ||
        config.baseUrl ||
        'https://www.trainingpeaks.com',
      timeout: config.timeout || 30000,
      headers: {
        'User-Agent': 'TrainingPeaks-SDK/1.0.0',
        ...config.headers,
      },
    });
  }

  /**
   * Upload a workout to TrainingPeaks
   * @param workoutData - The workout data to upload
   * @returns Upload response with ID and status
   */
  public async uploadWorkout(
    workoutData: WorkoutData
  ): Promise<UploadResponse> {
    if (!this.auth.isAuthenticated()) {
      throw new AuthenticationError('Must be authenticated to upload workouts');
    }

    this.validateWorkoutData(workoutData);

    try {
      const token = this.auth.getToken();
      if (!token) {
        throw new AuthenticationError('No authentication token available');
      }

      let response: AxiosResponse;

      if (workoutData.fileData) {
        response = await this.uploadWithFile(workoutData, token.accessToken);
      } else {
        response = await this.uploadManualWorkout(
          workoutData,
          token.accessToken
        );
      }

      return this.parseUploadResponse(response.data);
    } catch (error: unknown) {
      if (
        error instanceof AuthenticationError ||
        error instanceof ValidationError
      ) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new AuthenticationError('Authentication token expired');
        }
        if (error.response?.status === 413) {
          throw new UploadError('File too large');
        }
        if (error.response?.status === 429) {
          throw new UploadError('Rate limit exceeded');
        }

        const message = error.response?.data?.message || error.message;
        throw new UploadError(`Upload failed: ${message}`);
      }

      throw new NetworkError('Network error during upload');
    }
  }

  /**
   * Upload workout with file attachment
   * @private
   */
  private async uploadWithFile(
    workoutData: WorkoutData,
    accessToken: string
  ): Promise<AxiosResponse> {
    const formData = new FormData();

    // Add workout metadata
    formData.append('name', workoutData.name);
    if (workoutData.description)
      formData.append('description', workoutData.description);
    if (workoutData.date) formData.append('date', workoutData.date);
    if (workoutData.duration)
      formData.append('duration', workoutData.duration.toString());
    if (workoutData.distance)
      formData.append('distance', workoutData.distance.toString());
    if (workoutData.type) formData.append('type', workoutData.type);

    // Add file
    const fileData = workoutData.fileData!;
    formData.append('file', fileData.content, {
      filename: fileData.filename,
      contentType: fileData.mimeType,
    });

    return await this.httpClient.post('/api/workouts/upload', formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...formData.getHeaders(),
      },
    });
  }

  /**
   * Upload manual workout without file
   * @private
   */
  private async uploadManualWorkout(
    workoutData: WorkoutData,
    accessToken: string
  ): Promise<AxiosResponse> {
    const payload = {
      name: workoutData.name,
      description: workoutData.description,
      date: workoutData.date,
      duration: workoutData.duration,
      distance: workoutData.distance,
      type: workoutData.type,
    };

    return await this.httpClient.post('/api/workouts', payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Validate workout data before upload
   * @private
   */
  private validateWorkoutData(workoutData: WorkoutData): void {
    if (!workoutData.name || workoutData.name.trim().length === 0) {
      throw new ValidationError('Workout name is required');
    }

    if (workoutData.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(workoutData.date)) {
        throw new ValidationError('Date must be in YYYY-MM-DD format');
      }

      const parsedDate = new Date(workoutData.date);
      if (isNaN(parsedDate.getTime())) {
        throw new ValidationError('Invalid date format');
      }
    }

    if (workoutData.duration && workoutData.duration < 0) {
      throw new ValidationError('Duration must be positive');
    }

    if (workoutData.distance && workoutData.distance < 0) {
      throw new ValidationError('Distance must be positive');
    }

    if (workoutData.fileData) {
      this.validateFileData(workoutData.fileData);
    }
  }

  /**
   * Validate file data
   * @private
   */
  private validateFileData(fileData: WorkoutFileData): void {
    if (!fileData.filename || fileData.filename.trim().length === 0) {
      throw new ValidationError('File name is required');
    }

    if (!fileData.content) {
      throw new ValidationError('File content is required');
    }

    if (!fileData.mimeType) {
      throw new ValidationError('File MIME type is required');
    }

    // Check file size (assuming content is string, check length)
    const contentSize =
      typeof fileData.content === 'string'
        ? Buffer.byteLength(fileData.content, 'utf8')
        : fileData.content.length;

    if (contentSize > 50 * 1024 * 1024) {
      // 50MB limit
      throw new ValidationError('File size exceeds 50MB limit');
    }

    // Validate file extension
    const allowedExtensions = ['.gpx', '.tcx', '.fit', '.xml'];
    const extension = fileData.filename
      .toLowerCase()
      .substring(fileData.filename.lastIndexOf('.'));

    if (!allowedExtensions.includes(extension)) {
      throw new ValidationError(
        `Unsupported file type: ${extension}. Allowed: ${allowedExtensions.join(', ')}`
      );
    }
  }

  /**
   * Parse upload response from TrainingPeaks
   * @private
   */
  private parseUploadResponse(responseData: any): UploadResponse {
    return {
      id: responseData.id || responseData.uploadId || 'unknown',
      status: responseData.status || 'success',
      message: responseData.message || 'Upload completed successfully',
      workoutId: responseData.workoutId || responseData.workout?.id,
      errors: responseData.errors || [],
    };
  }

  /**
   * Create workout data from file
   * @param filename - Name of the file
   * @param content - File content (string or Buffer)
   * @param mimeType - MIME type of the file
   * @param metadata - Additional workout metadata
   * @returns WorkoutData object ready for upload
   */
  public createWorkoutFromFile(
    filename: string,
    content: string | Buffer,
    mimeType: string,
    metadata: Partial<Omit<WorkoutData, 'fileData'>> = {}
  ): WorkoutData {
    return {
      name: metadata.name || filename.replace(/\.[^/.]+$/, ''), // Remove extension
      description: metadata.description,
      date: metadata.date || new Date().toISOString().split('T')[0],
      duration: metadata.duration || 0,
      distance: metadata.distance,
      type: metadata.type || WorkoutType.OTHER,
      fileData: {
        filename,
        content,
        mimeType,
      },
    };
  }

  /**
   * Get upload status by ID
   * @param uploadId - The upload ID returned from uploadWorkout
   * @returns Upload status information
   */
  public async getUploadStatus(uploadId: string): Promise<any> {
    if (!this.auth.isAuthenticated()) {
      throw new AuthenticationError(
        'Must be authenticated to check upload status'
      );
    }

    try {
      const token = this.auth.getToken();
      if (!token) {
        throw new AuthenticationError('No authentication token available');
      }

      const response = await this.httpClient.get(`/api/uploads/${uploadId}`, {
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
        },
      });

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new AuthenticationError('Authentication token expired');
        }
        if (error.response?.status === 404) {
          throw new UploadError('Upload not found');
        }

        throw new NetworkError(`Failed to get upload status: ${error.message}`);
      }
      throw error;
    }
  }
}
