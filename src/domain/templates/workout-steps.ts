import {
  buildWorkoutStep,
  createWorkoutStepBuilder,
  withDuration,
  withIntensityClass,
  withName,
  withTarget,
} from '@/domain/builders/workout-step-builder';
import { IntensityClass, type WorkoutStructureStep } from '@/types';

/**
 * Create a warmup step
 */
export const createWarmupStep = (
  durationMinutes: number
): WorkoutStructureStep => {
  return buildWorkoutStep(
    withTarget(
      withIntensityClass(
        withDuration(
          withName(createWorkoutStepBuilder(), 'Warmup'),
          durationMinutes
        ),
        IntensityClass.WARM_UP
      ),
      45,
      55
    )
  );
};

/**
 * Create a cooldown step
 */
export const createCooldownStep = (
  durationMinutes: number
): WorkoutStructureStep => {
  return buildWorkoutStep(
    withTarget(
      withIntensityClass(
        withDuration(
          withName(createWorkoutStepBuilder(), 'Cooldown'),
          durationMinutes
        ),
        IntensityClass.COOL_DOWN
      ),
      35,
      45
    )
  );
};

/**
 * Create an interval step
 */
export const createIntervalStep = (
  durationMinutes: number,
  intensityPercent: number
): WorkoutStructureStep => {
  return buildWorkoutStep(
    withTarget(
      withIntensityClass(
        withDuration(
          withName(createWorkoutStepBuilder(), 'Interval'),
          durationMinutes
        ),
        IntensityClass.ACTIVE
      ),
      intensityPercent - 5,
      intensityPercent + 5
    )
  );
};

/**
 * Create a recovery step
 */
export const createRecoveryStep = (
  durationMinutes: number
): WorkoutStructureStep => {
  return buildWorkoutStep(
    withTarget(
      withIntensityClass(
        withDuration(
          withName(createWorkoutStepBuilder(), 'Recovery'),
          durationMinutes
        ),
        IntensityClass.REST
      ),
      55,
      65
    )
  );
};

/**
 * Create a steady step
 */
export const createSteadyStep = (
  durationMinutes: number,
  intensityPercent: number
): WorkoutStructureStep => {
  return buildWorkoutStep(
    withTarget(
      withIntensityClass(
        withDuration(
          withName(createWorkoutStepBuilder(), 'Steady'),
          durationMinutes
        ),
        IntensityClass.ACTIVE
      ),
      intensityPercent - 5,
      intensityPercent + 5
    )
  );
};
