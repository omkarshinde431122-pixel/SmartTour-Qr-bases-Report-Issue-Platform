// ============================================================================
// SmartTour — Report Issue Page (QR Landing)
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  AlertTriangle,
  X,
  CheckCircle,
  Camera,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { getLocationBySlug, getLocations, createReport } from '../services/dataService';
import { analyzeComplaint } from '../services/aiService';
import { REPORT_CATEGORIES, REPORT_PRIORITIES, NETWORK_ISSUE_TYPES } from '../constants';
import { validateImageFile } from '../utils';
import type { TouristLocation, ReportCategory, ReportPriority } from '../types';

export default function Report() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const locationSlug = searchParams.get('location');

  // Location state
  const [location, setLocation] = useState<TouristLocation | null>(null);
  const [allLocations, setAllLocations] = useState<TouristLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(!!locationSlug);

  // Custom / Unlisted Location state (GPS)
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [customLocationName, setCustomLocationName] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState<ReportCategory | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [priority, setPriority] = useState<ReportPriority>('medium');
  const [networkProvider, setNetworkProvider] = useState('');
  const [networkIssueType, setNetworkIssueType] = useState('');

  // AI suggestion
  const [aiSuggestion, setAiSuggestion] = useState<{ category: ReportCategory; priority: ReportPriority; confidence: number } | null>(null);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load location from QR code slug
  useEffect(() => {
    const loadData = async () => {
      if (locationSlug) {
        setIsLoadingLocation(true);
        const loc = await getLocationBySlug(locationSlug);
        if (loc) {
          setLocation(loc);
          setSelectedLocationId(loc.id);
        }
        setIsLoadingLocation(false);
      }
      const locs = await getLocations();
      setAllLocations(locs);
    };
    loadData();
  }, [locationSlug]);

  // AI analysis when description changes
  useEffect(() => {
    if (description.length > 15 && title.length > 3) {
      const result = analyzeComplaint(title, description);
      if (result.confidence > 0.2) {
        setAiSuggestion(result);
        setShowAiSuggestion(true);
      }
    } else {
      setShowAiSuggestion(false);
    }
  }, [title, description]);

  // Image handling
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];
    const newErrors: string[] = [];

    files.forEach((file) => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        if (images.length + validFiles.length < 5) {
          validFiles.push(file);
          newPreviews.push(URL.createObjectURL(file));
        } else {
          newErrors.push('Maximum 5 images allowed');
        }
      } else {
        newErrors.push(validation.error || 'Invalid file');
      }
    });

    if (newErrors.length > 0) {
      setErrors((prev) => ({ ...prev, images: newErrors[0] }));
    } else {
      setErrors((prev) => {
        const { images: _, ...rest } = prev;
        return rest;
      });
    }

    setImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  }, [images.length]);

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const acceptAiSuggestion = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion.category);
      setPriority(aiSuggestion.priority);
      setShowAiSuggestion(false);
    }
  };

  const handleLocationChange = (val: string) => {
    setSelectedLocationId(val);
    if (val === 'other') {
      setIsCustomLocation(true);
    } else {
      setIsCustomLocation(false);
    }
  };

  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingGps(false);
      },
      (error) => {
        setIsGettingGps(false);
        setGpsError(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission denied. Please allow location access in your browser.'
            : 'Could not acquire GPS position. Please try again.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Form validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedLocationId && !location) {
      newErrors.location = 'Please select a location';
    } else if (selectedLocationId === 'other' && !customLocationName.trim()) {
      newErrors.customLocation = 'Please enter the name or landmark of the location';
    }
    if (!category) newErrors.category = 'Please select a category';
    if (!title.trim()) newErrors.title = 'Please enter a title';
    if (title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!description.trim()) newErrors.description = 'Please describe the issue';
    if (description.trim().length < 10) newErrors.description = 'Description must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let locId = 'custom-location';
      let locName = customLocationName.trim() || 'New / Unlisted Location';
      let lat = gpsCoordinates?.lat;
      let lng = gpsCoordinates?.lng;

      if (location) {
        locId = location.id;
        locName = location.name;
        lat = location.latitude;
        lng = location.longitude;
      } else if (selectedLocationId && selectedLocationId !== 'other') {
        const found = allLocations.find((l) => l.id === selectedLocationId);
        if (found) {
          locId = found.id;
          locName = found.name;
          lat = found.latitude;
          lng = found.longitude;
        }
      }

      const reportId = await createReport({
        locationId: locId,
        locationName: locName,
        category: category as ReportCategory,
        title: title.trim(),
        description: description.trim(),
        priority,
        latitude: lat,
        longitude: lng,
        networkProvider: category === 'network' ? networkProvider : undefined,
        networkIssueType: category === 'network' ? networkIssueType : undefined,
        aiSuggestedCategory: aiSuggestion?.category,
        aiSuggestedPriority: aiSuggestion?.priority,
      });

      navigate(`/report/success?id=${reportId}`);
    } catch (err) {
      setErrors({ submit: 'Failed to submit report. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="section-container max-w-2xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-2">
            Report an Issue
          </h1>
          <p className="text-gray-500 text-sm">
            Help improve tourist destinations by reporting problems you encounter.
          </p>
        </motion.div>

        {/* Location Banner */}
        {isLoadingLocation ? (
          <div className="card p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl skeleton" />
            <div className="flex-1">
              <div className="h-4 w-32 skeleton mb-1" />
              <div className="h-3 w-48 skeleton" />
            </div>
          </div>
        ) : location ? (
          <motion.div
            className="card p-4 mb-6 border-emerald-100 bg-emerald-50/50"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-medium">📍 Reporting at</p>
                <p className="font-semibold text-gray-900">{location.name}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
            </div>
          </motion.div>
        ) : null}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Location Selection (if not from QR) */}
          {!location && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className={`input-base ${errors.location ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                  aria-label="Select location"
                >
                  <option value="">Select a location</option>
                  {allLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                  <option value="other">📍 Other / New Location (Unlisted)</option>
                </select>
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
              </div>

              {/* Custom Location Inputs */}
              <AnimatePresence>
                {isCustomLocation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-3 overflow-hidden"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-emerald-800 mb-1">
                        Place Name / Landmark <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customLocationName}
                        onChange={(e) => setCustomLocationName(e.target.value)}
                        placeholder="e.g., Near Bopdev Ghat Waterfall / Trail Point B"
                        className={`input-base bg-white text-sm ${errors.customLocation ? 'border-red-300' : ''}`}
                      />
                      {errors.customLocation && (
                        <p className="text-xs text-red-500 mt-1">{errors.customLocation}</p>
                      )}
                    </div>

                    {/* Geolocation Capture Button */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-gray-700">Attach GPS Coordinates</span>
                        {gpsCoordinates && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Captured
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleGetGpsLocation}
                        disabled={isGettingGps}
                        className="w-full py-2 px-3 bg-white border border-emerald-300 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                      >
                        {isGettingGps ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Acquiring GPS Location...
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            {gpsCoordinates ? 'Re-capture My Location (GPS)' : 'Get My Current Location (GPS)'}
                          </>
                        )}
                      </button>

                      {gpsCoordinates && (
                        <div className="mt-2 p-2 bg-white/80 border border-emerald-100 rounded-lg text-center">
                          <p className="text-[11px] font-mono text-gray-600">
                            Lat: <strong>{gpsCoordinates.lat.toFixed(5)}</strong>, Lng: <strong>{gpsCoordinates.lng.toFixed(5)}</strong>
                          </p>
                        </div>
                      )}

                      {gpsError && (
                        <p className="text-xs text-red-500 mt-1.5">{gpsError}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {REPORT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-xl border text-center transition-all text-xs font-medium ${
                    category === cat.value
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-pressed={category === cat.value}
                >
                  <span className="text-lg block mb-1">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          {/* Network-specific fields */}
          <AnimatePresence>
            {category === 'network' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Network Issue Type</label>
                  <select
                    value={networkIssueType}
                    onChange={(e) => setNetworkIssueType(e.target.value)}
                    className="input-base"
                  >
                    <option value="">Select type</option>
                    {NETWORK_ISSUE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Network Provider (optional)</label>
                  <input
                    type="text"
                    value={networkProvider}
                    onChange={(e) => setNetworkProvider(e.target.value)}
                    placeholder="e.g., Jio, Airtel, Vi, BSNL, All providers"
                    className="input-base"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Trekking route is difficult to identify"
              className={`input-base ${errors.title ? 'border-red-300' : ''}`}
              maxLength={100}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail. Where exactly is the problem? How severe is it?"
              rows={4}
              className={`input-base resize-none ${errors.description ? 'border-red-300' : ''}`}
              maxLength={1000}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-xs text-red-500">{errors.description}</p>
              ) : <span />}
              <span className="text-xs text-gray-400">{description.length}/1000</span>
            </div>
          </div>

          {/* AI Suggestion */}
          <AnimatePresence>
            {showAiSuggestion && aiSuggestion && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="overflow-hidden"
              >
                <div className="card p-4 border-blue-100 bg-blue-50/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-blue-800 mb-1">AI Suggestion</p>
                      <p className="text-xs text-blue-700">
                        Category: <strong>{REPORT_CATEGORIES.find(c => c.value === aiSuggestion.category)?.label}</strong>
                        {' · '}
                        Priority: <strong className="capitalize">{aiSuggestion.priority}</strong>
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={acceptAiSuggestion}
                        className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAiSuggestion(false)}
                        className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="flex gap-2">
              {REPORT_PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                    priority === p.value
                      ? 'ring-2'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  style={priority === p.value ? { borderColor: p.color, backgroundColor: p.bgColor, color: p.color, ['--tw-ring-color' as string]: p.color + '40' } : {}}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Upload Photos <span className="text-gray-400">(optional, max 5)</span>
            </label>
            <div className="space-y-3">
              {/* Preview Grid */}
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={preview} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove image ${idx + 1}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {images.length < 5 && (
                <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors cursor-pointer">
                  <Camera className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {images.length === 0 ? 'Add photos' : 'Add more photos'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {errors.images && <p className="text-xs text-red-500 mt-1">{errors.images}</p>}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Submit Report
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
