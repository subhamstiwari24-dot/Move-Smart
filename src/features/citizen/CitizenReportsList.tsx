import React, { useState, useMemo } from 'react';
import { Incident, IncidentCategory, IncidentPriority, IncidentStatus } from '../../types/incident';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Eye, 
  Clock, 
  SlidersHorizontal,
  Compass
} from 'lucide-react';

interface CitizenReportsListProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onOpenReportModal: () => void;
}

export const CitizenReportsList: React.FC<CitizenReportsListProps> = ({
  incidents,
  onSelectIncident,
  onOpenReportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        inc.title.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || inc.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || inc.status === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || inc.priority === selectedPriority;

      return matchesSearch && matchesCat && matchesStatus && matchesPriority;
    });
  }, [incidents, searchQuery, selectedCategory, selectedStatus, selectedPriority]);

  return (
    <div className="space-y-4">
      {/* Search & Filters Controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, ID (e.g. MS-2026-101), or Mumbai location..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0F766E] outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Traffic Congestion">Traffic Congestion</option>
              <option value="Road Blockage">Road Blockage</option>
              <option value="Accident">Accident</option>
              <option value="Public Transport Delay">Public Transport Delay</option>
              <option value="Damaged Road">Damaged Road</option>
              <option value="Footpath / Accessibility">Footpath / Accessibility</option>
              <option value="Other">Other</option>
            </select>

            {/* Priority Dropdown */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0F766E] outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0F766E] outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Counts */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filteredIncidents.length}</strong> of{' '}
            <strong className="text-slate-800">{incidents.length}</strong> city alerts
          </span>
          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedPriority('all');
              }}
              className="text-xs text-[#0F766E] hover:underline font-semibold cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Incidents Grid / List */}
      {filteredIncidents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              onClick={() => onSelectIncident(incident)}
              className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-[#0F766E] hover:shadow-xs transition-all duration-150 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header: ID, Category & Priority */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {incident.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <PriorityBadge priority={incident.priority} size="sm" />
                    <StatusBadge status={incident.status} size="sm" />
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors line-clamp-1 mb-1.5">
                  {incident.title}
                </h4>

                {/* Description snippet */}
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {incident.description}
                </p>
              </div>

              {/* Bottom metadata */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 text-slate-700 font-medium truncate max-w-[200px]">
                  <MapPin className="w-3.5 h-3.5 text-[#0F766E] flex-shrink-0" />
                  <span className="truncate">{incident.location}</span>
                </div>

                <div className="flex items-center gap-1 text-[#0F766E] font-semibold flex-shrink-0 group-hover:translate-x-1 transition-transform">
                  <span>Track Status</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-white rounded-xl border border-slate-200">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">No matching community reports</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, changing the category filter, or reporting a new incident.
          </p>
          <button
            onClick={onOpenReportModal}
            className="mt-4 px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            Report This Incident Now
          </button>
        </div>
      )}
    </div>
  );
};
