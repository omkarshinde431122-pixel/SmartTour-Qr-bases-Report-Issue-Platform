// ============================================================================
// SmartTour — Admin Sidebar Component
// ============================================================================

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  MapPin,
  Map,
  QrCode,
  BarChart3,
  LogOut,
  ChevronLeft,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/reports', label: 'Reports', icon: FileText },
  { to: '/admin/map', label: 'Complaint Map', icon: Map },
  { to: '/admin/locations', label: 'Locations', icon: MapPin },
  { to: '/admin/qr', label: 'QR Codes', icon: QrCode },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, appUser } = useAuth();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 admin-sidebar text-white flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-display font-bold tracking-tight">
              Smart<span className="text-emerald-400">Tour</span>
            </span>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" aria-label="Admin navigation">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to, link.exact);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-white bg-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="adminSidebarActive"
                  className="absolute inset-0 rounded-xl bg-white/10 border border-white/5"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon className="w-4.5 h-4.5 relative z-10" />
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + Actions */}
      <div className="p-3 border-t border-white/10 space-y-1">
        {appUser && (
          <div className="px-3.5 py-2 mb-2">
            <p className="text-sm font-medium text-gray-200 truncate">{appUser.displayName}</p>
            <p className="text-xs text-gray-500 truncate">{appUser.email}</p>
          </div>
        )}

        <Link
          to="/"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="w-4.5 h-4.5" />
          Back to Site
        </Link>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
