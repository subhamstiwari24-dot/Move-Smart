import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useAuth } from '../../context/AuthContext';
import { MumbaiMap } from '../../components/map/MumbaiMap';
import { Incident, IncidentCategory } from '../../types/incident';
import { PriorityBadge, StatusBadge, CategoryBadge } from '../../components/common/Badge';
import { 
  Compass, 
  MapPin, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Car, 
  ArrowRight, 
  ExternalLink, 
  PhoneCall, 
  Activity,
  Layers,
  Construction,
  Bus,
  Footprints,
  Droplets,
  AlertOctagon,
  Wrench,
  Building2,
  FileCheck2,
  Radio,
  Send,
  HelpCircle,
  ChevronRight,
  ShieldAlert,
  TreePine,
  Mail,
  LifeBuoy,
  PhoneForwarded,
  Info
} from 'lucide-react';

interface LandingPageProps {
  onOpenReportModal: () => void;
  onOpenTrackModal: (trackingId?: string) => void;
  onViewMap: () => void;
  onSelectIncident: (incident: Incident) => void;
}

// 8 Standard Reportable Hazard Categories
const CIVIC_CATEGORIES: {
  category: IncidentCategory;
  title: string;
  desc: string;
  icon: React.ReactNode;
  borderHover: string;
}[] = [
  {
    category: 'Pothole',
    title: 'Potholes & Craters',
    desc: 'Deep asphalt craters, sharp depressions, and hazardous potholes on roads.',
    icon: <Wrench className="w-5 h-5 text-orange-700" />,
    borderHover: 'hover:border-orange-400',
  },
  {
    category: 'Road Damage',
    title: 'Road Damage',
    desc: 'Cracked road surfaces, sunken asphalt, broken paver blocks, and curb damage.',
    icon: <Wrench className="w-5 h-5 text-amber-700" />,
    borderHover: 'hover:border-amber-400',
  },
  {
    category: 'Accident',
    title: 'Traffic Accidents',
    desc: 'Vehicular collisions, overturned heavy trucks, and crash debris blockages.',
    icon: <AlertTriangle className="w-5 h-5 text-rose-700" />,
    borderHover: 'hover:border-rose-400',
  },
  {
    category: 'Waterlogging',
    title: 'Waterlogging & Flooding',
    desc: 'Subway water accumulation, monsoon pooling, and flooded underpasses.',
    icon: <Droplets className="w-5 h-5 text-sky-700" />,
    borderHover: 'hover:border-sky-400',
  },
  {
    category: 'Traffic Signal Failure',
    title: 'Signal Malfunction',
    desc: 'Blacked-out signal lights, broken timers, and conflicting phase indicators.',
    icon: <AlertOctagon className="w-5 h-5 text-red-700" />,
    borderHover: 'hover:border-red-400',
  },
  {
    category: 'Road Blockage',
    title: 'Road Blockages',
    desc: 'Stalled heavy transport, construction debris, and illegal traffic barriers.',
    icon: <Construction className="w-5 h-5 text-amber-700" />,
    borderHover: 'hover:border-amber-400',
  },
  {
    category: 'Fallen Tree',
    title: 'Fallen Trees & Poles',
    desc: 'Uprooted monsoon trees, fallen branches, and damaged utility cables.',
    icon: <TreePine className="w-5 h-5 text-emerald-700" />,
    borderHover: 'hover:border-emerald-400',
  },
  {
    category: 'Other Road Hazard',
    title: 'Other Road Hazards',
    desc: 'Uncovered manholes, oil/chemical spills, and missing safety barriers.',
    icon: <HelpCircle className="w-5 h-5 text-slate-600" />,
    borderHover: 'hover:border-slate-400',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenReportModal,
  onOpenTrackModal,
  onViewMap,
  onSelectIncident,
}) => {
  const { incidents, statistics } = useIncidents();
  const { isAuthenticated, user } = useAuth();
  const [activeNav, setActiveNav] = useState('overview');

  const recentIncidents = incidents.slice(0, 4);

  const scrollToSection = (id: string) => {
    setActiveNav(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800 antialiased">
      {/* Public In-Page Section Anchors Navigation Strip */}
      <nav className="bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="font-bold text-xs text-teal-400 flex items-center gap-1.5 mr-2">
              <Compass className="w-3.5 h-3.5" />
              <span>MoveSmart Portal</span>
            </span>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'about', label: 'About MMR' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'categories', label: 'Hazard Types' },
              { id: 'map', label: 'Live Map' },
              { id: 'emergency', label: 'Emergency Guidance' },
              { id: 'contact', label: 'Contact Desk' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeNav === tab.id
                    ? 'bg-[#0F766E] text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onOpenTrackModal()}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3 h-3 text-teal-400" />
              <span>Track ID</span>
            </button>
            <button
              onClick={onOpenReportModal}
              className="px-3 py-1 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Report Hazard</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section (#overview) */}
      <section id="overview" className="relative bg-[#0B192C] text-white overflow-hidden py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Vision & Primary Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-950/80 border border-teal-800 text-teal-300 text-xs font-semibold tracking-wide">
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                <span>Mumbai Metropolitan Region • Civic Mobility Intelligence</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Report Road Hazards.<br />
                <span className="text-teal-400 font-bold">Make Every Commute Safer.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                MoveSmart bridges Mumbai commuters directly with municipal traffic command. Submit real-time hazard reports with geotagged GPS and photographic evidence to mobilize swift municipal resolution across the Western Express Highway, Eastern Express Highway, and arterial connectors.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onOpenReportModal}
                  className="px-5 py-3 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report Road Hazard</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenTrackModal()}
                  className="px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 flex items-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  <Search className="w-4 h-4 text-teal-400" />
                  <span>Track Complaint by ID</span>
                </button>

                <button
                  type="button"
                  onClick={onViewMap}
                  className="px-4 py-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-teal-400" />
                  <span>Live Mumbai Map</span>
                </button>
              </div>

              {/* Civic Operational Principles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Direct Civic Routing</p>
                    <p className="text-[11px] text-slate-400">Escalates directly to ward engineers</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileCheck2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Transparent Tracking</p>
                    <p className="text-[11px] text-slate-400">Track complaints with unique ID</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Radio className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">24/7 Operations</p>
                    <p className="text-[11px] text-slate-400">Monitored round the clock</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Operations Telemetry Panel */}
            <div className="lg:col-span-5">
              <div className="bg-[#0F1E33] rounded-xl border border-slate-800 p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Live Operations Telemetry
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                    MMR HQ Online
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/70">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Total Active Incidents</p>
                    <p className="text-2xl font-extrabold text-white font-mono mt-1">{statistics.total}</p>
                    <span className="text-[10px] text-slate-400">Across Mumbai Corridors</span>
                  </div>

                  <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/70">
                    <p className="text-[10px] uppercase font-bold text-amber-400">High / Critical Urgency</p>
                    <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">{statistics.criticalOrHighOpen}</p>
                    <span className="text-[10px] text-slate-400">Immediate Triage Queue</span>
                  </div>

                  <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/70">
                    <p className="text-[10px] uppercase font-bold text-emerald-400">Roadways Cleared</p>
                    <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{statistics.resolved}</p>
                    <span className="text-[10px] text-slate-400">Resolution Rate {statistics.resolutionRate}%</span>
                  </div>

                  <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/70">
                    <p className="text-[10px] uppercase font-bold text-blue-400">Avg Triage Speed</p>
                    <p className="text-2xl font-extrabold text-blue-400 font-mono mt-1">14m</p>
                    <span className="text-[10px] text-slate-400">Report to Verification</span>
                  </div>
                </div>

                {/* Instant Track Input Bar */}
                <div className="pt-1">
                  <label htmlFor="hero-track-input" className="block text-[11px] text-slate-300 mb-1.5 font-medium">
                    Have an existing tracking ID? Check live dispatch status:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="hero-track-input"
                      placeholder="e.g. MS-TRK-10101"
                      className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) onOpenTrackModal(val);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('hero-track-input') as HTMLInputElement;
                        if (el && el.value.trim()) onOpenTrackModal(el.value.trim());
                        else onOpenTrackModal();
                      }}
                      className="px-3.5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Track</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About MoveSmart & Mumbai Coverage (#about) */}
      <section id="about" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
            Civic Mandate & Regional Scope
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            About MoveSmart Mumbai
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            MoveSmart is an urban civic technology platform engineered to manage road hazards, flood obstructions, and transit bottlenecks across the <strong>Mumbai Metropolitan Region (MMR)</strong>. It integrates citizen crowd-sourcing with municipal dispatch squads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#0F766E] border border-teal-200 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">24 Municipal Wards Coverage</h3>
            <p className="text-slate-600 leading-relaxed">
              Full administrative routing covering all 24 Brihanmumbai Municipal Corporation (BMC) wards—from Ward A (Colaba/Fort) in South Mumbai to Ward T (Mulund) and Ward R-North (Dahisar).
            </p>
            <div className="pt-2 text-[11px] font-mono text-teal-800">
              Ward A through T • MCGM Integrated
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Arterial Highway Corridors</h3>
            <p className="text-slate-600 leading-relaxed">
              Real-time monitoring across the Western Express Highway (WEH), Eastern Express Highway (EEH), Sion-Panvel Expressway, JVLR, SCLR, Bandra-Worli Sea Link, and Mumbai Coastal Road.
            </p>
            <div className="pt-2 text-[11px] font-mono text-blue-800">
              WEH • EEH • Coastal Road • Freeway
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Verified Municipal Dispatch</h3>
            <p className="text-slate-600 leading-relaxed">
              Citizen hazard submissions are evaluated by Mumbai Traffic Operations Center controllers before mobilizing BMC dewatering pumps, towing cranes, or road restoration teams.
            </p>
            <div className="pt-2 text-[11px] font-mono text-amber-800">
              Zero Fake Dispatches • CCTV Validated
            </div>
          </div>
        </div>
      </section>

      {/* 3. Structured 4-Step Resolution Workflow (#how-it-works) */}
      <section id="how-it-works" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-200">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
            Municipal Operational Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            How Hazards Are Resolved in Mumbai
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Every submission transitions through four authenticated municipal stages to guarantee accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-[#0F766E] flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900">Citizen Report & GPS</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Commuters capture photographic evidence and drop an accurate GPS coordinate pin at the road hazard location.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900">Operations Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mumbai Traffic Operations Center controllers cross-reference reports with CCTV cameras and assign initial priority.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900">Municipal Unit Dispatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              BMC dewatering pumps, towing cranes, or ward road maintenance crews are mobilized to the site with live public updates.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h3 className="text-sm font-bold text-slate-900">Roadway Clearance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When the obstruction is resolved, the status is stamped with municipal timestamps, ensuring complete public auditability.
            </p>
          </div>
        </div>
      </section>

      {/* 4. 8 Hazard Categories Grid (#categories) */}
      <section id="categories" className="bg-slate-100/70 py-14 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                Civic Classification
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Reportable Urban Hazard Categories
              </h2>
              <p className="text-xs text-slate-500">Every hazard category routes automatically to the respective municipal division</p>
            </div>
            <button
              type="button"
              onClick={onOpenReportModal}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit Hazard</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CIVIC_CATEGORIES.map((cat) => (
              <div
                key={cat.category}
                onClick={onOpenReportModal}
                className={`bg-white p-5 rounded-xl border border-slate-200 shadow-xs transition-all text-left cursor-pointer group ${cat.borderHover}`}
              >
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 w-fit mb-3">
                  {cat.icon}
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                  {cat.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Live Mumbai Operations Map (#map) */}
      <section id="map" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E] animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Interactive Mumbai Operations Map</h2>
            </div>
            <p className="text-xs text-slate-500">
              Spatial visualization across South Mumbai, Western Suburbs, Eastern Suburbs, and Navi Mumbai corridors.
            </p>
          </div>
          <button
            type="button"
            onClick={onViewMap}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Open Dedicated Map View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs">
          <MumbaiMap
            incidents={incidents}
            onSelectIncident={onSelectIncident}
            heightClass="h-[480px]"
          />
        </div>
      </section>

      {/* 6. Recent Public Activity (#reports) */}
      <section id="reports" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Public Incident Activity</h3>
            <p className="text-xs text-slate-500">Public incident reports verified and tracked in the Mumbai operations queue</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-[#0F766E] transition-all cursor-pointer space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono font-bold text-[#0F766E]">{inc.trackingId || inc.id}</span>
                  <StatusBadge status={inc.status} size="sm" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{inc.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{inc.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span className="truncate max-w-[140px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span>{inc.location}</span>
                </span>
                <PriorityBadge priority={inc.priority} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Emergency Guidance & Disclaimers (#emergency) */}
      <section id="emergency" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-amber-500 text-white flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] uppercase tracking-wider mb-1">
                Critical Safety Notice
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-amber-950">
                Emergency Guidance & Official Disclaimer
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed mt-1">
                <strong>MoveSmart is NOT an emergency first-responder service.</strong> MoveSmart is an urban civic-infrastructure tracking and municipal dispatch platform. In the event of active vehicular accidents with injuries, fires, structural collapses, or life-threatening emergencies, do not wait for online ticket triage—call emergency emergency services immediately.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <a
              href="tel:112"
              className="p-3 bg-white rounded-xl border border-amber-200 hover:border-red-400 flex items-center gap-3 transition-colors text-slate-800"
            >
              <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                112
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">National Emergency</p>
                <p className="text-[10px] text-slate-500">Police, Fire & Medical</p>
              </div>
            </a>

            <a
              href="tel:100"
              className="p-3 bg-white rounded-xl border border-amber-200 hover:border-blue-400 flex items-center gap-3 transition-colors text-slate-800"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                100
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Police Control Room</p>
                <p className="text-[10px] text-slate-500">Mumbai Police Command</p>
              </div>
            </a>

            <a
              href="tel:1916"
              className="p-3 bg-white rounded-xl border border-amber-200 hover:border-teal-400 flex items-center gap-3 transition-colors text-slate-800"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                1916
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">BMC Disaster Control</p>
                <p className="text-[10px] text-slate-500">Monsoon & Flooding Desk</p>
              </div>
            </a>

            <a
              href="tel:108"
              className="p-3 bg-white rounded-xl border border-amber-200 hover:border-emerald-400 flex items-center gap-3 transition-colors text-slate-800"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                108
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Medical Ambulance</p>
                <p className="text-[10px] text-slate-500">Emergency Trauma Squad</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 8. Contact & Municipal Ward Liaison Desk (#contact) */}
      <section id="contact" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-200">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
            Civic Liaison
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Contact & Municipal Head Offices
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official physical headquarters and digital coordination channels for the Mumbai Metropolitan Region.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#0F766E]" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">BMC Municipal Head Office</h4>
            <p className="text-slate-600 leading-relaxed">
              Brihanmumbai Municipal Corporation Headquarters, Mahapalika Marg, Dhobi Talao, Fort, Mumbai, Maharashtra 400001
            </p>
            <div className="pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
              Civic Inquiries: 022-22620251
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Mumbai Traffic Police HQ</h4>
            <p className="text-slate-600 leading-relaxed">
              Traffic Police Headquarters, Sir Pochkhanawala Road, Worli, Mumbai, Maharashtra 400030
            </p>
            <div className="pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
              WhatsApp Traffic Helpline: +91 8454999999
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-700" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">MoveSmart Project Desk</h4>
            <p className="text-slate-600 leading-relaxed">
              Digital Grievance Cell: <span className="font-mono text-teal-800 font-semibold">grievance@movesmart.city</span><br />
              Technical & Architecture: <span className="font-mono text-teal-800 font-semibold">ops.desk@movesmart.city</span>
            </p>
            <div className="pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
              Response Window: Standard 24h SLA
            </div>
          </div>
        </div>
      </section>

      {/* 9. Municipal Civic Footer */}
      <footer className="mt-auto bg-[#0B192C] text-slate-400 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#0F766E] flex items-center justify-center text-white">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-base font-extrabold text-white tracking-tight">MoveSmart</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Mumbai Metropolitan Region urban mobility and road hazard dispatch platform. Connecting citizens and transit authorities for safer city journeys.
              </p>
            </div>

            {/* Citizen Services */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Citizen Services</h4>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <button onClick={onOpenReportModal} className="hover:text-teal-400 transition-colors cursor-pointer text-left">
                    Report Traffic Hazard
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenTrackModal()} className="hover:text-teal-400 transition-colors cursor-pointer text-left">
                    Track Complaint by ID
                  </button>
                </li>
                <li>
                  <button onClick={onViewMap} className="hover:text-teal-400 transition-colors cursor-pointer text-left">
                    Live Mumbai Operations Map
                  </button>
                </li>
              </ul>
            </div>

            {/* Emergency Helplines */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Emergency Helplines</h4>
              <ul className="space-y-2 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <PhoneCall className="w-3 h-3 text-red-400" />
                  <span>Police Control Room: <strong className="text-white">100 / 112</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <PhoneCall className="w-3 h-3 text-amber-400" />
                  <span>Traffic Police WhatsApp: <strong className="text-white">8454999999</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <PhoneCall className="w-3 h-3 text-blue-400" />
                  <span>BMC Disaster Helpline: <strong className="text-white">1916</strong></span>
                </li>
                <li className="flex items-center gap-1.5">
                  <PhoneCall className="w-3 h-3 text-emerald-400" />
                  <span>Medical Ambulance: <strong className="text-white">108</strong></span>
                </li>
              </ul>
            </div>

            {/* Architecture Telemetry */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">System Specifications</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Production architecture: Spring Boot 4 REST API, React 19, TypeScript, Leaflet OpenStreetMap GIS, and BCrypt JWT Authentication.
              </p>
              <div className="mt-2 text-[10px] text-slate-500 font-mono">
                API Endpoint: REST 8080 Active • TLS Encrypted
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© 2026 MoveSmart Mumbai. All rights reserved.</p>
            <p className="text-amber-400/90">
              Disclaimer: MoveSmart is not an emergency response service. In case of active accidents, dial 112 immediately.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
