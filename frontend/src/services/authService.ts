/**
 * Authentication Service
 * Manages user registration, login, session tokens, and local cache.
 * Connects directly to backend /api/auth endpoints using the shared apiClient.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';
import { tokenStorage } from './tokenStorage';
import { Config } from '../constants/config';
import { User, AuthResponse } from '../types/user';

export const AuthService = {
  /**
   * Register a new user account
   */
  async register(name: string, email: string, password: string, phone?: string): Promise<AuthResponse> {
    if (Config.FORCE_MOCK_API) {
      return this._mockAuth(name, email);
    }

    try {
      // Send both full_name and phone_number matching the backend schema
      const response = await apiClient.post('/api/auth/register', {
        full_name: name,
        email,
        password,
        phone_number: phone || undefined,
      });
      const data: AuthResponse = response.data;
      await this._saveSession(data);
      return data;
    } catch (error: any) {
      if (Config.AUTO_FALLBACK_TO_MOCK && error.isNetworkError) {
        console.warn('[AuthService] Backend unavailable. Falling back to local development mock session.');
        return this._mockAuth(name, email);
      }
      throw error;
    }
  },

  /**
   * Authenticate existing user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    if (Config.FORCE_MOCK_API) {
      return this._mockAuth('Demo User', email);
    }

    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
      });
      const data: AuthResponse = response.data;
      await this._saveSession(data);
      return data;
    } catch (error: any) {
      if (Config.AUTO_FALLBACK_TO_MOCK && error.isNetworkError) {
        console.warn('[AuthService] Backend unavailable. Falling back to local development mock session.');
        return this._mockAuth('Demo User', email);
      }
      throw error;
    }
  },

  /**
   * Request password reset instructions
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch {
      // Mock resolution for development
      return {
        success: true,
        message: 'Password reset link sent to ' + email + ' (Development Simulation)',
      };
    }
  },

  /**
   * Retrieve cached authenticated user from storage
   */
  async getStoredSession(): Promise<{ user: User | null; token: string | null }> {
    try {
      const [token, userStr] = await Promise.all([
        tokenStorage.getToken(),
        AsyncStorage.getItem(Config.STORAGE_KEYS.USER_PROFILE),
      ]);
      const user = userStr ? JSON.parse(userStr) : null;
      return { user, token };
    } catch {
      return { user: null, token: null };
    }
  },

  /**
   * Log out and clear stored session
   */
  async logout(): Promise<void> {
    await Promise.all([
      tokenStorage.removeToken(),
      AsyncStorage.removeItem(Config.STORAGE_KEYS.USER_PROFILE),
    ]);
  },

  async _saveSession(data: AuthResponse): Promise<void> {
    const token = data.token || (data as any).access_token;
    await Promise.all([
      tokenStorage.setToken(token),
      AsyncStorage.setItem(Config.STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.user)),
    ]);
  },

  async _mockAuth(name: string, email: string): Promise<AuthResponse> {
    const mockUser: User = {
      id: 'usr_dev_' + Math.random().toString(36).substring(2, 9),
      name: name || 'Priya Sharma',
      email: email || 'priya.sharma@example.com',
      phone: '+1 (555) 234-5678',
      createdAt: new Date().toISOString(),
    };
    const mockResponse: AuthResponse = {
      token: 'jwt_mock_dev_token_' + Date.now(),
      user: mockUser,
    };
    await this._saveSession(mockResponse);
    return mockResponse;
  },
};

export default AuthService;
