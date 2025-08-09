import { describe, expect, it } from 'vitest';

import * as schemas from './index';

describe('Application Schemas Index', () => {
  it('should export workout schemas', () => {
    expect(schemas).toHaveProperty('WorkoutResponseSchema');
    expect(schemas).toHaveProperty('WorkoutsListResponseSchema');
    expect(schemas).toHaveProperty('WorkoutStatsSchema');
    expect(schemas).toHaveProperty('CreateWorkoutRequestSchema');
    expect(schemas).toHaveProperty('UpdateWorkoutRequestSchema');
    expect(schemas).toHaveProperty('WorkoutFiltersSchema');
  });

  it('should have expected export structure', () => {
    const exportKeys = Object.keys(schemas);
    expect(exportKeys.length).toBeGreaterThan(0);
  });
});
