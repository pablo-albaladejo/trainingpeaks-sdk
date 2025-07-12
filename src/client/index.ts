/**
 * TrainingPeaks Main Client
 */

import { TrainingPeaksAuth } from '../auth';
import { TrainingPeaksConfig } from '../types';
import { WorkoutUploader } from '../workout';

export class TrainingPeaksClient {
  private config: TrainingPeaksConfig;
  private auth: TrainingPeaksAuth;
  private workoutUploader: WorkoutUploader;

  constructor(config: TrainingPeaksConfig = {}) {
    this.config = {
      baseUrl: 'https://www.trainingpeaks.com',
      timeout: 10000,
      debug: false,
      ...config,
    };

    this.auth = new TrainingPeaksAuth(this.config.baseUrl);
    this.workoutUploader = new WorkoutUploader(this.auth, this.config);
  }

  /**
   * Get authentication module
   * @returns Authentication module instance
   */
  public getAuth(): TrainingPeaksAuth {
    return this.auth;
  }

  /**
   * Get workout uploader module
   * @returns Workout uploader module instance
   */
  public getWorkoutUploader(): WorkoutUploader {
    return this.workoutUploader;
  }

  /**
   * Get current configuration
   * @returns Current configuration object
   */
  public getConfig(): TrainingPeaksConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   * @param config - New configuration options
   */
  public updateConfig(config: Partial<TrainingPeaksConfig>): void {
    this.config = { ...this.config, ...config };
    // Recreate modules with new config
    this.auth = new TrainingPeaksAuth(this.config.baseUrl);
    this.workoutUploader = new WorkoutUploader(this.auth, this.config);
  }

  /**
   * Check if client is ready for API calls
   * @returns True if authenticated and ready
   */
  public isReady(): boolean {
    return this.auth.isAuthenticated();
  }
}
