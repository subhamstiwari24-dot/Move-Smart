import React, { useState, useEffect } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { Incident } from '../../types/incident';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { 
  Search, 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Copy,
  ExternalLink,
  Navigation
} from 'lucide-react';

interface TrackIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIncidentId?: string;
}

export const TrackIncidentModal: React.FC<TrackIncidentModalProps> = ({
  isOpen,
  onClose,
  initialIncidentId = '',
}) => {
  const { 
    incidents, 
    setSelectedIncident, 
    setActiveRole, 
    setAdminTab, 
    showToast 
  } = useIncidents();
  const [searchId, setSearchId] = useState(initialIncidentId);
  const [searchedIncident, setSearchedIncident] = useState<Incident | null>(null);
  const [hasSearched, setHasSearched] = useState(Boolean(initialIncidentId));

  // Sync state whenever modal opens or target ID changes
  useEffect(() => {
    if (isOpen) {
      const target = initialIncidentId.trim();
      setSearchId(target);
      if (target) {
        const found = incidents.find((i) => i.id.toLowerCase() === target.toLowerCase()) || null;
        setSearchedIncident(found);
        setHasSearched(true);
      } else {
        setSearchedIncident(null);
        setHasSearched(false);
      }
    }
  }, [isOpen, initialIncidentId, incidents]);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent, customId?: string) => {
    if (e) e.preventDefault();
    const query = (customId !== undefined ? customId : searchId).trim();
    if (!query) return;

    if (customId !== undefined) {
      setSearchId(customId);
    }

    const found = incidents.find(
      (i) => i.id.trim().toLowerCase() === query.toLowerCase()
    );
    setSearchedIncident(found || null);
    setHasSearched(true);
  };

  const handleCopyId = () => {
    if (searchedIncident) {
      navigator.clipboard.writeText(searchedIncident.id);
      showToast(`Incident #${searchedIncident.id} copied to clipboard`, 'success');
    }
  };

  const handleOpenInAdmin = () => {
    if (searchedIncident) {
      setSelectedIncident(searchedIncident);
      setActiveRole('admin');
      setAdminTab('management');
      onClose();
    }
  };

  const getStepState = (step: 'Reported' | 'In Progress' | 'Resolved', currentStatus: string) => {
    if (currentStatus === 'Resolved') return 'completed';
    if (currentStatus === 'In Progress') {
      if (step === 'Reported') return 'completed';
      if (step === 'In Progress') return 'active';
      return 'pending';
    }
    // Reported
    if (step === 'Reported') return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0B192C] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Track Incident Status</h3>
              <p className="text-xs text-slate-300">Enter your Incident ID (e.g. MS-2026-101)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Type your Incident Tracking ID (e.g. MS-2026-101)..."
                className="w-full px-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white font-mono focus:ring-1 focus:ring-[#0F766E] outline-none shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="px-4.5 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track</span>
            </button>
          </form>
        </div>

        {/* Search Result Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {searchedIncident ? (
            <div className="space-y-6">
              {/* Incident Header Card */}
              <div className="p-4.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                      {searchedIncident.id}
                    </span>
                    <button
                      onClick={handleCopyId}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title="Copy Incident ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CategoryBadge category={searchedIncident.category} />
                    <PriorityBadge priority={searchedIncident.priority} size="sm" />
                    <StatusBadge status={searchedIncident.status} size="sm" />
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900 mb-1.5">
                  {searchedIncident.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  {searchedIncident.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 font-medium truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#0F766E] flex-shrink-0" />
                    <span className="truncate">{searchedIncident.location}</span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px] sm:text-right">
                    {searchedIncident.latitude !== undefined && searchedIncident.longitude !== undefined ? (
                      <span>GPS: {searchedIncident.latitude}° N, {searchedIncident.longitude}° E</span>
                    ) : (
                      <span className="text-amber-700">Unmapped (Text address only)</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100 mt-2">
                  <span>Reported: {new Date(searchedIncident.createdAt).toLocaleString()}</span>
                  <span>Updated: {new Date(searchedIncident.updatedAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Progress Flow Steps */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                  Resolution Progress Workflow
                </h5>
                <div className="grid grid-cols-3 gap-3">
                  {/* Step 1: Reported */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-white text-center">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center font-bold text-xs bg-emerald-100 text-[#15803D]">
                      ✓
                    </div>
                    <p className="text-xs font-bold text-slate-800">1. Reported</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Logged in system</p>
                  </div>

                  {/* Step 2: In Progress */}
                  <div className={`p-3 rounded-xl border text-center ${
                    getStepState('In Progress', searchedIncident.status) === 'completed'
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : getStepState('In Progress', searchedIncident.status) === 'active'
                      ? 'border-amber-300 bg-amber-50/50 ring-2 ring-amber-100'
                      : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}>
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center font-bold text-xs ${
                      getStepState('In Progress', searchedIncident.status) === 'completed'
                        ? 'bg-emerald-100 text-[#15803D]'
                        : getStepState('In Progress', searchedIncident.status) === 'active'
                        ? 'bg-amber-100 text-amber-700 animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {getStepState('In Progress', searchedIncident.status) === 'completed' ? '✓' : '2'}
                    </div>
                    <p className="text-xs font-bold text-slate-800">2. In Progress</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Crew dispatched</p>
                  </div>

                  {/* Step 3: Resolved */}
                  <div className={`p-3 rounded-xl border text-center ${
                    getStepState('Resolved', searchedIncident.status) === 'completed'
                      ? 'border-emerald-300 bg-emerald-50/50 ring-2 ring-emerald-100'
                      : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}>
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center font-bold text-xs ${
                      getStepState('Resolved', searchedIncident.status) === 'completed'
                        ? 'bg-[#15803D] text-white shadow-xs'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {getStepState('Resolved', searchedIncident.status) === 'completed' ? '✓' : '3'}
                    </div>
                    <p className="text-xs font-bold text-slate-800">3. Resolved</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Site verified clear</p>
                  </div>
                </div>
              </div>

              {/* Administrative Updates & Notes */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                  Operational Dispatch Details
                </span>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <strong>Assigned Municipal Unit:</strong>{' '}
                    <span className="text-slate-800">{searchedIncident.assignedUnit || 'Mumbai Traffic Control Room'}</span>
                  </p>
                  {searchedIncident.adminNotes && (
                    <p>
                      <strong>Official Field Note:</strong>{' '}
                      <span className="text-slate-800">{searchedIncident.adminNotes}</span>
                    </p>
                  )}
                  {searchedIncident.estimatedImpact && (
                    <p>
                      <strong>Commuter Impact Advisory:</strong>{' '}
                      <span className="text-amber-800">{searchedIncident.estimatedImpact}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-900">No Incident Found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No active report matched ID <span className="font-mono font-bold text-slate-700">"{searchId}"</span>. Please verify the ID format (e.g. MS-2026-101).
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-2">
                Enter an incident tracking number to view real-time clearance status
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-slate-400">Try sample:</span>
                {['MS-2026-101', 'MS-2026-102', 'MS-2026-109'].map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSearch(undefined, id)}
                    className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-teal-50 text-[#0F766E] hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          {searchedIncident ? (
            <button
              type="button"
              onClick={handleOpenInAdmin}
              className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage in Operations Desk</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
