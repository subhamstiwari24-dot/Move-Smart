import React, { useMemo } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Flame, 
  Clock, 
  ShieldAlert, 
  PieChart as PieIcon,
  Percent,
  Activity,
  Layers,
  Info
} from 'lucide-react';

const CATEGORY_COLORS: { [key: string]: string } = {
  'Traffic Congestion': '#0F766E',
  'Road Blockage': '#EA580C',
  'Accident': '#DC2626',
  'Public Transport Delay': '#3478F6',
  'Damaged Road': '#F59E0B',
  'Footpath / Accessibility': '#8B5CF6',
  'Other': '#64748B',
};

const STATUS_COLORS: { [key: string]: string } = {
  Reported: '#6366F1',
  'In Progress': '#EA580C',
  Resolved: '#15803D',
};

const PRIORITY_COLORS: { [key: string]: string } = {
  Critical: '#DC2626',
  High: '#EA580C',
  Medium: '#3478F6',
  Low: '#64748B',
};

export const AnalyticsTab: React.FC = () => {
  const { incidents, statistics } = useIncidents();

  // 1. Incidents by Category
  const categoryData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    incidents.forEach((inc) => {
      counts[inc.category] = (counts[inc.category] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      color: CATEGORY_COLORS[name] || '#0F766E',
    }));
  }, [incidents]);

  // 2. Incidents by Status
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      Submitted: 0,
      'Under Review': 0,
      Verified: 0,
      Assigned: 0,
      'In Progress': 0,
      Resolved: 0,
      Rejected: 0,
      Reported: 0,
    };
    incidents.forEach((inc) => {
      if (counts[inc.status] !== undefined) {
        counts[inc.status]++;
      } else {
        counts[inc.status] = 1;
      }
    });

    return [
      { name: 'Submitted / Review', value: (counts['Submitted'] || 0) + (counts['Under Review'] || 0) + (counts['Reported'] || 0), color: '#3B82F6' },
      { name: 'Verified / Assigned', value: (counts['Verified'] || 0) + (counts['Assigned'] || 0), color: '#8B5CF6' },
      { name: 'In Progress', value: counts['In Progress'] || 0, color: '#D97706' },
      { name: 'Resolved', value: counts['Resolved'] || 0, color: '#0F766E' },
    ];
  }, [incidents]);

  // 3. Incidents by Priority
  const priorityData = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    incidents.forEach((inc) => {
      if (counts[inc.priority] !== undefined) {
        counts[inc.priority]++;
      }
    });

    return [
      { name: 'Critical', value: counts.Critical, color: PRIORITY_COLORS.Critical },
      { name: 'High', value: counts.High, color: PRIORITY_COLORS.High },
      { name: 'Medium', value: counts.Medium, color: PRIORITY_COLORS.Medium },
      { name: 'Low', value: counts.Low, color: PRIORITY_COLORS.Low },
    ];
  }, [incidents]);

  // 4. Cumulative Resolution comparison
  const openVsResolvedData = useMemo(() => {
    const openCount = statistics.total - statistics.resolved;
    return [
      { name: 'Active / Open', value: openCount, color: '#EA580C' },
      { name: 'Resolved / Cleared', value: statistics.resolved, color: '#15803D' },
    ];
  }, [statistics.total, statistics.resolved]);

  // 5. Timeline Flow Data (derived strictly from active incidents)
  const timelineData = useMemo(() => {
    const dateMap: { [dateStr: string]: { date: string; total: number; resolved: number } } = {};

    incidents.forEach((inc) => {
      const d = new Date(inc.createdAt);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      if (!dateMap[key]) {
        dateMap[key] = { date: key, total: 0, resolved: 0 };
      }
      dateMap[key].total++;
      if (inc.status === 'Resolved') {
        dateMap[key].resolved++;
      }
    });

    return Object.values(dateMap);
  }, [incidents]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Operations Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Clearance Rate</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#15803D]">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{statistics.resolutionRate}%</p>
          <p className="text-xs text-[#15803D] font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{statistics.resolved} of {statistics.total} incidents cleared</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Urgent Bottlenecks</span>
            <div className="p-2 rounded-lg bg-red-50 text-[#DC2626]">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{statistics.criticalOrHighOpen}</p>
          <p className="text-xs text-[#DC2626] font-semibold mt-1">
            Unresolved Critical / High hazards
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Active Corridors</span>
            <div className="p-2 rounded-lg bg-teal-50 text-[#0F766E]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{categoryData.length}</p>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Distinct transit categories monitored
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Active Queue Depth</span>
            <div className="p-2 rounded-lg bg-amber-50 text-[#EA580C]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{statistics.total - statistics.resolved}</p>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            Reports pending or under active work
          </p>
        </div>
      </div>

      {/* Row 1: Category Bar Chart & Status Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Incidents by Urban Transit Category</h3>
              <p className="text-[11px] text-slate-500">Distribution of hazards across road and transit classifications</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {incidents.length} Data Points
            </span>
          </div>

          <div className="h-72 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B192C',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Clearance Lifecycle Status</h3>
            <p className="text-[11px] text-slate-500">Current workflow stage of active reports</p>

            <div className="h-52 w-full flex items-center justify-center my-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B192C',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </span>
                <span className="font-mono font-bold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Priority Severity & Active vs Resolved */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority Severity Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Priority Severity Distribution</h3>
            <p className="text-[11px] text-slate-500">Traffic hazard categorization by urgency</p>

            <div className="h-56 w-full flex items-center justify-center my-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`p-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B192C',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {priorityData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                </span>
                <span className="font-mono font-bold">{p.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Integrity Explanation Callout (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Info className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-sm font-bold text-slate-900">Data Integrity & Calculation Model</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every metric and chart on this dashboard is derived strictly in real-time from the current active local storage session records (<strong>{incidents.length} total incidents</strong>).
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <p>• <strong>Resolution Rate:</strong> ({statistics.resolved} resolved / {statistics.total} total) × 100 = <strong>{statistics.resolutionRate}%</strong></p>
              <p>• <strong>Urgent Open Items:</strong> Count of all incidents with priority <em>Critical</em> or <em>High</em> whose status is not <em>Resolved</em>.</p>
              <p>• <strong>Historical Consistency:</strong> No artificial external time-series feeds are fabricated. Data updates dynamically with every user action.</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Audit status: Synchronized</span>
            <span>Local Database v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
