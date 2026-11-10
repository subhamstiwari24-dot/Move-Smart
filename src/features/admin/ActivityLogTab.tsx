import React, { useState, useMemo } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { ActivityActionType, ActivityLog } from '../../types/activity';
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  RotateCcw, 
  Clock, 
  User,
  ShieldCheck,
  Calendar,
  Download,
  ExternalLink,
  Info
} from 'lucide-react';

export const ActivityLogTab: React.FC = () => {
  const { activities, incidents, setSelectedIncident, setAdminTab } = useIncidents();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        act.title.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        act.actor.toLowerCase().includes(q) ||
        (act.incidentId && act.incidentId.toLowerCase().includes(q));

      const matchesType = filterType === 'all' || act.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [activities, searchQuery, filterType]);

  const getActionIcon = (type: ActivityActionType) => {
    switch (type) {
      case 'INCIDENT_SUBMITTED':
        return (
          <div className="p-2 rounded-lg bg-teal-50 text-[#0F766E] border border-teal-200">
            <PlusCircle className="w-4 h-4" />
          </div>
        );
      case 'STATUS_UPDATED':
        return (
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-4 h-4" />
          </div>
        );
      case 'INCIDENT_RESOLVED':
        return (
          <div className="p-2 rounded-lg bg-emerald-50 text-[#15803D] border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'INCIDENT_EDITED':
        return (
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Edit3 className="w-4 h-4" />
          </div>
        );
      case 'INCIDENT_DELETED':
        return (
          <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200">
            <Trash2 className="w-4 h-4" />
          </div>
        );
      case 'DEMO_DATA_RESET':
      default:
        return (
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-200">
            <RotateCcw className="w-4 h-4" />
          </div>
        );
    }
  };

  const handleExportAuditLog = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `movesmart_audit_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Search & Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, incident ID (e.g. MS-2026-101), or action details..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-1 focus:ring-[#0F766E] outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0F766E] outline-none cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="all">All Action Types</option>
            <option value="INCIDENT_SUBMITTED">Incident Submissions</option>
            <option value="STATUS_UPDATED">Status Updates</option>
            <option value="INCIDENT_RESOLVED">Resolutions</option>
            <option value="INCIDENT_EDITED">Edits</option>
            <option value="INCIDENT_DELETED">Deletions</option>
            <option value="DEMO_DATA_RESET">System Resets</option>
          </select>

          <button
            onClick={handleExportAuditLog}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            title="Export audit log as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Log</span>
          </button>
        </div>
      </div>

      {/* Audit Trail List */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 text-xs">
          <span className="font-bold text-slate-900">
            Sequential Event Timeline ({filteredActivities.length} events)
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Immutable Audit Trail
          </span>
        </div>

        {filteredActivities.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filteredActivities.map((act) => {
              const matchedIncident = act.incidentId
                ? incidents.find((i) => i.id === act.incidentId)
                : null;

              return (
                <div key={act.id} className="relative flex items-start gap-4 text-xs group">
                  <div className="absolute -left-6 mt-1 flex-shrink-0">
                    {getActionIcon(act.type)}
                  </div>

                  <div className="flex-1 bg-slate-50/70 hover:bg-slate-50 p-4 rounded-xl border border-slate-200/80 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{act.title}</h4>
                        {act.incidentId && (
                          <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">
                            {act.incidentId}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-[#64748B]">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {act.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Actor: <strong className="text-slate-700">{act.actor}</strong></span>
                      </span>

                      {matchedIncident && (
                        <button
                          onClick={() => {
                            setSelectedIncident(matchedIncident);
                            setAdminTab('management');
                          }}
                          className="font-bold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inspect #{matchedIncident.id}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-900">No matching audit events</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or filter selection.</p>
          </div>
        )}
      </div>
    </div>
  );
};
