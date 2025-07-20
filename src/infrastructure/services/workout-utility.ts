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
  // Generate a unique workout ID
  return `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    const structureElements = elements.map((element, index) => ({
      type: element.type,
      duration: element.duration,
      intensity: element.intensity,
      description: element.description,
      begin: index * element.duration,
      end: (index + 1) * element.duration,
    }));

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
