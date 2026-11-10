import React from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  ListFilter, 
  Map, 
  BarChart3, 
  History, 
  Settings, 
  ArrowLeft, 
  Flame,
  Users
} from 'lucide-react';

interface AdminSidebarProps {
  onOpenUserManagement?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onOpenUserManagement }) => {
  const { adminTab, setAdminTab, statistics, setActiveRole } = useIncidents();
  const { isAdmin } = useAuth();

  const navItems = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      description: 'Operations Telemetry Command',
    },
    {
      id: 'management' as const,
      label: 'Incident Queue',
      icon: <ListFilter className="w-4 h-4" />,
      description: 'Incident Queue & Dispatch',
      badge: statistics.total.toString(),
    },
    {
      id: 'map' as const,
      label: 'Operations Map',
      icon: <Map className="w-4 h-4" />,
      description: 'Spatial Geofence Intelligence',
    },
    {
      id: 'analytics' as const,
      label: 'Mobility Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'Mobility & Response Trends',
    },
    {
      id: 'activity' as const,
      label: 'Audit Trail',
      icon: <History className="w-4 h-4" />,
      description: 'Sequential Audit Trail',
    },
    {
      id: 'settings' as const,
      label: 'System Settings',
      icon: <Settings className="w-4 h-4" />,
      description: 'Platform & API Architecture',
    },
  ];

  return (
    <>
      {/* Mobile Horizontal Navigation Strip (visible on < md) */}
      <div className="md:hidden bg-[#0B192C] border-b border-slate-800 p-2.5 flex-shrink-0">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">Mumbai Operations Center</span>
          </div>
          <button
            onClick={() => setActiveRole('citizen')}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Citizen View</span>
          </button>
        </div>

        {/* Horizontal Scroll Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {isAdmin && onOpenUserManagement && (
            <button
              onClick={onOpenUserManagement}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer text-teal-300 bg-teal-950/60 border border-teal-800/80"
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Professional Sidebar (visible on >= md) */}
      <aside className="hidden md:flex md:w-60 lg:w-64 bg-[#0B192C] text-slate-300 flex-col border-r border-slate-800 flex-shrink-0 min-h-[calc(100vh-3.75rem)]">
        {/* Operations Center Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold text-xs font-mono">
              MMR
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wider uppercase font-mono">
                Operations Command
              </h2>
              <p className="text-[11px] text-slate-400">Traffic Intelligence Unit</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-1 flex-1">
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Operations Workspace
          </p>

          {navItems.map((item) => {
            const isActive = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/80'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Admin User Management Button */}
          {isAdmin && onOpenUserManagement && (
            <div className="pt-2">
              <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-400/80">
                Administration
              </p>
              <button
                onClick={onOpenUserManagement}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-slate-300 hover:text-white hover:bg-slate-850 border border-transparent hover:border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-teal-400" />
                  <span>User & Staff Admin</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/60">
                  ADMIN
                </span>
              </button>
            </div>
          )}

          {/* Priority Hazard Alert Callout */}
          {statistics.criticalOrHighOpen > 0 && (
            <div className="mt-6 p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-400">
                <Flame className="w-3.5 h-3.5" />
                <span>Priority Action Queue</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-snug">
                <strong>{statistics.criticalOrHighOpen}</strong> critical or high bottleneck{statistics.criticalOrHighOpen > 1 ? 's' : ''} require immediate municipal dispatch.
              </p>
              <button
                onClick={() => setAdminTab('management')}
                className="mt-2 text-[11px] font-bold text-amber-300 hover:text-white underline cursor-pointer"
              >
                Triage unresolved incidents →
              </button>
            </div>
          )}
        </nav>

        {/* Bottom Telemetry & Citizen Switch */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <div className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
              <span>ACTIVE DATASET</span>
              <span className="text-emerald-400">SYNCED</span>
            </div>
            <p className="truncate text-slate-300">{statistics.total} total incident records</p>
          </div>

          <button
            onClick={() => setActiveRole('citizen')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-850 transition-colors border border-slate-800 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Citizen Portal</span>
          </button>
        </div>
      </aside>
    </>
  );
};
