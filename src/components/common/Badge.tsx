import React from 'react';
import { IncidentCategory, IncidentPriority, IncidentStatus } from '../../types/incident';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Flame, 
  ShieldAlert, 
  Car, 
  Construction, 
  Bus, 
  Footprints, 
  HelpCircle,
  XCircle,
  RotateCcw,
  UserCheck,
  Search,
  Droplets,
  AlertOctagon,
  Wrench
} from 'lucide-react';

interface PriorityBadgeProps {
  priority: IncidentPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-semibold';

  switch (priority) {
    case 'Critical':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 text-rose-800 font-bold ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
          <Flame className="w-3 h-3 text-rose-600" />
          <span>Critical</span>
        </span>
      );
    case 'High':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 text-amber-900 font-semibold ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          <AlertTriangle className="w-3 h-3 text-amber-700" />
          <span>High</span>
        </span>
      );
    case 'Medium':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-900 font-semibold ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <ShieldAlert className="w-3 h-3 text-blue-700" />
          <span>Medium</span>
        </span>
      );
    case 'Low':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 font-medium ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>Low</span>
        </span>
      );
  }
};

interface StatusBadgeProps {
  status: IncidentStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-semibold';

  switch (status) {
    case 'Submitted':
    case 'Reported':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-100 text-slate-800 font-medium ${sizeClasses}`}>
          <Clock className="w-3 h-3 text-slate-600" />
          <span>{status}</span>
        </span>
      );
    case 'Under Review':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-800 font-semibold ${sizeClasses}`}>
          <Search className="w-3 h-3 text-indigo-600" />
          <span>Under Review</span>
        </span>
      );
    case 'Verified':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border border-cyan-200 bg-cyan-50 text-cyan-900 font-semibold ${sizeClasses}`}>
          <CheckCircle2 className="w-3 h-3 text-cyan-700" />
          <span>Verified</span>
        </span>
      );
    case 'Assigned':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border border-purple-200 bg-purple-50 text-purple-900 font-semibold ${sizeClasses}`}>
          <UserCheck className="w-3 h-3 text-purple-700" />
          <span>Assigned</span>
        </span>
      );
    case 'In Progress':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 text-amber-900 font-semibold ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          <span>In Progress</span>
        </span>
      );
    case 'Resolved':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-900 font-bold ${sizeClasses}`}>
          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
          <span>Resolved</span>
        </span>
      );
    case 'Rejected':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 text-rose-800 font-medium ${sizeClasses}`}>
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>Rejected</span>
        </span>
      );
    case 'Reopened':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border border-orange-200 bg-orange-50 text-orange-900 font-semibold ${sizeClasses}`}>
          <RotateCcw className="w-3 h-3 text-orange-700" />
          <span>Reopened</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 font-medium ${sizeClasses}`}>
          <span>{status}</span>
        </span>
      );
  }
};

interface CategoryBadgeProps {
  category: IncidentCategory;
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, showIcon = true }) => {
  const getCategoryConfig = () => {
    switch (category) {
      case 'Pothole':
      case 'Damaged Road':
      case 'Road Damage':
        return {
          icon: <Wrench className="w-3.5 h-3.5 text-orange-700" />,
          classes: 'bg-orange-50/80 text-orange-900 border-orange-200/80',
        };
      case 'Road Blockage':
      case 'Fallen Tree':
        return {
          icon: <Construction className="w-3.5 h-3.5 text-amber-700" />,
          classes: 'bg-amber-50/80 text-amber-900 border-amber-200/80',
        };
      case 'Accident':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />,
          classes: 'bg-rose-50/80 text-rose-900 border-rose-200/80',
        };
      case 'Waterlogging':
      case 'Waterlogging / Flooding':
        return {
          icon: <Droplets className="w-3.5 h-3.5 text-sky-700" />,
          classes: 'bg-sky-50/80 text-sky-900 border-sky-200/80',
        };
      case 'Damaged Traffic Signal':
      case 'Traffic Signal Failure':
        return {
          icon: <AlertOctagon className="w-3.5 h-3.5 text-red-700" />,
          classes: 'bg-red-50/80 text-red-900 border-red-200/80',
        };
      case 'Traffic Congestion':
        return {
          icon: <Car className="w-3.5 h-3.5 text-teal-700" />,
          classes: 'bg-teal-50/80 text-teal-900 border-teal-200/80',
        };
      case 'Public Transport Delay':
        return {
          icon: <Bus className="w-3.5 h-3.5 text-blue-700" />,
          classes: 'bg-blue-50/80 text-blue-900 border-blue-200/80',
        };
      case 'Footpath / Accessibility':
        return {
          icon: <Footprints className="w-3.5 h-3.5 text-purple-700" />,
          classes: 'bg-purple-50/80 text-purple-900 border-purple-200/80',
        };
      case 'Other Road Hazard':
      case 'Other':
      default:
        return {
          icon: <HelpCircle className="w-3.5 h-3.5 text-slate-600" />,
          classes: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  const { icon, classes } = getCategoryConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-md border ${classes}`}>
      {showIcon && icon}
      <span>{category}</span>
    </span>
  );
};
