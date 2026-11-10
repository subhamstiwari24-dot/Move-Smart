import React, { useState, useEffect } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useAuth } from '../../context/AuthContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  RotateCcw, 
  Database, 
  Server, 
  Code2, 
  Info, 
  ShieldCheck, 
  Cpu, 
  HardDrive, 
  ExternalLink,
  CheckCircle2,
  Download,
  Sliders,
  Map,
  Bell,
  Layers,
  Settings,
  RefreshCw,
  Activity,
  AlertTriangle,
  Clock,
  Key,
  Users
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { 
    incidents, 
    activities, 
    resetDemoData, 
    showToast, 
    isBackendConnected, 
    backendHealth, 
    checkBackendHealth 
  } = useIncidents();
  
  const { allUsers, loadAllUsers, isAdmin } = useAuth();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);

  // Settings states
  const [tableDensity, setTableDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [mapProvider, setMapProvider] = useState<'osm' | 'carto'>('osm');
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [criticalReminder, setCriticalReminder] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadAllUsers();
    }
  }, [isAdmin, loadAllUsers]);

  const handleRefreshHealth = async () => {
    setIsRefreshingHealth(true);
    await checkBackendHealth();
    setIsRefreshingHealth(false);
    showToast('Backend health probe updated', 'info');
  };

  const handleReset = () => {
    resetDemoData();
    setIsResetConfirmOpen(false);
  };

  const handleExportJSON = () => {
    const backup = {
      app: 'MoveSmart Urban Mobility Intelligence',
      targetRegion: 'Mumbai Metropolitan Region (MMR)',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      systemHealth: backendHealth,
      totalIncidents: incidents.length,
      incidents,
      activities,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `movesmart_mumbai_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('System incident dataset exported successfully', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Live Backend Architecture & Health Status Card */}
      <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-50 text-[#0F766E] border border-teal-200/60">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Spring Boot REST API & Database Status
              </h3>
              <p className="text-xs text-slate-500">
                Live runtime telemetry from Spring Boot backend on port 8080
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefreshHealth}
            disabled={isRefreshingHealth}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingHealth ? 'animate-spin text-[#0F766E]' : ''}`} />
            <span>Check Health Probe</span>
          </button>
        </div>

        {/* Live Diagnostics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Activity className="w-3 h-3 text-slate-400" />
              <span>Backend Service</span>
            </span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <p className="font-bold text-slate-900">
                {isBackendConnected ? 'API UP (Connected)' : 'Offline / Standalone'}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">http://localhost:8080/api</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>Active Database Engine</span>
            </span>
            <p className="font-bold text-slate-900 pt-0.5">
              {backendHealth?.database ? `${backendHealth.database} JPA Session` : 'H2 In-Memory (Zero-Config)'}
            </p>
            <p className="text-[10px] text-slate-500">PostgreSQL Ready</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Key className="w-3 h-3 text-amber-600" />
              <span>Authentication Token</span>
            </span>
            <p className="font-bold text-slate-900 pt-0.5">HMAC-SHA256 JWT</p>
            <p className="text-[10px] text-slate-500 font-mono">Stateless • 24h Expiry</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Users className="w-3 h-3 text-teal-600" />
              <span>Active User Directory</span>
            </span>
            <p className="font-bold text-slate-900 pt-0.5">
              {allUsers.length > 0 ? `${allUsers.length} Provisioned Users` : 'Authenticated Session'}
            </p>
            <p className="text-[10px] text-slate-500">RBAC: Citizen • Ops • Admin</p>
          </div>
        </div>

        {backendHealth?.timestamp && (
          <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Last Health Probe: {new Date(backendHealth.timestamp).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* 2. Operational Preferences */}
      <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Sliders className="w-4 h-4 text-[#0F766E]" />
          <h4 className="text-sm font-bold text-slate-900">Operations Console Preferences</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Table Density */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">Queue Table Density</p>
              <p className="text-[11px] text-slate-500">Row padding in Incident Management queue</p>
            </div>
            <select
              value={tableDensity}
              onChange={(e) => {
                setTableDensity(e.target.value as any);
                showToast(`Queue density set to ${e.target.value}`, 'info');
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-800 cursor-pointer"
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </div>

          {/* Map Tile Style */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">Default GIS Basemap Provider</p>
              <p className="text-[11px] text-slate-500">OpenStreetMap standard or CartoDB Voyager</p>
            </div>
            <select
              value={mapProvider}
              onChange={(e) => {
                setMapProvider(e.target.value as any);
                showToast(`Basemap provider: ${e.target.value.toUpperCase()}`, 'info');
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-800 cursor-pointer"
            >
              <option value="osm">OpenStreetMap</option>
              <option value="carto">CartoDB Voyager</option>
            </select>
          </div>

          {/* Critical Hazard Alert Reminder */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">Critical Hazard Highlight Banner</p>
              <p className="text-[11px] text-slate-500">Display priority callout banner in the sidebar</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={criticalReminder}
                onChange={(e) => {
                  setCriticalReminder(e.target.checked);
                  showToast(e.target.checked ? 'Critical highlight active' : 'Critical highlight muted', 'info');
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F766E]"></div>
            </label>
          </div>

          {/* Audio Chime Notification */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">Audio Chimes on New Hazards</p>
              <p className="text-[11px] text-slate-500">Play subtle audible tone when new incidents arrive</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => {
                  setSoundAlerts(e.target.checked);
                  showToast(e.target.checked ? 'Audio alerts enabled' : 'Audio alerts muted', 'info');
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F766E]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Data Export & Operations Reset */}
      <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <HardDrive className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-bold text-slate-900">Incident Registry & Operations Reset</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Live Incident Records</span>
            <p className="text-xl font-black text-slate-900 mt-1">{incidents.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Municipal database queue</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Audit Trail Actions</span>
            <p className="text-xl font-black text-slate-900 mt-1">{activities.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Sequential ledger events</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Resolved Incidents</span>
            <p className="text-xl font-black text-emerald-700 mt-1">
              {incidents.filter((i) => i.status === 'Resolved').length}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Cleared roadway corridors</p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Registry as JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demonstration Environment</span>
          </button>
        </div>
      </div>

      {/* 4. Backend Technology Architecture Documentation */}
      <div className="p-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold">
          <Code2 className="w-4 h-4 text-[#0F766E]" />
          <h4 className="text-sm font-bold">Production Full-Stack Architecture</h4>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          MoveSmart operates a robust decoupled architecture connecting a high-performance React 19 / TypeScript / Vite client with a production-grade <strong>Spring Boot 4 / Java 21 REST API</strong> backed by <strong>Spring Data JPA</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Database Persistence Layer</span>
            </div>
            <ul className="text-slate-600 space-y-1 text-[11px] leading-relaxed">
              <li>• <strong>PostgreSQL Ready:</strong> Full driver configured with automatic table update.</li>
              <li>• <strong>Zero-Config H2 Fallback:</strong> In-memory mode with instant demo startup.</li>
              <li>• <strong>Entity Mapping:</strong> `incidents`, `users`, `notifications`, `activity_logs`.</li>
              <li>• <strong>Persistent Uploads:</strong> Multipart photo evidence saved to `uploads/`.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Security & Access Control (RBAC)</span>
            </div>
            <ul className="text-slate-600 space-y-1 text-[11px] leading-relaxed">
              <li>• <strong>BCrypt Password Hashing:</strong> Secure one-way credential cryptography.</li>
              <li>• <strong>JWT Bearer Authentication:</strong> Stateless session verification.</li>
              <li>• <strong>Role Separation:</strong> `ROLE_CITIZEN`, `ROLE_OPERATIONS`, `ROLE_ADMIN`.</li>
              <li>• <strong>Data Isolation:</strong> Citizens cannot access admin endpoints or private reports.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset All Demonstration Data?"
        message="This will re-seed the environment with the baseline 12 Mumbai incidents, clear user edits, and return all dispatch records to default state. Proceed?"
        confirmLabel="Confirm Reset"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
