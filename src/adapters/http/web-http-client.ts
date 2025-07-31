import type { LoggerType } from '@/adapters/logging/logger';
import { generateCurlCommand } from '@/shared/utils/curl-generator';
import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosResponseHeaders,
} from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

export type WebHttpClientConfig = {
  timeout?: number;
  baseURL?: string;
  logger?: LoggerType;
};

export type WebHttpResponse<T = unknown> = {
  status: number;
  statusText: string;
  data: T;
  headers: AxiosResponseHeaders;
  cookies: string[];
};

export type WebHttpClient = {
  get<T = unknown>(
    url: string,
    options?: {
      headers?: Record<string, string>;
    }
  ): Promise<WebHttpResponse<T>>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    options?: {
      contentType?: string;
      followRedirects?: boolean;
      headers?: Record<string, string>;
    }
  ): Promise<WebHttpResponse<T>>;
  setCookie(name: string, value: string): void;
};

export const createWebHttpClient = (
  config: WebHttpClientConfig,
  logger: LoggerType
): WebHttpClient => {
  const jar = new CookieJar();
  const MAX_COOKIES = 50; // Limit to prevent memory leaks
  let storedCookies: string[] = [];

  // Use config.logger if available, otherwise fallback to the passed logger
  const clientLogger = config.logger || logger;

  // Helper function to limit cookie count and prevent memory leaks
  const limitCookieCount = (): void => {
    if (storedCookies.length > MAX_COOKIES) {
      // Keep only the most recent cookies
      storedCookies = storedCookies.slice(-MAX_COOKIES);
      clientLogger.debug(
        '🌐 Web HTTP Client: Cookie limit reached, removed oldest cookies',
        {
          remainingCookies: storedCookies.length,
        }
      );
    }
  };

  const client: AxiosInstance = wrapper(
    axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      withCredentials: true,
      jar,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Lambda Bot)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        Connection: 'keep-alive',
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
    })
  );

  // Add request interceptor for cURL logging
  client.interceptors.request.use(
    (requestConfig) => {
      const curlCommand = generateCurlCommand({
        method: requestConfig.method || 'GET',
        url: requestConfig.url || '',
        headers: requestConfig.headers as Record<string, string>,
        data: requestConfig.data,
        cookies: storedCookies,
      });

      clientLogger.debug('🌐 Web HTTP Client: cURL command', {
        method: requestConfig.method,
        url: requestConfig.url,
        curl: curlCommand,
      });

      return requestConfig;
    },
    (error) => {
      clientLogger.error('🌐 Web HTTP Client: Request interceptor error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return Promise.reject(error);
    }
  );

  // Add response interceptor for logging
  client.interceptors.response.use(
    (response) => {
      clientLogger.debug('🌐 Web HTTP Client: Response received', {
        method: response.config.method,
        url: response.config.url,
        status: response.status,
        statusText: response.statusText,
        cookieCount: extractCookies(response).length,
        totalStoredCookies: storedCookies.length,
      });
      return response;
    },
    (error) => {
      clientLogger.error('🌐 Web HTTP Client: Response error', {
        method: error.config?.method,
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return Promise.reject(error);
    }
  );

  const extractCookies = (response: AxiosResponse): string[] => {
    const setCookieHeaders = response.headers['set-cookie'];
    if (!setCookieHeaders) return [];
    return setCookieHeaders
      .map((header) => {
        const match = header.match(/^([^=]+)=([^;]+)/);
        return match ? `${match[1]}=${match[2]}` : '';
      })
      .filter(Boolean);
  };

  const get = async <T = unknown>(
    url: string,
    options: { headers?: Record<string, string> } = {}
  ): Promise<WebHttpResponse<T>> => {
    const { headers = {} } = options;
    const response = await client.get<T>(url, { headers });
    const cookies = extractCookies(response);
    storedCookies = Array.from(new Set([...storedCookies, ...cookies]));
    limitCookieCount(); // Prevent memory leak
    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers as AxiosResponseHeaders,
      cookies,
    };
  };

  const post = async <T = unknown>(
    url: string,
    data?: unknown,
    options: {
      contentType?: string;
      followRedirects?: boolean;
      headers?: Record<string, string>;
    } = {}
  ): Promise<WebHttpResponse<T>> => {
    const {
      contentType = 'application/x-www-form-urlencoded',
      followRedirects = true,
      headers = {},
    } = options;
    const response = await client.post<T>(url, data, {
      headers: {
        'Content-Type': contentType,
        ...headers,
      },
      maxRedirects: followRedirects ? 5 : 0,
    });
    const cookies = extractCookies(response);
    storedCookies = Array.from(new Set([...storedCookies, ...cookies]));
    limitCookieCount(); // Prevent memory leak
    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers as AxiosResponseHeaders,
      cookies,
    };
  };

  const setCookie = (name: string, value: string): void => {
    const cookie = `${name}=${value}`;
    storedCookies = storedCookies.filter((c) => !c.startsWith(`${name}=`));
    storedCookies.push(cookie);
    limitCookieCount(); // Prevent memory leak
  };

  return { get, post, setCookie };
};
