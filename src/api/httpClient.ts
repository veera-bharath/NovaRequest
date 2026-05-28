import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { Method, HeaderRow, ApiResponse } from '../types/request';

/**
 * Sends an HTTP request and measures its duration.
 */
export const sendRequest = async (
  method: Method,
  url: string,
  headers: HeaderRow[],
  body: string,
  timeout = 30000
): Promise<ApiResponse> => {
  const startTime = performance.now();

  // Ensure absolute URL
  let targetUrl = url.trim();
  if (targetUrl && !/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }

  // Format headers
  const axiosHeaders: Record<string, string> = {};
  headers.forEach((h) => {
    if (h.enabled && h.key.trim()) {
      axiosHeaders[h.key.trim()] = h.value;
    }
  });

  // Prepare request body
  let requestData: any = undefined;
  if ((method === 'POST' || method === 'PUT') && body) {
    try {
      requestData = JSON.parse(body);
    } catch (e) {
      // Fallback to sending raw body if it is not valid JSON
      requestData = body;
    }
  }

  const config: AxiosRequestConfig = {
    method,
    url: targetUrl,
    headers: axiosHeaders,
    data: requestData,
    timeout,
    // In an API tester, we want to return response even for failure status codes (e.g. 400, 500)
    validateStatus: () => true,
  };

  try {
    const response: AxiosResponse = await axios(config);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
      data: response.data,
      responseTime,
    };
  } catch (error: any) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    let errorMessage = 'An unknown error occurred';
    if (error.code === 'ECONNABORTED') {
      errorMessage = `Request timed out after ${timeout}ms`;
    } else if (error.message === 'Network Error') {
      errorMessage = 'Network Error. This could be due to CORS, invalid SSL, or an unreachable server.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      status: 0,
      statusText: 'Network Error',
      headers: {},
      data: null,
      responseTime,
      error: errorMessage,
    };
  }
};
