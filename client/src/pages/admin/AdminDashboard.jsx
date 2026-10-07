import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService, reportService } from '../../services/api';
import {
  Users, AlertTriangle, LifeBuoy, Home, Radio,
  BarChart3, ArrowRight, ShieldAlert, CheckCircle2, Clock
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../../components/common/StatusBadge';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await analyticsService.getDashboardAnalytics();
        if (res.data) setData(res.data.analytics);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const s = data?.summary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-3 py-1 rounded-full border border-red-800">
            Emergency Command & Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            Administrator Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time municipal telemetry, crisis dispatch coordination, shelter resources, and emergency alert broadcasting.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/analytics"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-slate-700 transition"
          >
            <BarChart3 className="h-4 w-4 text-amber-400" />
            <span>Interactive Analytics</span>
          </Link>

          <Link
            to="/admin/alerts"
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition"
          >
            <Radio className="h-4 w-4" />
            <span>Broadcast Alert</span>
          </Link>
        </div>
      </div>

      {/* Real Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Users */}
        <Link to="/admin/users" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{s?.users?.total_users ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {s?.users?.volunteers ?? 0} Volunteers Active
          </div>
        </Link>

        {/* Emergency Reports */}
        <Link to="/admin/reports" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-red-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Incidents</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{s?.reports?.total_reports ?? 0}</div>
          <div className="text-[11px] text-amber-600 mt-1">
            {s?.reports?.status_in_progress ?? 0} In Progress
          </div>
        </Link>

        {/* Pending Rescues */}
        <Link to="/admin/rescues" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rescue Ops</span>
            <LifeBuoy className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-red-600">{s?.rescues?.pending_rescues ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {s?.rescues?.completed_rescues ?? 0} Completed
          </div>
        </Link>

        {/* Relief Shelters */}
        <Link to="/admin/shelters" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shelter Beds</span>
            <Home className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{s?.shelters?.total_available ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {s?.shelters?.total_shelters ?? 0} centers
          </div>
        </Link>

        {/* Active Alerts */}
        <Link to="/admin/alerts" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-red-300 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Alerts</span>
            <Radio className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{s?.alerts?.active_alerts ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Live broadcasts
          </div>
        </Link>
      </div>

      {/* Quick Navigation Admin Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link to="/admin/analytics" className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 text-center transition">
          <BarChart3 className="h-6 w-6 text-red-600 mx-auto mb-1.5" />
          <span className="text-xs font-bold text-slate-800">Analytics</span>
        </Link>
        <Link to="/admin/reports" className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 text-center transition">
          <AlertTriangle className="h-6 w-6 text-amber-600 mx-auto mb-1.5" />
          <span className="text-xs font-bold text-slate-800">All Reports</span>
        </Link>
        <Link to="/admin/rescues" className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 text-center transition">
          <LifeBuoy className="h-6 w-6 text-indigo-600 mx-auto mb-1.5" />
          <span className="text-xs font-bold text-slate-800">Rescue Ops</span>
        </Link>
        <Link to="/admin/shelters" className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 text-center transition">
          <Home className="h-6 w-6 text-emerald-600 mx-auto mb-1.5" />
          <span className="text-xs font-bold text-slate-800">Shelters</span>
        </Link>
        <Link to="/admin/alerts" className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 text-center transition">
          <Radio className="h-6 w-6 text-red-600 mx-auto mb-1.5" />
          <span className="text-xs font-bold text-slate-800">Alerts</span>
        </Link>
        <Link to="/admin/users" className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 text-center transition">
          <Users className="h-6 w-6 text-slate-700 mx-auto mb-1.5" />
          <span className="text-xs font-bold text-slate-800">Users</span>
        </Link>
      </div>

      {/* Recent Incidents Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent Emergency Reports</h2>
            <p className="text-xs text-slate-500">Live feed of incoming citizen dispatches</p>
          </div>
          <Link to="/admin/reports" className="text-xs font-bold text-red-600 hover:underline flex items-center">
            <span>View All Reports</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-xs text-slate-400">Loading incidents...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Disaster</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.recentIncidents || []).map((r) => (
                  <tr key={r.report_id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.disaster_type}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{r.location}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">{r.reporter_name}</td>
                    <td className="py-3.5 px-4"><PriorityBadge priority={r.priority_level} /></td>
                    <td className="py-3.5 px-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/admin/reports"
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
