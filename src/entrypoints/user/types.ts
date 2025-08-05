import { Logger } from '@/adapters';
import { TrainingPeaksRepository } from '@/application';

/**
 * User Entrypoint Dependencies
 */
export type UserEntrypointDependencies = {
  tpRepository: TrainingPeaksRepository;
  logger: Logger;
};

/**
 * Get User Profile Response
 */
export type GetUserProfileResponse = {
  success: boolean;
  data?: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    preferences?: {
      timezone?: string;
      language?: string;
      units?: 'metric' | 'imperial';
      dateFormat?: string;
      email?: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
};

/**
 * Update User Profile Command
 */
export type UpdateUserProfileCommand = {
  name?: string;
  avatar?: string;
  preferences?: {
    timezone?: string;
    language?: string;
    units?: 'metric' | 'imperial';
    dateFormat?: string;
  };
};

/**
 * Update User Profile Response
 */
export type UpdateUserProfileResponse = {
  success: boolean;
  data?: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    preferences?: {
      timezone?: string;
      language?: string;
      units?: 'metric' | 'imperial';
      dateFormat?: string;
      email?: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
};
