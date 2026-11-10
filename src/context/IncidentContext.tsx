import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Incident, IncidentStatistics, IncidentStatus, IncidentPriority } from '../types/incident';
import { ActivityLog } from '../types/activity';
import { storageService } from '../services/storageService';
import { apiService, BackendHealthResponse } from '../services/apiService';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

interface IncidentContextType {
  incidents: Incident[];
  activities: ActivityLog[];
  statistics: IncidentStatistics;
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;
  createIncident: (data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => Incident;
  createIncidentAsync: (data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Incident>;
  fetchMyReports: () => Promise<Incident[]>;
  updateIncident: (id: string, updates: Partial<Incident>) => Incident | null;
  updateStatus: (
    id: string,
    newStatus: IncidentStatus,
    adminNote?: string,
    publicUpdate?: string,
    assignedUnit?: string,
    priority?: IncidentPriority
  ) => Incident | null;
  deleteIncident: (id: string) => boolean;
  resetDemoData: () => void;
  toast: ToastState;
  showToast: (message: string, type?: ToastState['type']) => void;
  hideToast: () => void;
  activeRole: 'citizen' | 'admin';
  setActiveRole: (role: 'citizen' | 'admin') => void;
  adminTab: 'overview' | 'management' | 'map' | 'analytics' | 'activity' | 'settings';
  setAdminTab: (tab: 'overview' | 'management' | 'map' | 'analytics' | 'activity' | 'settings') => void;
  focusIncidentId: string | null;
  setFocusIncidentId: (id: string | null) => void;
  isBackendConnected: boolean;
  backendHealth: BackendHealthResponse | null;
  checkBackendHealth: () => Promise<void>;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeRole, setActiveRole] = useState<'citizen' | 'admin'>('citizen');
  const [adminTab, setAdminTab] = useState<'overview' | 'management' | 'map' | 'analytics' | 'activity' | 'settings'>('overview');
  const [focusIncidentId, setFocusIncidentId] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [backendHealth, setBackendHealth] = useState<BackendHealthResponse | null>(null);

  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback((message: string, type: ToastState['type'] = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show, hideToast]);

  // Load from local cache initially for instantaneous UI render
  const refreshData = useCallback(() => {
    const loadedIncidents = storageService.getIncidents();
    const loadedActivities = storageService.getActivities();
    setIncidents(loadedIncidents);
    setActivities(loadedActivities);
  }, []);

  // Check backend health and sync remote data if available
  const checkBackendHealth = useCallback(async () => {
    try {
      const health = await apiService.checkHealth();
      setBackendHealth(health);
      setIsBackendConnected(health.connected);

      if (health.connected) {
        // Synchronize incidents and activities from the Spring Boot API
        const remoteIncidents = await apiService.getIncidents();
        if (remoteIncidents && Array.isArray(remoteIncidents) && remoteIncidents.length > 0) {
          setIncidents(remoteIncidents);
          storageService.saveIncidents(remoteIncidents);
        }

        const remoteActivities = await apiService.getActivities();
        if (remoteActivities && Array.isArray(remoteActivities) && remoteActivities.length > 0) {
          setActivities(remoteActivities);
          storageService.saveActivities(remoteActivities);
        }
      }
    } catch (e) {
      console.warn('Backend sync check note:', e);
      setIsBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    checkBackendHealth();
  }, [refreshData, checkBackendHealth]);

  const statistics = storageService.computeStatistics(incidents);

  const createIncident = useCallback(
    (data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
      // 1. Optimistic local update
      const created = storageService.createIncident(data);
      refreshData();
      showToast(`Incident #${created.id} reported successfully!`, 'success');

      // 2. Async backend sync
      if (isBackendConnected) {
        apiService.createIncident(data).then((remoteCreated) => {
          if (remoteCreated) {
            const current = storageService.getIncidents();
            const filtered = current.filter((i) => i.id !== created.id);
            const synced = [remoteCreated, ...filtered];
            storageService.saveIncidents(synced);
            setIncidents(synced);
          }
        }).catch((err) => {
          console.warn('Backend create sync failed, preserved in local storage:', err);
        });
      }

      return created;
    },
    [refreshData, showToast, isBackendConnected]
  );

  const createIncidentAsync = useCallback(
    async (data: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (isBackendConnected) {
        try {
          const remoteCreated = await apiService.createIncident(data);
          if (remoteCreated) {
            const current = storageService.getIncidents();
            const synced = [remoteCreated, ...current.filter((i) => i.id !== remoteCreated.id)];
            storageService.saveIncidents(synced);
            setIncidents(synced);
            refreshData();
            showToast(`Incident #${remoteCreated.id} reported to operations!`, 'success');
            return remoteCreated;
          }
        } catch (err) {
          console.warn('Backend create failed, saving locally:', err);
        }
      }
      const created = storageService.createIncident(data);
      refreshData();
      showToast(`Incident #${created.id} reported successfully!`, 'success');
      return created;
    },
    [refreshData, showToast, isBackendConnected]
  );

  const fetchMyReports = useCallback(async () => {
    if (isBackendConnected) {
      const reports = await apiService.getMyReports();
      if (reports) return reports;
    }
    return [];
  }, [isBackendConnected]);

  const updateIncident = useCallback(
    (id: string, updates: Partial<Incident>) => {
      const updated = storageService.updateIncident(id, updates);
      if (updated) {
        refreshData();
        if (selectedIncident && selectedIncident.id === id) {
          setSelectedIncident(updated);
        }
        showToast(`Incident #${id} details updated`, 'info');

        if (isBackendConnected) {
          apiService.updateIncident(id, updates).catch((err) => {
            console.warn('Backend update sync note:', err);
          });
        }
      }
      return updated;
    },
    [refreshData, selectedIncident, showToast, isBackendConnected]
  );

  const updateStatus = useCallback(
    (
      id: string,
      newStatus: IncidentStatus,
      adminNote?: string,
      publicUpdate?: string,
      assignedUnit?: string,
      priority?: IncidentPriority
    ) => {
      const updated = storageService.updateIncidentStatus(
        id,
        newStatus,
        adminNote,
        publicUpdate,
        assignedUnit,
        priority
      );
      if (updated) {
        refreshData();
        if (selectedIncident && (selectedIncident.id === id || selectedIncident.trackingId === id)) {
          setSelectedIncident(updated);
        }
        showToast(`Incident #${updated.id} status changed to ${newStatus}`, 'info');

        if (isBackendConnected) {
          apiService
            .updateIncidentStatus(id, newStatus, adminNote, publicUpdate, assignedUnit, priority)
            .catch((err) => {
              console.warn('Backend status update sync note:', err);
            });
        }
      }
      return updated;
    },
    [refreshData, selectedIncident, showToast, isBackendConnected]
  );

  const deleteIncident = useCallback(
    (id: string) => {
      const success = storageService.deleteIncident(id);
      if (success) {
        refreshData();
        if (selectedIncident && selectedIncident.id === id) {
          setSelectedIncident(null);
        }
        showToast(`Incident #${id} removed from records`, 'warning');

        if (isBackendConnected) {
          apiService.deleteIncident(id).catch((err) => {
            console.warn('Backend delete sync note:', err);
          });
        }
      }
      return success;
    },
    [refreshData, selectedIncident, showToast, isBackendConnected]
  );

  const resetDemoData = useCallback(() => {
    storageService.resetToDemoData();
    refreshData();
    setSelectedIncident(null);
    showToast('Demo environment reset to initial Mumbai sample data', 'info');

    if (isBackendConnected) {
      apiService.resetDemoData().then(() => {
        checkBackendHealth();
      }).catch((err) => {
        console.warn('Backend reset sync note:', err);
      });
    }
  }, [refreshData, showToast, isBackendConnected, checkBackendHealth]);

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        activities,
        statistics,
        selectedIncident,
        setSelectedIncident,
        createIncident,
        createIncidentAsync,
        fetchMyReports,
        updateIncident,
        updateStatus,
        deleteIncident,
        resetDemoData,
        toast,
        showToast,
        hideToast,
        activeRole,
        setActiveRole,
        adminTab,
        setAdminTab,
        focusIncidentId,
        setFocusIncidentId,
        isBackendConnected,
        backendHealth,
        checkBackendHealth,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
