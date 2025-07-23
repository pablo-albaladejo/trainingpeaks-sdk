import {
  ElementType,
  IntensityClass,
  LengthUnit,
  StructureElement,
  WorkoutStep,
  WorkoutStructure,
} from '@/types';

/**
 * Maps the internal workout structure format to the TrainingPeaks API format
 */
export class WorkoutStructureMapper {
  /**
   * Converts internal workout structure to TrainingPeaks API format
   */
  static toTrainingPeaksFormat(structure: WorkoutStructure): any {
    return {
      structure: structure.structure.map((element) =>
        this.mapStructureElement(element)
      ),
      polyline: this.generatePolyline(structure),
      primaryLengthMetric: 'duration',
      primaryIntensityMetric: 'percentOfThresholdPace',
      primaryIntensityTargetOrRange: 'range',
    };
  }

  /**
   * Maps a structure element to TrainingPeaks format
   */
  private static mapStructureElement(element: StructureElement): any {
    return {
      type: this.mapElementType(element.type),
      length: this.mapLength(element.length),
      steps: element.steps.map((step) => this.mapWorkoutStep(step)),
      begin: element.begin,
      end: element.end,
    };
  }

  /**
   * Maps a workout step to TrainingPeaks format
   */
  private static mapWorkoutStep(step: WorkoutStep): any {
    return {
      name: step.name,
      length: this.mapLength(step.length),
      targets: step.targets,
      intensityClass: this.mapIntensityClass(step.intensityClass),
      openDuration: step.openDuration,
    };
  }

  /**
   * Maps element type to TrainingPeaks format
   */
  private static mapElementType(type: ElementType): string {
    switch (type) {
      case ElementType.STEP:
        return 'step';
      case ElementType.REPETITION:
        return 'repetition';
      case ElementType.INTERVAL:
        return 'interval';
      default:
        return 'step';
    }
  }

  /**
   * Maps length unit to TrainingPeaks format
   */
  private static mapLength(length: { value: number; unit: LengthUnit }): any {
    const { value, unit } = length;

    switch (unit) {
      case LengthUnit.MINUTE:
        return { value: value * 60, unit: 'second' };
      case LengthUnit.SECOND:
        return { value, unit: 'second' };
      case LengthUnit.METER:
        return { value, unit: 'meter' };
      case LengthUnit.KILOMETER:
        return { value: value * 1000, unit: 'meter' };
      case LengthUnit.REPETITION:
        return { value, unit: 'repetition' };
      default:
        return { value, unit: 'second' };
    }
  }

  /**
   * Maps intensity class to TrainingPeaks format
   */
  private static mapIntensityClass(intensity: IntensityClass): string {
    switch (intensity) {
      case IntensityClass.ACTIVE:
        return 'active';
      case IntensityClass.REST:
        return 'rest';
      case IntensityClass.WARM_UP:
        return 'warmUp';
      case IntensityClass.COOL_DOWN:
        return 'coolDown';
      default:
        return 'active';
    }
  }

  /**
   * Generates polyline data for the workout structure
   * This is a simplified polyline generation - in a real implementation,
   * you might want to generate more sophisticated polyline data
   */
  private static generatePolyline(structure: WorkoutStructure): number[][] {
    const polyline: number[][] = [];
    let currentTime = 0;
    const totalDuration = this.calculateTotalDuration(structure);

    // Generate a simple polyline based on workout structure
    polyline.push([0.0, 0.0]);
    polyline.push([0.0, 1.0]);

    // Add points for each element
    structure.structure.forEach((element) => {
      const elementStart = element.begin / totalDuration;
      const elementEnd = element.end / totalDuration;

      // Add start point
      polyline.push([elementStart, 1.0]);
      polyline.push([elementStart, 0.0]);

      // Add end point
      polyline.push([elementEnd, 0.0]);
      polyline.push([elementEnd, 1.0]);
    });

    // Add final point
    polyline.push([1.0, 1.0]);
    polyline.push([1.0, 0.0]);

    return polyline;
  }

  /**
   * Calculates total duration of the workout in seconds
   */
  private static calculateTotalDuration(structure: WorkoutStructure): number {
    if (structure.structure.length === 0) return 0;

    const lastElement = structure.structure[structure.structure.length - 1];
    return lastElement.end;
  }
}
