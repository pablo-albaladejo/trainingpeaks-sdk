import { WorkoutStructureBuilder } from '@/domain/builders/workout-structure-builder';
import { WorkoutStructureElementBuilder } from '@/domain/builders/workout-structure-element-builder';
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
  const builder = new WorkoutStructureBuilder();

  // Warmup
  const warmupElement = new WorkoutStructureElementBuilder()
    .type(ElementType.STEP)
    .addStep(createWarmupStep(warmupMinutes))
    .build();
  builder.addElement(warmupElement);

  // Intervals
  for (let i = 0; i < intervals; i++) {
    const intervalElement = new WorkoutStructureElementBuilder()
      .type(ElementType.STEP)
      .addStep(createIntervalStep(intervalMinutes, intervalIntensity))
      .build();
    builder.addElement(intervalElement);

    // Recovery (except after last interval)
    if (i < intervals - 1) {
      const recoveryElement = new WorkoutStructureElementBuilder()
        .type(ElementType.STEP)
        .addStep(createRecoveryStep(recoveryMinutes))
        .build();
      builder.addElement(recoveryElement);
    }
  }

  // Cooldown
  const cooldownElement = new WorkoutStructureElementBuilder()
    .type(ElementType.STEP)
    .addStep(createCooldownStep(cooldownMinutes))
    .build();
  builder.addElement(cooldownElement);

  return builder.build();
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
  const builder = new WorkoutStructureBuilder();

  // Warmup
  const warmupElement = new WorkoutStructureElementBuilder()
    .type(ElementType.STEP)
    .addStep(createWarmupStep(warmupMinutes))
    .build();
  builder.addElement(warmupElement);

  // Tempo
  const tempoElement = new WorkoutStructureElementBuilder()
    .type(ElementType.STEP)
    .addStep(createSteadyStep(tempoMinutes, tempoIntensity))
    .build();
  builder.addElement(tempoElement);

  // Cooldown
  const cooldownElement = new WorkoutStructureElementBuilder()
    .type(ElementType.STEP)
    .addStep(createCooldownStep(cooldownMinutes))
    .build();
  builder.addElement(cooldownElement);

  return builder.build();
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
  const builder = new WorkoutStructureBuilder();

  // Warmup
  const warmupElement = new WorkoutStructureElementBuilder()
    .type(ElementType.STEP)
    .addStep(createWarmupStep(warmupMinutes))
    .build();
  builder.addElement(warmupElement);

  // Long steady
  const steadyElement = new WorkoutStructureElementBuilder()
    .type(ElementType.STEP)
    .addStep(createSteadyStep(steadyMinutes, steadyIntensity))
    .build();
  builder.addElement(steadyElement);

  // Cooldown
  const cooldownElement = new WorkoutStructureElementBuilder()
    .type(ElementType.STEP)
    .addStep(createCooldownStep(cooldownMinutes))
    .build();
  builder.addElement(cooldownElement);

  return builder.build();
};
