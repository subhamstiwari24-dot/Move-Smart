import React, { useState, useRef, useEffect } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useAuth } from '../../context/AuthContext';
import { Incident } from '../../types/incident';
import { 
  ShieldCheck, 
  UserCheck, 
  Search, 
  Bell, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Clock, 
  Compass, 
  ChevronDown,
  X,
  ExternalLink,
  MapPin,
  RotateCcw,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenReportModal?: () => void;
  onOpenResetConfirm?: () => void;
  onOpenAuthModal?: (initialMode?: 'login' | 'register') => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Info';
  isRead: boolean;
  incidentId?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenReportModal, 
  onOpenResetConfirm,
  onOpenAuthModal 
}) => {
  const { 
    activeRole, 
    setActiveRole, 
    statistics, 
    adminTab, 
    setAdminTab,
    incidents,
    setSelectedIncident,
    isBackendConnected
  } = useIncidents();

  const { 
    isAuthenticated, 
    user, 
    logout, 
    loginDemo, 
    isCitizen, 
    isOperations, 
    isAdmin, 
    openAuthModal 
  } = useAuth();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationContainerRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Critical Incident Reported',
      message: 'Severe waterlogging at Milan Subway halting both directions.',
      time: '12m ago',
      priority: 'Critical',
      isRead: false,
      incidentId: 'MS-2026-101',
    },
    {
      id: 'notif-2',
      title: 'Municipal Response Deployed',
      message: 'Crews dispatched with heavy dewatering equipment to WEH Flyover.',
      time: '34m ago',
      priority: 'High',
      isRead: false,
      incidentId: 'MS-2026-102',
    },
    {
      id: 'notif-3',
      title: 'Roadway Cleared',
      message: 'Oil spill at Bandra Reclamation safely treated and cleared.',
      time: '1h ago',
      priority: 'Info',
      isRead: true,
      incidentId: 'MS-2026-104',
    },
  ]);

  // User profile / demo menu state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  // Filter incidents for global search
  const searchResults = searchQuery.trim()
    ? incidents
        .filter((inc) => {
          const q = searchQuery.toLowerCase().trim();
          return (
            inc.id.toLowerCase().includes(q) ||
            (inc.trackingId && inc.trackingId.toLowerCase().includes(q)) ||
            inc.title.toLowerCase().includes(q) ||
            inc.location.toLowerCase().includes(q) ||
            inc.category.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleSelectSearchResult = (incident: Incident) => {
    setSelectedIncident(incident);
    setSearchQuery('');
    setIsSearchOpen(false);
    if (activeRole !== 'admin') {
      setActiveRole('admin');
      setAdminTab('management');
    }
  };

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        notificationContainerRef.current &&
        !notificationContainerRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
      if (
        profileContainerRef.current &&
        !profileContainerRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSectionTitle = () => {
    if (activeRole === 'citizen') return 'Citizen Mobility Portal';
    switch (adminTab) {
      case 'overview':
        return 'Operations Center / Overview';
      case 'management':
        return 'Operations Center / Incident Queue';
      case 'map':
        return 'Operations Center / Operations Map';
      case 'analytics':
        return 'Operations Center / Mobility Analytics';
      case 'activity':
        return 'Operations Center / Audit Log';
      case 'settings':
        return 'Operations Center / Settings';
      default:
        return 'Operations Center';
    }
  };

  // User initials
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 bg-[#0B192C] text-slate-100 border-b border-slate-800 shadow-xs">
      {/* Top Telemetry & Status Strip */}
      <div className="bg-[#07111D] text-slate-400 text-[11px] py-1 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse" />
          <span className="font-semibold text-slate-300">Mumbai Metropolitan Region (MMR)</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline text-slate-400">Urban Mobility Operations Command</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Active Incidents:</span>
            <span className="font-bold text-white bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
              {statistics.total}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-400">High / Critical Urgency:</span>
            <span className="font-bold text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-800/40">
              {statistics.criticalOrHighOpen}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolution Rate: {statistics.resolutionRate}%</span>
          </div>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-3">
        {/* Left: Brand & Breadcrumb */}
        <div className="flex items-center gap-4 min-w-0">
          <div 
            className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer" 
            onClick={() => setActiveRole('citizen')}
          >
            <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white border border-teal-500/30 shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white font-sans">
                  MoveSmart
                </span>
                <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.2 rounded bg-teal-500/15 text-teal-300 border border-teal-500/25 hidden sm:inline-block">
                  MUMBAI
                </span>
              </div>
            </div>
          </div>

          {/* Section Breadcrumb Divider */}
          <div className="hidden xl:flex items-center text-xs text-slate-400 pl-3 border-l border-slate-800">
            <span className="font-medium text-slate-300">{getSectionTitle()}</span>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="relative flex-1 max-w-md mx-2 hidden sm:block" ref={searchContainerRef}>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Quick search incident ID (MS-2026-101), tracking ID, street..."
              className="w-full pl-9 pr-12 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800/80 text-white placeholder-slate-400 focus:bg-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
            />
            <span className="absolute right-2.5 top-2 text-[10px] font-mono text-slate-400 bg-slate-700/60 px-1.5 py-0.5 rounded border border-slate-600/50">
              /
            </span>
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F1E33] border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800 flex justify-between items-center">
                <span>Matching Records</span>
                <span>{searchResults.length} result{searchResults.length === 1 ? '' : 's'}</span>
              </div>
              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto">
                  {searchResults.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => handleSelectSearchResult(res)}
                      className="w-full text-left p-2.5 hover:bg-slate-800/70 transition-colors flex items-start gap-2.5 cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-teal-400">
                          {res.id}
                        </span>
                        {res.trackingId && (
                          <span className="font-mono text-[10px] text-slate-400">
                            {res.trackingId}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{res.title}</p>
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{res.location}</span>
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          res.priority === 'Critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : res.priority === 'High'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {res.priority}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching incidents found for "{searchQuery}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Operational Controls & Auth */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Backend Status Telemetry Badge */}
          <div 
            title={isBackendConnected ? "Spring Boot REST API: Connected (Port 8080)" : "Local Storage Mode"}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
              isBackendConnected
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-mono text-[10px] tracking-wide">{isBackendConnected ? 'API 8080' : 'OFFLINE'}</span>
          </div>

          {/* Role Switcher Pill */}
          <div className="bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 flex items-center">
            <button
              type="button"
              onClick={() => setActiveRole('citizen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeRole === 'citizen'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Citizen Portal</span>
              <span className="sm:hidden">Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Operations Center</span>
              <span className="sm:hidden">Ops</span>
            </button>
          </div>

          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            aria-label="Toggle mobile search"
            className="sm:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Operational Notifications Popover */}
          <div className="relative" ref={notificationContainerRef}>
            <button
              type="button"
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              aria-label="View notifications"
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0B192C]">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0F1E33] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Operations Dispatch Alerts
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 transition-colors ${
                        notif.isRead ? 'bg-transparent text-slate-400' : 'bg-slate-850 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {notif.priority === 'Critical' ? (
                            <Flame className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                          ) : notif.priority === 'High' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          )}
                          <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.incidentId && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-mono text-[10px] text-teal-400">
                            {notif.incidentId}
                          </span>
                          <button
                            onClick={() => {
                              const found = incidents.find((i) => i.id === notif.incidentId);
                              if (found) {
                                setSelectedIncident(found);
                                setActiveRole('admin');
                                setAdminTab('management');
                              }
                              setIsNotificationOpen(false);
                            }}
                            className="text-[10px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect record</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          {onOpenReportModal && (
            <button
              type="button"
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer flex-shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{activeRole === 'admin' ? 'Create Incident' : 'Report Hazard'}</span>
            </button>
          )}

          {/* User Auth Profile / Demo Accounts Menu */}
          <div className="relative" ref={profileContainerRef}>
            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg hover:bg-slate-850 transition-colors border border-transparent hover:border-slate-800 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md bg-[#0F766E] text-white border border-teal-500/40 flex items-center justify-center font-bold text-xs shadow-xs">
                  {initials}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-white leading-tight truncate max-w-[110px]">
                    {user.fullName}
                  </p>
                  <p className="text-[10px] text-teal-300 leading-tight">
                    {user.role === 'ROLE_ADMIN'
                      ? 'System Admin'
                      : user.role === 'ROLE_OPERATIONS'
                      ? 'Ops Controller'
                      : 'Citizen Commuter'}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openAuthModal('citizen-login')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-teal-400" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
                  title="Demo Accounts"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            )}

            {/* Profile / Demo Accounts Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0F1E33] border border-slate-700 rounded-xl shadow-2xl p-2.5 z-50 text-xs">
                {isAuthenticated && user ? (
                  <>
                    <div className="p-2 border-b border-slate-800 mb-2">
                      <p className="font-bold text-white">{user.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          {user.role === 'ROLE_ADMIN'
                            ? 'Admin Privileges Active'
                            : user.role === 'ROLE_OPERATIONS'
                            ? 'Operations Controller'
                            : 'Verified Citizen'}
                        </span>
                      </div>
                    </div>

                    {isOperations || isAdmin ? (
                      <button
                        onClick={() => {
                          setActiveRole('admin');
                          setAdminTab('settings');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        System & Architecture Settings
                      </button>
                    ) : null}

                    {onOpenResetConfirm && (
                      <button
                        onClick={() => {
                          onOpenResetConfirm();
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 cursor-pointer mt-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Demonstration Data</span>
                      </button>
                    )}

                    <div className="pt-2 border-t border-slate-800 mt-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 border-b border-slate-800 mb-2">
                      <div className="flex items-center gap-1.5 text-teal-400 font-bold text-xs uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>One-Click Evaluation Accounts</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Select a pre-seeded Mumbai role to test access control:
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <button
                        onClick={() => {
                          loginDemo('citizen');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-white text-xs">Citizen Account</p>
                          <p className="text-[10px] text-slate-400 font-mono">citizen.mumbai@movesmart.city</p>
                        </div>
                        <span className="text-[10px] text-blue-400 font-bold">Sign In</span>
                      </button>

                      <button
                        onClick={() => {
                          loginDemo('operations');
                          setActiveRole('admin');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-white text-xs">Operations Controller</p>
                          <p className="text-[10px] text-slate-400 font-mono">ops.admin@movesmart.city</p>
                        </div>
                        <span className="text-[10px] text-teal-400 font-bold">Sign In</span>
                      </button>

                      <button
                        onClick={() => {
                          loginDemo('admin');
                          setActiveRole('admin');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-white text-xs">System Administrator</p>
                          <p className="text-[10px] text-slate-400 font-mono">admin@movesmart.city</p>
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold">Sign In</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-800 mt-2">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          openAuthModal('citizen-login');
                        }}
                        className="w-full py-1.5 text-center bg-[#0F766E] hover:bg-[#115E59] text-white font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Custom Login or Register
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Input Drawer */}
      {isMobileSearchOpen && (
        <div className="sm:hidden px-4 py-2.5 bg-[#07111D] border-t border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search incident ID, tracking ID, street, or category..."
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:bg-slate-900 focus:border-teal-500 outline-none"
              autoFocus
            />
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Dropdown on Mobile */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="mt-2 bg-[#0F1E33] border border-slate-700 rounded-xl shadow-xl overflow-hidden">
              <div className="p-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800 flex justify-between items-center">
                <span>Matching Records ({searchResults.length})</span>
              </div>
              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-800 max-h-56 overflow-y-auto">
                  {searchResults.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => {
                        handleSelectSearchResult(res);
                        setIsMobileSearchOpen(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-800/70 transition-colors flex items-start gap-2.5 cursor-pointer"
                    >
                      <span className="font-mono text-xs font-bold text-teal-400 mt-0.5">
                        {res.trackingId || res.id}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{res.title}</p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{res.location}</p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          res.priority === 'Critical'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {res.priority}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  No matching incidents found.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
