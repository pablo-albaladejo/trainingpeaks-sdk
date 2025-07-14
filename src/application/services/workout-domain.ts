/**
 * Workout Domain Service Contract (DEPRECATED)
 *
 * @deprecated Use WorkoutService instead for new code.
 * This service is maintained for backward compatibility.
 *
 * Contains business logic for workout operations
 */

import { WorkoutService } from './workout-service';

/**
 * Workout Domain Service Contract (DEPRECATED)
 *
 * @deprecated Use WorkoutService instead for new code.
 * This contract is maintained for backward compatibility.
 *
 * Defines the interface for workout domain operations
 */
export type WorkoutDomainService = WorkoutService;

/**
 * Factory function signature for creating workout domain service (DEPRECATED)
 *
 * @deprecated Use WorkoutServiceFactory instead for new code.
 * This factory is maintained for backward compatibility.
 */
export type WorkoutDomainServiceFactory = (
  workoutRepository: unknown
) => WorkoutDomainService;
