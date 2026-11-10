import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { Incident, IncidentStatus, IncidentPriority } from '../../types/incident';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  AlertTriangle, 
  Compass, 
  FileText, 
  Activity, 
  Layers, 
  ChevronRight,
  Image as ImageIcon,
  Copy,
  Check
} from 'lucide-react';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onEdit: (incident: Incident) => void;
}

const ALL_STATUSES: IncidentStatus[] = [
  'Submitted',
  'Under Review',
  'Verified',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
];

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onEdit,
}) => {
  const { incidents, updateStatus, deleteIncident, showToast } = useIncidents();
  const [adminNote, setAdminNote] = useState('');
  const [publicUpdate, setPublicUpdate] = useState('');
  const [assignedUnit, setAssignedUnit] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live reference ensures any status update or edit immediately updates the open modal
  const liveIncident = (incident ? incidents.find((i) => i.id === incident.id) : null) || incident;

  if (!liveIncident) return null;

  const handleStatusChange = (newStatus: IncidentStatus) => {
    updateStatus(
      liveIncident.id,
      newStatus,
      adminNote.trim() || undefined,
      publicUpdate.trim() || undefined,
      assignedUnit.trim() || undefined
    );
    setAdminNote('');
    setPublicUpdate('');
  };

  const handleSaveNotes = () => {
    if (!adminNote.trim() && !publicUpdate.trim() && !assignedUnit.trim()) return;
    updateStatus(
      liveIncident.id,
      liveIncident.status,
      adminNote.trim() || undefined,
      publicUpdate.trim() || undefined,
      assignedUnit.trim() || undefined
    );
    setAdminNote('');
    setPublicUpdate('');
    showToast('Operations notes updated', 'success');
  };

  const handleDeleteConfirm = () => {
    deleteIncident(liveIncident.id);
    setIsDeleting(false);
    onClose();
  };

  const handleCopyId = () => {
    const val = liveIncident.trackingId || liveIncident.id;
    navigator.clipboard.writeText(val);
    setCopied(true);
    showToast(`Copied ${val}!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div 
          className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#0B192C] text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 flex-shrink-0">
                {liveIncident.id}
              </span>
              {liveIncident.trackingId && (
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Copy Tracking ID"
                >
                  <span>{liveIncident.trackingId}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
              <h3 className="text-base font-bold text-white truncate max-w-sm sm:max-w-md">
                {liveIncident.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* Status & Urgency Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Current Status:</span>
                <StatusBadge status={liveIncident.status} />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Priority Severity:</span>
                <PriorityBadge priority={liveIncident.priority} />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Category:</span>
                <CategoryBadge category={liveIncident.category} />
              </div>
            </div>

            {/* Comprehensive Status Action Workflow */}
            <div className="p-3.5 bg-slate-100/70 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 text-xs block">
                Triage / Transition Operational Status:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ALL_STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    disabled={liveIncident.status === st}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      liveIncident.status === st
                        ? 'bg-[#0F766E] text-white shadow-xs ring-2 ring-teal-200'
                        : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Evidence & Incident Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Description & Impact */}
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Hazard Details</span>
                </div>
                <p className="text-slate-800 leading-relaxed font-normal text-xs whitespace-pre-wrap">
                  {liveIncident.description}
                </p>
                {liveIncident.estimatedImpact && (
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <strong>Traffic Impact:</strong> {liveIncident.estimatedImpact}
                  </div>
                )}
              </div>

              {/* Photo Evidence Card */}
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  <ImageIcon className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Attached Photo Evidence</span>
                </div>
                {liveIncident.photoUrl ? (
                  <div className="rounded-lg overflow-hidden border border-slate-200 max-h-40 bg-slate-900 flex items-center justify-center">
                    <img
                      src={liveIncident.photoUrl}
                      alt="Incident evidence photo"
                      className="w-full h-36 object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-slate-400">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-40" />
                    <span>No photographic evidence attached</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location & GPS Info */}
            <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Location & Geofence</span>
              </div>
              <p className="font-semibold text-slate-900 text-xs">
                {liveIncident.location}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                <p>
                  <strong>Lat:</strong> {liveIncident.latitude !== undefined ? `${liveIncident.latitude}° N` : 'No GPS'}
                </p>
                <p>
                  <strong>Lng:</strong> {liveIncident.longitude !== undefined ? `${liveIncident.longitude}° E` : 'No GPS'}
                </p>
                <p>
                  <strong>Assigned Unit:</strong> {liveIncident.assignedUnit || 'Mumbai Traffic Control'}
                </p>
              </div>
            </div>

            {/* Reporter Information & Timestamps */}
            <div className="p-4 bg-white rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Logged by: {liveIncident.reporter?.isAnonymous ? 'Anonymous Citizen' : (liveIncident.reporter?.name || 'Municipal Officer')}</span>
                </p>
                {liveIncident.reporter?.email && (
                  <p className="text-[11px] text-slate-500 font-mono">Email: {liveIncident.reporter.email}</p>
                )}
                {liveIncident.reporter?.phone && (
                  <p className="text-[11px] text-slate-500 font-mono">Phone: {liveIncident.reporter.phone}</p>
                )}
              </div>

              <div className="text-right space-y-0.5 font-mono text-[11px] text-slate-500">
                <p>Created: {new Date(liveIncident.createdAt).toLocaleString()}</p>
                <p>Last Update: {new Date(liveIncident.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Operations Notes: Internal Dispatch Notes & Citizen Advisory */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                Operations Response Dispatch & Advisory
              </span>

              {/* Public Citizen Update */}
              <div>
                <label className="block text-[11px] font-bold text-teal-800 mb-1">
                  Public Advisory for Citizen Tracker (Visible on Tracking Portal):
                </label>
                <input
                  type="text"
                  value={publicUpdate}
                  onChange={(e) => setPublicUpdate(e.target.value)}
                  placeholder={liveIncident.publicUpdate || 'e.g. BMC team dispatched with dewatering equipment to clear subway'}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-[#0F766E] outline-none"
                />
              </div>

              {/* Internal Dispatch Note */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Internal Operations Notes (Officer & Dispatch Log):
                </label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={liveIncident.adminNotes || 'e.g. Tow truck #4 deployed from Bandra depot; ETA 12 minutes'}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-[#0F766E] outline-none"
                />
              </div>

              {/* Assigned Response Unit */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Assign Response Unit:
                  </label>
                  <input
                    type="text"
                    value={assignedUnit}
                    onChange={(e) => setAssignedUnit(e.target.value)}
                    placeholder={liveIncident.assignedUnit || 'e.g. BMC Ward K-West Dewatering Unit'}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-[#0F766E] outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={!adminNote.trim() && !publicUpdate.trim() && !assignedUnit.trim()}
                  className="w-full sm:w-auto px-4 py-2 mt-auto bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex-shrink-0"
                >
                  Save Dispatch Notes
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setIsDeleting(true)}
              className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Record</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onEdit(liveIncident);
                }}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Edit Incident</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0B192C] hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleting}
        title="Permanently Delete Incident Record?"
        message={`Are you sure you want to delete incident #${liveIncident.id} ("${liveIncident.title}")? This action cannot be undone.`}
        confirmLabel="Confirm Deletion"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleting(false)}
      />
    </>
  );
};
