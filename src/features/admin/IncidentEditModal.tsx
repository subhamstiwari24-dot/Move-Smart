import React, { useState, useEffect } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { Incident, IncidentCategory, IncidentPriority, IncidentStatus } from '../../types/incident';
import { X, Save, Edit3, Compass, MapPin } from 'lucide-react';

interface IncidentEditModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: IncidentCategory[] = [
  'Traffic Congestion',
  'Road Blockage',
  'Accident',
  'Public Transport Delay',
  'Damaged Road',
  'Footpath / Accessibility',
  'Other',
];

const PRIORITIES: IncidentPriority[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: IncidentStatus[] = [
  'Submitted',
  'Under Review',
  'Verified',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
];

export const IncidentEditModal: React.FC<IncidentEditModalProps> = ({
  incident,
  isOpen,
  onClose,
}) => {
  const { updateIncident } = useIncidents();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('Traffic Congestion');
  const [priority, setPriority] = useState<IncidentPriority>('Medium');
  const [status, setStatus] = useState<IncidentStatus>('Reported');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUnit, setAssignedUnit] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [estimatedImpact, setEstimatedImpact] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (incident) {
      setTitle(incident.title);
      setCategory(incident.category);
      setPriority(incident.priority);
      setStatus(incident.status);
      setLocation(incident.location);
      setLatitude(incident.latitude !== undefined ? incident.latitude.toString() : '');
      setLongitude(incident.longitude !== undefined ? incident.longitude.toString() : '');
      setDescription(incident.description);
      setAssignedUnit(incident.assignedUnit || '');
      setAdminNotes(incident.adminNotes || '');
      setEstimatedImpact(incident.estimatedImpact || '');
      setErrors({});
    }
  }, [incident, isOpen]);

  if (!isOpen || !incident) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    if (!location.trim()) {
      setErrors({ location: 'Location is required' });
      return;
    }

    updateIncident(incident.id, {
      title: title.trim(),
      category,
      priority,
      status,
      location: location.trim(),
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      description: description.trim(),
      assignedUnit: assignedUnit.trim() || undefined,
      adminNotes: adminNotes.trim() || undefined,
      estimatedImpact: estimatedImpact.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0B192C] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-base font-bold text-white">Edit Incident #{incident.id}</h3>
              <p className="text-xs text-slate-400">Modify operational record and dispatch details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Title / Summary <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#149688] outline-hidden"
              required
            />
          </div>

          {/* Category, Priority, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IncidentPriority)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IncidentStatus)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Location Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#149688] outline-hidden"
              required
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Latitude</label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 19.0625"
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Longitude</label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 72.8538"
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-[#149688] outline-hidden"
            />
          </div>

          {/* Assigned Unit & Admin Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Assigned Municipal Unit
              </label>
              <input
                type="text"
                value={assignedUnit}
                onChange={(e) => setAssignedUnit(e.target.value)}
                placeholder="e.g. Traffic Division 3 - BKC"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Commuter Impact Notice
              </label>
              <input
                type="text"
                value={estimatedImpact}
                onChange={(e) => setEstimatedImpact(e.target.value)}
                placeholder="e.g. 30 mins delay"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Administrative Operation Notes
            </label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Heavy crane on scene. Road sweep underway."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
