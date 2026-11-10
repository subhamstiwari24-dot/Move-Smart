import { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials, 
  CreateStaffCredentials,
  ResetPasswordCredentials,
  UpdateProfileCredentials,
  ChangePasswordCredentials
} from '../types/auth';
import { getApiBaseUrl } from '../utils/apiUrl';

// SessionStorage keys - NEVER stored in permanent localStorage
const SESS_TOKEN_KEY = 'movesmart_sess_token_v2';
const SESS_USER_KEY = 'movesmart_sess_user_v2';

// In-memory token cache for runtime requests
let memoryToken: string | null = null;
let sessionExpiredHandler: (() => void) | null = null;

// Purge any legacy localStorage tokens from older prototypes
try {
  localStorage.removeItem('movesmart_auth_token_v1');
  localStorage.removeItem('movesmart_auth_user_v1');
} catch {}

// Base URL: resolves dynamically via getApiBaseUrl utility
const API_BASE = getApiBaseUrl();

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = authService.getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const authService = {
  onSessionExpired(callback: () => void): () => void {
    sessionExpiredHandler = callback;
    return () => {
      if (sessionExpiredHandler === callback) {
        sessionExpiredHandler = null;
      }
    };
  },

  handleUnauthorized(): void {
    this.clearAuth();
    if (sessionExpiredHandler) {
      sessionExpiredHandler();
    }
  },

  getStoredToken(): string | null {
    if (memoryToken) return memoryToken;
    try {
      memoryToken = sessionStorage.getItem(SESS_TOKEN_KEY);
      return memoryToken;
    } catch {
      return null;
    }
  },

  getStoredUser(): User | null {
    try {
      const data = sessionStorage.getItem(SESS_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveAuth(auth: AuthResponse): void {
    try {
      memoryToken = auth.token;
      sessionStorage.setItem(SESS_TOKEN_KEY, auth.token);
      const user: User = {
        id: auth.id,
        email: auth.email,
        fullName: auth.fullName,
        role: auth.role,
      };
      sessionStorage.setItem(SESS_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save session auth', e);
    }
  },

  saveUser(user: User): void {
    try {
      sessionStorage.setItem(SESS_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  },

  clearAuth(): void {
    memoryToken = null;
    try {
      sessionStorage.removeItem(SESS_TOKEN_KEY);
      sessionStorage.removeItem(SESS_USER_KEY);
    } catch (e) {
      console.error('Failed to clear session auth', e);
    }
  },

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return {
          success: false,
          error: errData.error || errData.message || 'Invalid email or password',
        };
      }

      const data: AuthResponse = await res.json();
      this.saveAuth(data);
      return {
        success: true,
        user: {
          id: data.id,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
        },
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || 'Unable to connect to authentication server. Please check backend status.',
      };
    }
  },

  async register(credentials: RegisterCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return {
          success: false,
          error: errData.error || errData.message || 'Registration failed. Email may already be registered.',
        };
      }

      const data: AuthResponse = await res.json();
      this.saveAuth(data);
      return {
        success: true,
        user: {
          id: data.id,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
        },
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || 'Unable to connect to registration server',
      };
    }
  },

  async updateProfile(credentials: UpdateProfileCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      if (res.status === 401) {
        this.handleUnauthorized();
        return { success: false, error: 'Session expired. Please log in again.' };
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.error || 'Failed to update profile' };
      }

      const updatedUser: User = await res.json();
      this.saveUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Network error updating profile' };
    }
  },

  async changePassword(credentials: ChangePasswordCredentials): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      if (res.status === 401) {
        const errData = await res.json().catch(() => ({}));
        if (errData.error === 'Current password does not match' || errData.error === 'Current password is incorrect') {
          return { success: false, error: 'Current password is incorrect' };
        }
        this.handleUnauthorized();
        return { success: false, error: 'Session expired. Please log in again.' };
      }

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, message: data.message || 'Password updated successfully' };
      }
      return { success: false, error: data.error || 'Failed to change password' };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Network error' };
    }
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, message: data.message || 'Password reset instructions dispatched.' };
      }
      return { success: false, error: data.error || 'Failed to request password reset' };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Connection error' };
    }
  },

  async resetPassword(credentials: ResetPasswordCredentials): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, message: data.message || 'Password updated successfully.' };
      }
      return { success: false, error: data.error || 'Password reset failed' };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Connection error' };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = this.getStoredToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user: User = await res.json();
        this.saveUser(user);
        return user;
      } else {
        if (res.status === 401) {
          this.handleUnauthorized();
        }
        return null;
      }
    } catch {
      // Use cached session user if offline
      return this.getStoredUser();
    }
  },

  // Admin user management functions
  async getAllUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE}/auth/users`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createStaffUser(credentials: CreateStaffCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/users/staff`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, user: data };
      }
      return { success: false, error: data.error || 'Failed to create staff account' };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Connection error' };
    }
  },

  async toggleUserActive(userId: string, active: boolean): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/users/${encodeURIComponent(userId)}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ active }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, user: data };
      }
      return { success: false, error: data.error || 'Status update failed' };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Connection error' };
    }
  },

  logout(): void {
    this.clearAuth();
  },
};
