// ============================================================================
// SmartTour — Admin Reports Page
// ============================================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  X,
  FileText,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getReports, updateReportStatus, updateReportPriority, addAdminNote } from '../../services/dataService';
import { REPORT_CATEGORIES, REPORT_STATUSES, REPORT_PRIORITIES, STATUS_MAP, CATEGORY_MAP, PRIORITY_MAP } from '../../constants';
import type { Report, ReportStatus, ReportCategory, ReportPriority } from '../../types';
import { formatDateTime } from '../../utils';

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | ''>('');
  const [filterCategory, setFilterCategory] = useState<ReportCategory | ''>('');
  const [filterPriority, setFilterPriority] = useState<ReportPriority | ''>('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [newAdminNote, setNewAdminNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const reportsData = await getReports();
      setReports(reportsData);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || r.status === filterStatus;
    const matchesCategory = !filterCategory || r.category === filterCategory;
    const matchesPriority = !filterPriority || r.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      const now = new Date();
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId || r.reportId === reportId
            ? { ...r, status: newStatus, updatedAt: now, resolvedAt: newStatus === 'resolved' ? now : r.resolvedAt }
            : r
        )
      );
      if (selectedReport && (selectedReport.id === reportId || selectedReport.reportId === reportId)) {
        setSelectedReport((prev) =>
          prev
            ? { ...prev, status: newStatus, updatedAt: now, resolvedAt: newStatus === 'resolved' ? now : prev.resolvedAt }
            : null
        );
      }
      const statusObj = STATUS_MAP[newStatus];
      toast.success(`Status updated to ${statusObj?.label || newStatus}`);
    } catch (err) {
      toast.error('Failed to update status in database');
    }
  };

  const handlePriorityChange = async (reportId: string, newPriority: ReportPriority) => {
    try {
      await updateReportPriority(reportId, newPriority);
      const now = new Date();
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId || r.reportId === reportId ? { ...r, priority: newPriority, updatedAt: now } : r
        )
      );
      if (selectedReport && (selectedReport.id === reportId || selectedReport.reportId === reportId)) {
        setSelectedReport((prev) => (prev ? { ...prev, priority: newPriority, updatedAt: now } : null));
      }
      toast.success(`Priority updated to ${newPriority}`);
    } catch (err) {
      toast.error('Failed to update priority');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !newAdminNote.trim()) return;

    setIsSavingNote(true);
    try {
      const noteText = newAdminNote.trim();
      const targetId = selectedReport.id || selectedReport.reportId;
      await addAdminNote(targetId, noteText);
      const updatedNotes = [...(selectedReport.adminNotes || []), noteText];
      const now = new Date();
      
      setSelectedReport((prev) => (prev ? { ...prev, adminNotes: updatedNotes, updatedAt: now } : null));
      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id || r.reportId === selectedReport.reportId
            ? { ...r, adminNotes: updatedNotes, updatedAt: now }
            : r
        )
      );
      setNewAdminNote('');
      toast.success('Admin resolution note added');
    } catch (err) {
      toast.error('Failed to add note');
    } finally {
      setIsSavingNote(false);
    }
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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">{filteredReports.length} complaint{filteredReports.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-9 py-2 text-sm"
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ReportStatus | '')} className="input-base py-2 text-sm w-auto">
            <option value="">All Status</option>
            {REPORT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as ReportCategory | '')} className="input-base py-2 text-sm w-auto">
            <option value="">All Categories</option>
            {REPORT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as ReportPriority | '')} className="input-base py-2 text-sm w-auto">
            <option value="">All Priorities</option>
            {REPORT_PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Report</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Priority</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredReports.map((report) => {
                const cat = CATEGORY_MAP[report.category];
                const status = STATUS_MAP[report.status];
                const priority = PRIORITY_MAP[report.priority];
                return (
                  <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 text-sm">{report.title}</p>
                      <p className="text-xs text-gray-400 font-mono">{report.reportId}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{report.locationName}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 text-sm">
                        <span>{cat?.icon}</span>
                        <span className="text-gray-600 text-xs">{cat?.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge text-[10px]" style={{ backgroundColor: priority?.bgColor, color: priority?.color }}>
                        {priority?.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.id, e.target.value as ReportStatus)}
                        className="text-xs font-medium rounded-lg border px-2 py-1"
                        style={{ borderColor: status?.color + '40', backgroundColor: status?.bgColor, color: status?.color }}
                      >
                        {REPORT_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDateTime(report.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                        aria-label="View report details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No reports found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Detail Slide-over */}
      <AnimatePresence>
        {selectedReport && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Report Details</h2>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close details panel"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-gray-400 font-mono mb-1">{selectedReport.reportId}</p>
                    <h3 className="text-base font-semibold text-gray-900">{selectedReport.title}</h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="badge" style={{ backgroundColor: STATUS_MAP[selectedReport.status]?.bgColor, color: STATUS_MAP[selectedReport.status]?.color }}>
                      {STATUS_MAP[selectedReport.status]?.icon} {STATUS_MAP[selectedReport.status]?.label}
                    </span>
                    <span className="badge" style={{ backgroundColor: PRIORITY_MAP[selectedReport.priority]?.bgColor, color: PRIORITY_MAP[selectedReport.priority]?.color }}>
                      {selectedReport.priority}
                    </span>
                    <span className="badge bg-gray-100 text-gray-700">
                      {CATEGORY_MAP[selectedReport.category]?.icon} {CATEGORY_MAP[selectedReport.category]?.label}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedReport.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Location</p>
                      <p className="font-medium text-gray-700">{selectedReport.locationName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Submitted</p>
                      <p className="font-medium text-gray-700">{formatDateTime(selectedReport.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Updated</p>
                      <p className="font-medium text-gray-700">{formatDateTime(selectedReport.updatedAt)}</p>
                    </div>
                    {selectedReport.networkIssueType && (
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Network Issue</p>
                        <p className="font-medium text-gray-700">{selectedReport.networkIssueType}</p>
                      </div>
                    )}
                  </div>

                  {/* Update Status */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {REPORT_STATUSES.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => handleStatusChange(selectedReport.id, s.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            selectedReport.status === s.value
                              ? 'ring-2'
                              : 'hover:bg-gray-50'
                          }`}
                          style={
                            selectedReport.status === s.value
                              ? { borderColor: s.color, backgroundColor: s.bgColor, color: s.color, boxShadow: `0 0 0 2px ${s.color}30` }
                              : { borderColor: '#E5E7EB', color: '#6B7280' }
                          }
                        >
                          {s.icon} {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Update Priority */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Update Priority</p>
                    <div className="flex flex-wrap gap-2">
                      {REPORT_PRIORITIES.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => handlePriorityChange(selectedReport.id, p.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            selectedReport.priority === p.value
                              ? 'ring-2'
                              : 'hover:bg-gray-50'
                          }`}
                          style={
                            selectedReport.priority === p.value
                              ? { borderColor: p.color, backgroundColor: p.bgColor, color: p.color }
                              : { borderColor: '#E5E7EB', color: '#6B7280' }
                          }
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Admin Resolution Notes */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Admin Resolution Notes</p>
                    {selectedReport.adminNotes && selectedReport.adminNotes.length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {selectedReport.adminNotes.map((note, idx) => (
                          <div key={idx} className="p-2.5 bg-gray-50 rounded-lg text-xs text-gray-700 border border-gray-100">
                            📝 {typeof note === 'string' ? note : note.content}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mb-3 italic">No resolution notes added yet.</p>
                    )}

                    <form onSubmit={handleAddNote} className="flex gap-2">
                      <input
                        type="text"
                        value={newAdminNote}
                        onChange={(e) => setNewAdminNote(e.target.value)}
                        placeholder="Add resolution note..."
                        className="input-base py-1.5 text-xs flex-1"
                      />
                      <button
                        type="submit"
                        disabled={isSavingNote || !newAdminNote.trim()}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        {isSavingNote ? 'Saving...' : 'Add Note'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
