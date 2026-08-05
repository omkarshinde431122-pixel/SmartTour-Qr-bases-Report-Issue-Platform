// ============================================================================
// SmartTour — Report Success Page
// ============================================================================

import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, Search, Home, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function ReportSuccess() {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('id') || 'ST-2026-XXXXXX';
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reportId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6, delay: 0.1 }}
        >
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-2">
          Report Submitted!
        </h1>
        <p className="text-gray-500 mb-8">
          Your issue has been successfully reported. Thank you for helping improve this location.
        </p>

        {/* Report ID Card */}
        <div className="card p-5 mb-6">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Your Report ID</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
              {reportId}
            </span>
            <button
              onClick={copyToClipboard}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              aria-label="Copy report ID"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-emerald-600 font-medium"
            >
              Copied to clipboard!
            </motion.p>
          )}

          <p className="text-xs text-gray-500">
            Save this ID to track the status of your report.
          </p>
        </div>

        {/* Status Timeline */}
        <div className="card p-5 mb-6 text-left">
          <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Status Timeline</p>
          <div className="space-y-3">
            {[
              { status: 'Reported', icon: '🟡', active: true, description: 'Your report has been received' },
              { status: 'Under Review', icon: '🔵', active: false, description: 'Authorities reviewing the issue' },
              { status: 'In Progress', icon: '🟠', active: false, description: 'Work is underway to resolve' },
              { status: 'Resolved', icon: '🟢', active: false, description: 'Issue has been resolved' },
            ].map((step, idx) => (
              <div key={step.status} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-sm">{step.icon}</span>
                  {idx < 3 && (
                    <div className={`w-px h-6 mt-1 ${step.active ? 'bg-amber-300' : 'bg-gray-200'}`} />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${step.active ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.status}
                  </p>
                  <p className={`text-xs ${step.active ? 'text-gray-500' : 'text-gray-300'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/track?id=${reportId}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            Track Your Report
          </Link>
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
