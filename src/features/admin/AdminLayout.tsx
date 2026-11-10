import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useAuth } from '../../context/AuthContext';
import { Incident } from '../../types/incident';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { OverviewTab } from './OverviewTab';
import { IncidentManagementTab } from './IncidentManagementTab';
import { LiveMapTab } from './LiveMapTab';
import { AnalyticsTab } from './AnalyticsTab';
import { ActivityLogTab } from './ActivityLogTab';
import { SettingsTab } from './SettingsTab';
import { IncidentDetailModal } from './IncidentDetailModal';
import { IncidentEditModal } from './IncidentEditModal';
import { UserManagementModal } from './UserManagementModal';
import { ReportIncidentForm } from '../citizen/ReportIncidentForm';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  X, 
  PlusCircle, 
  ShieldAlert, 
  Lock, 
  ArrowLeft, 
  UserCheck, 
  LogIn, 
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Compass,
  AlertTriangle,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { 
    adminTab, 
    setAdminTab, 
    resetDemoData, 
    selectedIncident, 
    setSelectedIncident,
    setActiveRole,
    showToast
  } = useIncidents();

  const { isAuthenticated, user, isCitizen, isOperations, isAdmin, login, loginDemo, logout } = useAuth();

  // Modals state
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  // Dedicated Admin/Operations Login Form states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [adminLoggingIn, setAdminLoggingIn] = useState(false);
  const [showDemoFlyout, setShowDemoFlyout] = useState(false);

  // Drill-down filter states from overview cards
  const [mgmtStatusFilter, setMgmtStatusFilter] = useState<string>('all');
  const [mgmtPriorityFilter, setMgmtPriorityFilter] = useState<string>('all');

  const handleFilterNavigate = (statusFilter = 'all', priorityFilter = 'all') => {
    setMgmtStatusFilter(statusFilter);
    setMgmtPriorityFilter(priorityFilter);
    setAdminTab('management');
  };

  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  const handleEditIncident = (incident: Incident) => {
    setSelectedIncident(null);
    setEditingIncident(incident);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleResetConfirm = () => {
    resetDemoData();
    setIsResetConfirmOpen(false);
    setSelectedIncident(null);
    setEditingIncident(null);
  };

  const handleAdminFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);
    setAdminLoggingIn(true);

    try {
      const res = await login({ email: adminEmail.trim(), password: adminPassword });
      if (res.success) {
        showToast('Authenticated into Operations Center', 'success');
        setAdminEmail('');
        setAdminPassword('');
      } else {
        setAdminLoginError(res.error || 'Invalid credentials or inactive account');
      }
    } catch (err: unknown) {
      setAdminLoginError((err as Error).message || 'Authentication error');
    } finally {
      setAdminLoggingIn(false);
    }
  };

  const handleDemoSignIn = async (role: 'operations' | 'admin') => {
    setAdminLoggingIn(true);
    setAdminLoginError(null);
    try {
      await loginDemo(role);
      showToast(`Signed in as Demo ${role === 'admin' ? 'System Administrator' : 'Operations Staff'}`, 'info');
    } catch {
      setAdminLoginError('Demo sign in failed');
    } finally {
      setAdminLoggingIn(false);
    }
  };

  // RBAC Barrier 1: Unauthenticated -> Real Production Admin/Staff Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-[#0B192C] p-6 text-white text-center space-y-2 border-b border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Operations Center Sign In</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Authorized municipal traffic controllers, engineers, and administrators only.
            </p>
          </div>

          <form onSubmit={handleAdminFormSubmit} className="p-6 space-y-4">
            {adminLoginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Staff Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="officer@movesmart.city"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F766E] bg-white font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F766E] bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={adminLoggingIn}
              className="w-full py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{adminLoggingIn ? 'Verifying Credentials...' : 'Sign In to Operations'}</span>
            </button>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setActiveRole('citizen')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Citizen Portal</span>
              </button>
            </div>
          </form>

          {/* Labeled Demonstration Accounts (Foldable) */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setShowDemoFlyout(!showDemoFlyout)}
              className="w-full flex items-center justify-between text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-[11px]"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Demonstration Mode Evaluation Profiles</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDemoFlyout ? 'rotate-180' : ''}`} />
            </button>

            {showDemoFlyout && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-200 space-y-1.5 animate-in fade-in duration-100">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('operations')}
                    className="p-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-teal-800 text-left cursor-pointer transition-colors"
                  >
                    <p className="font-bold text-xs">Operations Controller</p>
                    <p className="text-[10px] text-slate-500 font-mono">ops.admin@movesmart.city</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('admin')}
                    className="p-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-amber-800 text-left cursor-pointer transition-colors"
                  >
                    <p className="font-bold text-xs">System Administrator</p>
                    <p className="text-[10px] text-slate-500 font-mono">admin@movesmart.city</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RBAC Barrier 2: Authenticated as CITIZEN (403 Forbidden Access)
  if (isCitizen && !isOperations && !isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden text-center animate-in fade-in duration-200">
          <div className="bg-[#0B192C] p-6 text-white space-y-2 border-b border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold tracking-wider uppercase border border-rose-500/30">
              HTTP 403 Forbidden
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Operations Center Access Restricted</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are currently authenticated as a Citizen (<strong>{user?.email}</strong>).
            </p>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              The Operations Center is reserved for authorized municipal traffic controllers, engineers, and administrators. Citizens may submit reports and track complaints via the Citizen Portal.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveRole('citizen')}
                className="w-full py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Return to Citizen Portal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                }}
                className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-slate-600" />
                <span>Sign Out & Switch Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RBAC Granted: Operations Controller or Admin
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-3.75rem)] bg-[#F8FAFC]">
      {/* Deep Navy Admin Sidebar */}
      <AdminSidebar onOpenUserManagement={() => setIsUserManagementOpen(true)} />

      {/* Main Admin Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
        />

        {/* Tab Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {adminTab === 'overview' && (
            <OverviewTab
              onSelectIncident={handleSelectIncident}
              onFilterNavigate={handleFilterNavigate}
            />
          )}

          {adminTab === 'management' && (
            <IncidentManagementTab
              onSelectIncident={handleSelectIncident}
              onEditIncident={handleEditIncident}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              initialStatusFilter={mgmtStatusFilter}
              initialPriorityFilter={mgmtPriorityFilter}
            />
          )}

          {adminTab === 'map' && (
            <LiveMapTab onSelectIncident={handleSelectIncident} />
          )}

          {adminTab === 'analytics' && <AnalyticsTab />}

          {adminTab === 'activity' && <ActivityLogTab />}

          {adminTab === 'settings' && <SettingsTab />}
        </main>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onEdit={handleEditIncident}
        />
      )}

      {/* Incident Edit Modal */}
      {editingIncident && (
        <IncidentEditModal
          incident={editingIncident}
          isOpen={Boolean(editingIncident)}
          onClose={() => setEditingIncident(null)}
        />
      )}

      {/* User & Staff Management Modal (Admins only) */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
      />

      {/* Quick Create Incident Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4 sm:p-5 bg-[#0B192C] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Direct Incident Entry</h3>
                  <p className="text-xs text-slate-300">Add an urban mobility incident directly to the operations registry</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <ReportIncidentForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reset Demo Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset Entire Operations Environment?"
        message="This will restore all default 12 Mumbai incidents, clear user edits, and return the operations queue to the initial demonstration state."
        confirmLabel="Reset Demonstration Data"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleResetConfirm}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
