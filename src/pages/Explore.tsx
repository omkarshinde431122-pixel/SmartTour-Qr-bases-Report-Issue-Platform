// ============================================================================
// SmartTour — Explore Page (Interactive Map)
// ============================================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Search,
  List,
  Map as MapIcon,
  AlertTriangle,
} from 'lucide-react';
import { getLocations } from '../services/dataService';
import { LOCATION_CATEGORY_MAP, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, TREKKING_ROUTES } from '../constants';
import type { TouristLocation, LocationCategory } from '../types';

// Custom marker icon
function createMarkerIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;">
      <div style="transform:rotate(45deg);color:white;font-size:14px;">📍</div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

// Fly to location on map
function FlyToLocation({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function Explore() {
  const [locations, setLocations] = useState<TouristLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | ''>('');
  const [showList, setShowList] = useState(false);
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getLocations();
        setLocations(data);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      !searchQuery ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || loc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Object.entries(LOCATION_CATEGORY_MAP);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">Explore Locations</h1>
              <p className="text-sm text-gray-500">{filteredLocations.length} tourist locations</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-base pl-9 py-2 text-sm"
                  aria-label="Search locations"
                />
              </div>

              {/* Category filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as LocationCategory | '')}
                className="input-base py-2 text-sm w-auto"
                aria-label="Filter by category"
              >
                <option value="">All Types</option>
                {categories.map(([key, info]) => (
                  <option key={key} value={key}>{info.icon} {info.label}</option>
                ))}
              </select>

              {/* Toggle view */}
              <button
                onClick={() => setShowList(!showList)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors sm:hidden"
                aria-label={showList ? 'Show map' : 'Show list'}
              >
                {showList ? <MapIcon className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map + List */}
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Map */}
        <div className={`flex-1 relative ${showList ? 'hidden sm:block' : ''}`}>
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading map...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={MAP_DEFAULT_CENTER}
              zoom={MAP_DEFAULT_ZOOM}
              className="w-full h-full z-0"
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FlyToLocation center={flyTo} />

              {/* Trekking Route Polylines */}
              {TREKKING_ROUTES.map((route) => (
                <Polyline
                  key={route.id}
                  positions={route.positions}
                  pathOptions={{
                    color: route.color,
                    weight: 5,
                    opacity: 0.8,
                    dashArray: '8, 8',
                  }}
                >
                  <Popup>
                    <div className="p-2 text-center">
                      <p className="font-semibold text-xs text-gray-900">🥾 {route.name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{route.distance} · {route.estimatedTime}</p>
                    </div>
                  </Popup>
                </Polyline>
              ))}

              {filteredLocations.map((loc) => {
                const catInfo = LOCATION_CATEGORY_MAP[loc.category];
                return (
                  <Marker
                    key={loc.id}
                    position={[loc.latitude, loc.longitude]}
                    icon={createMarkerIcon(catInfo?.color || '#059669')}
                  >
                    <Popup>
                      <div className="p-3 min-w-[240px]">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{loc.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap ml-2">
                            {catInfo?.icon} {catInfo?.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 leading-relaxed">{loc.shortDescription}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                          {loc.reportCount > 0 && (
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {loc.reportCount} reports
                            </span>
                          )}
                          {loc.difficulty && (
                            <span>🥾 {loc.difficulty}</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex gap-1.5">
                            <Link
                              to={`/location/${loc.slug}`}
                              className="flex-1 text-center px-2.5 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              View Details
                            </Link>
                            <Link
                              to={`/report?location=${loc.slug}`}
                              className="flex-1 text-center px-2.5 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Report Issue
                            </Link>
                          </div>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-center px-2.5 py-1 text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                          >
                            🗺️ Directions on Google Maps
                          </a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>

        {/* Sidebar List */}
        <div className={`w-full sm:w-80 lg:w-96 bg-white border-l border-gray-100 overflow-y-auto ${showList ? '' : 'hidden sm:block'}`}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              {filteredLocations.length} Location{filteredLocations.length !== 1 ? 's' : ''}
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {filteredLocations.map((loc) => {
              const catInfo = LOCATION_CATEGORY_MAP[loc.category];
              return (
                <div
                  key={loc.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => {
                    setFlyTo([loc.latitude, loc.longitude]);
                    setShowList(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    {loc.images && loc.images[0] ? (
                      <img
                        src={loc.images[0]}
                        alt={loc.name}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100 shadow-sm"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                        style={{ backgroundColor: `${catInfo?.color}15` }}
                      >
                        {catInfo?.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {loc.name}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{loc.shortDescription}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                        <span className="badge text-[10px]" style={{ backgroundColor: catInfo?.color + '15', color: catInfo?.color }}>
                          {catInfo?.label}
                        </span>
                        {loc.reportCount > 0 && (
                          <span>{loc.reportCount} reports</span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/location/${loc.slug}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-emerald-600 font-medium whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View →
                    </Link>
                  </div>
                </div>
              );
            })}

            {filteredLocations.length === 0 && (
              <div className="p-8 text-center">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No locations found.</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
