import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { IncidentCategory, IncidentPriority } from '../../types/incident';
import { MUMBAI_PRESET_LOCATIONS } from '../../data/mumbaiLocations';
import { 
  AlertTriangle, 
  MapPin, 
  Send, 
  RotateCcw, 
  X, 
  Info, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone,
  Sparkles,
  Compass
} from 'lucide-react';

interface ReportIncidentFormProps {
  onSuccess?: (newIncidentId: string) => void;
  onCancel?: () => void;
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

const PRIORITIES: { value: IncidentPriority; label: string; desc: string }[] = [
  { value: 'Low', label: 'Low', desc: 'Minor inconvenience, no major stoppage' },
  { value: 'Medium', label: 'Medium', desc: 'Noticeable delays or pedestrian obstacle' },
  { value: 'High', label: 'High', desc: 'Significant bottleneck, single lane blocked' },
  { value: 'Critical', label: 'Critical', desc: 'Immediate collision, severe injury risk or total road blockage' },
];

export const ReportIncidentForm: React.FC<ReportIncidentFormProps> = ({ onSuccess, onCancel }) => {
  const { createIncident } = useIncidents();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('Traffic Congestion');
  const [priority, setPriority] = useState<IncidentPriority>('Medium');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [description, setDescription] = useState('');
  const [estimatedImpact, setEstimatedImpact] = useState('');
  
  // Reporter details
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preset location handler
  const handleSelectPreset = (presetName: string) => {
    const found = MUMBAI_PRESET_LOCATIONS.find((p) => p.name === presetName);
    if (found) {
      setLocation(`${found.name}, ${found.area}, Mumbai`);
      setLatitude(found.latitude.toString());
      setLongitude(found.longitude.toString());
      if (errors.location) {
        setErrors((prev) => ({ ...prev, location: '' }));
      }
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required (e.g. Broken water pipe near station)';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Please provide a descriptive title (at least 5 characters)';
    }

    if (!location.trim()) {
      newErrors.location = 'Specific street address or landmark in Mumbai is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Please describe what you observed so authorities can dispatch the right crew';
    } else if (description.trim().length < 15) {
      newErrors.description = 'Description must be at least 15 characters long';
    }

    if (!isAnonymous && !reporterName.trim()) {
      newErrors.reporterName = 'Please enter your name or check "Report anonymously"';
    }

    if (!isAnonymous && reporterEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail.trim())) {
      newErrors.reporterEmail = 'Please enter a valid email address';
    }

    if (latitude) {
      const latNum = Number(latitude);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        newErrors.latitude = 'Latitude must be a valid coordinate (-90 to 90)';
      }
    }
    if (longitude) {
      const lngNum = Number(longitude);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        newErrors.longitude = 'Longitude must be a valid coordinate (-180 to 180)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const created = createIncident({
        title: title.trim(),
        category,
        priority,
        location: location.trim(),
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        description: description.trim(),
        estimatedImpact: estimatedImpact.trim() || undefined,
        status: 'Reported',
        reporter: {
          name: isAnonymous ? 'Anonymous Citizen' : reporterName.trim(),
          phone: isAnonymous ? undefined : reporterPhone.trim() || undefined,
          email: isAnonymous ? undefined : reporterEmail.trim() || undefined,
          isAnonymous,
        },
      });

      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(created.id);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setCategory('Traffic Congestion');
    setPriority('Medium');
    setLocation('');
    setLatitude('');
    setLongitude('');
    setDescription('');
    setEstimatedImpact('');
    setReporterName('');
    setReporterPhone('');
    setReporterEmail('');
    setIsAnonymous(false);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category & Priority Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1D2939] mb-1.5">
            Issue Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as IncidentCategory)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#149688] focus:border-transparent cursor-pointer shadow-2xs"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1D2939] mb-1.5">
            Reported Urgency / Priority <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {PRIORITIES.map((p) => {
              const isSelected = priority === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? p.value === 'Critical'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : p.value === 'High'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : p.value === 'Medium'
                        ? 'bg-[#3478F6] text-white border-[#3478F6] shadow-xs'
                        : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title={p.desc}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-[11px] text-[#667085]">
            {PRIORITIES.find((p) => p.value === priority)?.desc}
          </p>
        </div>
      </div>

      {/* Incident Title */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1D2939] mb-1.5">
          Incident Summary / Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          placeholder="e.g. Major waterlogging blocking 2 lanes near Dadar TT Circle"
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#1D2939] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#149688] shadow-2xs ${
            errors.title ? 'border-red-500 bg-red-50/20' : 'border-slate-300 bg-white'
          }`}
        />
        {errors.title && <p className="mt-1 text-xs text-red-600 font-medium">{errors.title}</p>}
      </div>

      {/* Location with Quick Presets */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1D2939]">
            Location / Landmark (Mumbai) <span className="text-red-500">*</span>
          </label>
          <div className="text-[11px] text-slate-500">
            <span>Quick pick: </span>
            <select
              onChange={(e) => {
                if (e.target.value) handleSelectPreset(e.target.value);
              }}
              defaultValue=""
              className="text-[11px] font-semibold text-[#149688] bg-transparent border-0 underline cursor-pointer p-0 focus:ring-0"
            >
              <option value="" disabled>
                Select Popular Hub
              </option>
              {MUMBAI_PRESET_LOCATIONS.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
            }}
            placeholder="e.g. SV Road, opposite Bandra Talao, Bandra West"
            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-[#1D2939] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#149688] shadow-2xs ${
              errors.location ? 'border-red-500 bg-red-50/20' : 'border-slate-300 bg-white'
            }`}
          />
        </div>
        {errors.location && <p className="mt-1 text-xs text-red-600 font-medium">{errors.location}</p>}
      </div>

      {/* Optional Coordinates */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#149688]" />
            Optional Geographic Coordinates
          </span>
          <span className="text-[11px] text-slate-500 italic">
            Leave blank if unknown (will not be fabricated on map)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Latitude</label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => {
                setLatitude(e.target.value);
                if (errors.latitude) setErrors((prev) => ({ ...prev, latitude: '' }));
              }}
              placeholder="e.g. 19.0625"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-800 focus:ring-1 focus:ring-[#149688] outline-hidden"
            />
            {errors.latitude && <p className="mt-0.5 text-[10px] text-red-500">{errors.latitude}</p>}
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Longitude</label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => {
                setLongitude(e.target.value);
                if (errors.longitude) setErrors((prev) => ({ ...prev, longitude: '' }));
              }}
              placeholder="e.g. 72.8538"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-800 focus:ring-1 focus:ring-[#149688] outline-hidden"
            />
            {errors.longitude && <p className="mt-0.5 text-[10px] text-red-500">{errors.longitude}</p>}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1D2939] mb-1.5">
          Detailed Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
          }}
          placeholder="Describe what occurred, vehicles involved, traffic impact, and whether emergency services or cranes are needed..."
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#1D2939] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#149688] shadow-2xs ${
            errors.description ? 'border-red-500 bg-red-50/20' : 'border-slate-300 bg-white'
          }`}
        />
        {errors.description && <p className="mt-1 text-xs text-red-600 font-medium">{errors.description}</p>}
      </div>

      {/* Estimated Impact */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1D2939] mb-1.5">
          Estimated Commuter Impact (Optional)
        </label>
        <input
          type="text"
          value={estimatedImpact}
          onChange={(e) => setEstimatedImpact(e.target.value)}
          placeholder="e.g. 25-minute delay on northbound carriageway"
          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm text-[#1D2939] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#149688] shadow-2xs"
        />
      </div>

      {/* Reporter Information */}
      <div className="pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[#1D2939]">
            Reporter Details
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => {
                setIsAnonymous(e.target.checked);
                if (e.target.checked) {
                  setErrors((prev) => ({ ...prev, reporterName: '' }));
                }
              }}
              className="rounded-sm border-slate-300 text-[#149688] focus:ring-[#149688] h-4 w-4 cursor-pointer"
            />
            <span>Submit Anonymously</span>
          </label>
        </div>

        {!isAnonymous ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => {
                    setReporterName(e.target.value);
                    if (errors.reporterName) setErrors((prev) => ({ ...prev, reporterName: '' }));
                  }}
                  placeholder="Aarav Sharma"
                  className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs text-slate-800 ${
                    errors.reporterName ? 'border-red-500 bg-red-50/20' : 'border-slate-300 bg-white'
                  }`}
                />
              </div>
              {errors.reporterName && <p className="mt-0.5 text-[10px] text-red-500">{errors.reporterName}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Phone</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+91 98200 00000"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email (Updates)</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="citizen@mumbai.in"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#149688] flex-shrink-0" />
            <span>Reporting anonymously. Your personal identifiers will not be stored with this incident report.</span>
          </div>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Form</span>
        </button>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Transmitting...' : 'Submit Official Report'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
