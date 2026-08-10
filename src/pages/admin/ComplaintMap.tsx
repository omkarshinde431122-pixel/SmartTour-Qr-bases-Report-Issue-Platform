// ============================================================================
// SmartTour — Admin Complaint Map Page
// ============================================================================

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';
import { getReports, getLocations } from '../../services/dataService';
import { STATUS_MAP, CATEGORY_MAP, PRIORITY_MAP, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '../../constants';
import type { Report } from '../../types';
import { formatDateTime } from '../../utils';

function createComplaintIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
      <div style="color:white;font-size:12px;">!</div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export default function AdminComplaintMap() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [reportsData, locationsData] = await Promise.all([getReports(), getLocations()]);
      // Assign coordinates from location for display
      const reportsWithCoords = reportsData.map((r) => {
        if (!r.latitude || !r.longitude) {
          const loc = locationsData.find((l) => l.id === r.locationId);
          if (loc) {
            return {
              ...r,
              latitude: loc.latitude + (Math.random() - 0.5) * 0.005,
              longitude: loc.longitude + (Math.random() - 0.5) * 0.005,
            };
          }
        }
        return r;
      });
      setReports(reportsWithCoords);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-display font-bold text-gray-900">Complaint Map</h1>
        <p className="text-sm text-gray-500">{reports.length} complaints displayed on map</p>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 flex flex-wrap gap-4 text-xs">
        <span className="font-semibold text-gray-700">Status Colors:</span>
        {Object.values(STATUS_MAP).map((s) => (
          <span key={s.value} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.dotColor }} />
            {s.label}
          </span>
        ))}
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <MapContainer
          center={MAP_DEFAULT_CENTER}
          zoom={MAP_DEFAULT_ZOOM}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {reports.map((report) => {
            if (!report.latitude || !report.longitude) return null;
            const status = STATUS_MAP[report.status];
            const cat = CATEGORY_MAP[report.category];
            const priority = PRIORITY_MAP[report.priority];

            return (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={createComplaintIcon(status?.dotColor || '#6B7280')}
              >
                <Popup>
                  <div className="p-3 min-w-[250px]">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[10px] font-mono text-gray-400">{report.reportId}</p>
                        <h3 className="font-semibold text-gray-900 text-sm">{report.title}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{report.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="badge text-[9px]" style={{ backgroundColor: status?.bgColor, color: status?.color }}>
                        {status?.label}
                      </span>
                      <span className="badge text-[9px]" style={{ backgroundColor: priority?.bgColor, color: priority?.color }}>
                        {priority?.label}
                      </span>
                      <span className="badge text-[9px] bg-gray-100 text-gray-600">
                        {cat?.icon} {cat?.label}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 space-y-0.5">
                      <p>📍 {report.locationName}</p>
                      <p>📅 {formatDateTime(report.createdAt)}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
