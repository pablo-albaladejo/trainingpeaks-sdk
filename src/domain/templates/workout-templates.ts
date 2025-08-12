import {
  buildWorkoutStructure,
  createWorkoutStructureBuilder,
  withStructureElement,
} from '@/domain/builders/workout-structure-builder';
import {
  buildWorkoutStructureElement,
  createWorkoutStructureElementBuilder,
  withElementType,
  withStep,
} from '@/domain/builders/workout-structure-element-builder';
import { ElementType, type WorkoutStructure } from '@/types';

import {
  createCooldownStep,
  createIntervalStep,
  createRecoveryStep,
  createSteadyStep,
  createWarmupStep,
} from './workout-steps';

/**
 * Create an interval workout template
 */
export const createIntervalWorkout = (
  warmupMinutes: number = 10,
  intervalMinutes: number = 5,
  intervalIntensity: number = 120,
  recoveryMinutes: number = 3,
  intervals: number = 6,
  cooldownMinutes: number = 10
): WorkoutStructure => {
  let builder = createWorkoutStructureBuilder();

  // Warmup
  const warmupElement = buildWorkoutStructureElement(
    withStep(
      withElementType(createWorkoutStructureElementBuilder(), ElementType.STEP),
      createWarmupStep(warmupMinutes)
    )
  );
  builder = withStructureElement(builder, warmupElement);

  // Intervals
  for (let i = 0; i < intervals; i++) {
    const intervalElement = buildWorkoutStructureElement(
      withStep(
        withElementType(
          createWorkoutStructureElementBuilder(),
          ElementType.STEP
        ),
        createIntervalStep(intervalMinutes, intervalIntensity)
      )
    );
    builder = withStructureElement(builder, intervalElement);

    // Recovery (except after last interval)
    if (i < intervals - 1) {
      const recoveryElement = buildWorkoutStructureElement(
        withStep(
          withElementType(
            createWorkoutStructureElementBuilder(),
            ElementType.STEP
          ),
          createRecoveryStep(recoveryMinutes)
        )
      );
      builder = withStructureElement(builder, recoveryElement);
    }
  }

  // Cooldown
  const cooldownElement = buildWorkoutStructureElement(
    withStep(
      withElementType(createWorkoutStructureElementBuilder(), ElementType.STEP),
      createCooldownStep(cooldownMinutes)
    )
  );
  builder = withStructureElement(builder, cooldownElement);

  return buildWorkoutStructure(builder);
};

/**
 * Create a tempo workout template
 */
export const createTempoWorkout = (
  warmupMinutes: number = 15,
  tempoMinutes: number = 30,
  tempoIntensity: number = 90,
  cooldownMinutes: number = 10
): WorkoutStructure => {
  let builder = createWorkoutStructureBuilder();

  // Warmup
  const warmupElement = buildWorkoutStructureElement(
    withStep(
      withElementType(createWorkoutStructureElementBuilder(), ElementType.STEP),
      createWarmupStep(warmupMinutes)
    )
  );
  builder = withStructureElement(builder, warmupElement);

  // Tempo
  const tempoElement = buildWorkoutStructureElement(
    withStep(
      withElementType(createWorkoutStructureElementBuilder(), ElementType.STEP),
      createSteadyStep(tempoMinutes, tempoIntensity)
    )
  );
  builder = withStructureElement(builder, tempoElement);

  // Cooldown
  const cooldownElement = buildWorkoutStructureElement(
    withStep(
      withElementType(createWorkoutStructureElementBuilder(), ElementType.STEP),
      createCooldownStep(cooldownMinutes)
    )
  );
  builder = withStructureElement(builder, cooldownElement);

  return buildWorkoutStructure(builder);
};

/**
 * Create a long steady workout template
 */
export const createLongSteadyWorkout = (
  warmupMinutes: number = 10,
  steadyMinutes: number = 120,
  steadyIntensity: number = 75,
  cooldownMinutes: number = 10
): WorkoutStructure => {
  let builder = createWorkoutStructureBuilder();

  // Warmup
  const warmupElement = buildWorkoutStructureElement(
    withStep(
      withElementType(createWorkoutStructureElementBuilder(), ElementType.STEP),
      createWarmupStep(warmupMinutes)
    )
  );
  builder = withStructureElement(builder, warmupElement);

  // Long steady
  const steadyElement = buildWorkoutStructureElement(
    withStep(
      withElementType(createWorkoutStructureElementBuilder(), ElementType.STEP),
      createSteadyStep(steadyMinutes, steadyIntensity)
    )
  );
  builder = withStructureElement(builder, steadyElement);

  // Cooldown
  const cooldownElement = buildWorkoutStructureElement(
    withStep(
      withElementType(createWorkoutStructureElementBuilder(), ElementType.STEP),
      createCooldownStep(cooldownMinutes)
    )
  );
  builder = withStructureElement(builder, cooldownElement);

  return buildWorkoutStructure(builder);
};
