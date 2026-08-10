// ============================================================================
// SmartTour — Track Complaint Page
// ============================================================================

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, MapPin, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { getReportByReportId } from '../services/dataService';
import { CATEGORY_MAP, STATUS_MAP, PRIORITY_MAP } from '../constants';
import type { Report } from '../types';
import { formatDateTime } from '../utils';

export default function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [trackingId, setTrackingId] = useState(initialId);
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (id?: string) => {
    const searchId = id || trackingId.trim();
    if (!searchId) return;

    setIsLoading(true);
    setError(null);
    setSearched(true);

    try {
      const result = await getReportByReportId(searchId);
      setReport(result);
      if (!result) {
        setError('No report found with this ID. Please check and try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const statusSteps = ['reported', 'under_review', 'in_progress', 'resolved', 'closed'];
  const currentStepIndex = report ? statusSteps.indexOf(report.status) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="section-container max-w-2xl">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-2">
            Track Your Report
          </h1>
          <p className="text-gray-500 text-sm">
            Enter your report ID to check the current status.
          </p>
        </motion.div>

        {/* Search */}
        <div className="card p-4 mb-8">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
              placeholder="Enter Report ID (e.g., ST-2026-100001)"
              className="input-base flex-1 font-mono"
              aria-label="Report ID"
            />
            <button
              type="submit"
              disabled={isLoading || !trackingId.trim()}
              className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Track
            </button>
          </form>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              className="card p-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{error}</p>
            </motion.div>
          ) : report ? (
            <motion.div
              key="result"
              className="space-y-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Report Card */}
              <div className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400 font-mono mb-1">{report.reportId}</p>
                    <h2 className="text-lg font-semibold text-gray-900">{report.title}</h2>
                  </div>
                  {(() => {
                    const status = STATUS_MAP[report.status];
                    return (
                      <span
                        className="badge"
                        style={{ backgroundColor: status?.bgColor, color: status?.color }}
                      >
                        {status?.icon} {status?.label}
                      </span>
                    );
                  })()}
                </div>

                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{report.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {report.locationName}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-base">{CATEGORY_MAP[report.category]?.icon}</span>
                    {CATEGORY_MAP[report.category]?.label}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {formatDateTime(report.createdAt)}
                  </div>
                  <div>
                    <span
                      className="badge text-xs"
                      style={{ backgroundColor: PRIORITY_MAP[report.priority]?.bgColor, color: PRIORITY_MAP[report.priority]?.color }}
                    >
                      {report.priority} priority
                    </span>
                  </div>
                </div>

                {/* Admin Notes */}
                {report.adminNotes && report.adminNotes.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-emerald-700 mb-2 uppercase tracking-wider">
                      💬 Official Authority Notes
                    </p>
                    <div className="space-y-2">
                      {report.adminNotes.map((note, idx) => (
                        <div key={idx} className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-gray-700 leading-relaxed">
                          📌 {typeof note === 'string' ? note : note.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Status Timeline</h3>
                <div className="space-y-4">
                  {statusSteps.filter(s => s !== 'closed').map((step, idx) => {
                    const stepInfo = STATUS_MAP[step as keyof typeof STATUS_MAP];
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <div key={step} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {isCompleted ? <CheckCircle className="w-4 h-4" /> : <span className="text-sm">{stepInfo?.icon}</span>}
                          </div>
                          {idx < 3 && (
                            <div className={`w-px h-6 mt-1 ${isCompleted && idx < currentStepIndex ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isCurrent ? 'text-gray-900' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                            {stepInfo?.label}
                            {isCurrent && (
                              <span className="ml-2 text-xs text-emerald-600 font-normal">← Current</span>
                            )}
                          </p>
                          {isCompleted && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {isCurrent ? formatDateTime(report.updatedAt) : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : searched ? null : (
            <motion.div
              key="empty"
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Enter your report ID above to track its status.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
