/**
 * WorkoutFile Value Object
 * Represents workout file data
 */

import type { WorkoutFile as WorkoutFileType } from '@/domain/schemas/value-objects.schema';

export type WorkoutFile = WorkoutFileType;

/**
 * Create workout file value object
 */
export const createWorkoutFile = (
  fileName: string,
  content: string,
  mimeType: string
): WorkoutFile => ({
  fileName: fileName.trim(),
  content,
  mimeType: mimeType.trim(),
});

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
