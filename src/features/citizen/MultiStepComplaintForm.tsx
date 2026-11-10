import React, { useState, useRef } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useAuth } from '../../context/AuthContext';
import { IncidentCategory, IncidentPriority } from '../../types/incident';
import { MUMBAI_PRESET_LOCATIONS } from '../../data/mumbaiLocations';
import { MumbaiMap } from '../../components/map/MumbaiMap';
import { apiService } from '../../services/apiService';
import { 
  AlertTriangle, 
  MapPin, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Compass, 
  X, 
  FileText, 
  Clock, 
  Car, 
  AlertOctagon, 
  HelpCircle, 
  Copy, 
  ExternalLink,
  Construction,
  Wrench,
  Droplets,
  Edit3,
  Loader2,
  Trash2,
  ShieldCheck
} from 'lucide-react';

interface MultiStepComplaintFormProps {
  onSuccess?: (trackingId: string, incidentId: string) => void;
  onCancel?: () => void;
  onTrackSubmitted?: (trackingId: string) => void;
}

const CATEGORIES: { value: IncidentCategory; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'Pothole', label: 'Pothole', icon: <Wrench className="w-4 h-4 text-orange-700" />, desc: 'Deep craters, asphalt cave-in, uneven road surface' },
  { value: 'Road Damage', label: 'Road Damage', icon: <Wrench className="w-4 h-4 text-amber-700" />, desc: 'Cracked asphalt, road depression, missing paver blocks' },
  { value: 'Accident', label: 'Accident', icon: <AlertTriangle className="w-4 h-4 text-rose-700" />, desc: 'Vehicle collision, overturned truck, injury hazard' },
  { value: 'Waterlogging', label: 'Waterlogging', icon: <Droplets className="w-4 h-4 text-blue-700" />, desc: 'Subway water accumulation, monsoon pooling, submerged lanes' },
  { value: 'Traffic Signal Failure', label: 'Traffic Signal Failure', icon: <AlertOctagon className="w-4 h-4 text-red-700" />, desc: 'Blacked-out signal, broken lights, conflicting indications' },
  { value: 'Road Blockage', label: 'Road Blockage', icon: <Construction className="w-4 h-4 text-amber-700" />, desc: 'Stalled heavy vehicles, construction debris, barrier failure' },
  { value: 'Fallen Tree', label: 'Fallen Tree', icon: <Construction className="w-4 h-4 text-emerald-700" />, desc: 'Uprooted tree or fallen branch obstructing roadway' },
  { value: 'Other Road Hazard', label: 'Other Road Hazard', icon: <HelpCircle className="w-4 h-4 text-slate-600" />, desc: 'Uncovered manhole, sharp blind turn, acute hazard' },
];

const PRIORITIES: { value: IncidentPriority; label: string; color: string; desc: string }[] = [
  { value: 'Low', label: 'Low Urgency', color: 'border-slate-300 text-slate-700', desc: 'Passable street, minor inconvenience, no injury hazard' },
  { value: 'Medium', label: 'Medium Urgency', color: 'border-blue-400 text-blue-700', desc: 'Noticeable commute bottleneck, single lane restriction' },
  { value: 'High', label: 'High Urgency', color: 'border-amber-400 text-amber-700', desc: 'Major corridor severely jammed, municipal diversion required' },
  { value: 'Critical', label: 'Critical / Emergency', color: 'border-red-500 text-red-700', desc: 'Total road blockage, accident with injury risk, live hazard' },
];

// Sample demo photos for fast 1-click evaluation
const SAMPLE_PHOTOS = [
  {
    name: 'Milan Subway Waterlogging',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Asphalt Pothole Crater',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Highway Traffic Gridlock',
    url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Construction Barrier Fallen',
    url: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=600&auto=format&fit=crop&q=80',
  },
];

export const MultiStepComplaintForm: React.FC<MultiStepComplaintFormProps> = ({
  onSuccess,
  onCancel,
  onTrackSubmitted,
}) => {
  const { createIncidentAsync, showToast, incidents } = useIncidents();
  const { user } = useAuth();

  // Wizard step (1 to 4)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Hazard Details
  const [category, setCategory] = useState<IncidentCategory>('Pothole');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IncidentPriority>('Medium');
  const [incidentTime, setIncidentTime] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  // Step 2: Location
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<string>('19.0760');
  const [longitude, setLongitude] = useState<string>('72.8777');
  const [isLocating, setIsLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<string>('');

  // Step 3: Evidence & Photo Upload
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoName, setPhotoName] = useState<string>('');
  const [photoSize, setPhotoSize] = useState<string>('');
  const [photoError, setPhotoError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4: Reporter & Confirmation
  const [reporterName, setReporterName] = useState(user?.fullName || '');
  const [reporterPhone, setReporterPhone] = useState(user?.phone || '');
  const [reporterEmail, setReporterEmail] = useState(user?.email || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [declarationChecked, setDeclarationChecked] = useState(true);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    trackingId: string;
    incidentId: string;
    title: string;
    category: string;
  } | null>(null);

  // Handle Geolocation with browser permission
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationNote('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationNote('Requesting browser location permission...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setLatitude(lat);
        setLongitude(lng);
        setLocationNote(`✓ Acquired GPS coordinates: ${lat}° N, ${lng}° E (+/- ${Math.round(pos.coords.accuracy)}m)`);
        if (!location) {
          setLocation(`GPS Location near (${lat}, ${lng}), Mumbai`);
        }
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationNote('Location permission was denied. You can click on the map or type your address manually.');
        } else {
          setLocationNote('Could not determine exact location. Please select on the map below.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Quick preset corridor selection
  const handleSelectPreset = (presetName: string) => {
    const found = MUMBAI_PRESET_LOCATIONS.find((p) => p.name.toLowerCase().includes(presetName.toLowerCase()));
    if (found) {
      setLocation(`${found.name}, ${found.area}`);
      setLatitude(found.latitude.toString());
      setLongitude(found.longitude.toString());
      setLocationNote(`Selected: ${found.name} (${found.area})`);
      if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
    }
  };

  // Handle Map Pin Click
  const handleMapLocationPicked = (lat: number, lng: number) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setLocationNote(`✓ Pin dropped at ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
    if (!location) {
      setLocation(`Mumbai Metropolitan Region (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
    }
  };

  // Handle File Upload for Evidence
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');

    // Format validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Invalid file format. Please upload JPEG, PNG, or WebP.');
      return;
    }

    // Size validation: max 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setPhotoError('File size exceeds the 5MB limit. Please upload a smaller photo.');
      return;
    }

    setPhotoName(file.name);
    setPhotoSize(`${(file.size / 1024).toFixed(0)} KB`);
    setUploadProgress(25);

    try {
      // 1. Upload to backend storage provider
      setUploadProgress(50);
      const res = await apiService.uploadPhoto(file);
      setUploadProgress(85);

      if (res.success && res.url) {
        setPhotoUrl(res.url);
        setUploadProgress(100);
        showToast('Photo uploaded to persistent storage!', 'success');
        setTimeout(() => setUploadProgress(null), 1000);
      } else {
        // Fallback to local Data URI if server upload is unconfigured or failed
        const reader = new FileReader();
        reader.onload = (readEv) => {
          if (readEv.target?.result) {
            setPhotoUrl(readEv.target.result as string);
            setUploadProgress(100);
            showToast('Photo attached locally as evidence', 'info');
            setTimeout(() => setUploadProgress(null), 1000);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Graceful fallback to Data URI
      const reader = new FileReader();
      reader.onload = (readEv) => {
        if (readEv.target?.result) {
          setPhotoUrl(readEv.target.result as string);
          setUploadProgress(100);
          setTimeout(() => setUploadProgress(null), 1000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    setPhotoName('');
    setPhotoSize('');
    setPhotoError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) {
      errs.title = 'Please provide an incident title';
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters long';
    }

    if (!description.trim()) {
      errs.description = 'Please describe the observed hazard';
    } else if (description.trim().length < 15) {
      errs.description = 'Please provide at least 15 characters of detail';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errs: { [key: string]: string } = {};
    if (!location.trim()) {
      errs.location = 'Please enter a Mumbai landmark or select a corridor';
    }

    if (latitude) {
      const latNum = Number(latitude);
      if (isNaN(latNum) || latNum < 18.5 || latNum > 19.6) {
        errs.latitude = 'Latitude must be within the Mumbai region (~18.5 to 19.6)';
      }
    }
    if (longitude) {
      const lngNum = Number(longitude);
      if (isNaN(lngNum) || lngNum < 72.7 || lngNum > 73.4) {
        errs.longitude = 'Longitude must be within the Mumbai region (~72.7 to 73.4)';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 4: Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errs: { [key: string]: string } = {};
    if (!isAnonymous && !reporterName.trim()) {
      errs.reporterName = 'Please enter your name or choose "Submit Anonymously"';
    }
    if (!declarationChecked) {
      errs.declaration = 'Please confirm that the submitted information is accurate';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        priority,
        location: location.trim(),
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        description: description.trim(),
        photoUrl: photoUrl || undefined,
        status: 'Submitted' as const,
        publicUpdate: 'Hazard registered in operations queue and awaiting verification.',
        reporterUserId: user?.id,
        reporter: {
          name: isAnonymous ? 'Anonymous Citizen' : (reporterName.trim() || user?.fullName || 'Citizen Commuter'),
          phone: isAnonymous ? undefined : (reporterPhone.trim() || user?.phone),
          email: isAnonymous ? undefined : (reporterEmail.trim() || user?.email),
          isAnonymous,
        },
      };

      const created = await createIncidentAsync(payload);

      setSubmissionSuccess({
        trackingId: created.trackingId || created.id,
        incidentId: created.id,
        title: created.title,
        category: created.category,
      });

      if (onSuccess) {
        onSuccess(created.trackingId || created.id, created.id);
      }
    } catch (err) {
      console.error('Failed to submit incident:', err);
      showToast('Error submitting incident to operations queue', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Confirmation Screen upon successful submission
  if (submissionSuccess) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center max-w-xl mx-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Hazard Report Logged Successfully
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            Thank you for keeping Mumbai safe!
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Your complaint has been logged in the Mumbai Traffic Operations Center and assigned to the response triage queue.
          </p>
        </div>

        {/* Unique Tracking ID Box */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-left">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Official Tracking ID:</span>
            <span className="font-mono text-slate-400">System Ref: {submissionSuccess.incidentId}</span>
          </div>

          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-teal-500/40 shadow-xs">
            <span className="font-mono text-lg sm:text-xl font-extrabold text-[#0F766E] tracking-wider">
              {submissionSuccess.trackingId}
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(submissionSuccess.trackingId);
                showToast(`Tracking ID ${submissionSuccess.trackingId} copied!`, 'success');
              }}
              className="px-3 py-1.5 bg-[#0F766E]/10 hover:bg-[#0F766E]/20 text-[#0F766E] font-bold text-xs rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Use this tracking ID to follow inspection, crew dispatch, and roadway clearance in real time.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onTrackSubmitted && (
            <button
              type="button"
              onClick={() => onTrackSubmitted(submissionSuccess.trackingId)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Track Live Status Now</span>
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Done & Return
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4-Step Stepper Header */}
      <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between max-w-lg mx-auto relative">
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0" />
          <div 
            className="absolute top-4 left-6 h-0.5 bg-[#0F766E] transition-all duration-300 z-0"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />

          {/* Step 1 */}
          <div className="flex flex-col items-center relative z-10">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                currentStep >= 1
                  ? 'bg-[#0F766E] text-white ring-4 ring-teal-50'
                  : 'bg-white text-slate-400 border border-slate-300'
              }`}
            >
              {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </button>
            <span className={`text-[11px] font-semibold mt-1 hidden sm:block ${currentStep === 1 ? 'text-[#0F766E]' : 'text-slate-500'}`}>
              Incident Details
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center relative z-10">
            <button
              type="button"
              onClick={() => { if (validateStep1()) setCurrentStep(2); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                currentStep >= 2
                  ? 'bg-[#0F766E] text-white ring-4 ring-teal-50'
                  : 'bg-white text-slate-400 border border-slate-300'
              }`}
            >
              {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </button>
            <span className={`text-[11px] font-semibold mt-1 hidden sm:block ${currentStep === 2 ? 'text-[#0F766E]' : 'text-slate-500'}`}>
              Location
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center relative z-10">
            <button
              type="button"
              onClick={() => { if (validateStep1() && validateStep2()) setCurrentStep(3); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                currentStep >= 3
                  ? 'bg-[#0F766E] text-white ring-4 ring-teal-50'
                  : 'bg-white text-slate-400 border border-slate-300'
              }`}
            >
              {currentStep > 3 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
            </button>
            <span className={`text-[11px] font-semibold mt-1 hidden sm:block ${currentStep === 3 ? 'text-[#0F766E]' : 'text-slate-500'}`}>
              Evidence
            </span>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center relative z-10">
            <button
              type="button"
              onClick={() => { if (validateStep1() && validateStep2()) setCurrentStep(4); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                currentStep === 4
                  ? 'bg-[#0F766E] text-white ring-4 ring-teal-50'
                  : 'bg-white text-slate-400 border border-slate-300'
              }`}
            >
              4
            </button>
            <span className={`text-[11px] font-semibold mt-1 hidden sm:block ${currentStep === 4 ? 'text-[#0F766E]' : 'text-slate-500'}`}>
              Review & Submit
            </span>
          </div>
        </div>
      </div>

      {/* STEP 1: Incident Details */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Select Hazard Classification <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    category === cat.value
                      ? 'border-[#0F766E] bg-teal-50/40 ring-1 ring-[#0F766E]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-md bg-slate-100 border border-slate-200/80 flex items-center justify-center">
                      {cat.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-900 leading-tight">{cat.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Short Summary Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Deep pothole on left lane near Milan Subway"
              className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F766E] ${
                errors.title ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Hazard Observation Details <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              placeholder="Describe lane obstructions, water depth, road damage, or traffic delay details..."
              className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F766E] ${
                errors.description ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>Minimum 15 characters required</span>
              <span>{description.length} chars</span>
            </div>
            {errors.description && <p className="text-[11px] text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Urgency & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Perceived Urgency / Severity
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IncidentPriority)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-[#0F766E] outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label} - {p.desc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Time Observed
              </label>
              <input
                type="datetime-local"
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-[#0F766E] outline-none"
              />
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setCurrentStep(2);
              }}
              className="ml-auto px-5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Next: Set Location</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Location & Interactive Map */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl flex items-start gap-3">
            <Compass className="w-5 h-5 text-[#0F766E] flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-slate-800">Select Location in Mumbai Metropolitan Region</p>
              <p className="text-slate-600 mt-0.5">
                Click anywhere on the interactive map below, acquire your GPS position, or type the nearest street landmark.
              </p>
            </div>
          </div>

          {/* Interactive Map Picker */}
          <div className="rounded-xl overflow-hidden border border-slate-300 shadow-xs">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <span className="font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
                Click map to drop pin:
              </span>
              <span className="font-mono text-slate-700">
                {latitude}° N, {longitude}° E
              </span>
            </div>
            <MumbaiMap
              incidents={incidents}
              allowPickLocation={true}
              pickedCoordinates={{
                lat: Number(latitude) || 19.0760,
                lng: Number(longitude) || 72.8777,
              }}
              onLocationPicked={handleMapLocationPicked}
              heightClass="h-[240px]"
              showFilters={false}
            />
          </div>

          {/* Geolocation Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>{isLocating ? 'Locating Your Device...' : 'Use My Current GPS Location'}</span>
            </button>

            {locationNote && (
              <span className="text-[11px] font-mono text-slate-600">
                {locationNote}
              </span>
            )}
          </div>

          {/* Quick Select Popular Mumbai Arterials */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Quick-Select Common Mumbai Corridors:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['Milan Subway', 'WEH Flyover', 'Bandra Reclamation', 'Sion Flyover', 'Saki Naka Junction', 'JVLR Connector', 'Dadar TT Circle'].map((pName) => (
                <button
                  key={pName}
                  type="button"
                  onClick={() => handleSelectPreset(pName)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
                >
                  {pName}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Address */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Street Landmark / Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
                }}
                placeholder="e.g. Western Express Highway, near Santacruz Domestic Airport Gate 1, Mumbai"
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F766E] ${
                  errors.location ? 'border-red-500' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.location && <p className="text-[11px] text-red-500 mt-1">{errors.location}</p>}
          </div>

          {/* Coordinates inputs */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Latitude (°N)
              </label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 19.0886"
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-md border border-slate-300 bg-white text-slate-900"
              />
              {errors.latitude && <p className="text-[10px] text-red-500 mt-0.5">{errors.latitude}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Longitude (°E)
              </label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 72.8428"
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-md border border-slate-300 bg-white text-slate-900"
              />
              {errors.longitude && <p className="text-[10px] text-red-500 mt-0.5">{errors.longitude}</p>}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateStep2()) setCurrentStep(3);
              }}
              className="px-5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Next: Attach Evidence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Photo Evidence Upload */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Upload Road Hazard Photo / Evidence (Optional but Recommended)
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Photographic proof accelerates verification and helps municipal response teams identify the required equipment.
            </p>

            {photoError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 mb-3">
                {photoError}
              </div>
            )}

            {/* Upload Dropzone */}
            {!photoUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#0F766E] rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  Click to browse or drop photograph here
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supported formats: JPEG, PNG, WebP (Max 5MB)
                </p>
              </div>
            ) : (
              /* Attached Photo Preview */
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={photoUrl}
                      alt="Uploaded evidence"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-200 shadow-2xs"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                        {photoName || 'Attached photograph evidence'}
                      </p>
                      {photoSize && <p className="text-[11px] font-mono text-slate-500">{photoSize}</p>}
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                        ✓ Evidence Attached
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Upload progress indicator */}
            {uploadProgress !== null && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Uploading to evidence server...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0F766E] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick 1-Click Sample Photos */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Or pick an evaluation sample photo:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PHOTOS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => {
                    setPhotoUrl(sample.url);
                    setPhotoName(sample.name);
                    setPhotoSize('Sample 600px');
                    setPhotoError('');
                    showToast(`Selected sample: ${sample.name}`, 'info');
                  }}
                  className="group rounded-lg border border-slate-200 overflow-hidden hover:border-[#0F766E] transition-all text-left cursor-pointer bg-white"
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-16 object-cover group-hover:scale-105 transition-transform"
                  />
                  <p className="p-1.5 text-[10px] font-medium text-slate-700 truncate">
                    {sample.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Next: Review & Submit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review and Submit */}
      {currentStep === 4 && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-150">
          <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
              <span className="font-bold text-slate-800">Final Verification Before Operations Dispatch</span>
            </div>
            <span className="text-[11px] text-slate-500">Step 4 of 4</span>
          </div>

          {/* Review Summary Cards with Edit shortcuts */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            {/* Header: Title & Category */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Incident</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">{title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    {category}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Priority: {priority}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-[#0F766E] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {/* Description */}
            <div className="pb-3 border-b border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-400">Observation</span>
              <p className="text-slate-700 mt-0.5 leading-relaxed">{description}</p>
            </div>

            {/* Location & GPS */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Location</span>
                <p className="font-semibold text-slate-800 mt-0.5">{location}</p>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  GPS: {latitude}° N, {longitude}° E
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-[#0F766E] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {/* Evidence Photo */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Photo Evidence</span>
                {photoUrl ? (
                  <div className="flex items-center gap-2 mt-1">
                    <img
                      src={photoUrl}
                      alt="Attached evidence"
                      className="w-12 h-12 rounded object-cover border border-slate-200"
                    />
                    <span className="text-[11px] text-slate-600">{photoName || 'Photograph attached'}</span>
                  </div>
                ) : (
                  <p className="text-slate-500 italic mt-0.5">No photograph attached</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-[#0F766E] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>

          {/* Reporter Identification */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Reporter Attribution</span>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded text-[#0F766E] focus:ring-[#0F766E]"
              />
              <span className="text-slate-700">Submit anonymously (hide your personal details from public map)</span>
            </label>

            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 bg-white"
                  />
                  {errors.reporterName && <p className="text-[10px] text-red-500 mt-0.5">{errors.reporterName}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Contact Phone (for dispatch clarifications)
                  </label>
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="+91 98200 00000"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 bg-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Legal declaration */}
          <div>
            <label className="flex items-start gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={declarationChecked}
                onChange={(e) => setDeclarationChecked(e.target.checked)}
                className="mt-0.5 rounded text-[#0F766E] focus:ring-[#0F766E]"
              />
              <span className="text-slate-600 leading-tight">
                I hereby declare that this report accurately describes an observed road hazard or obstruction in the Mumbai Metropolitan Region.
              </span>
            </label>
            {errors.declaration && <p className="text-[11px] text-red-500 mt-1">{errors.declaration}</p>}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Operations Queue...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Hazard Complaint</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
