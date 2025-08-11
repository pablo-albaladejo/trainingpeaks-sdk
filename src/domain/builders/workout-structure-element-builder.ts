import {
  ElementType,
  LengthUnit,
  type WorkoutStructureElement,
  type WorkoutStructureStep,
} from '@/types';

/**
 * Builder for workout structure elements
 */
export class WorkoutStructureElementBuilder {
  private readonly element: WorkoutStructureElement = {
    type: ElementType.STEP,
    steps: [],
    length: { value: 0, unit: LengthUnit.MINUTE },
    begin: 0,
    end: 0,
  };

  type(type: ElementType): this {
    this.element.type = type;
    return this;
  }

  addStep(step: WorkoutStructureStep): this {
    this.element.steps.push(step);
    return this;
  }

  addSteps(steps: WorkoutStructureStep[]): this {
    this.element.steps.push(...steps);
    return this;
  }

  duration(minutes: number): this {
    this.element.length = { value: minutes, unit: LengthUnit.MINUTE };
    return this;
  }

  distance(value: number, unit: LengthUnit = LengthUnit.KILOMETER): this {
    this.element.length = { value, unit };
    return this;
  }

  build(): WorkoutStructureElement {
    return { ...this.element };
  }
}
