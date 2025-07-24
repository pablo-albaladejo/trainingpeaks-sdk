/**
 * cURL Command Generator
 * Shared utility for generating curl commands from HTTP requests
 */

export interface CurlRequestData {
  method: string;
  url: string;
  headers?: Record<string, string>;
  data?: unknown;
  cookies?: string[];
}

/**
 * Generate curl command from request data
 */
export const generateCurlCommand = (request: CurlRequestData): string => {
  const { method, url, headers = {}, data, cookies = [] } = request;

  let curl = `curl -X ${method.toUpperCase()} '${url}'`;

  // Add headers (excluding some browser-specific headers)
  Object.entries(headers).forEach(([key, value]) => {
    // Skip browser-specific headers that aren't needed for API calls
    if (
      ![
        'user-agent',
        'accept-encoding',
        'accept-language',
        'cache-control',
        'sec-fetch-*',
      ].includes(key.toLowerCase())
    ) {
      curl += ` \\\n  -H '${key}: ${value}'`;
    }
  });

  // Add cookies if present
  if (cookies.length > 0) {
    const cookieHeader = cookies.join('; ');
    curl += ` \\\n  -H 'Cookie: ${cookieHeader}'`;
  }

  // Add data if present
  if (data) {
    if (data instanceof URLSearchParams) {
      // Handle form data - show each field separately for better readability
      const entries = Array.from(data.entries());
      if (entries.length > 0) {
        entries.forEach(([key, value]) => {
          curl += ` \\\n  -d '${key}=${encodeURIComponent(value)}'`;
        });
      }
    } else if (typeof data === 'string') {
      // Handle string data
      curl += ` \\\n  -d '${data}'`;
    } else {
      // Handle JSON data
      const jsonData = JSON.stringify(data, null, 2);
      curl += ` \\\n  -d '${jsonData}'`;
    }
  }

  return curl;
};
