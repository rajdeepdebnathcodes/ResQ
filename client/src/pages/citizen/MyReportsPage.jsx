import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService, rescueService } from '../../services/api';
import {
  FileText, LifeBuoy, MapPin, Calendar, Sparkles,
  AlertCircle, ArrowRight, CheckCircle2, Image, ShieldAlert
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../../components/common/StatusBadge';

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const res = await reportService.getMyReports();
      if (res.data) setReports(res.data.reports);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRescue = async (reportId, priority) => {
    setRequestingId(reportId);
    try {
      await rescueService.createRescueRequest({
        report_id: reportId,
        priority_level: priority,
        notes: 'Emergency extraction requested by citizen from incident reports board.'
      });
      await fetchMyReports();
      alert('Rescue request queued! A volunteer will be dispatched.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate rescue request.');
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
            <FileText className="h-4 w-4" />
            <span>Citizen Incident Archive</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            My Submitted Emergency Reports
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track report statuses, review AI evaluations, and coordinate with active rescue volunteers.
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow transition flex items-center space-x-2"
        >
          <span>Report New Hazard</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Reports Feed */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Loading incident records...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No reports submitted yet</h3>
          <p className="text-xs text-slate-500 mt-1">Click above to log an emergency incident in your area.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <div
              key={report.report_id}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5 hover:border-slate-300 transition"
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className="font-black text-xl text-slate-900">
                    {report.ai_classification || report.disaster_type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    #RPT-{report.report_id}
                  </span>
                  <PriorityBadge priority={report.priority_level} />
                  <StatusBadge status={report.status} />
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(report.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Middle row: content + optional photo */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 space-y-3">
                  <div className="flex items-start text-xs font-semibold text-slate-700">
                    <MapPin className="h-4 w-4 mr-1 text-red-500 shrink-0 mt-0.5" />
                    <span>{report.location}</span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    {report.description}
                  </p>

                  {/* AI Card */}
                  {report.summary && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-700">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>AI Triage Briefing ({report.ai_confidence || 'Verified'}):</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic">
                        "{report.summary}"
                      </p>
                      {report.ai_safety_tips && (
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 whitespace-pre-line">
                          <strong>Safety Action:</strong> {report.ai_safety_tips.split('\n')[0]}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right side: Image thumbnail + Rescue status button */}
                <div className="md:col-span-4 flex flex-col justify-between space-y-4">
                  {report.image_url ? (
                    <div
                      onClick={() => setSelectedImage(report.image_url)}
                      className="cursor-pointer group relative overflow-hidden rounded-2xl border border-slate-200 h-36 bg-slate-100 flex items-center justify-center"
                    >
                      <img
                        src={report.image_url}
                        alt="Incident"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold">
                        View Photo
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                      No photo attached
                    </div>
                  )}

                  {/* Rescue Request Action Box */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    {report.rescue_request_id ? (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-semibold text-slate-600">Rescue Status:</span>
                          <StatusBadge status={report.rescue_status} />
                        </div>
                        {report.assigned_volunteer_name && (
                          <div className="text-[11px] text-slate-500 mb-2">
                            Volunteer: <strong>{report.assigned_volunteer_name}</strong>
                          </div>
                        )}
                        <Link
                          to={`/citizen/rescue/${report.rescue_request_id}`}
                          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 shadow transition"
                        >
                          <LifeBuoy className="h-3.5 w-3.5" />
                          <span>Track Live Rescue</span>
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs text-slate-500 mb-2">
                          No active rescue operation linked.
                        </div>
                        <button
                          onClick={() => handleRequestRescue(report.report_id, report.priority_level)}
                          disabled={requestingId === report.report_id}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition disabled:opacity-50"
                        >
                          <LifeBuoy className="h-3.5 w-3.5 text-amber-300" />
                          <span>
                            {requestingId === report.report_id ? 'Dispatching...' : 'Request Rescue Now'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={selectedImage} alt="Enlarged" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 bg-white text-slate-900 rounded-full p-1.5 shadow"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
