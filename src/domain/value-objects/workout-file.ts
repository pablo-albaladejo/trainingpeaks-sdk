/**
 * WorkoutFile Value Object
 * Represents workout file data
 */

import { ValidationError } from '@/domain/errors/domain-errors';
import type { WorkoutFile as WorkoutFileType } from '@/domain/schemas/value-objects.schema';

export type WorkoutFile = WorkoutFileType;

/**
 * Create workout file value object
 */
export const createWorkoutFile = (
  fileName: string,
  content: string,
  mimeType: string
): WorkoutFile => {
  const trimmedFileName = fileName.trim();
  const trimmedMimeType = mimeType.trim();

  // Validate fileName
  if (!trimmedFileName) {
    throw new ValidationError('File name cannot be empty', 'fileName');
  }

  if (trimmedFileName.length > 255) {
    throw new ValidationError(
      'File name cannot exceed 255 characters',
      'fileName'
    );
  }

  // Validate mimeType
  if (!trimmedMimeType) {
    throw new ValidationError('MIME type cannot be empty', 'mimeType');
  }

  if (trimmedMimeType.length > 100) {
    throw new ValidationError(
      'MIME type cannot exceed 100 characters',
      'mimeType'
    );
  }

  // Validate content
  if (!content) {
    throw new ValidationError('File content cannot be empty', 'content');
  }

  return {
    fileName: trimmedFileName,
    content,
    mimeType: trimmedMimeType,
  };
};

/**
 * Validate workout file
 */
export const validateWorkoutFile = (file: WorkoutFile): boolean => {
  return (
    file.fileName.length > 0 &&
    file.content.length > 0 &&
    file.mimeType.length > 0
  );
};

/**
 * Get file size in bytes
 */
export const getFileSize = (file: WorkoutFile): number => {
  return Buffer.byteLength(file.content, 'utf8');
};
