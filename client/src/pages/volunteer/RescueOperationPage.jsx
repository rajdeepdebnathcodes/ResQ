import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rescueService } from '../../services/api';
import {
  LifeBuoy, MapPin, Phone, User, Clock, ArrowLeft,
  CheckCircle2, RefreshCw, Send, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../../components/common/StatusBadge';

export default function RescueOperationPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('In Progress');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchRescue = async () => {
    try {
      const res = await rescueService.getRescueDetails(id);
      if (res.data) {
        setData(res.data);
        setStatus(res.data.rescue_request.status || 'In Progress');
      }
    } catch (err) {
      console.error('Failed to load rescue details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRescue();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!remarks.trim()) {
      alert('Please provide operational remarks for the status log.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      await rescueService.updateRescueStatus(id, {
        status,
        remarks: remarks.trim()
      });
      setMessage(`Mission status successfully updated to "${status}".`);
      setRemarks('');
      await fetchRescue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update rescue status.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading mission control telemetry...</p>
      </div>
    );
  }

  if (!data || !data.rescue_request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Rescue Mission Record Not Found</h2>
        <Link to="/volunteer/dashboard" className="mt-4 inline-block text-xs font-semibold text-indigo-600 underline">
          Return to Volunteer Desk
        </Link>
      </div>
    );
  }

  const req = data.rescue_request;
  const timeline = data.timeline || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top back nav */}
      <Link
        to="/volunteer/dashboard"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Volunteer Operations Desk</span>
      </Link>

      {/* Operation Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800">
              Active Mission #{req.request_id}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">
              {req.disaster_type} Rescue Operation
            </h1>
            <p className="text-xs text-slate-300 mt-1 flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1 text-red-400" />
              {req.location}
            </p>
          </div>

          <div className="flex sm:flex-col items-end gap-2">
            <StatusBadge status={req.status} />
            <PriorityBadge priority={req.priority_level} />
          </div>
        </div>

        {/* Action quick links */}
        <div className="pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
          <div>
            Citizen: <strong>{req.citizen_name}</strong>
            {req.citizen_phone && (
              <a href={`tel:${req.citizen_phone}`} className="ml-2 text-indigo-300 hover:underline font-mono">
                📞 {req.citizen_phone}
              </a>
            )}
          </div>

          {req.latitude && req.longitude && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${req.latitude},${req.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition"
            >
              Open GPS Navigation ↗
            </a>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Update Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Post Mission Status Update</h2>
          <p className="text-xs text-slate-500">Record progress remarks or mark the rescue operation as completed.</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Update Current Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['In Progress', 'Completed', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition text-center ${
                    status === st
                      ? st === 'Completed'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Field Remarks / SITREP Log
            </label>
            <textarea
              rows="3"
              required
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Inflatable raft launched. Evacuated elderly couple to Shivaji Nagar Community Shelter. Victims evaluated stable."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Field Update & Notify Citizen</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Historical Updates Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Mission Progress Audit Log</h3>
          <p className="text-xs text-slate-500">Chronological history of status transitions and field notes</p>
        </div>

        <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
          {timeline.map((update) => (
            <div key={update.update_id} className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 shadow"></div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <span className="font-bold text-slate-900">
                    {update.author_name} ({update.status})
                  </span>
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(update.updated_at).toLocaleString()}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {update.remarks}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
