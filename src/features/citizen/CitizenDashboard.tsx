import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useAuth } from '../../context/AuthContext';
import { Incident } from '../../types/incident';
import { NotificationItem } from '../../types/notification';
import { apiService } from '../../services/apiService';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/common/Badge';
import { 
  PlusCircle, 
  MapPin, 
  Copy, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Search, 
  Bell, 
  Eye, 
  Calendar, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ArrowUpDown,
  Check,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';

interface CitizenDashboardProps {
  onOpenReportModal: () => void;
  onOpenTrackModal: (trackingId: string) => void;
  onNavigateToTab?: (tab: 'home' | 'map' | 'reports' | 'dashboard' | 'profile') => void;
  initialTab?: 'complaints' | 'notifications';
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  onOpenReportModal,
  onOpenTrackModal,
  onNavigateToTab,
  initialTab = 'complaints',
}) => {
  const { incidents, showToast, isBackendConnected } = useIncidents();
  const { user } = useAuth();

  // Active sub-tab inside citizen dashboard
  const [activeTab, setActiveTab] = useState<'complaints' | 'notifications'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Personal reports state (fetched directly from backend API for authenticated citizen)
  const [myReports, setMyReports] = useState<Incident[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search, filter & sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Selected incident for detail view drawer/modal
  const [inspectIncident, setInspectIncident] = useState<Incident | null>(null);

  // In-app notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

  // Load citizen reports strictly from /api/incidents/my-reports
  const loadMyReports = useCallback(async () => {
    if (!user) return;
    setIsLoadingReports(true);
    try {
      if (isBackendConnected) {
        const remote = await apiService.getMyReports();
        if (remote && Array.isArray(remote)) {
          setMyReports(remote);
          return;
        }
      }
      // Offline fallback: filter local incidents
      const local = incidents.filter((inc) => {
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
      setMyReports(local);
    } catch (err) {
      console.warn('Could not load personal reports:', err);
    } finally {
      setIsLoadingReports(false);
    }
  }, [user, isBackendConnected, incidents]);

  // Load in-app notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoadingNotifs(true);
    try {
      if (isBackendConnected) {
        const notifs = await apiService.getNotifications();
        const count = await apiService.getUnreadNotificationCount();
        setNotifications(notifs);
        setUnreadCount(count);
      }
    } catch (err) {
      console.warn('Could not load notifications:', err);
    } finally {
      setIsLoadingNotifs(false);
    }
  }, [user, isBackendConnected]);

  useEffect(() => {
    loadMyReports();
    loadNotifications();
  }, [loadMyReports, loadNotifications]);

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = async () => {
    if (isBackendConnected) {
      await apiService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'info');
    }
  };

  const handleMarkSingleNotificationRead = async (id: string, incidentId?: string) => {
    if (isBackendConnected) {
      await apiService.markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (incidentId) {
      onOpenTrackModal(incidentId);
    }
  };

  // Metrics computation from user's actual reports
  const totalCount = myReports.length;
  const activeCount = myReports.filter((i) => i.status === 'Submitted' || i.status === 'Assigned' || i.status === 'In Progress').length;
  const underReviewCount = myReports.filter((i) => i.status === 'Under Review' || i.status === 'Verified').length;
  const resolvedCount = myReports.filter((i) => i.status === 'Resolved').length;

  // Filtered & sorted complaints list
  const filteredReports = useMemo(() => {
    return myReports
      .filter((inc) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            (inc.id && inc.id.toLowerCase().includes(q)) ||
            (inc.trackingId && inc.trackingId.toLowerCase().includes(q)) ||
            (inc.title && inc.title.toLowerCase().includes(q)) ||
            (inc.location && inc.location.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Status filter
        if (filterStatus !== 'all') {
          if (filterStatus === 'active') {
            if (inc.status === 'Resolved' || inc.status === 'Rejected') return false;
          } else if (filterStatus === 'resolved') {
            if (inc.status !== 'Resolved') return false;
          } else if (filterStatus === 'under-review') {
            if (inc.status !== 'Under Review' && inc.status !== 'Verified') return false;
          } else if (inc.status.toLowerCase() !== filterStatus.toLowerCase()) {
            return false;
          }
        }

        // Category filter
        if (filterCategory !== 'all' && inc.category.toLowerCase() !== filterCategory.toLowerCase()) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [myReports, searchQuery, filterStatus, filterCategory, sortBy]);

  const handleCopy = (trackingId: string) => {
    navigator.clipboard.writeText(trackingId);
    setCopiedId(trackingId);
    showToast(`Copied tracking ID ${trackingId}!`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Banner */}
      <div className="bg-[#0B192C] text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-xl flex-shrink-0">
              {user?.fullName?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Welcome back, {user?.fullName || 'Citizen Commuter'}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  ROLE_CITIZEN
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span>{user?.email || 'citizen@movesmart.city'}</span>
                <span>•</span>
                <span>Verified Resident Commuter</span>
                <span>•</span>
                <span>Mumbai Metropolitan Region</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => onOpenTrackModal('')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-teal-400" />
              <span>Track Complaint</span>
            </button>

            <button
              type="button"
              onClick={onOpenReportModal}
              className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit New Complaint</span>
            </button>
          </div>
        </div>

        {/* Real-time Personal Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Submitted</span>
            <p className="text-2xl font-extrabold text-white font-mono mt-1">{totalCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Your lifetime reports</p>
          </div>

          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Active / In Progress</span>
            <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">{activeCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Crew assigned & working</p>
          </div>

          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Under Review</span>
            <p className="text-2xl font-extrabold text-blue-400 font-mono mt-1">{underReviewCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Operations verification</p>
          </div>

          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Resolved Hazards</span>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{resolvedCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Roadway restored clear</p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: My Complaints vs In-App Notifications */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'complaints'
                ? 'bg-white text-slate-900 border border-slate-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>My Submitted Complaints</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'notifications'
                ? 'bg-white text-slate-900 border border-slate-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-red-600 text-white font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            loadMyReports();
            loadNotifications();
          }}
          className="text-xs text-slate-500 hover:text-[#0F766E] flex items-center gap-1 cursor-pointer font-semibold"
          title="Refresh reports and notifications"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReports || isLoadingNotifs ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* VIEW 1: MY COMPLAINTS TAB */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          {/* Search, Filter and Sort Toolbar */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by tracking ID (MS-TRK-...), title, or location..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-[#0F766E] outline-none"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0F766E] outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Bottlenecks</option>
                <option value="Submitted">Submitted</option>
                <option value="under-review">Under Review / Verified</option>
                <option value="In Progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0F766E] outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Damaged Road">Pothole / Damaged Road</option>
                <option value="Accident">Road Accident</option>
                <option value="Road Blockage">Road Blockage</option>
                <option value="Waterlogging / Flooding">Waterlogging</option>
                <option value="Damaged Traffic Signal">Damaged Signal</option>
                <option value="Traffic Congestion">Traffic / Congestion</option>
                <option value="Other">Other</option>
              </select>

              {/* Sort by Submission Date */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0F766E] outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Filter Summary */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>
                Displaying <strong>{filteredReports.length}</strong> of <strong>{totalCount}</strong> personal reports
              </span>
              {(searchQuery || filterStatus !== 'all' || filterCategory !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                    setFilterCategory('all');
                  }}
                  className="text-xs text-[#0F766E] hover:underline font-semibold cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Complaints Grid */}
          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map((inc) => (
                <div
                  key={inc.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-[#0F766E] transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Tracking ID & Badges */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200">
                          {inc.trackingId || inc.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(inc.trackingId || inc.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                          title="Copy tracking ID"
                        >
                          {copiedId === (inc.trackingId || inc.id) ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <PriorityBadge priority={inc.priority} size="sm" />
                        <StatusBadge status={inc.status} size="sm" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors mb-1.5 line-clamp-1">
                      {inc.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {inc.description}
                    </p>

                    {/* Category & Location Chips */}
                    <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#0F766E] flex-shrink-0" />
                        <span className="truncate">{inc.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>Submitted: {new Date(inc.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </div>

                    {/* Public update notice if present */}
                    {inc.publicUpdate && (
                      <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-100 text-[11px] text-teal-900 leading-relaxed mb-3">
                        <span className="font-bold">Operations Update: </span>
                        {inc.publicUpdate}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setInspectIncident(inc)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenTrackModal(inc.trackingId || inc.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Track Workflow</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {searchQuery || filterStatus !== 'all' ? 'No Matching Complaints Found' : 'No Hazard Reports Yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try modifying your search keywords or resetting filters to view all your reported complaints.'
                  : 'You have not submitted any road hazard reports yet. Spot a pothole, flooding, or traffic signal issue? Report it now to alert Mumbai Municipal dispatch.'}
              </p>
              <button
                type="button"
                onClick={onOpenReportModal}
                className="mt-2 px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Your First Report</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: IN-APP NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800">
                In-App Municipal Dispatch Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllNotificationsRead}
                className="text-xs text-[#0F766E] hover:underline font-bold cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Email notice badge per user instructions */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Notification Channel Advisory: </span>
              In-app updates are active in real time. Automated email notifications will be activated upon configuration of a production SMTP or AWS SES provider.
            </div>
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-2.5">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkSingleNotificationRead(notif.id, notif.incidentId)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    notif.read
                      ? 'bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-teal-50/30 border-teal-200 hover:border-teal-300 ring-1 ring-teal-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      notif.type === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                      notif.type === 'VERIFIED' ? 'bg-blue-100 text-blue-700' :
                      notif.type === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                      'bg-teal-100 text-teal-800'
                    }`}>
                      {notif.type === 'RESOLVED' ? <CheckCircle2 className="w-4 h-4" /> :
                       notif.type === 'VERIFIED' ? <ShieldCheck className="w-4 h-4" /> :
                       notif.type === 'REJECTED' ? <AlertTriangle className="w-4 h-4" /> :
                       <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] font-mono text-slate-400 block mt-1.5">
                        {new Date(notif.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  {notif.incidentId && (
                    <button
                      type="button"
                      className="text-xs text-[#0F766E] font-bold hover:underline flex items-center gap-1 flex-shrink-0"
                    >
                      <span>Track</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 bg-white rounded-xl border border-slate-200 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No Notifications</h4>
              <p className="text-xs text-slate-400">
                You will receive alerts here whenever your submitted hazard reports are verified, assigned, or resolved.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Inspect Complaint Detail Drawer / Modal */}
      {inspectIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 bg-[#0B192C] text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-teal-300">
                  {inspectIncident.trackingId || inspectIncident.id}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{inspectIncident.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectIncident(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <CategoryBadge category={inspectIncident.category} />
                <PriorityBadge priority={inspectIncident.priority} size="sm" />
                <StatusBadge status={inspectIncident.status} size="sm" />
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Observation Description</span>
                <p className="text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {inspectIncident.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-0.5">Location</span>
                  <p className="font-semibold text-slate-800">{inspectIncident.location}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-0.5">GPS Coordinates</span>
                  <p className="font-mono text-slate-800">
                    {inspectIncident.latitude && inspectIncident.longitude
                      ? `${inspectIncident.latitude}° N, ${inspectIncident.longitude}° E`
                      : 'Unmapped (Text address only)'}
                  </p>
                </div>
              </div>

              {inspectIncident.photoUrl && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Attached Photographic Evidence</span>
                  <img
                    src={inspectIncident.photoUrl}
                    alt="Complaint evidence"
                    className="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-2xs"
                  />
                </div>
              )}

              {inspectIncident.publicUpdate && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900">
                  <span className="font-bold block mb-0.5">Municipal Dispatch Advisory</span>
                  <p>{inspectIncident.publicUpdate}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setInspectIncident(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-100"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const id = inspectIncident.trackingId || inspectIncident.id;
                  setInspectIncident(null);
                  onOpenTrackModal(id);
                }}
                className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold rounded-lg flex items-center gap-1.5"
              >
                <span>Track Full Workflow</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
