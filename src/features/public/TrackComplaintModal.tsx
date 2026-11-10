import React, { useState, useEffect } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { Incident, IncidentStatus } from '../../types/incident';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { apiService } from '../../services/apiService';
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
  Navigation,
  FileText,
  User,
  Image as ImageIcon,
  Share2,
  AlertTriangle,
  RotateCcw,
  Check,
  Loader2,
  Timer,
  Building2
} from 'lucide-react';

interface TrackComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const LIFECYCLE_STEPS: { status: IncidentStatus; label: string; desc: string }[] = [
  { status: 'Submitted', label: 'Submitted', desc: 'Complaint logged in system' },
  { status: 'Under Review', label: 'Under Review', desc: 'Traffic desk validating data' },
  { status: 'Verified', label: 'Verified', desc: 'Confirmed by field radar/CCTV' },
  { status: 'Assigned', label: 'Assigned', desc: 'Dispatched to response unit' },
  { status: 'In Progress', label: 'In Progress', desc: 'On-ground clearance underway' },
  { status: 'Resolved', label: 'Resolved', desc: 'Roadway clear and safe' },
];

export const TrackComplaintModal: React.FC<TrackComplaintModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const { incidents, showToast } = useIncidents();
  const [query, setQuery] = useState(initialQuery);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const performLookup = async (searchString: string) => {
    const term = searchString.trim();
    if (!term) return;

    // Check local incidents first
    const foundLocal = incidents.find(
      (i) =>
        (i.trackingId && i.trackingId.toLowerCase() === term.toLowerCase()) ||
        i.id.toLowerCase() === term.toLowerCase()
    );

    if (foundLocal) {
      setIncident(foundLocal);
      setHasSearched(true);
      return;
    }

    // Fall back to backend query via apiService
    setIsLoading(true);
    try {
      const remote = await apiService.trackIncident(term);
      if (remote) {
        setIncident(remote);
      } else {
        setIncident(null);
      }
    } catch {
      setIncident(null);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const q = initialQuery.trim();
      setQuery(q);
      if (q) {
        performLookup(q);
      } else {
        setIncident(null);
        setHasSearched(false);
      }
    }
  }, [isOpen, initialQuery, incidents]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(query);
  };

  const handleCopyTrackingId = () => {
    if (incident?.trackingId || incident?.id) {
      const idToCopy = incident.trackingId || incident.id;
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      showToast(`Copied ${idToCopy} to clipboard!`, 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper to compute progress index for lifecycle stepper
  const getStepStatus = (stepStatus: IncidentStatus, currentStatus: IncidentStatus) => {
    if (currentStatus === 'Rejected') {
      return stepStatus === 'Submitted' ? 'completed' : 'rejected';
    }

    if (currentStatus === 'Reopened') {
      if (stepStatus === 'Submitted' || stepStatus === 'Under Review' || stepStatus === 'Verified') {
        return 'completed';
      }
      if (stepStatus === 'In Progress') return 'current';
      return 'upcoming';
    }

    const order: IncidentStatus[] = [
      'Submitted',
      'Under Review',
      'Verified',
      'Assigned',
      'In Progress',
      'Resolved',
    ];

    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepStatus);

    if (currentIndex === -1) {
      return 'upcoming';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
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
              <h3 className="text-base font-bold text-white">Track Mobility Incident / Complaint</h3>
              <p className="text-xs text-slate-300">Public transparency portal for Mumbai Metropolitan Region</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex-shrink-0">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Tracking ID (e.g. MS-TRK-10101) or System ID (e.g. MS-2026-101)..."
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Search</span>
              )}
            </button>
          </form>

          {/* Quick Demo Chips */}
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 overflow-x-auto">
            <span className="font-semibold text-slate-600">Sample tracking IDs:</span>
            {['MS-TRK-10101', 'MS-TRK-10102', 'MS-TRK-10104'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setQuery(id);
                  performLookup(id);
                }}
                className="font-mono text-[10px] px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-[#0F766E] border border-slate-200 transition-colors cursor-pointer"
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Retrieving official status from municipal ledger...</p>
            </div>
          ) : incident ? (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Top Banner with Tracking ID & Status */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-[#0F766E]">
                      {incident.trackingId || incident.id}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTrackingId}
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Copy Tracking ID"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{incident.title}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={incident.status} />
                  <PriorityBadge priority={incident.priority} />
                </div>
              </div>

              {/* Public Official Update Banner */}
              <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                  <span>Latest Operations Advisory for Citizens</span>
                </div>
                <p className="text-xs text-teal-950 leading-relaxed font-medium">
                  {incident.publicUpdate || 'Complaint registered in operations queue and awaiting verification.'}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-teal-700 pt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-teal-600" />
                    <span>Unit: {incident.assignedUnit || 'Mumbai Central Traffic Ops Desk'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Timer className="w-3 h-3 text-teal-600" />
                    <span>ETA: {incident.estimatedImpact || 'Standard SLA (24-48h)'}</span>
                  </span>
                  <span>•</span>
                  <span>Updated: {new Date(incident.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* 8-Status Visual Lifecycle Timeline */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Complaint Status Stepper
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Active State: <strong>{incident.status}</strong>
                  </span>
                </div>

                {incident.status === 'Rejected' ? (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Complaint Marked as Rejected / Closed</p>
                      <p className="text-rose-700 mt-0.5">
                        {incident.publicUpdate || 'This report was evaluated by the municipal traffic desk and closed (e.g. duplicate hazard, private premises obstruction, or unverified report).'}
                      </p>
                    </div>
                  </div>
                ) : incident.status === 'Reopened' ? (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2.5 mb-2">
                    <RotateCcw className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Case Reopened for Municipal Re-Evaluation</p>
                      <p className="text-amber-800 mt-0.5">
                        This grievance was reopened. Operations field units have been re-notified to inspect and resolve the recurring condition.
                      </p>
                    </div>
                  </div>
                ) : null}

                {incident.status !== 'Rejected' && (
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center pt-2">
                    {LIFECYCLE_STEPS.map((step, idx) => {
                      const state = getStepStatus(step.status, incident.status);
                      return (
                        <div
                          key={step.status}
                          className={`p-2 rounded-lg border text-xs flex flex-col items-center justify-center transition-all ${
                            state === 'completed'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                              : state === 'current'
                              ? 'bg-teal-50 border-[#0F766E] text-[#0F766E] font-bold shadow-xs ring-1 ring-[#0F766E]'
                              : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mb-1 font-bold ${
                              state === 'completed'
                                ? 'bg-emerald-600 text-white'
                                : state === 'current'
                                ? 'bg-[#0F766E] text-white animate-pulse'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {state === 'completed' ? '✓' : idx + 1}
                          </div>
                          <span className="text-[11px] leading-tight">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Photo Evidence & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Photo Evidence */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    <ImageIcon className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>Photo Evidence</span>
                  </div>
                  {incident.photoUrl ? (
                    <div className="rounded-lg overflow-hidden border border-slate-200 max-h-44 bg-slate-900 flex items-center justify-center relative group">
                      <img
                        src={incident.photoUrl}
                        alt="Hazard observation evidence"
                        className="w-full h-40 object-cover"
                      />
                      <a
                        href={incident.photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 hover:bg-black text-white text-[10px] rounded flex items-center gap-1 font-medium transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Full</span>
                      </a>
                    </div>
                  ) : (
                    <div className="p-6 bg-white rounded-lg border border-dashed border-slate-300 text-center text-slate-400">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-40" />
                      <span>No photo evidence attached</span>
                    </div>
                  )}
                </div>

                {/* Location & Redacted Reporter Details */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>Report Location</span>
                    </div>
                    <p className="font-semibold text-slate-900">{incident.location}</p>
                    {incident.latitude && incident.longitude && (
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60">
                        <p className="font-mono text-[10px] text-slate-500">
                          {incident.latitude.toFixed(5)}° N, {incident.longitude.toFixed(5)}° E
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-semibold text-[#0F766E] hover:underline flex items-center gap-0.5"
                        >
                          <span>Open Maps</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reporter Privacy</span>
                    </div>
                    <p className="text-slate-600">
                      {incident.reporter?.isAnonymous ? 'Anonymous Citizen' : (incident.reporter?.name || 'Verified Citizen')}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Phone & email are protected and redacted on public tracking view.
                    </p>
                  </div>
                </div>
              </div>

              {/* Observation Description */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Submitted Incident Description
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {incident.description}
                </p>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No Incident Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't locate any report matching "{query}". Please double-check your tracking ID (e.g. MS-TRK-10101) or system ID (e.g. MS-2026-101).
              </p>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700">Enter a Tracking ID to Inspect Progress</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Every citizen report receives a unique tracking number to monitor municipal response and street clearance.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Official Mumbai Metropolitan Region Mobility Tracking Desk
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-4 py-2 bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
