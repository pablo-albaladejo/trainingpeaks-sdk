/**
 * Logout Entrypoint Mappers
 * Transform Domain results to Entrypoint response types
 */

import type { LogoutEntrypointResponse } from './types';

/**
 * Map successful logout to entrypoint response
 */
export const mapLogoutSuccessToEntrypoint = (): LogoutEntrypointResponse => {
  return {
    success: true,
  };
};

/**
 * Map error to entrypoint response
 */
export const mapLogoutErrorToEntrypoint = (
  error: Error,
  code = 'LOGOUT_FAILED'
): LogoutEntrypointResponse => {
  return {
    success: false,
    error: {
      code,
      message: error.message,
    },
  };
};
