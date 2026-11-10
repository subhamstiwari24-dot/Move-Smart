import React, { useState, useEffect, useCallback } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useAuth } from '../../context/AuthContext';
import { Incident } from '../../types/incident';
import { MumbaiMap } from '../../components/map/MumbaiMap';
import { CitizenReportsList } from './CitizenReportsList';
import { MultiStepComplaintForm } from './MultiStepComplaintForm';
import { CitizenDashboard } from './CitizenDashboard';
import { TrackComplaintModal } from '../public/TrackComplaintModal';
import { LandingPage } from '../public/LandingPage';
import { apiService } from '../../services/apiService';
import { 
  PlusCircle, 
  Search, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Layers, 
  User, 
  Home, 
  FileText,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Lock,
  X,
  Bell,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Loader2,
  ShieldAlert,
  Info,
  KeyRound
} from 'lucide-react';

export const CitizenPortal: React.FC = () => {
  const { incidents, showToast, isBackendConnected } = useIncidents();
  const { isAuthenticated, user, logout, openAuthModal, updateProfile, changePassword } = useAuth();

  // Navigation Sub-views in Citizen Portal
  const [subView, setSubView] = useState<'home' | 'map' | 'reports' | 'dashboard' | 'profile'>('home');
  const [dashboardInitialTab, setDashboardInitialTab] = useState<'complaints' | 'notifications'>('complaints');

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');
  const [quickSearchInput, setQuickSearchInput] = useState('');

  // Unread notifications count in nav
  const [unreadNotifs, setUnreadNotifs] = useState<number>(0);

  // Profile Edit State
  const [profileFullName, setProfileFullName] = useState(user?.fullName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sign out confirmation modal
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Sync profile fields when user changes
  useEffect(() => {
    if (user) {
      setProfileFullName(user.fullName || '');
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  // Fetch unread notifications for navigation badge
  const fetchUnreadCount = useCallback(async () => {
    if (isAuthenticated && isBackendConnected) {
      const count = await apiService.getUnreadNotificationCount();
      setUnreadNotifs(count);
    }
  }, [isAuthenticated, isBackendConnected]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleSelectIncidentFromMap = (incident: Incident) => {
    setTrackQuery(incident.trackingId || incident.id);
    setIsTrackModalOpen(true);
  };

  const handleReportSuccess = (trackingId: string, incidentId: string) => {
    fetchUnreadCount();
  };

  const handleOpenTrackModalWithId = (id?: string) => {
    if (id) setTrackQuery(id);
    setIsTrackModalOpen(true);
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchInput.trim()) {
      setTrackQuery(quickSearchInput.trim());
      setIsTrackModalOpen(true);
      setQuickSearchInput('');
    }
  };

  // User-submitted complaints count for navigation badge
  const userComplaints = incidents.filter((inc) => {
    if (!user) return false;
    if (inc.reporterUserId && inc.reporterUserId === user.id) return true;
    if (user.email && inc.reporter?.email && inc.reporter.email.toLowerCase() === user.email.toLowerCase()) return true;
    if (user.email === 'citizen.mumbai@movesmart.city') {
      return (
        inc.id === 'MS-2026-101' ||
        inc.id === 'MS-2026-103' ||
        inc.id === 'MS-2026-105' ||
        inc.id === 'MS-2026-108' ||
        inc.reporterUserId === user.id
      );
    }
    return false;
  });

  // Handle Profile Update
  const handleProfileUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);

    if (!profileFullName.trim()) {
      setProfileFeedback({ type: 'error', message: 'Full name is required.' });
      return;
    }

    if (profilePhone && !/^[0-9+\s-]{8,15}$/.test(profilePhone.trim())) {
      setProfileFeedback({ type: 'error', message: 'Please enter a valid phone number (8-15 digits).' });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await updateProfile({
        fullName: profileFullName.trim(),
        phone: profilePhone.trim() || undefined,
      });

      if (res.success) {
        setProfileFeedback({ type: 'success', message: 'Profile details updated successfully.' });
        showToast('Profile updated successfully', 'success');
      } else {
        setProfileFeedback({ type: 'error', message: res.error || 'Failed to update profile.' });
      }
    } catch {
      setProfileFeedback({ type: 'error', message: 'An unexpected error occurred while updating profile.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Password Strength Calculation
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);
  const isPassValid = hasMinLength && hasLetter && hasNumber;

  // Handle Password Change
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassFeedback(null);

    if (!currentPassword) {
      setPassFeedback({ type: 'error', message: 'Please enter your current password.' });
      return;
    }

    if (!isPassValid) {
      setPassFeedback({
        type: 'error',
        message: 'New password must be at least 8 characters long and contain both letters and numbers.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        setPassFeedback({ type: 'success', message: 'Password updated successfully! Please use it next time you sign in.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('Password changed successfully', 'success');
      } else {
        setPassFeedback({ type: 'error', message: res.error || 'Failed to change password. Please verify your current password.' });
      }
    } catch {
      setPassFeedback({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  // Confirm Sign out
  const handleConfirmLogout = () => {
    setShowSignOutConfirm(false);
    logout();
    setSubView('home');
    showToast('Signed out of MoveSmart citizen session', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      {/* Citizen Navigation Strip */}
      <section className="bg-[#0B192C] text-white py-2.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Subview Nav Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSubView('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                subView === 'home'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Explore Portal</span>
            </button>

            <button
              onClick={() => setSubView('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                subView === 'map'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Live Mumbai Map</span>
            </button>

            <button
              onClick={() => setSubView('reports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                subView === 'reports'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Public Incident Feed</span>
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setDashboardInitialTab('complaints');
                    setSubView('dashboard');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                    subView === 'dashboard' && dashboardInitialTab === 'complaints'
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>My Complaints</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-teal-300">
                    {userComplaints.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setDashboardInitialTab('notifications');
                    setSubView('dashboard');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 relative ${
                    subView === 'dashboard' && dashboardInitialTab === 'notifications'
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                  title="In-App Notifications"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Alerts</span>
                  {unreadNotifs > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono animate-pulse">
                      {unreadNotifs}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setSubView('profile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                    subView === 'profile'
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{user?.fullName?.split(' ')[0] || 'Profile'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => openAuthModal('citizen-login')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span>Sign In / My Reports</span>
              </button>
            )}
          </div>

          {/* Quick Track Input Bar & Report Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <form onSubmit={handleQuickSearchSubmit} className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <input
                type="text"
                value={quickSearchInput}
                onChange={(e) => setQuickSearchInput(e.target.value)}
                placeholder="Track ID (MS-TRK-10101)..."
                className="px-2.5 py-1 text-xs text-white placeholder-slate-400 bg-transparent outline-none w-36 sm:w-44 font-mono"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Search className="w-3 h-3 text-teal-400" />
                <span>Track</span>
              </button>
            </form>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Hazard</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Render by Subview */}
      <div className="flex-1">
        {subView === 'home' && (
          <LandingPage
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenTrackModal={handleOpenTrackModalWithId}
            onViewMap={() => setSubView('map')}
            onSelectIncident={handleSelectIncidentFromMap}
          />
        )}

        {subView === 'map' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Interactive Mumbai Incident Map</h2>
                <p className="text-xs text-slate-500">
                  Live geolocated hazard markers across Mumbai Metropolitan Region (MMR). Click pins to view verified dispatch updates.
                </p>
              </div>

              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Report Road Hazard</span>
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs">
              <MumbaiMap
                incidents={incidents}
                onSelectIncident={handleSelectIncidentFromMap}
                heightClass="h-[560px]"
              />
            </div>

            {/* Informational Guidance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                  <div className="p-1.5 rounded-md bg-teal-50 text-[#0F766E] border border-teal-200/60">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>Priority Pin Guide</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Red pins highlight critical obstructions and flooding; amber pins mark heavy congestion; blue and slate pins note minor transit delays.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                  <div className="p-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Operations Dispatch</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Every citizen hazard report routes directly to the Mumbai Traffic Operations Center for camera verification and municipal squad assignment.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold mb-1">
                  <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Clearance Auditing</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Once municipal units restore road movement, the status transitions to Resolved with official timestamps recorded in the ledger.
                </p>
              </div>
            </div>
          </div>
        )}

        {subView === 'reports' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <CitizenReportsList
              incidents={incidents}
              onSelectIncident={handleSelectIncidentFromMap}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          </div>
        )}

        {subView === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <CitizenDashboard
              initialTab={dashboardInitialTab}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onOpenTrackModal={handleOpenTrackModalWithId}
            />
          </div>
        )}

        {/* Citizen Profile Subview with Full Profile & Password Management */}
        {subView === 'profile' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-150">
            {/* Header User Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-teal-50 border border-teal-200 text-[#0F766E] flex items-center justify-center font-bold text-xl">
                    {user?.fullName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{user?.fullName || 'Citizen Commuter'}</h2>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                        Citizen Account
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Registered citizen contributing to Mumbai road safety and civic reporting
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSignOutConfirm(true)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-6">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address (Verified)</span>
                  </span>
                  <p className="font-semibold text-slate-900">{user?.email || 'N/A'}</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mobile Number</span>
                  </span>
                  <p className="font-semibold text-slate-900">{user?.phone || 'Not provided'}</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Access Role Authority</span>
                  </span>
                  <p className="font-mono text-slate-900 font-semibold">{user?.role || 'ROLE_CITIZEN'}</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Status</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Citizen Commuter</span>
                  </div>
                </div>
              </div>

              {/* Civic Activity Statistics */}
              <div className="pt-6 mt-6 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Civic Reporting Telemetry
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Total Hazards Lodged</p>
                    <p className="text-xl font-bold text-slate-900 font-mono mt-1">{userComplaints.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-[10px] uppercase font-bold text-amber-800">Under Action</p>
                    <p className="text-xl font-bold text-amber-900 font-mono mt-1">
                      {userComplaints.filter((i) => i.status !== 'Resolved' && i.status !== 'Rejected').length}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <p className="text-[10px] uppercase font-bold text-emerald-800">Resolved</p>
                    <p className="text-xl font-bold text-emerald-900 font-mono mt-1">
                      {userComplaints.filter((i) => i.status === 'Resolved').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0F766E]" />
                  <span>Update Profile Information</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Keep your civic commuter contact details current for response notifications
                </p>
              </div>

              {profileFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    profileFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {profileFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{profileFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleProfileUpdateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={profileFullName}
                      onChange={(e) => setProfileFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kulkarni"
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Mobile Number</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+91 98200 12345"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    />
                  </div>
                </div>

                {/* Email (Locked Notice) */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email Address (Locked): <span className="font-mono text-slate-600">{user?.email}</span></span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>
                      Email cannot be modified online as it anchors your municipal grievance audit trail and identity verification records. To update your verified email, contact the MoveSmart civic administrator desk.
                    </span>
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#0F766E]" />
                  <span>Change Account Password</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ensure your citizen login remains secure by using a strong unique password
                </p>
              </div>

              {passFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    passFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {passFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{passFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      required
                      className="w-full pl-3 pr-10 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 chars with letters & numbers"
                        required
                        className="w-full pl-3 pr-10 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    />
                  </div>
                </div>

                {/* Password Criteria Checklist */}
                {newPassword && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                      Password Requirements:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                        {hasMinLength ? '✓' : '○'} At least 8 characters
                      </span>
                      <span className={`flex items-center gap-1.5 ${hasLetter ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                        {hasLetter ? '✓' : '○'} Contains letters
                      </span>
                      <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                        {hasNumber ? '✓' : '○'} Contains numbers
                      </span>
                      <span className={`flex items-center gap-1.5 ${confirmPassword && newPassword === confirmPassword ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                        {confirmPassword && newPassword === confirmPassword ? '✓' : '○'} Passwords match
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isChangingPass || !currentPassword || !isPassValid || newPassword !== confirmPassword}
                    className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {isChangingPass ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Change Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Sign Out of MoveSmart?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You will be signed out of your citizen account and returned to the public portal. All session tokens will be removed.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Step Road Hazard Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4 sm:p-5 bg-[#0B192C] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Report Urban Road Hazard</h3>
                  <p className="text-xs text-slate-300">Submit a traffic obstruction directly to the Mumbai Operations Center</p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <MultiStepComplaintForm
                onSuccess={handleReportSuccess}
                onCancel={() => setIsReportModalOpen(false)}
                onTrackSubmitted={(trackingId) => {
                  setIsReportModalOpen(false);
                  setTrackQuery(trackingId);
                  setIsTrackModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Public Track Complaint Modal */}
      <TrackComplaintModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        initialQuery={trackQuery}
      />
    </div>
  );
};
