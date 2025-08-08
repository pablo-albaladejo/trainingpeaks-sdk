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
  failureCount: number;
  readonly REFRESH_COOLDOWN: number;
  readonly MAX_BACKOFF: number;
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

    // Check refresh cooldown with dynamic backoff
    const now = Date.now();
    const currentCooldown = Math.min(
      30000 * Math.pow(2, state.failureCount), // BASE_COOLDOWN * 2^failureCount
      300000 // MAX_BACKOFF
    );

    if (now - state.lastRefreshAttempt < currentCooldown) {
      logger.warn('Token refresh attempted too recently, skipping', {
        lastAttempt: state.lastRefreshAttempt,
        failureCount: state.failureCount,
        currentCooldown,
        cooldownRemaining: currentCooldown - (now - state.lastRefreshAttempt),
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

      // Set attempt timestamp and handle success/failure
      state.lastRefreshAttempt = now;

      if (refreshedToken) {
        // Reset failure count on success
        state.failureCount = 0;
      } else {
        // Increment failure count for exponential backoff
        state.failureCount++;
      }

      return refreshedToken;
    } catch (error) {
      // Set attempt timestamp and increment failure count for exponential backoff
      state.lastRefreshAttempt = now;
      state.failureCount++;
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
    failureCount: 0,
    REFRESH_COOLDOWN: 30000, // 30 seconds
    MAX_BACKOFF: 300000, // 5 minutes
  };

  // Return the public interface
  return {
    ensureValidToken: () =>
      ensureValidToken(state, httpClient, sessionStorage, logger),
    reset: () => resetTokenRefreshState(state),
  };
};
