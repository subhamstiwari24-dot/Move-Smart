import React, { useEffect, useRef, useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { Incident, IncidentPriority } from '../../types/incident';
import { MUMBAI_CENTER, DEFAULT_ZOOM } from '../../data/mumbaiLocations';
import { 
  Maximize2, 
  MapPin, 
  Navigation, 
  Layers, 
  AlertTriangle, 
  Info,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  X
} from 'lucide-react';
import L from 'leaflet';

interface MumbaiMapProps {
  incidents: Incident[];
  selectedIncidentId?: string | null;
  onSelectIncident?: (incident: Incident) => void;
  heightClass?: string;
  allowPickLocation?: boolean;
  onLocationPicked?: (lat: number, lng: number, approximateName?: string) => void;
  pickedCoordinates?: { lat: number; lng: number } | null;
  showFilters?: boolean;
}

export const MumbaiMap: React.FC<MumbaiMapProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  heightClass = 'h-[500px]',
  allowPickLocation = false,
  onLocationPicked,
  pickedCoordinates,
  showFilters = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickedMarkerRef = useRef<L.Marker | null>(null);

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activePriorityFilter, setActivePriorityFilter] = useState<string>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [tileError, setTileError] = useState<boolean>(false);
  const [showUnmappedModal, setShowUnmappedModal] = useState<boolean>(false);

  // Compute explicit inline styles to guarantee Leaflet container never collapses to 0 height
  const getHeightStyle = () => {
    if (heightClass.includes('640')) return { height: '640px', minHeight: '640px', width: '100%' };
    if (heightClass.includes('520')) return { height: '520px', minHeight: '520px', width: '100%' };
    if (heightClass.includes('500')) return { height: '500px', minHeight: '500px', width: '100%' };
    if (heightClass.includes('360')) return { height: '360px', minHeight: '360px', width: '100%' };
    if (heightClass.includes('340')) return { height: '340px', minHeight: '340px', width: '100%' };
    return { height: '500px', minHeight: '500px', width: '100%' };
  };

  // Filter only incidents that have valid coordinates
  const validCoordinateIncidents = useMemo(() => {
    return incidents.filter(
      (inc) =>
        typeof inc.latitude === 'number' &&
        typeof inc.longitude === 'number' &&
        !isNaN(inc.latitude) &&
        !isNaN(inc.longitude) &&
        (activeCategoryFilter === 'all' || inc.category === activeCategoryFilter) &&
        (activePriorityFilter === 'all' || inc.priority === activePriorityFilter) &&
        (activeStatusFilter === 'all' || inc.status === activeStatusFilter)
    );
  }, [incidents, activeCategoryFilter, activePriorityFilter, activeStatusFilter]);

  // Unmapped incidents
  const unmappedIncidents = useMemo(() => {
    return incidents.filter(
      (inc) =>
        typeof inc.latitude !== 'number' ||
        typeof inc.longitude !== 'number' ||
        isNaN(inc.latitude) ||
        isNaN(inc.longitude)
    );
  }, [incidents]);

  // Create customized HTML div icons based on priority & status
  const createMarkerIcon = (priority: IncidentPriority, isResolved: boolean, isSelected: boolean) => {
    let bgColor = '#0F766E';
    let pulseClass = '';
    let badgeText = priority.charAt(0);

    if (isResolved) {
      bgColor = '#15803D'; // Emerald
      badgeText = '✓';
    } else {
      switch (priority) {
        case 'Critical':
          bgColor = '#DC2626'; // Red
          pulseClass = 'pulse-marker-critical';
          break;
        case 'High':
          bgColor = '#EA580C'; // Orange
          break;
        case 'Medium':
          bgColor = '#3478F6'; // Blue
          break;
        case 'Low':
        default:
          bgColor = '#64748B'; // Slate
          break;
      }
    }

    const size = isSelected ? 36 : 28;
    const border = isSelected ? 'border-3 border-[#0B192C] shadow-xl' : 'border-2 border-white shadow-md';

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-115" style="width: ${size}px; height: ${size}px;">
        <div class="w-full h-full rounded-full flex items-center justify-center font-bold text-white text-xs ${border} ${pulseClass}" style="background-color: ${bgColor};">
          ${badgeText}
        </div>
        ${
          isSelected
            ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-[#0B192C] flex items-center justify-center text-[8px] font-black">★</span>'
            : ''
        }
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let resizeObserver: ResizeObserver | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (!mapInstanceRef.current) {
      // Clear any prior Leaflet container id if remounting
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const map = L.map(mapContainerRef.current, {
        center: MUMBAI_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: false,
      });

      // Primary OSM tile layer with fallback to CartoDB Voyager
      let fallbackTried = false;
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; OpenStreetMap contributors',
      });

      tileLayer.on('tileerror', () => {
        setTileError(true);
        if (!fallbackTried) {
          fallbackTried = true;
          tileLayer.setUrl('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png');
        }
      });

      tileLayer.addTo(map);

      // Attribution control in bottom right
      L.control
        .attribution({
          position: 'bottomright',
          prefix: false,
        })
        .addAttribution('© <a href="https://openstreetmap.org" target="_blank" rel="noreferrer">OpenStreetMap</a> | MoveSmart Mumbai')
        .addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Handle map click for location picking
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (allowPickLocation && onLocationPicked) {
          const { lat, lng } = e.latlng;
          onLocationPicked(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
        }
      });

      // Force initial size calculation
      map.invalidateSize();
      timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      // Listen to resize events
      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        });
        resizeObserver.observe(mapContainerRef.current);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Update Markers when incidents or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    // Refresh map canvas bounds in case tab changed
    mapInstanceRef.current.invalidateSize();
    markersLayerRef.current.clearLayers();

    validCoordinateIncidents.forEach((inc) => {
      if (typeof inc.latitude !== 'number' || typeof inc.longitude !== 'number') return;

      const isSelected = selectedIncidentId === inc.id;
      const isResolved = inc.status === 'Resolved';
      const icon = createMarkerIcon(inc.priority, isResolved, isSelected);

      const marker = L.marker([inc.latitude, inc.longitude], { icon });

      // Create rich popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 max-w-[270px] text-left';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
          <span class="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">${inc.id}</span>
          <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            inc.status === 'Resolved'
              ? 'bg-emerald-50 text-[#15803D] border border-emerald-200'
              : inc.status === 'In Progress'
              ? 'bg-amber-50 text-[#EA580C] border border-amber-200'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          }">${inc.status}</span>
        </div>
        <h4 id="view-title-${inc.id}" class="font-bold text-sm text-slate-900 leading-tight mb-1.5 cursor-pointer hover:text-[#0F766E] transition-colors" title="Click to inspect details">${inc.title}</h4>
        <p class="text-xs text-slate-500 mb-2 line-clamp-2">${inc.description}</p>
        <div class="text-[11px] text-slate-600 mb-2 space-y-1">
          <div class="flex items-center gap-1.5 font-medium text-slate-700">
            <svg class="w-3.5 h-3.5 text-[#0F766E] flex-shrink-0 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span class="truncate">${inc.location}</span>
          </div>
          <div class="flex items-center gap-2 text-slate-500">
            <span>Priority: <strong class="${
              inc.priority === 'Critical' ? 'text-rose-600 font-bold' : inc.priority === 'High' ? 'text-amber-600 font-bold' : 'text-slate-700'
            }">${inc.priority}</strong></span>
            <span>•</span>
            <span>${inc.category}</span>
          </div>
        </div>
        <button id="view-incident-${inc.id}" class="w-full mt-2 py-1.5 px-3 bg-[#0B192C] hover:bg-[#0F766E] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
          Inspect Details
        </button>
      `;

      const triggerSelect = (e?: Event) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (onSelectIncident) {
          onSelectIncident(inc);
          marker.closePopup();
        }
      };

      const btn = popupContent.querySelector(`#view-incident-${inc.id}`);
      if (btn) btn.addEventListener('click', triggerSelect);
      const titleEl = popupContent.querySelector(`#view-title-${inc.id}`);
      if (titleEl) titleEl.addEventListener('click', triggerSelect);

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const liveBtn = document.getElementById(`view-incident-${inc.id}`);
        if (liveBtn) liveBtn.onclick = triggerSelect;
        const liveTitle = document.getElementById(`view-title-${inc.id}`);
        if (liveTitle) liveTitle.onclick = triggerSelect;
      });

      // Double-click marker directly opens details modal
      marker.on('dblclick', (e) => {
        L.DomEvent.stopPropagation(e);
        triggerSelect();
      });

      marker.addTo(markersLayerRef.current!);

      // Auto-open if selected
      if (isSelected && mapInstanceRef.current) {
        mapInstanceRef.current.setView([inc.latitude, inc.longitude], 14, { animate: true });
        marker.openPopup();
      }
    });
  }, [validCoordinateIncidents, selectedIncidentId, onSelectIncident]);

  // Handle Picked Marker (in coordinate selection mode)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (pickedCoordinates && typeof pickedCoordinates.lat === 'number' && typeof pickedCoordinates.lng === 'number') {
      const pinIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-[#0B192C] border-2 border-white shadow-xl flex items-center justify-center text-teal-400">
              <svg class="w-4 h-4 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
          </div>
        `,
        className: 'picked-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (pickedMarkerRef.current) {
        pickedMarkerRef.current.setLatLng([pickedCoordinates.lat, pickedCoordinates.lng]);
      } else {
        pickedMarkerRef.current = L.marker([pickedCoordinates.lat, pickedCoordinates.lng], {
          icon: pinIcon,
          zIndexOffset: 1000,
        }).addTo(mapInstanceRef.current);
      }
      mapInstanceRef.current.panTo([pickedCoordinates.lat, pickedCoordinates.lng]);
    } else if (pickedMarkerRef.current) {
      pickedMarkerRef.current.remove();
      pickedMarkerRef.current = null;
    }
  }, [pickedCoordinates]);

  // Fit bounds: includes every mapped incident in the current filtered dataset
  const handleFitMarkers = () => {
    if (!mapInstanceRef.current || validCoordinateIncidents.length === 0) {
      mapInstanceRef.current?.setView(MUMBAI_CENTER, DEFAULT_ZOOM, { animate: true });
      return;
    }

    const latLngs = validCoordinateIncidents
      .filter((i) => typeof i.latitude === 'number' && typeof i.longitude === 'number')
      .map((i) => [i.latitude!, i.longitude!] as [number, number]);

    if (latLngs.length === 1) {
      mapInstanceRef.current.setView(latLngs[0], 14, { animate: true });
    } else if (latLngs.length > 1) {
      const bounds = L.latLngBounds(latLngs);
      mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 14, animate: true });
    }
  };

  // Center: returns to default Mumbai map view
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(MUMBAI_CENTER, DEFAULT_ZOOM, { animate: true });
      mapInstanceRef.current.invalidateSize();
    }
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200/90 shadow-2xs bg-white">
      {/* Map Header / Filters Bar */}
      {showFilters && (
        <div className="p-3 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Mumbai Geofence</span>
            </span>
            <span className="bg-teal-50 text-[#0F766E] border border-teal-200 px-2 py-0.5 rounded-md font-medium">
              {validCoordinateIncidents.length} mapped
            </span>
            {unmappedIncidents.length > 0 && (
              <button
                type="button"
                onClick={() => setShowUnmappedModal(true)}
                className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1"
                title="Click to view unmapped incidents without GPS"
              >
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>{unmappedIncidents.length} unmapped</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {/* Category Filter */}
            <select
              value={activeCategoryFilter}
              onChange={(e) => setActiveCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#0F766E] outline-none cursor-pointer"
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

            {/* Priority Filter */}
            <select
              value={activePriorityFilter}
              onChange={(e) => setActivePriorityFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#0F766E] outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical (Red)</option>
              <option value="High">High (Orange)</option>
              <option value="Medium">Medium (Blue)</option>
              <option value="Low">Low (Slate)</option>
            </select>

            {/* Status Filter */}
            <select
              value={activeStatusFilter}
              onChange={(e) => setActiveStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#0F766E] outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved (Green)</option>
            </select>

            {/* Reset Filters Shortcut */}
            {(activeCategoryFilter !== 'all' || activePriorityFilter !== 'all' || activeStatusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setActiveCategoryFilter('all');
                  setActivePriorityFilter('all');
                  setActiveStatusFilter('all');
                }}
                className="text-[11px] font-bold text-[#0F766E] hover:underline px-1 cursor-pointer"
              >
                Reset
              </button>
            )}

            {/* Controls */}
            <button
              type="button"
              onClick={handleFitMarkers}
              title="Fit all filtered incidents on map"
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#0F766E]" />
              <span className="hidden sm:inline">Fit All</span>
            </button>
            <button
              type="button"
              onClick={handleResetView}
              title="Center on Mumbai"
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <Navigation className="w-3.5 h-3.5 text-[#3478F6]" />
              <span className="hidden sm:inline">Center</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Map Canvas Wrapper with Explicit Height */}
      <div className="relative w-full" style={getHeightStyle()}>
        <div 
          ref={mapContainerRef} 
          className={`w-full ${heightClass}`} 
          style={getHeightStyle()}
        />

        {/* Tile loading fallback notice */}
        {tileError && (
          <div className="absolute top-3 left-3 z-20 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Map tiles loading via CDN fallback. Markers remain fully operational.</span>
          </div>
        )}

        {/* Map Legend Overlay matching exact marker palette & badges */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 shadow-md text-[11px] max-w-[240px] hidden sm:block">
          <p className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Operational Marker Legend</span>
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-700 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#DC2626] text-white font-bold flex items-center justify-center text-[8px]">C</span>
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#EA580C] text-white font-bold flex items-center justify-center text-[8px]">H</span>
              <span>High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#3478F6] text-white font-bold flex items-center justify-center text-[8px]">M</span>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#64748B] text-white font-bold flex items-center justify-center text-[8px]">L</span>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-slate-100">
              <span className="w-3.5 h-3.5 rounded-full bg-[#15803D] text-white font-bold flex items-center justify-center text-[8px]">✓</span>
              <span>Resolved / Cleared</span>
            </div>
          </div>
          <p className="mt-1.5 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
            *Illustrative Mumbai sample coordinates
          </p>
        </div>

        {/* Location Picker Prompt (when in pick mode) */}
        {allowPickLocation && (
          <div className="absolute top-3 right-3 z-20 bg-[#0B192C] text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-ping" />
            <span>Click any point on the map to set incident coordinates</span>
          </div>
        )}
      </div>

      {/* Unmapped Incidents Modal */}
      {showUnmappedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 bg-[#0B192C] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Unmapped Reports ({unmappedIncidents.length})</h3>
              </div>
              <button
                onClick={() => setShowUnmappedModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 leading-relaxed">
              These reports do not have GPS coordinates. To maintain data integrity, they are omitted from the map until coordinates are assigned.
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-slate-100 flex-1 space-y-2.5">
              {unmappedIncidents.map((inc) => (
                <div key={inc.id} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-800">{inc.id}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        {inc.priority}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 truncate">{inc.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{inc.location}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (onSelectIncident) {
                        onSelectIncident(inc);
                      }
                      setShowUnmappedModal(false);
                    }}
                    className="px-2.5 py-1 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-md transition-colors cursor-pointer flex-shrink-0"
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
