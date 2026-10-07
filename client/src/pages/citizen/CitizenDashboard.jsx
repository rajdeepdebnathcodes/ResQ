import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reportService, alertService } from '../../services/api';
import {
  AlertTriangle, LifeBuoy, PlusCircle, Clock,
  ArrowRight, ShieldCheck, MapPin, Eye, CheckCircle2
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../../components/common/StatusBadge';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await reportService.getMyReports();
        if (res.data) setReports(res.data.reports);
      } catch (e) {
        console.error('Failed to load citizen reports:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeRescues = reports.filter(r => r.rescue_status && r.rescue_status !== 'Completed' && r.rescue_status !== 'Cancelled');
  const resolvedCount = reports.filter(r => r.status === 'Resolved' || r.rescue_status === 'Completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-800/60">
            Citizen Emergency Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3">
            Welcome, {user?.name}
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Monitor your reported emergency incidents, track real-time volunteer rescue dispatch, and access nearby shelter services.
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 shrink-0 transition transform hover:-translate-y-0.5"
        >
          <AlertTriangle className="h-5 w-5" />
          <span>Report New Emergency</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reports</div>
            <div className="text-3xl font-black text-slate-900 mt-1">{reports.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Rescues</div>
            <div className="text-3xl font-black text-red-600 mt-1">{activeRescues.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <LifeBuoy className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved Cases</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">{resolvedCount}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Active Rescue Operation Card (if any) */}
      {activeRescues.length > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-3xl p-6 sm:p-7 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full w-fit">
                <LifeBuoy className="h-4 w-4 animate-spin" />
                <span>Active Rescue Dispatch In Progress</span>
              </div>
              <h3 className="text-xl font-extrabold mt-2">
                Rescue #{activeRescues[0].rescue_request_id}: {activeRescues[0].disaster_type} at {activeRescues[0].location}
              </h3>
              <p className="text-xs sm:text-sm text-white/90 mt-1">
                Status: <strong>{activeRescues[0].rescue_status}</strong>
                {activeRescues[0].assigned_volunteer_name && ` • Responder: ${activeRescues[0].assigned_volunteer_name}`}
              </p>
            </div>

            <Link
              to={`/citizen/rescue/${activeRescues[0].rescue_request_id}`}
              className="px-5 py-2.5 bg-white text-red-600 hover:bg-slate-100 font-bold rounded-xl text-xs sm:text-sm shadow transition"
            >
              Track Live Timeline →
            </Link>
          </div>
        </div>
      )}

      {/* Recent Reports Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">My Emergency Reports</h2>
            <p className="text-xs text-slate-500">History of your logged incident reports & AI triage analysis</p>
          </div>
          <Link
            to="/citizen/reports"
            className="text-xs sm:text-sm font-semibold text-red-600 hover:underline flex items-center"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Loading your incident reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <ShieldCheck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold">No emergency reports submitted yet.</p>
            <p className="text-xs mt-1">If you witness an accident or hazard, use the "Report New Emergency" button.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Disaster Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">AI Priority</th>
                  <th className="py-3 px-4">Report Status</th>
                  <th className="py-3 px-4">Rescue Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.slice(0, 5).map((r) => (
                  <tr key={r.report_id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {r.ai_classification || r.disaster_type}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {r.location}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={r.priority_level} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      {r.rescue_status ? (
                        <StatusBadge status={r.rescue_status} />
                      ) : (
                        <span className="text-xs text-slate-400">Not Requested</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {r.rescue_request_id ? (
                        <Link
                          to={`/citizen/rescue/${r.rescue_request_id}`}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Track Rescue
                        </Link>
                      ) : (
                        <Link
                          to="/citizen/reports"
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                          Details
                        </Link>
                      )}
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
