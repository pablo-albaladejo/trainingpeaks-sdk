import { describe, expect, it } from 'vitest';

import * as templates from './index';

describe('Domain Templates Index', () => {
  it('should export workout step creators', () => {
    expect(typeof templates.createWarmupStep).toBe('function');
    expect(typeof templates.createCooldownStep).toBe('function');
    expect(typeof templates.createIntervalStep).toBe('function');
    expect(typeof templates.createRecoveryStep).toBe('function');
    expect(typeof templates.createSteadyStep).toBe('function');
  });

  it('should export workout template creators', () => {
    expect(typeof templates.createIntervalWorkout).toBe('function');
    expect(typeof templates.createLongSteadyWorkout).toBe('function');
    expect(typeof templates.createTempoWorkout).toBe('function');
  });

  it('should have expected export structure', () => {
    // Verify all expected functions are exported
    const expectedExports = [
      'createWarmupStep',
      'createCooldownStep',
      'createIntervalStep',
      'createRecoveryStep',
      'createSteadyStep',
      'createIntervalWorkout',
      'createLongSteadyWorkout',
      'createTempoWorkout',
    ];

    const exportKeys = Object.keys(templates);
    expect(exportKeys.length).toBeGreaterThanOrEqual(expectedExports.length);

    expectedExports.forEach((exportName) => {
      expect(exportKeys).toContain(exportName);
    });
  });
});
