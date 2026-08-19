// ============================================================================
// SmartTour — Admin Complaint Map Page
// ============================================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Loader2, RefreshCw, Filter, Navigation, ExternalLink } from 'lucide-react';
import { getReports, getLocations } from '../../services/dataService';
import { STATUS_MAP, CATEGORY_MAP, PRIORITY_MAP, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '../../constants';
import type { Report, ReportStatus, ReportCategory } from '../../types';
import { formatDateTime } from '../../utils';

function createComplaintIcon(color: string, iconSymbol: string = '!') {
  return L.divIcon({
    className: 'custom-marker-pin',
    html: `
      <div style="
        position: relative;
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 13px;
          line-height: 1;
        ">${iconSymbol}</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export default function AdminComplaintMap() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all');

  const fetchData = async () => {
    try {
      const [reportsData, locationsData] = await Promise.all([getReports(), getLocations()]);
      
      const reportsWithCoords = reportsData.map((r, idx) => {
        if (!r.latitude || !r.longitude) {
          const loc = locationsData.find((l) => l.id === r.locationId);
          if (loc) {
            const offsetLat = ((idx * 17) % 10 - 5) * 0.0008;
            const offsetLng = ((idx * 23) % 10 - 5) * 0.0008;
            return {
              ...r,
              latitude: loc.latitude + offsetLat,
              longitude: loc.longitude + offsetLng,
            };
          }
        }
        return r;
      });
      setReports(reportsWithCoords);
    } catch (err) {
      console.error('Failed to fetch map data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const filteredReports = reports.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Complaint Navigation Map</h1>
          <p className="text-sm text-gray-500">
            Showing {filteredReports.length} of {reports.length} reported issues in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            Refresh Realtime Data
          </button>
        </div>
      </div>

      {/* Filter Bar & Legend */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filter Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
            className="input-base text-xs py-1 px-2.5 w-auto rounded-lg"
          >
            <option value="all">All Statuses ({reports.length})</option>
            {Object.values(STATUS_MAP).map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} ({reports.filter((r) => r.status === s.value).length})
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ReportCategory | 'all')}
            className="input-base text-xs py-1 px-2.5 w-auto rounded-lg"
          >
            <option value="all">All Categories</option>
            {Object.values(CATEGORY_MAP).map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {Object.values(STATUS_MAP).map((s) => (
            <span key={s.value} className="flex items-center gap-1 text-[11px] font-medium text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.dotColor }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Map Display */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm relative" style={{ height: 'calc(100vh - 240px)', minHeight: '450px' }}>
        <MapContainer
          center={MAP_DEFAULT_CENTER}
          zoom={MAP_DEFAULT_ZOOM}
          className="w-full h-full z-0"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredReports.map((report) => {
            if (!report.latitude || !report.longitude) return null;
            const status = STATUS_MAP[report.status];
            const cat = CATEGORY_MAP[report.category];
            const priority = PRIORITY_MAP[report.priority];

            return (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={createComplaintIcon(status?.dotColor || '#6B7280', cat?.icon || '!')}
              >
                <Popup>
                  <div className="p-3 min-w-[260px] space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="font-mono text-[10px] font-bold text-gray-400">{report.reportId}</span>
                      <span
                        className="badge text-[10px] px-2 py-0.5"
                        style={{ backgroundColor: status?.bgColor, color: status?.color }}
                      >
                        {status?.icon} {status?.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug">{report.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{report.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <span className="badge text-[9px] bg-gray-100 text-gray-700">
                        {cat?.icon} {cat?.label}
                      </span>
                      <span
                        className="badge text-[9px]"
                        style={{ backgroundColor: priority?.bgColor, color: priority?.color }}
                      >
                        {priority?.label} priority
                      </span>
                    </div>

                    <div className="text-[10px] text-gray-400 space-y-0.5 pt-1 border-t border-gray-50">
                      <p className="flex items-center gap-1 font-medium text-gray-600">
                        <Navigation className="w-3 h-3 text-emerald-600" /> {report.locationName}
                      </p>
                      <p>📅 Reported: {formatDateTime(report.createdAt)}</p>
                      {report.updatedAt && (
                        <p>🔄 Updated: {formatDateTime(report.updatedAt)}</p>
                      )}
                    </div>

                    {report.adminNotes && report.adminNotes.length > 0 && (
                      <div className="bg-emerald-50/70 p-2 rounded-lg text-[10px] text-emerald-800 border border-emerald-100">
                        <p className="font-bold">💬 Action Note:</p>
                        <p className="line-clamp-2">
                          {typeof report.adminNotes[report.adminNotes.length - 1] === 'string'
                            ? (report.adminNotes[report.adminNotes.length - 1] as string)
                            : (report.adminNotes[report.adminNotes.length - 1] as any)?.content}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 flex justify-between items-center">
                      <Link
                        to={`/track?id=${report.reportId || report.id}`}
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:text-emerald-700"
                        target="_blank"
                      >
                        View Tracking <ExternalLink className="w-3 h-3" />
                      </Link>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-blue-600 font-medium hover:underline"
                      >
                        Open Navigation 🗺️
                      </a>
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
