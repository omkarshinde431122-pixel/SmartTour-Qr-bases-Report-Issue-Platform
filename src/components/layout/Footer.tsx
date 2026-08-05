// ============================================================================
// SmartTour — Footer Component
// ============================================================================

import { Link } from 'react-router-dom';
import { MapPin, Heart, Mail, ExternalLink, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-display font-bold text-white tracking-tight">
                Smart<span className="text-emerald-400">Tour</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Helping make tourist destinations cleaner, safer, and easier to explore through QR-based issue reporting.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-200 mb-4 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5">
              <li><Link to="/explore" className="text-sm hover:text-white transition-colors">Tourist Map</Link></li>
              <li><Link to="/report" className="text-sm hover:text-white transition-colors">Report an Issue</Link></li>
              <li><Link to="/track" className="text-sm hover:text-white transition-colors">Track Complaint</Link></li>
              <li><Link to="/about" className="text-sm hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h4 className="text-sm font-semibold text-gray-200 mb-4 uppercase tracking-wider">Top Locations</h4>
            <ul className="space-y-2.5">
              <li><Link to="/location/bopdev-ghat" className="text-sm hover:text-white transition-colors">Bopdev Ghat</Link></li>
              <li><Link to="/location/kanifnath-temple" className="text-sm hover:text-white transition-colors">Kanifnath Temple</Link></li>
              <li><Link to="/location/bopdev-ghat-viewpoint" className="text-sm hover:text-white transition-colors">Bopdev Viewpoint</Link></li>
              <li><Link to="/location/bopdev-ghat-trek-entry" className="text-sm hover:text-white transition-colors">Trek Entry Point</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-200 mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:contact@smarttour.dev" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <Mail className="w-4 h-4" /> contact@smarttour.dev
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <Globe className="w-4 h-4" /> GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} SmartTour. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400" /> for tourism
          </p>
        </div>
      </div>
    </footer>
  );
}
