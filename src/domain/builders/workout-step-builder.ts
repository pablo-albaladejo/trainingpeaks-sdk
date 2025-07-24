import type { WorkoutStructureStep } from '@/types';
import { IntensityClass, LengthUnit } from '@/types';

/**
 * Builder for workout structure steps
 */
export class WorkoutStepBuilder {
  readonly step: WorkoutStructureStep = {
    name: '',
    length: { value: 0, unit: LengthUnit.MINUTE },
    targets: [],
    intensityClass: IntensityClass.ACTIVE,
    openDuration: false,
  };

  name(name: string): this {
    this.step.name = name;
    return this;
  }

  duration(minutes: number): this {
    this.step.length = { value: minutes, unit: LengthUnit.MINUTE };
    return this;
  }

  distance(value: number, unit: LengthUnit = LengthUnit.KILOMETER): this {
    this.step.length = { value, unit };
    return this;
  }

  addTarget(minValue: number, maxValue: number): this {
    this.step.targets.push({ minValue, maxValue });
    return this;
  }

  intensityClass(intensityClass: IntensityClass): this {
    this.step.intensityClass = intensityClass;
    return this;
  }

  openDuration(open: boolean = true): this {
    this.step.openDuration = open;
    return this;
  }

  build(): WorkoutStructureStep {
    return { ...this.step };
  }
}
