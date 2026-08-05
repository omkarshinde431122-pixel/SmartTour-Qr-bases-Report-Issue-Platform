// ============================================================================
// SmartTour — Home Page
// ============================================================================

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Compass,
  Shield,
  BarChart3,
  Smartphone,
  Mountain,
  Sparkles,
} from 'lucide-react';
import { SAMPLE_LOCATIONS } from '../constants';
import { LOCATION_CATEGORY_MAP } from '../constants';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section (Original Default Theme) */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-b from-white via-emerald-50/40 to-white py-16 sm:py-24">
        {/* Ambient Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
          
          {/* Floating Badges */}
          <motion.div
            className="absolute top-28 right-[14%] hidden md:block"
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-white shadow-xl border border-emerald-100 flex items-center justify-center">
              <QrCode className="w-7 h-7 text-emerald-600" />
            </div>
          </motion.div>

          <motion.div
            className="absolute top-44 left-[10%] hidden lg:block"
            animate={{ y: [6, -10, 6] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xl border border-blue-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-32 left-[18%] hidden lg:block"
            animate={{ y: [-5, 10, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          >
            <div className="w-11 h-11 rounded-xl bg-white shadow-lg border border-amber-100 flex items-center justify-center">
              <Mountain className="w-5 h-5 text-amber-500" />
            </div>
          </motion.div>
        </div>

        {/* Hero Content */}
        <div className="section-container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div {...fadeInUp}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6 border border-emerald-100 shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                QR-Based Smart Tourism Platform
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Explore. Discover.{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text">Report. Improve.</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Help make tourist & trekking destinations cleaner, safer, and easier to explore
              by reporting problems directly from the location.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                to="/report"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5"
              >
                <AlertTriangle className="w-4.5 h-4.5" />
                Report an Issue
              </Link>

              <Link
                to="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all hover:-translate-y-0.5"
              >
                <Compass className="w-4.5 h-4.5 text-emerald-600" />
                Explore Tourist Locations
              </Link>

              <Link
                to="/track"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-50 text-emerald-800 text-sm font-semibold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all hover:-translate-y-0.5"
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                Track Complaint
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white" id="how-it-works">
        <div className="section-container">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-3">
              How It Works
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Three simple steps to report and resolve issues at tourist locations.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                step: '01',
                icon: QrCode,
                title: 'Scan QR Code',
                description: 'Find a QR code at the tourist location and scan it with your phone camera.',
                color: 'emerald',
              },
              {
                step: '02',
                icon: AlertTriangle,
                title: 'Report the Issue',
                description: 'Describe the problem, select a category, and upload photos if needed.',
                color: 'blue',
              },
              {
                step: '03',
                icon: CheckCircle2,
                title: 'Track Resolution',
                description: 'Get a tracking ID and follow the progress of your report until it\'s resolved.',
                color: 'amber',
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                className="card p-7 text-center group"
                variants={fadeInUp}
                whileHover={{ y: -4 }}
              >
                <div className="text-xs font-bold text-gray-300 mb-4 tracking-widest">{item.step}</div>
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center ${
                  item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                  item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  'bg-amber-50 text-amber-600'
                } group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Locations */}
      <section className="py-20 bg-gray-50/50">
        <div className="section-container">
          <motion.div
            className="flex items-end justify-between mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-2">
                Tourist Locations
              </h2>
              <p className="text-gray-500">Discover and explore popular destinations in the region.</p>
            </div>
            <Link
              to="/explore"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {SAMPLE_LOCATIONS.slice(0, 6).map((location) => {
              const catInfo = LOCATION_CATEGORY_MAP[location.category];
              return (
                <motion.div key={location.slug} variants={fadeInUp}>
                  <Link
                    to={`/location/${location.slug}`}
                    className="card block overflow-hidden group"
                  >
                    {/* Location Image */}
                    <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                      {location.images && location.images[0] ? (
                        <img
                          src={location.images[0]}
                          alt={location.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <Mountain className="w-12 h-12 opacity-30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute top-3 left-3">
                        <span className="badge bg-white/90 text-gray-700 backdrop-blur-sm shadow-sm">
                          {catInfo?.icon} {catInfo?.label}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                        {location.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {location.shortDescription}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {location.difficulty && (
                          <span className="flex items-center gap-1">
                            🥾 {location.difficulty}
                          </span>
                        )}
                        {location.distance && (
                          <span className="flex items-center gap-1">
                            📏 {location.distance}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          📋 {location.reportCount} reports
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="sm:hidden text-center mt-6">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View all locations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {[
              { value: '6+', label: 'Tourist Locations', icon: MapPin, color: 'emerald' },
              { value: '10+', label: 'Issues Reported', icon: AlertTriangle, color: 'blue' },
              { value: '247', label: 'QR Scans', icon: QrCode, color: 'purple' },
              { value: '85%', label: 'Resolution Rate', icon: CheckCircle2, color: 'amber' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-gray-50/80">
                <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                  stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                  stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50/50">
        <div className="section-container">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-3">
              Platform Features
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              A comprehensive toolkit for managing and improving tourist destinations.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { icon: QrCode, title: 'QR-Based Reporting', description: 'Scan a QR code at any location to instantly report issues without downloading an app.' },
              { icon: MapPin, title: 'Interactive Maps', description: 'Explore tourist locations, view reported issues, and discover nearby attractions on an interactive map.' },
              { icon: Smartphone, title: 'Mobile First', description: 'Designed for on-the-go usage. Report issues right from your phone in seconds.' },
              { icon: BarChart3, title: 'Real-time Analytics', description: 'Administrators get live dashboards with charts, heatmaps, and trend analysis.' },
              { icon: Shield, title: 'Secure & Private', description: 'No account required for reporting. Your data is handled securely with Firebase.' },
              { icon: Sparkles, title: 'AI Categorization', description: 'Smart text analysis automatically suggests the right category and priority for your report.' },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                className="card p-6 group"
                variants={fadeInUp}
                whileHover={{ y: -3 }}
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
              See a Problem? Report It.
            </h2>
            <p className="text-gray-500 mb-8 text-lg">
              Your reports help authorities maintain and improve tourist destinations for everyone.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                <AlertTriangle className="w-4 h-4" />
                Report an Issue
              </Link>
              <Link
                to="/track"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Track Your Complaint
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
