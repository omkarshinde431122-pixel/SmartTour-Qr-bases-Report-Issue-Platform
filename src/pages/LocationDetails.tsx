// ============================================================================
// SmartTour — Location Details Page
// ============================================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  AlertTriangle,
  ArrowLeft,
  Mountain,
  Compass,
  Info,
  CheckCircle,
  QrCode,
} from 'lucide-react';
import { getLocationBySlug, getReports } from '../services/dataService';
import { LOCATION_CATEGORY_MAP, CATEGORY_MAP, STATUS_MAP, PRIORITY_MAP, TREKKING_ROUTES } from '../constants';
import type { TouristLocation, Report } from '../types';

const locationIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:#059669;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
    <div style="transform:rotate(45deg);color:white;font-size:16px;">📍</div>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

export default function LocationDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [location, setLocation] = useState<TouristLocation | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        const loc = await getLocationBySlug(slug);
        if (!loc) {
          setError('Location not found');
          return;
        }
        setLocation(loc);

        const allReports = await getReports({ locationId: loc.id });
        setReports(allReports);
      } catch (err) {
        setError('Failed to load location');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Location Not Found</h2>
          <p className="text-gray-500 mb-4">{error || 'This location does not exist.'}</p>
          <Link to="/explore" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            ← Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const catInfo = LOCATION_CATEGORY_MAP[location.category];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-64 sm:h-96 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
        {location.images && location.images[0] ? (
          <img
            src={location.images[0]}
            alt={location.name}
            className="absolute inset-0 w-full h-full object-cover opacity-85"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
            <Mountain className="w-24 h-24 opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="section-container">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Explore
            </Link>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-2xl flex-shrink-0">
                {catInfo?.icon}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">{location.name}</h1>
                <p className="text-sm text-white/60 mt-1">{location.shortDescription}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600" /> About
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">{location.description}</p>
            </section>

            {/* Quick Info */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="card p-4 text-center">
                <span className="text-xl mb-1 block">{catInfo?.icon}</span>
                <span className="text-xs text-gray-500">{catInfo?.label}</span>
              </div>
              {location.difficulty && (
                <div className="card p-4 text-center">
                  <span className="text-xl mb-1 block">🥾</span>
                  <span className="text-xs text-gray-500 capitalize">{location.difficulty}</span>
                </div>
              )}
              {location.distance && (
                <div className="card p-4 text-center">
                  <span className="text-xl mb-1 block">📏</span>
                  <span className="text-xs text-gray-500">{location.distance}</span>
                </div>
              )}
              <div className="card p-4 text-center">
                <span className="text-xl mb-1 block">📋</span>
                <span className="text-xs text-gray-500">{reports.length} reports</span>
              </div>
            </section>

            {/* Facilities */}
            {location.facilities.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" /> Facilities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {location.facilities.map((facility) => (
                    <span key={facility} className="badge bg-gray-100 text-gray-700 px-3 py-1.5 text-xs">
                      {facility}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Important Info */}
            {location.importantInfo && (
              <section className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Important Information
                </h3>
                <p className="text-sm text-amber-700 leading-relaxed">{location.importantInfo}</p>
              </section>
            )}

            {/* Reported Issues */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Reported Issues
                </h2>
                <Link
                  to={`/report?location=${location.slug}`}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  + Report New Issue
                </Link>
              </div>

              {reports.length === 0 ? (
                <div className="card p-8 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No issues reported at this location.</p>
                  <Link
                    to={`/report?location=${location.slug}`}
                    className="text-xs font-medium text-emerald-600 mt-2 inline-block"
                  >
                    Be the first to report
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => {
                    const cat = CATEGORY_MAP[report.category];
                    const status = STATUS_MAP[report.status];
                    const priority = PRIORITY_MAP[report.priority];
                    return (
                      <motion.div
                        key={report.id}
                        className="card p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-xl flex-shrink-0">{cat?.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold text-gray-900">{report.title}</h4>
                              <span
                                className="badge text-[10px] flex-shrink-0"
                                style={{ backgroundColor: status?.bgColor, color: status?.color }}
                              >
                                {status?.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{report.description}</p>
                            <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                              <span className="badge" style={{ backgroundColor: priority?.bgColor, color: priority?.color }}>
                                {priority?.label}
                              </span>
                              <span>{cat?.label}</span>
                              <span>·</span>
                              <span>{report.createdAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Mini Map */}
            <div className="card overflow-hidden">
              <div className="h-48">
                <MapContainer
                  center={[location.latitude, location.longitude]}
                  zoom={14}
                  className="w-full h-full z-0"
                  zoomControl={false}
                  dragging={false}
                  scrollWheelZoom={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {TREKKING_ROUTES.filter((r) => r.locationSlug === location.slug).map((route) => (
                    <Polyline
                      key={route.id}
                      positions={route.positions}
                      pathOptions={{ color: route.color, weight: 4, opacity: 0.8 }}
                    />
                  ))}
                  <Marker position={[location.latitude, location.longitude]} icon={locationIcon} />
                </MapContainer>
              </div>
              <div className="p-3 text-center space-y-2">
                <p className="text-xs text-gray-500">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors w-full justify-center"
                >
                  🗺️ Open in Google Maps
                </a>
              </div>
            </div>

            {/* QR Code */}
            <div className="card p-5 text-center">
              <QrCode className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">QR Code Available</h3>
              <p className="text-xs text-gray-500 mb-3">Scan the QR code at this location to quickly report issues.</p>
              <Link
                to={`/report?location=${location.slug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors w-full justify-center"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Report an Issue
              </Link>
            </div>

            {/* Nearby (placeholder) */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-500" /> Nearby Locations
              </h3>
              <p className="text-xs text-gray-500">Explore other tourist locations near {location.name}.</p>
              <Link
                to="/explore"
                className="text-xs font-medium text-emerald-600 mt-2 inline-block"
              >
                View on Map →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
