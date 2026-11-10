import React, { useState, useMemo, useEffect } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { Incident, IncidentCategory, IncidentPriority, IncidentStatus } from '../../types/incident';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { 
  Search, 
  MapPin, 
  Edit3, 
  Trash2, 
  Eye, 
  PlusCircle, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface IncidentManagementTabProps {
  onSelectIncident: (incident: Incident) => void;
  onEditIncident: (incident: Incident) => void;
  onOpenCreateModal: () => void;
  initialStatusFilter?: string;
  initialPriorityFilter?: string;
}

const ALL_STATUS_OPTIONS: IncidentStatus[] = [
  'Submitted',
  'Under Review',
  'Verified',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
];

export const IncidentManagementTab: React.FC<IncidentManagementTabProps> = ({
  onSelectIncident,
  onEditIncident,
  onOpenCreateModal,
  initialStatusFilter = 'all',
  initialPriorityFilter = 'all',
}) => {
  const { incidents, updateStatus, deleteIncident } = useIncidents();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>(initialPriorityFilter);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusFilter);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

  // Synchronize when pre-filter props change
  useEffect(() => {
    if (initialStatusFilter) setSelectedStatus(initialStatusFilter);
    if (initialPriorityFilter) setSelectedPriority(initialPriorityFilter);
    setCurrentPage(1);
  }, [initialStatusFilter, initialPriorityFilter]);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Incident | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filtered and sorted list
  const filteredIncidents = useMemo(() => {
    const list = incidents.filter((inc) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        inc.title.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q) ||
        (inc.trackingId && inc.trackingId.toLowerCase().includes(q)) ||
        inc.location.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || inc.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || inc.priority === selectedPriority;
      const matchesStatus = selectedStatus === 'all' || inc.status === selectedStatus;

      return matchesSearch && matchesCat && matchesPriority && matchesStatus;
    });

    return list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder: { [key in IncidentPriority]: number } = {
          Critical: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });
  }, [incidents, searchQuery, selectedCategory, selectedPriority, selectedStatus, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage) || 1;
  const paginatedIncidents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredIncidents.slice(start, start + itemsPerPage);
  }, [filteredIncidents, currentPage, itemsPerPage]);

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteIncident(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleQuickStatusChange = (incident: Incident, newStatus: IncidentStatus) => {
    updateStatus(incident.id, newStatus);
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategory !== 'all' ||
    selectedPriority !== 'all' ||
    selectedStatus !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Search & Filter Header Bar */}
      <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by incident ID (MS-2026-101), tracking ID, title, corridor, or details..."
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-[#0F766E] focus:border-[#0F766E] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* New Incident Button */}
          <button
            onClick={onOpenCreateModal}
            className="w-full lg:w-auto px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Incident</span>
          </button>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          {/* Category */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0F766E] outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Traffic Congestion">Traffic Congestion</option>
              <option value="Road Blockage">Road Blockage</option>
              <option value="Accident">Accident</option>
              <option value="Public Transport Delay">Transit Delay</option>
              <option value="Damaged Road">Damaged Road</option>
              <option value="Footpath / Accessibility">Footpath</option>
              <option value="Waterlogging / Flooding">Waterlogging</option>
              <option value="Damaged Traffic Signal">Traffic Signal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0F766E] outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0F766E] outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {ALL_STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0F766E] outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips & Result Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900">{filteredIncidents.length}</strong> of{' '}
              <strong className="text-slate-900">{incidents.length}</strong> total incidents
            </span>

            {/* Filter pills */}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                Category: {selectedCategory}
                <X className="w-3 h-3 cursor-pointer hover:text-black" onClick={() => setSelectedCategory('all')} />
              </span>
            )}
            {selectedPriority !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                Priority: {selectedPriority}
                <X className="w-3 h-3 cursor-pointer hover:text-black" onClick={() => setSelectedPriority('all')} />
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                Status: {selectedStatus}
                <X className="w-3 h-3 cursor-pointer hover:text-black" onClick={() => setSelectedStatus('all')} />
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-32">Identifier</th>
                <th className="py-3 px-4 min-w-[220px]">Incident Details</th>
                <th className="py-3 px-4 w-36">Category</th>
                <th className="py-3 px-4 min-w-[180px]">Location</th>
                <th className="py-3 px-4 w-28">Priority</th>
                <th className="py-3 px-4 w-36">Status</th>
                <th className="py-3 px-4 w-28">Logged</th>
                <th className="py-3 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedIncidents.length > 0 ? (
                paginatedIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Identifier */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      <div 
                        onClick={() => onSelectIncident(incident)}
                        className="cursor-pointer hover:text-[#0F766E]"
                      >
                        <p className="text-xs font-bold text-slate-900">{incident.id}</p>
                        {incident.trackingId && (
                          <p className="text-[10px] text-teal-700 font-semibold">{incident.trackingId}</p>
                        )}
                      </div>
                    </td>

                    {/* Title & Description */}
                    <td className="py-3 px-4">
                      <p 
                        onClick={() => onSelectIncident(incident)}
                        className="font-bold text-slate-900 hover:text-[#0F766E] cursor-pointer truncate max-w-xs"
                        title={incident.title}
                      >
                        {incident.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                        {incident.description}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <CategoryBadge category={incident.category} />
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-slate-700 max-w-[200px] truncate" title={incident.location}>
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{incident.location}</span>
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={incident.priority} size="sm" />
                    </td>

                    {/* Status Changer */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={incident.status}
                        onChange={(e) => handleQuickStatusChange(incident, e.target.value as IncidentStatus)}
                        className="text-xs font-semibold px-2 py-1 rounded-md border border-slate-300 bg-white text-slate-800 hover:border-slate-400 cursor-pointer"
                      >
                        {ALL_STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Logged Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px] font-mono">
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectIncident(incident)}
                          title="Inspect incident details"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditIncident(incident)}
                          title="Edit incident"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(incident)}
                          title="Delete incident"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="font-bold text-sm text-slate-800">No matching incidents found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                    <button
                      onClick={clearAllFilters}
                      className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredIncidents.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredIncidents.length)}</strong> of{' '}
            <strong className="text-slate-900">{filteredIncidents.length}</strong> incidents
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer font-medium flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-2 font-mono font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer font-medium flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Incident Record?"
        message={`Are you sure you want to delete incident #${deleteTarget?.id} ("${deleteTarget?.title}")? This action will permanently remove it from all operations dashboards.`}
        confirmLabel="Delete Record"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
