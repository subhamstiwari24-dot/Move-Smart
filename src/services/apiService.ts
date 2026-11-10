import { Incident, IncidentStatus } from '../types/incident';
import { ActivityLog } from '../types/activity';
import { NotificationItem } from '../types/notification';
import { authService } from './authService';
import { getApiBaseUrl, getBackendOrigin } from '../utils/apiUrl';

const API_BASE = getApiBaseUrl();

export interface BackendHealthResponse {
  connected: boolean;
  service?: string;
  version?: string;
  timestamp?: string;
  database?: string;
  error?: string;
}

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

export const apiService = {
  async checkHealth(): Promise<BackendHealthResponse> {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) {
        return { connected: false, error: `HTTP ${res.status}` };
      }
      const data = await res.json();
      return {
        connected: data.status === 'UP',
        service: data.service,
        version: data.version,
        timestamp: data.timestamp,
        database: data.database,
      };
    } catch (err: unknown) {
      return { connected: false, error: (err as Error).message || 'Server unreachable' };
    }
  },

  async getIncidents(): Promise<Incident[] | null> {
    try {
      const res = await fetch(`${API_BASE}/incidents`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getIncidentById(id: string): Promise<Incident | null> {
    try {
      const res = await fetch(`${API_BASE}/incidents/${encodeURIComponent(id)}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async trackIncident(trackingId: string): Promise<Incident | null> {
    try {
      const res = await fetch(`${API_BASE}/incidents/track/${encodeURIComponent(trackingId.trim())}`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        // Fallback to by-id search
        const fallbackRes = await fetch(`${API_BASE}/incidents/${encodeURIComponent(trackingId.trim())}`, {
          signal: AbortSignal.timeout(5000),
        });
        if (fallbackRes.ok) return await fallbackRes.json();
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  },

  async getMyReports(): Promise<Incident[] | null> {
    try {
      const res = await fetch(`${API_BASE}/incidents/my-reports`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      if (res.status === 401) {
        authService.handleUnauthorized();
        return null;
      }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async createIncident(data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident | null> {
    try {
      const res = await fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(8000),
      });
      if (res.status === 401) {
        authService.handleUnauthorized();
        return null;
      }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async uploadPhoto(file: File): Promise<{ success: boolean; url?: string; filename?: string; error?: string }> {
    try {
      const token = authService.getStoredToken();
      const formData = new FormData();
      formData.append('file', file);

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/incidents/upload`, {
        method: 'POST',
        headers,
        body: formData,
        signal: AbortSignal.timeout(15000),
      });

      if (res.status === 401) {
        authService.handleUnauthorized();
        return { success: false, error: 'Session expired. Please log in again.' };
      }

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Build full URL if relative
        const fullUrl = data.url?.startsWith('http') ? data.url : `${getBackendOrigin()}${data.url}`;
        return { success: true, url: fullUrl, filename: data.filename };
      }
      return { success: false, error: data.error || 'Failed to upload photo evidence' };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Photo upload network error' };
    }
  },

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | null> {
    try {
      const res = await fetch(`${API_BASE}/incidents/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(5000),
      });
      if (res.status === 401) {
        authService.handleUnauthorized();
        return null;
      }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateIncidentStatus(
    id: string,
    newStatus: IncidentStatus,
    adminNote?: string,
    publicUpdate?: string,
    assignedUnit?: string,
    priority?: string
  ): Promise<Incident | null> {
    try {
      const res = await fetch(`${API_BASE}/incidents/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: newStatus,
          adminNote,
          publicUpdate,
          assignedUnit,
          priority,
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.status === 401) {
        authService.handleUnauthorized();
        return null;
      }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async deleteIncident(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/incidents/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      if (res.status === 401) {
        authService.handleUnauthorized();
        return false;
      }
      return res.status === 204 || res.ok;
    } catch {
      return false;
    }
  },

  async getActivities(): Promise<ActivityLog[] | null> {
    try {
      const res = await fetch(`${API_BASE}/activities`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      if (res.status === 401) {
        authService.handleUnauthorized();
        return null;
      }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async resetDemoData(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/incidents/reset`, {
        method: 'POST',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(8000),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // In-app Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      if (res.status === 401) {
        authService.handleUnauthorized();
        return [];
      }
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getUnreadNotificationCount(): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return 0;
      const data = await res.json();
      return data.unreadCount || 0;
    } catch {
      return 0;
    }
  },

  async markNotificationAsRead(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notifications/${encodeURIComponent(id)}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async markAllNotificationsAsRead(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
