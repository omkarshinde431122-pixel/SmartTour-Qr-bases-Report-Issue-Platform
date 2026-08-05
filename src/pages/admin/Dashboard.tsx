// ============================================================================
// SmartTour — Admin Dashboard
// ============================================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  MapPin,
  QrCode,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  getDashboardStats,
  getReports,
  getReportsByCategory,
  getReportsByStatus,
  getReportsByLocation,
} from '../../services/dataService';
import { STATUS_MAP, CATEGORY_MAP } from '../../constants';
import type { DashboardStats, Report } from '../../types';
import { formatRelativeDate } from '../../utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, reportsData] = await Promise.all([
          getDashboardStats(),
          getReports(),
        ]);
        setStats(statsData);
        setReports(reportsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const categoryChartData = getReportsByCategory(reports);
  const statusChartData = getReportsByStatus(reports);
  const locationChartData = getReportsByLocation(reports);
  const recentReports = reports.slice(0, 5);

  const statCards = [
    { label: 'Total Reports', value: stats?.totalReports || 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'New Reports', value: stats?.newReports || 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'In Progress', value: stats?.inProgressReports || 0, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Resolved', value: stats?.resolvedReports || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Locations', value: stats?.totalLocations || 0, icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'QR Scans', value: stats?.qrScans || 0, icon: QrCode, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'This Week', value: stats?.reportsThisWeek || 0, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Review', value: stats?.pendingReports || 0, icon: Eye, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of complaints, locations, and activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* Reports by Category */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Reports by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} width={80} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports by Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Reports by Status</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {statusChartData.map((item) => (
              <span key={item.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name} ({item.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Reports by Location + Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Locations */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Most Reported Locations</h3>
          <div className="space-y-3">
            {locationChartData.slice(0, 5).map((loc, idx) => (
              <div key={loc.name} className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400 w-5">{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{loc.name}</span>
                    <span className="text-xs font-semibold text-gray-500">{loc.value}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(loc.value / Math.max(...locationChartData.map(l => l.value))) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Reports</h3>
            <Link to="/admin/reports" className="text-xs text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentReports.map((report) => {
              const cat = CATEGORY_MAP[report.category];
              const status = STATUS_MAP[report.status];
              return (
                <div key={report.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-lg flex-shrink-0">{cat?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      <span>{report.locationName}</span>
                      <span>·</span>
                      <span>{formatRelativeDate(report.createdAt)}</span>
                    </div>
                  </div>
                  <span
                    className="badge text-[10px] flex-shrink-0"
                    style={{ backgroundColor: status?.bgColor, color: status?.color }}
                  >
                    {status?.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
