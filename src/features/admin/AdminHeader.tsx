import React from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusCircle, 
  Clock, 
  MapPin, 
  Calendar,
  Layers,
  Filter,
  CheckCircle2,
  Users
} from 'lucide-react';

interface AdminHeaderProps {
  onOpenCreateModal: () => void;
  onOpenResetConfirm: () => void;
  onOpenUserManagement?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onOpenCreateModal,
  onOpenUserManagement,
}) => {
  const { adminTab, statistics } = useIncidents();
  const { isAdmin } = useAuth();

  const getTabDetails = () => {
    switch (adminTab) {
      case 'overview':
        return {
          title: 'Overview',
          desc: 'Operational summary of traffic hazards, road blockages, and municipal dispatch across Mumbai.',
        };
      case 'management':
        return {
          title: 'Incident Management',
          desc: 'Filter, triage, assign municipal units, and monitor real-time clearance workflows.',
        };
      case 'map':
        return {
          title: 'Operations Map',
          desc: 'Spatial visualization of mapped incidents and transit bottlenecks across Mumbai.',
        };
      case 'analytics':
        return {
          title: 'Mobility Analytics',
          desc: 'Incident volume trends, transit category breakdowns, and resolution efficiency statistics.',
        };
      case 'activity':
        return {
          title: 'Activity Log',
          desc: 'Chronological audit trail of citizen submissions, triage notes, and status transitions.',
        };
      case 'settings':
      default:
        return {
          title: 'Settings & Architecture',
          desc: 'System preferences, client-side data management, and backend REST schema specifications.',
        };
    }
  };

  const { title, desc } = getTabDetails();

  return (
    <div className="bg-white border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            Mumbai MMR
          </span>
        </div>
        <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{desc}</p>
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* User Management Button for authorized Admin */}
        {isAdmin && onOpenUserManagement && (
          <button
            type="button"
            onClick={onOpenUserManagement}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-teal-700" />
            <span>Manage Staff & Users</span>
          </button>
        )}

        {/* Date / Shift Filter Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Active Shift: Today (24h Window)</span>
        </div>

        {/* Primary Action */}
        <button
          onClick={onOpenCreateModal}
          className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Create Incident</span>
        </button>
      </div>
    </div>
  );
};
