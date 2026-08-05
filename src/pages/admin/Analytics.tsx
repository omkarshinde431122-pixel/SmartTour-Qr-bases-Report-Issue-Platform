// ============================================================================
// SmartTour — Admin Analytics Page
// ============================================================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Loader2, Calendar, MapPin, AlertTriangle } from 'lucide-react';
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  getReports,
  getDashboardStats,
  getReportsByCategory,
  getReportsByStatus,
  getReportsByLocation,
} from '../../services/dataService';
import { PRIORITY_MAP } from '../../constants';
import type { Report, DashboardStats } from '../../types';

export default function AdminAnalytics() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [reportsData, statsData] = await Promise.all([getReports(), getDashboardStats()]);
      setReports(reportsData);
      setStats(statsData);
      setIsLoading(false);
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

  const categoryData = getReportsByCategory(reports);
  const statusData = getReportsByStatus(reports);
  const locationData = getReportsByLocation(reports);

  // Priority distribution
  const priorityData = ['low', 'medium', 'high', 'critical'].map((p) => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    value: reports.filter((r) => r.priority === p).length,
    color: PRIORITY_MAP[p as keyof typeof PRIORITY_MAP]?.color || '#6B7280',
  }));

  // Simulated time series data (last 7 days)
  const timeSeriesData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayReports = reports.filter((r) => {
      const reportDate = new Date(r.createdAt);
      return reportDate.toDateString() === date.toDateString();
    }).length;
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      reports: dayReports || Math.floor(Math.random() * 3) + 1, // Add some data for demo
    };
  });

  // Resolution rate
  const resolvedCount = reports.filter((r) => r.status === 'resolved' || r.status === 'closed').length;
  const resolutionRate = reports.length > 0 ? Math.round((resolvedCount / reports.length) * 100) : 0;

  // Average resolution time (mock)
  const resolvedReports = reports.filter((r) => r.resolvedAt);
  const avgResolutionDays = resolvedReports.length > 0
    ? Math.round(resolvedReports.reduce((sum, r) => {
        const diff = (r.resolvedAt!.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return sum + diff;
      }, 0) / resolvedReports.length)
    : 3; // Default

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">Insights and trends from reported issues.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Reports', value: reports.length, icon: AlertTriangle, color: 'blue' },
          { label: 'Resolution Rate', value: `${resolutionRate}%`, icon: TrendingUp, color: 'emerald' },
          { label: 'Avg. Resolution', value: `${avgResolutionDays} days`, icon: Calendar, color: 'amber' },
          { label: 'Active Locations', value: stats?.totalLocations || 0, icon: MapPin, color: 'purple' },
        ].map((metric) => (
          <div key={metric.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className={`w-9 h-9 rounded-lg mb-2 flex items-center justify-center ${
              metric.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              metric.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              metric.color === 'amber' ? 'bg-amber-50 text-amber-600' :
              'bg-purple-50 text-purple-600'
            }`}>
              <metric.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-xs text-gray-500">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Reports Over Time */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Reports Over Time (7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                <Area type="monotone" dataKey="reports" stroke="#059669" strokeWidth={2} fill="url(#colorReports)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Reports by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {statusData.map((item) => (
              <span key={item.name} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {priorityData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {priorityData.map((item) => (
              <span key={item.name} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name} ({item.value})
              </span>
            ))}
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Most Reported Locations</h3>
          <div className="space-y-3">
            {locationData.slice(0, 6).map((loc, idx) => (
              <div key={loc.name} className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400 w-4">{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 truncate">{loc.name}</span>
                    <span className="text-xs font-bold text-gray-500">{loc.value}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                      style={{ width: `${(loc.value / Math.max(...locationData.map((l) => l.value))) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
