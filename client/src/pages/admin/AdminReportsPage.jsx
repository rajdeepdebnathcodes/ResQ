import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/api';
import {
  AlertTriangle, Filter, Search, CheckCircle2,
  Trash2, Eye, MapPin, Sparkles, X, Image
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../../components/common/StatusBadge';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [statusFilter, priorityFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await reportService.getAllReports({
        status: statusFilter,
        priority: priorityFilter,
        search
      });
      if (res.data) setReports(res.data.reports);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await reportService.updateReportStatus(reportId, { status: newStatus });
      fetchReports();
    } catch (err) {
      alert('Failed to update report status.');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm(`Are you sure you want to delete report #${reportId}?`)) return;
    try {
      await reportService.deleteReport(reportId);
      fetchReports();
    } catch (err) {
      alert('Failed to delete report.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Emergency Reports Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Manage Emergency Incidents
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review citizen incident filings, audit AI triage evaluations, and supervise operational status.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Verified">Verified</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Dismissed">Dismissed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Loading incident records...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 text-slate-500">
          No reports found matching criteria.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">ID & Type</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">AI Priority</th>
                  <th className="py-3.5 px-4">Reporter</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Rescue Ops</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r.report_id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {r.ai_classification || r.disaster_type}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        #RPT-{r.report_id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs max-w-xs truncate">
                      {r.location}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={r.priority_level} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      <div>{r.reporter_name}</div>
                      <div className="text-slate-400 font-mono">{r.reporter_phone || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.report_id, e.target.value)}
                        className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Reported">Reported</option>
                        <option value="Verified">Verified</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Dismissed">Dismissed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      {r.rescue_status ? (
                        <StatusBadge status={r.rescue_status} />
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedReport(r)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="View Full Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.report_id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details & AI Inspection Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono text-slate-400">#RPT-{selectedReport.report_id}</span>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedReport.ai_classification || selectedReport.disaster_type} Incident
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <strong className="text-slate-900 text-xs block mb-1">Location:</strong>
                <p className="text-slate-700 text-xs flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-red-500" />
                  {selectedReport.location}
                </p>
              </div>

              <div>
                <strong className="text-slate-900 text-xs block mb-1">Citizen Description:</strong>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedReport.description}
                </p>
              </div>

              {selectedReport.summary && (
                <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-2">
                  <div className="flex items-center space-x-1 text-xs font-bold text-indigo-900">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span>AI Analysis Briefing ({selectedReport.ai_source || 'Gemini'}):</span>
                  </div>
                  <p className="text-xs text-indigo-950 italic">
                    "{selectedReport.summary}"
                  </p>
                  {selectedReport.ai_safety_tips && (
                    <div className="text-[11px] text-indigo-800 pt-2 border-t border-indigo-200/60 whitespace-pre-line">
                      <strong>Prescribed Protocols:</strong><br />
                      {selectedReport.ai_safety_tips}
                    </div>
                  )}
                </div>
              )}

              {selectedReport.image_url && (
                <div>
                  <strong className="text-slate-900 text-xs block mb-1">Attached Incident Photo:</strong>
                  <img
                    src={selectedReport.image_url}
                    alt="Disaster Photo"
                    className="h-48 w-full object-cover rounded-xl border border-slate-200"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
