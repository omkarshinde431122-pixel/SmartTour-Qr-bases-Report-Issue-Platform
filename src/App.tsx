// ============================================================================
// SmartTour — App Entry Point
// ============================================================================

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const LocationDetails = lazy(() => import('./pages/LocationDetails'));
const Report = lazy(() => import('./pages/Report'));
const ReportSuccess = lazy(() => import('./pages/ReportSuccess'));
const TrackComplaint = lazy(() => import('./pages/TrackComplaint'));
const About = lazy(() => import('./pages/About'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminComplaintMap = lazy(() => import('./pages/admin/ComplaintMap'));
const AdminLocations = lazy(() => import('./pages/admin/Locations'));
const AdminQRManagement = lazy(() => import('./pages/admin/QRManagement'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/location/:slug" element={<LocationDetails />} />
              <Route path="/report" element={<Report />} />
              <Route path="/report/success" element={<ReportSuccess />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route path="/about" element={<About />} />
            </Route>

            {/* Admin Login (no layout) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes (protected) */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/map" element={<AdminComplaintMap />} />
              <Route path="/admin/locations" element={<AdminLocations />} />
              <Route path="/admin/qr" element={<AdminQRManagement />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-display font-bold text-gray-200 mb-2">404</h1>
                    <p className="text-gray-500 mb-4">Page not found</p>
                    <a href="/" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                      Go Home →
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#1F2937',
            color: '#fff',
            fontSize: '14px',
          },
        }}
      />
    </AuthProvider>
  );
}
