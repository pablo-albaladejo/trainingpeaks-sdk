/**
 * Token Refresh Handler
 * Manages automatic token refresh with concurrency control
 */

import type { HttpClient, SessionStorage } from '@/application';
import {
  type AuthToken,
  hasRefreshCapability,
  isTokenExpired,
  refreshAuthToken as updateAuthToken,
  shouldRefreshToken,
} from '@/domain';

import type { Logger } from '../logging/logger';
import { refreshAuthToken as refreshUserAuthToken } from '../public-api/endpoints/users/v3/token';

/**
 * Token refresh state interface
 */
type TokenRefreshState = {
  refreshPromise: Promise<AuthToken | null> | null;
  lastRefreshAttempt: number;
  readonly REFRESH_COOLDOWN: number;
};

/**
 * Performs the actual token refresh operation
 */
const performTokenRefresh = async (
  currentToken: AuthToken,
  httpClient: HttpClient,
  sessionStorage: SessionStorage,
  logger: Logger
): Promise<AuthToken | null> => {
  try {
    logger.info('Starting token refresh', {
      currentTokenExpires: currentToken.expires,
      refreshToken: currentToken.refreshToken ? '***' : 'not_available',
    });

    // Call refresh endpoint
    const refreshResponse = await refreshUserAuthToken(httpClient, {
      refreshToken: currentToken.refreshToken!,
    });

    if (!refreshResponse.success || !refreshResponse.data) {
      logger.error('Token refresh failed - invalid response', {
        success: refreshResponse.success,
        hasData: !!refreshResponse.data,
        error: refreshResponse.error,
      });
      return null;
    }

    // Create new token from response
    const tokenData = refreshResponse.data.token;
    const newToken = updateAuthToken(
      currentToken,
      tokenData.access_token,
      new Date(tokenData.expires),
      tokenData.refresh_token
    );

    logger.info('Token refresh successful', {
      oldExpires: currentToken.expires,
      newExpires: newToken.expires,
      tokenType: newToken.tokenType,
    });

    // Update session with new token
    const session = await sessionStorage.get();
    if (session) {
      await sessionStorage.set({
        ...session,
        token: newToken,
      });

      logger.debug('Session updated with refreshed token');
    }

    return newToken;
  } catch (error) {
    logger.error('Token refresh failed with error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
};

/**
 * Checks if token needs refresh and initiates refresh if necessary
 * Returns current or refreshed token
 */
const ensureValidToken = async (
  state: TokenRefreshState,
  httpClient: HttpClient,
  sessionStorage: SessionStorage,
  logger: Logger
): Promise<AuthToken | null> => {
  try {
    const session = await sessionStorage.get();

    if (!session?.token) {
      logger.debug('No token found in session');
      return null;
    }

    const token = session.token;

    // If token is still valid and doesn't need refresh yet
    if (!shouldRefreshToken(token) && !isTokenExpired(token)) {
      return token;
    }

    logger.info('Token needs refresh', {
      isExpired: isTokenExpired(token),
      shouldRefresh: shouldRefreshToken(token),
      hasRefreshCapability: hasRefreshCapability(token),
    });

    // Check if token can be refreshed
    if (!hasRefreshCapability(token)) {
      logger.warn('Token cannot be refreshed - no refresh token available');
      return null;
    }

    // Prevent multiple simultaneous refresh attempts
    if (state.refreshPromise) {
      logger.debug('Refresh already in progress, waiting for completion');
      return await state.refreshPromise;
    }

    // Check refresh cooldown
    const now = Date.now();
    if (now - state.lastRefreshAttempt < state.REFRESH_COOLDOWN) {
      logger.warn('Token refresh attempted too recently, skipping', {
        lastAttempt: state.lastRefreshAttempt,
        cooldownRemaining:
          state.REFRESH_COOLDOWN - (now - state.lastRefreshAttempt),
      });
      return isTokenExpired(token) ? null : token;
    }

    // Start refresh process
    state.refreshPromise = performTokenRefresh(
      token,
      httpClient,
      sessionStorage,
      logger
    );

    try {
      const refreshedToken = await state.refreshPromise;
      
      // Only set cooldown after successful refresh (when we actually got a token)
      if (refreshedToken) {
        state.lastRefreshAttempt = now;
      } else {
        // Reset lastRefreshAttempt on failure to allow retry sooner
        state.lastRefreshAttempt = 0;
      }
      
      return refreshedToken;
    } catch (error) {
      // Reset lastRefreshAttempt on failure to allow retry sooner
      state.lastRefreshAttempt = 0;
      throw error;
    } finally {
      state.refreshPromise = null;
    }
  } catch (error) {
    logger.error('Failed to ensure valid token', { error });
    return null;
  }
};

/**
 * Resets the refresh state (useful for testing or error recovery)
 */
const resetTokenRefreshState = (state: TokenRefreshState): void => {
  state.refreshPromise = null;
  state.lastRefreshAttempt = 0;
};

/**
 * Token refresh handler factory
 * Creates a token refresh handler with functional patterns
 */
export const createTokenRefreshHandler = (
  httpClient: HttpClient,
  sessionStorage: SessionStorage,
  logger: Logger
) => {
  // State managed separately
  const state: TokenRefreshState = {
    refreshPromise: null,
    lastRefreshAttempt: 0,
    REFRESH_COOLDOWN: 30000, // 30 seconds
  };

  // Return the public interface
  return {
    ensureValidToken: () =>
      ensureValidToken(state, httpClient, sessionStorage, logger),
    reset: () => resetTokenRefreshState(state),
  };
};
