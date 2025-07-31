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
  // Check if file object exists
  if (!file) {
    return false;
  }

  // Check if required properties exist and are strings
  if (
    typeof file.fileName !== 'string' ||
    typeof file.content !== 'string' ||
    typeof file.mimeType !== 'string'
  ) {
    return false;
  }

  // Check if properties have non-zero length
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
  // Validate that file.content is a valid string
  if (typeof file.content !== 'string') {
    throw new ValidationError(
      'File content must be a valid string to calculate size',
      'content'
    );
  }

  return Buffer.byteLength(file.content, 'utf8');
};
