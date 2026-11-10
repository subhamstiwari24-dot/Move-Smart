import React, { useState, useMemo } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { Incident } from '../../types/incident';
import { MumbaiMap } from '../../components/map/MumbaiMap';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { 
  MapPin, 
  Info, 
  AlertTriangle, 
  ShieldCheck, 
  Compass, 
  Layers, 
  ExternalLink,
  Flame,
  CheckCircle2,
  X
} from 'lucide-react';

interface LiveMapTabProps {
  onSelectIncident: (incident: Incident) => void;
}

export const LiveMapTab: React.FC<LiveMapTabProps> = ({ onSelectIncident }) => {
  const { incidents } = useIncidents();
  const [isUnmappedDrawerOpen, setIsUnmappedDrawerOpen] = useState(false);

  // Compute mapped vs unmapped incidents
  const mappedIncidents = useMemo(() => {
    return incidents.filter(
      (i) => typeof i.latitude === 'number' && typeof i.longitude === 'number'
    );
  }, [incidents]);

  const unmappedIncidents = useMemo(() => {
    return incidents.filter(
      (i) => typeof i.latitude !== 'number' || typeof i.longitude !== 'number'
    );
  }, [incidents]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Operations Telemetry Header */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-50 text-[#0F766E] flex-shrink-0 mt-0.5">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Mumbai Metropolitan Geofence Map
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0F766E] border border-teal-200">
                19.0760° N, 72.8777° E
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive spatial tracking of active transit blockages, collisions, and municipal repairs across Mumbai corridors.
            </p>
          </div>
        </div>

        {/* Telemetry metrics pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
            <span><strong>{mappedIncidents.length}</strong> Mapped Corridors</span>
          </div>

          {unmappedIncidents.length > 0 && (
            <button
              onClick={() => setIsUnmappedDrawerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold flex items-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span><strong>{unmappedIncidents.length}</strong> Unmapped Reports</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Full-Height Leaflet Operations Map */}
      <MumbaiMap
        incidents={incidents}
        onSelectIncident={onSelectIncident}
        heightClass="h-[640px]"
        showFilters={true}
      />

      {/* Unmapped Incidents Drawer / Modal */}
      {isUnmappedDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 bg-[#0B192C] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Unmapped Incident Reports</h3>
              </div>
              <button
                onClick={() => setIsUnmappedDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-amber-50/70 border-b border-amber-200 text-xs text-amber-900 leading-relaxed">
              These reports were submitted with textual addresses but lack exact GPS coordinates. To maintain absolute spatial accuracy, they are excluded from the map pins until geo-tagged by an operator.
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-slate-100 flex-1 space-y-3">
              {unmappedIncidents.map((inc) => (
                <div key={inc.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-800">{inc.id}</span>
                      <PriorityBadge priority={inc.priority} size="sm" />
                      <StatusBadge status={inc.status} size="sm" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">{inc.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{inc.location}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{inc.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectIncident(inc);
                      setIsUnmappedDrawerOpen(false);
                    }}
                    className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex-shrink-0"
                  >
                    Inspect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
