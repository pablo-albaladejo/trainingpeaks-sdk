import { ValidationError } from '@/domain/errors/domain-errors';
import type { WorkoutStructureStep } from '@/types';
import { IntensityClass, LengthUnit } from '@/types';

/**
 * Builder for workout structure steps
 */
export class WorkoutStepBuilder {
  private step: WorkoutStructureStep = {
    name: '',
    length: { value: 0, unit: LengthUnit.MINUTE },
    targets: [],
    intensityClass: IntensityClass.ACTIVE,
    openDuration: false,
  };

  name(name: string): this {
    this.step = { ...this.step, name };
    return this;
  }

  duration(minutes: number): this {
    this.step = {
      ...this.step,
      length: { value: minutes, unit: LengthUnit.MINUTE },
    };
    return this;
  }

  distance(value: number, unit: LengthUnit = LengthUnit.KILOMETER): this {
    this.step = { ...this.step, length: { value, unit } };
    return this;
  }

  addTarget(minValue: number, maxValue: number): this {
    // Validate that both values are non-negative
    if (minValue < 0) {
      throw new ValidationError(
        'Minimum target value must be non-negative',
        'minValue'
      );
    }

    if (maxValue < 0) {
      throw new ValidationError(
        'Maximum target value must be non-negative',
        'maxValue'
      );
    }

    // Validate that minValue is less than maxValue
    if (minValue >= maxValue) {
      throw new ValidationError(
        'Minimum target value must be less than maximum target value',
        'target'
      );
    }

    this.step = {
      ...this.step,
      targets: [...this.step.targets, { minValue, maxValue }],
    };
    return this;
  }

  intensityClass(intensityClass: IntensityClass): this {
    this.step = { ...this.step, intensityClass };
    return this;
  }

  openDuration(open: boolean = true): this {
    this.step = { ...this.step, openDuration: open };
    return this;
  }

  build(): WorkoutStructureStep {
    return { ...this.step };
  }
}
