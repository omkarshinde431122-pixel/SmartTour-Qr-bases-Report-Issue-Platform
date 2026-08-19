// ============================================================================
// SmartTour — Track Complaint Page
// ============================================================================

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, CheckCircle, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searched, setSearched] = useState(!!initialId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (id?: string) => {
    const searchId = (id || trackingId).trim();
    if (!searchId) return;

    setIsLoading(true);
    setError(null);
    setSearched(true);

    try {
      const result = await getReportByReportId(searchId);
      setReport(result);
      if (!result) {
        setError('No report found with this ID. Please double check and try again.');
      }
    } catch (err) {
      setError('Failed to load complaint data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (report) {
      setIsRefreshing(true);
      handleSearch(report.reportId || report.id);
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
            Track Your Report Status
          </h1>
          <p className="text-gray-500 text-sm">
            Enter your Report ID (e.g. ST-2026-100001) to view real-time updates and authority actions.
          </p>
        </motion.div>

        {/* Search Input Form */}
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
              className="input-base flex-1 font-mono uppercase tracking-wider text-sm"
              aria-label="Report ID"
            />
            <button
              type="submit"
              disabled={isLoading || !trackingId.trim()}
              className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm flex-shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Track
            </button>
          </form>
        </div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              className="text-center py-12 card p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
              <p className="text-xs text-gray-400 font-medium">Fetching real-time status from database...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              className="card p-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 text-base mb-1">Report Not Found</h3>
              <p className="text-gray-500 text-sm">{error}</p>
            </motion.div>
          ) : report ? (
            <motion.div
              key="result"
              className="space-y-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Main Report Summary Card */}
              <div className="card p-6 border-l-4 border-l-emerald-500">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 font-mono font-bold bg-gray-100 px-2 py-0.5 rounded">
                        {report.reportId}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 leading-snug">{report.title}</h2>
                  </div>
                  {(() => {
                    const status = STATUS_MAP[report.status];
                    return (
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="badge cursor-pointer px-3 py-1.5 flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: status?.bgColor, color: status?.color }}
                        title="Click to refresh latest status"
                      >
                        {isRefreshing ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <span>{status?.icon}</span>
                        )}
                        <span>{status?.label}</span>
                      </button>
                    );
                  })()}
                </div>

                <p className="text-sm text-gray-600 mb-5 leading-relaxed bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  {report.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-medium truncate">{report.locationName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-base flex-shrink-0">{CATEGORY_MAP[report.category]?.icon}</span>
                    <span className="font-medium">{CATEGORY_MAP[report.category]?.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>Reported: {formatDateTime(report.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="badge text-[10px]"
                      style={{ backgroundColor: PRIORITY_MAP[report.priority]?.bgColor, color: PRIORITY_MAP[report.priority]?.color }}
                    >
                      {report.priority} priority
                    </span>
                  </div>
                </div>

                {/* Refresh Status Banner */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>Last updated: {formatDateTime(report.updatedAt || report.createdAt)}</span>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Status
                  </button>
                </div>

                {/* Admin Authority Notes / Actions */}
                {report.adminNotes && report.adminNotes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-emerald-800 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                      💬 Official Authority Actions & Notes
                    </p>
                    <div className="space-y-2">
                      {report.adminNotes.map((note, idx) => (
                        <div key={idx} className="p-3 bg-emerald-50/80 border border-emerald-100 rounded-xl text-xs text-emerald-900 leading-relaxed shadow-xs">
                          <span className="font-semibold text-emerald-700">Action #{idx + 1}:</span> {typeof note === 'string' ? note : note.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center justify-between">
                  <span>Complaint Lifecycle Timeline</span>
                  <span className="text-xs text-gray-400 font-normal">Step {currentStepIndex + 1} of 4</span>
                </h3>
                
                <div className="space-y-5 relative">
                  {statusSteps.filter(s => s !== 'closed').map((step, idx) => {
                    const stepInfo = STATUS_MAP[step as keyof typeof STATUS_MAP];
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div key={step} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                              isCurrent
                                ? 'ring-4 ring-emerald-100 bg-emerald-600 text-white shadow-sm'
                                : isCompleted
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-400 border border-gray-200'
                            }`}
                          >
                            {isCompleted ? <CheckCircle className="w-5 h-5" /> : <span className="text-base">{stepInfo?.icon}</span>}
                          </div>
                          {idx < 3 && (
                            <div
                              className={`w-0.5 h-8 mt-1.5 transition-colors ${
                                isCompleted && idx < currentStepIndex ? 'bg-emerald-500' : 'bg-gray-200'
                              }`}
                            />
                          )}
                        </div>

                        <div className="pt-1 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-bold ${isCurrent ? 'text-emerald-700' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                              {stepInfo?.label}
                            </p>
                            {isCurrent && (
                              <span className="badge bg-emerald-100 text-emerald-800 text-[10px] animate-pulse">
                                Current Active Stage
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {idx === 0
                              ? `Submitted on ${formatDateTime(report.createdAt)}`
                              : isCurrent
                              ? `Updated on ${formatDateTime(report.updatedAt)}`
                              : isCompleted
                              ? 'Completed'
                              : 'Pending Action'}
                          </p>
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
              className="text-center py-12 card p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-medium text-gray-600 mb-1">Search Your Complaint Status</p>
              <p className="text-xs text-gray-400">
                Enter your unique Report ID above to track resolution progress.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
