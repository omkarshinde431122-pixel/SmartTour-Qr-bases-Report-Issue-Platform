// ============================================================================
// SmartTour — Admin QR Management Page
// ============================================================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  Printer,
  Copy,
  CheckCircle,
  Search,
  Loader2,
} from 'lucide-react';
import { getLocations } from '../../services/dataService';
import { LOCATION_CATEGORY_MAP } from '../../constants';
import type { TouristLocation } from '../../types';

export default function AdminQRManagement() {
  const [locations, setLocations] = useState<TouristLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      const data = await getLocations();
      setLocations(data);
      setIsLoading(false);
    };
    fetchLocations();
  }, []);

  const filteredLocations = locations.filter((l) =>
    !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getQrUrl = (slug: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/report?location=${slug}`;
  };

  const copyUrl = (slug: string, id: string) => {
    navigator.clipboard.writeText(getQrUrl(slug));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadQR = (slug: string, _name?: string) => {
    const svg = document.getElementById(`qr-${slug}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      const link = document.createElement('a');
      link.download = `smarttour-qr-${slug}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const printQR = (slug: string, name: string) => {
    const qrUrl = getQrUrl(slug);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = document.getElementById(`qr-${slug}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);

    printWindow.document.write(`
      <html>
        <head>
          <title>SmartTour QR - ${name}</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 40px; }
            .qr-card { border: 2px solid #E5E7EB; border-radius: 16px; padding: 40px; display: inline-block; max-width: 400px; }
            h1 { font-size: 24px; color: #111827; margin: 0 0 4px; }
            h2 { font-size: 14px; color: #059669; font-weight: 600; margin: 0 0 20px; }
            .qr-svg { margin: 0 auto 20px; }
            .url { font-size: 11px; color: #6B7280; word-break: break-all; }
            .instruction { font-size: 16px; color: #374151; margin: 20px 0 8px; font-weight: 600; }
            .sub { font-size: 12px; color: #9CA3AF; }
            .brand { margin-top: 24px; font-size: 12px; color: #059669; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <h2>📍 SmartTour</h2>
            <h1>${name}</h1>
            <div class="qr-svg">${svgData}</div>
            <p class="instruction">Scan to Report an Issue</p>
            <p class="sub">Help make this location better by reporting problems.</p>
            <p class="url">${qrUrl}</p>
            <p class="brand">🌍 SmartTour — Smart Tourism Platform</p>
          </div>
          <script>setTimeout(() => { window.print(); }, 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">QR Code Management</h1>
        <p className="text-sm text-gray-500">Generate, download, and print QR codes for tourist locations.</p>
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

      {/* QR Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLocations.map((loc, idx) => {
          const catInfo = LOCATION_CATEGORY_MAP[loc.category];
          const qrUrl = getQrUrl(loc.slug);

          return (
            <motion.div
              key={loc.id}
              className="bg-white rounded-xl border border-gray-100 p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              {/* Location Info */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: catInfo?.color + '15' }}>
                  {catInfo?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{loc.name}</h3>
                  <p className="text-[10px] text-gray-400">{catInfo?.label}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center p-4 bg-gray-50 rounded-xl mb-4">
                <QRCodeSVG
                  id={`qr-${loc.slug}`}
                  value={qrUrl}
                  size={160}
                  level="M"
                  includeMargin={true}
                  bgColor="transparent"
                  fgColor="#111827"
                />
              </div>

              {/* URL */}
              <div className="flex items-center gap-1.5 mb-4 px-2 py-1.5 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-500 font-mono truncate flex-1">{qrUrl}</p>
                <button
                  onClick={() => copyUrl(loc.slug, loc.id)}
                  className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  aria-label="Copy URL"
                >
                  {copiedId === loc.id ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => downloadQR(loc.slug, loc.name)}
                  className="flex-1 py-2 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" /> Download
                </button>
                <button
                  onClick={() => printQR(loc.slug, loc.name)}
                  className="flex-1 py-2 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Printer className="w-3 h-3" /> Print
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
