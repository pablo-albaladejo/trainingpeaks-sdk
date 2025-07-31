/**
 * Base API Client
 * Provides common functionality for all entity-specific API clients
 */

import type { HttpClient, HttpClientConfig } from '@/adapters/http';
import { createHttpClient } from '@/adapters/http';
import { createLogger } from '@/adapters/logging/logger';
import { getSDKConfig } from '@/config';
import type { AuthToken } from '@/domain';

export interface BaseApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  version?: string;
}

export interface EntityApiConfig {
  entity: string;
  version?: string;
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Base API Client that provides common functionality
 */
export abstract class BaseApiClient {
  protected readonly httpClient: HttpClient;
  protected readonly logger: ReturnType<typeof createLogger>;
  protected readonly entity: string;
  protected readonly version: string;
  protected readonly baseURL: string;

  constructor(config: EntityApiConfig) {
    const sdkConfig = getSDKConfig();

    this.entity = config.entity;
    this.version = config.version || 'v1';
    this.baseURL = config.baseURL;

    this.logger = createLogger({
      level: sdkConfig.debug.enabled ? 'debug' : 'info',
      enabled: sdkConfig.debug.enabled && sdkConfig.debug.logNetwork,
    });

    const httpConfig: HttpClientConfig = {
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: config.headers,
    };

    this.httpClient = createHttpClient(httpConfig, this.logger);
  }

  /**
   * Build endpoint URL with entity, version, and action
   */
  protected buildEndpoint(
    action: string,
    params?: Record<string, string>
  ): string {
    const endpoint = `/${this.entity}/${this.version}/${action}`;

    if (params) {
      const queryParams = new URLSearchParams(params);
      return `${endpoint}?${queryParams.toString()}`;
    }

    return endpoint;
  }

  /**
   * Build endpoint URL with ID
   */
  protected buildEndpointWithId(
    action: string,
    id: string,
    params?: Record<string, string>
  ): string {
    const endpoint = `/${this.entity}/${this.version}/${action}/${id}`;

    if (params) {
      const queryParams = new URLSearchParams(params);
      return `${endpoint}?${queryParams.toString()}`;
    }

    return endpoint;
  }

  /**
   * Get authorization headers
   */
  protected getAuthHeaders(token: AuthToken): Record<string, string> {
    return {
      Authorization: `${token.tokenType} ${token.accessToken}`,
    };
  }

  /**
   * Log API request
   */
  protected logRequest(method: string, endpoint: string, data?: unknown): void {
    this.logger.debug(
      `🌐 ${this.entity.toUpperCase()} API: ${method} ${endpoint}`,
      {
        entity: this.entity,
        version: this.version,
        data: data ? JSON.stringify(data) : undefined,
      }
    );
  }

  /**
   * Log API response
   */
  protected logResponse(
    method: string,
    endpoint: string,
    status: number
  ): void {
    this.logger.debug(
      `🌐 ${this.entity.toUpperCase()} API: ${method} ${endpoint} → ${status}`,
      {
        entity: this.entity,
        version: this.version,
        status,
      }
    );
  }

  /**
   * Log API error
   */
  protected logError(method: string, endpoint: string, error: Error): void {
    this.logger.error(
      `🌐 ${this.entity.toUpperCase()} API: ${method} ${endpoint} → ERROR`,
      {
        entity: this.entity,
        version: this.version,
        error: error.message,
      }
    );
  }
}
