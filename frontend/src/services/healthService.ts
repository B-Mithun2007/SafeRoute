/**
 * HealthService — Backend Connectivity Check
 *
 * Uses the shared Axios instance from api.ts to verify that the
 * SafeRoute AI Backend is reachable and healthy.
 *
 * Calls:  GET /api/health
 *
 * This service is primarily for development diagnostics and integration
 * testing. It does not display UI on its own.
 *
 * Usage example (React component or DevTools console):
 *   import { HealthService } from './healthService';
 *   const result = await HealthService.check();
 *   console.log(result);
 */
import { apiClient } from './api';

/** Shape of the response returned by GET /api/health */
export interface HealthCheckResponse {
  /** True when the backend replied with status: "healthy" */
  isHealthy: boolean;
  /** Service name returned by the backend */
  service?: string;
  /** UTC timestamp from the backend */
  timestamp?: string;
  /** Backend API version */
  version?: string;
  /** Human-readable error description when isHealthy is false */
  error?: string;
  /** HTTP status code (undefined when no response arrived) */
  httpStatus?: number;
}

export const HealthService = {
  /**
   * Pings GET /api/health and returns a structured result.
   *
   * Never throws — always resolves with isHealthy: true or false.
   * Check the `error` field for failure details.
   */
  async check(): Promise<HealthCheckResponse> {
    try {
      const response = await apiClient.get('/api/health');

      // Backend is reachable and returned a 2xx response
      const data = response.data as {
        status?: string;
        service?: string;
        timestamp?: string;
        version?: string;
      };

      const isHealthy = data?.status === 'healthy';

      return {
        isHealthy,
        service: data?.service,
        timestamp: data?.timestamp,
        version: data?.version,
        // If the backend replied but status isn't "healthy", surface that
        error: isHealthy
          ? undefined
          : `Backend returned unexpected status: "${data?.status}"`,
        httpStatus: response.status,
      };
    } catch (err: any) {
      // Network error — backend unreachable
      if (err?.isNetworkError) {
        return {
          isHealthy: false,
          error:
            'Backend is unreachable. Ensure FastAPI is running: ' +
            'cd backend && .\\venv\\Scripts\\Activate.ps1 && uvicorn app.main:app --reload',
          httpStatus: undefined,
        };
      }

      // HTTP error (4xx / 5xx)
      return {
        isHealthy: false,
        error: err?.message || 'Unknown error from backend',
        httpStatus: err?.status,
      };
    }
  },

  /**
   * Logs health check result to the development console.
   *
   * Call this from a screen's useEffect or from the browser DevTools console:
   *   import { HealthService } from '../services/healthService';
   *   HealthService.diagnose();
   */
  async diagnose(): Promise<void> {
    console.log('[HealthService] Checking backend connectivity...');
    const result = await this.check();

    if (result.isHealthy) {
      console.log(
        `[HealthService] ✅ Backend is healthy.\n` +
          `  Service:   ${result.service}\n` +
          `  Version:   ${result.version}\n` +
          `  Timestamp: ${result.timestamp}`
      );
    } else {
      console.error(
        `[HealthService] ❌ Backend health check failed.\n` +
          `  HTTP Status: ${result.httpStatus ?? 'No response'}\n` +
          `  Error: ${result.error}`
      );
    }
  },
};

export default HealthService;
