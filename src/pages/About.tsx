// ============================================================================
// SmartTour — About Page
// ============================================================================

import { motion } from 'framer-motion';
import { MapPin, QrCode, Users, Shield, Target, Heart, Mountain, Globe } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-emerald-50/50 to-white">
        <div className="section-container text-center">
          <motion.div {...fadeInUp}>
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
              About SmartTour
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              SmartTour is a QR-based smart tourism platform that empowers visitors to report issues at tourist 
              and trekking locations, helping authorities maintain and improve these destinations for everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Tourist and trekking locations often face challenges like garbage accumulation, damaged infrastructure, 
                poor signage, and safety concerns. Traditional reporting methods are slow and inefficient.
              </p>
              <p className="text-gray-600 leading-relaxed">
                SmartTour bridges this gap by placing QR codes at strategic locations. Visitors simply scan a QR code, 
                describe the issue, and submit — no app download, no registration required. Reports are instantly 
                available to administrators who can track, prioritize, and resolve them.
              </p>
            </motion.div>
            <motion.div className="grid grid-cols-2 gap-4" {...fadeInUp}>
              {[
                { icon: QrCode, label: 'Instant QR Reporting', color: 'emerald' },
                { icon: Globe, label: 'No App Required', color: 'blue' },
                { icon: Shield, label: 'Secure & Private', color: 'purple' },
                { icon: Target, label: 'Real-time Tracking', color: 'amber' },
              ].map((item) => (
                <div key={item.label} className={`card p-5 text-center`}>
                  <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                    item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                    item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    item.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-16 bg-gray-50/50">
        <div className="section-container text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">Coverage Area</h2>
            <p className="text-gray-500 max-w-lg mx-auto mb-8">
              Currently deployed at tourist and trekking locations in Pune district, Maharashtra.
            </p>
          </motion.div>
          <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto" {...fadeInUp}>
            {[
              { name: 'Bopdev Ghat', type: 'Ghat & Trekking' },
              { name: 'Kanifnath Temple', type: 'Temple & Trek' },
              { name: 'Viewpoints', type: 'Scenic Spots' },
              { name: 'Trekking Routes', type: 'Trail Networks' },
              { name: 'Parking Areas', type: 'Visitor Infrastructure' },
              { name: 'Rest Points', type: 'Trail Amenities' },
            ].map((loc) => (
              <div key={loc.name} className="card p-4 text-left">
                <Mountain className="w-4 h-4 text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-gray-900">{loc.name}</p>
                <p className="text-xs text-gray-500">{loc.type}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* For Whom */}
      <section className="py-16">
        <div className="section-container">
          <motion.div className="text-center mb-10" {...fadeInUp}>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">Built For</h2>
          </motion.div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" {...fadeInUp}>
            {[
              { icon: Users, title: 'Tourists & Trekkers', description: 'Easily report problems encountered during visits.' },
              { icon: Shield, title: 'Local Authorities', description: 'Monitor, manage, and resolve issues efficiently.' },
              { icon: Mountain, title: 'Trekking Groups', description: 'Help maintain trails and safety infrastructure.' },
              { icon: Heart, title: 'Communities', description: 'Contribute to cleaner, safer tourist destinations.' },
            ].map((item) => (
              <div key={item.title} className="card p-6 text-center">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="section-container text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-3">
              Scan a QR. Report a Problem. Help Improve.
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              Every report matters. Your feedback helps make tourist destinations better for everyone.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>🌍 Open Platform</span>
              <span>·</span>
              <span>🔒 No Login Required</span>
              <span>·</span>
              <span>📱 Mobile Friendly</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
