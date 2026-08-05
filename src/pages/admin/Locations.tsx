// ============================================================================
// SmartTour — Admin Locations Page
// ============================================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Loader2,
  Mountain,
} from 'lucide-react';
import { getLocations, createLocation, updateLocation } from '../../services/dataService';
import { LOCATION_CATEGORIES, LOCATION_CATEGORY_MAP, TREK_DIFFICULTIES } from '../../constants';
import { createSlug, generateQrCodeId } from '../../utils';
import type { TouristLocation, LocationCategory, TrekDifficulty } from '../../types';

export default function AdminLocations() {
  const [locations, setLocations] = useState<TouristLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<TouristLocation | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<LocationCategory>('other');
  const [formDescription, setFormDescription] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<TrekDifficulty | ''>('');
  const [formDistance, setFormDistance] = useState('');
  const [formFacilities, setFormFacilities] = useState('');
  const [formImportantInfo, setFormImportantInfo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const data = await getLocations();
    setLocations(data);
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormName('');
    setFormCategory('other');
    setFormDescription('');
    setFormShortDesc('');
    setFormLat('');
    setFormLng('');
    setFormDifficulty('');
    setFormDistance('');
    setFormFacilities('');
    setFormImportantInfo('');
    setEditingLocation(null);
  };

  const openEditForm = (loc: TouristLocation) => {
    setEditingLocation(loc);
    setFormName(loc.name);
    setFormCategory(loc.category);
    setFormDescription(loc.description);
    setFormShortDesc(loc.shortDescription);
    setFormLat(loc.latitude.toString());
    setFormLng(loc.longitude.toString());
    setFormDifficulty(loc.difficulty || '');
    setFormDistance(loc.distance || '');
    setFormFacilities(loc.facilities.join(', '));
    setFormImportantInfo(loc.importantInfo || '');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const slug = createSlug(formName);
    const locationData: Partial<TouristLocation> = {
      name: formName,
      slug,
      category: formCategory,
      description: formDescription,
      shortDescription: formShortDesc,
      latitude: parseFloat(formLat),
      longitude: parseFloat(formLng),
      difficulty: formDifficulty as TrekDifficulty || undefined,
      distance: formDistance || undefined,
      facilities: formFacilities.split(',').map((f) => f.trim()).filter(Boolean),
      importantInfo: formImportantInfo || undefined,
      qrCodeId: editingLocation?.qrCodeId || generateQrCodeId(slug),
    };

    if (editingLocation) {
      await updateLocation(editingLocation.id, locationData);
    } else {
      await createLocation(locationData);
    }

    await fetchLocations();
    setShowForm(false);
    resetForm();
    setIsSaving(false);
  };

  const filteredLocations = locations.filter((l) =>
    !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Locations</h1>
          <p className="text-sm text-gray-500">{locations.length} tourist locations</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.map((loc) => {
          const catInfo = LOCATION_CATEGORY_MAP[loc.category];
          return (
            <div key={loc.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group">
              <div className="h-36 bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center overflow-hidden">
                {loc.images && loc.images[0] ? (
                  <img
                    src={loc.images[0]}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Mountain className="w-10 h-10 text-gray-400 opacity-40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                <div className="absolute top-2 left-2">
                  <span className="badge bg-white/90 text-gray-700 text-[10px] backdrop-blur-sm">{catInfo?.icon} {catInfo?.label}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{loc.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-1 mb-3">{loc.shortDescription}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <span>📋 {loc.reportCount} reports</span>
                  {loc.difficulty && <span>🥾 {loc.difficulty}</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(loc)}
                    className="flex-1 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowForm(false); resetForm(); }}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-xl z-50 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingLocation ? 'Edit Location' : 'Add Location'}
                  </h2>
                  <button onClick={() => { setShowForm(false); resetForm(); }} className="p-1.5 rounded-lg hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input value={formName} onChange={(e) => setFormName(e.target.value)} className="input-base" required placeholder="e.g., Bopdev Ghat" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as LocationCategory)} className="input-base">
                      {LOCATION_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
                    <input value={formShortDesc} onChange={(e) => setFormShortDesc(e.target.value)} className="input-base" required placeholder="One-line summary" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
                    <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="input-base resize-none" rows={3} required />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                      <input type="number" step="any" value={formLat} onChange={(e) => setFormLat(e.target.value)} className="input-base" required placeholder="18.4529" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                      <input type="number" step="any" value={formLng} onChange={(e) => setFormLng(e.target.value)} className="input-base" required placeholder="73.8774" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trek Difficulty</label>
                      <select value={formDifficulty} onChange={(e) => setFormDifficulty(e.target.value as TrekDifficulty | '')} className="input-base">
                        <option value="">Not applicable</option>
                        {TREK_DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
                      <input value={formDistance} onChange={(e) => setFormDistance(e.target.value)} className="input-base" placeholder="e.g., 6 km" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facilities (comma-separated)</label>
                    <input value={formFacilities} onChange={(e) => setFormFacilities(e.target.value)} className="input-base" placeholder="Parking, Trail Markers, Water" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Important Information</label>
                    <textarea value={formImportantInfo} onChange={(e) => setFormImportantInfo(e.target.value)} className="input-base resize-none" rows={2} placeholder="Safety warnings, best times to visit..." />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingLocation ? 'Update Location' : 'Create Location'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
