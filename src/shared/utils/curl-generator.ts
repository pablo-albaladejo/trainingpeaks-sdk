/**
 * cURL Command Generator
 * Shared utility for generating curl commands from HTTP requests
 */

export interface CurlRequestData {
  method: string;
  url: string;
  headers?: Record<string, string>;
  data?: unknown;
}

/**
 * Generate curl command from request data
 */
export const generateCurlCommand = (request: CurlRequestData): string => {
  const { method, url, headers = {}, data } = request;

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

  // Add data if present
  if (data) {
    const jsonData = JSON.stringify(data, null, 2);
    curl += ` \\\n  -d '${jsonData}'`;
  }

  return curl;
};
