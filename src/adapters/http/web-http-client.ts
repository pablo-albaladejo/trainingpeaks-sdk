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
};

export type WebHttpResponse<T = unknown> = {
  status: number;
  statusText: string;
  data: T;
  headers: AxiosResponseHeaders;
  cookies: string[];
};

export type WebHttpClient = {
  get<T = unknown>(url: string): Promise<WebHttpResponse<T>>;
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
  config: WebHttpClientConfig
): WebHttpClient => {
  let storedCookies: string[] = [];
  const jar = new CookieJar();
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

  const get = async <T = unknown>(url: string): Promise<WebHttpResponse<T>> => {
    const response = await client.get<T>(url);
    const cookies = extractCookies(response);
    storedCookies = Array.from(new Set([...storedCookies, ...cookies]));
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
  };

  return { get, post, setCookie };
};
