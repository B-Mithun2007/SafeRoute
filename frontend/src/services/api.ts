/**
 * Central Axios API Client configuration.
 * Configured with dynamic baseURL, timeouts, and error interceptors.
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Config } from '../constants/config';
import { tokenStorage } from './tokenStorage';

// Create singleton Axios client
export const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: Config.API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Auth Token if present
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await tokenStorage.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Non-blocking fallback if storage read fails
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Format standard errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      // Network connectivity or server down
      return Promise.reject({
        message: 'Unable to reach SafeRoute backend. Please check your network connection or server status.',
        isNetworkError: true,
      });
    }
    const serverMessage = (error.response.data as { detail?: string })?.detail || error.message;
    return Promise.reject({
      status: error.response.status,
      message: serverMessage,
      data: error.response.data,
    });
  }
);

export default apiClient;
