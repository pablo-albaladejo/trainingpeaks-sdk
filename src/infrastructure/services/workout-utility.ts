/**
 * Workout Utility Service Implementation
 * Individual function implementations that receive dependencies as parameters
 */

import type {
  ActivityType,
  BuildStructureFromSimpleElements,
  GenerateWorkoutId,
  GetMimeTypeFromFileName,
  MapWorkoutTypeToActivityType,
  SimpleWorkoutElement,
  WorkoutType,
} from '@/application/services/workout-utility';

export const generateWorkoutId: GenerateWorkoutId = (): string => {
  // Generate a unique workout ID with microsecond precision
  const timestamp = Date.now();
  const microsecond = performance.now() % 1; // Get microsecond part
  const random = Math.random().toString(36).substring(2, 11); // 9 characters
  return `workout_${timestamp}_${Math.floor(microsecond * 1000000)}_${random}`;
};

export const getMimeTypeFromFileName: GetMimeTypeFromFileName = (
  fileName: string
): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'tcx':
      return 'application/tcx+xml';
    case 'gpx':
      return 'application/gpx+xml';
    case 'fit':
      return 'application/fit';
    case 'json':
      return 'application/json';
    case 'xml':
      return 'application/xml';
    default:
      return 'application/octet-stream';
  }
};

export const mapWorkoutTypeToActivityType: MapWorkoutTypeToActivityType = (
  workoutType: WorkoutType
): ActivityType => {
  // Map workout type to activity type
  const typeMapping: Record<string, ActivityType> = {
    structured: 'run',
    file: 'bike',
    manual: 'other',
    running: 'run',
    cycling: 'bike',
    swimming: 'swim',
    strength: 'strength',
  };

  return typeMapping[workoutType.toLowerCase()] || 'other';
};

export const buildStructureFromSimpleElements: BuildStructureFromSimpleElements =
  (elements: SimpleWorkoutElement[]) => {
    // Simple implementation - return a basic structure object
    let currentTime = 0;
    const structureElements = elements.map((element) => {
      const begin = currentTime;
      const end = currentTime + element.duration;
      currentTime = end;

      return {
        type: element.type,
        duration: element.duration,
        intensity: element.intensity,
        description: element.description,
        begin,
        end,
      };
    });

    const result = {
      elements: structureElements,
      totalDuration: structureElements.reduce(
        (sum, el) => sum + el.duration,
        0
      ),
      totalSteps: structureElements.length,
    };

    // Cast to unknown first, then to the expected type
    return result as unknown as ReturnType<BuildStructureFromSimpleElements>;
  };
