import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rescueService } from '../../services/api';
import {
  LifeBuoy, MapPin, Phone, User, Clock, AlertTriangle,
  Sparkles, CheckCircle2
} from 'lucide-react';
import { PriorityBadge } from '../../components/common/StatusBadge';

export default function PendingRescuesPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await rescueService.getPendingRequests();
      if (res.data) setRequests(res.data.requests);
    } catch (err) {
      console.error('Failed to load pending queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setAcceptingId(requestId);
    try {
      await rescueService.acceptRescueRequest(requestId);
      alert('Rescue mission accepted! Navigating to mission console...');
      navigate(`/volunteer/rescue/${requestId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not claim request.');
      fetchPending();
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
          <LifeBuoy className="h-4 w-4" />
          <span>Module 3: Rescue Coordination</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Emergency Rescue Dispatch Queue
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Pending civilian rescue requests waiting for responder deployment. High and Critical incidents appear at the top.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Scanning dispatch frequency...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Queue is Clear!</h3>
          <p className="text-xs text-slate-500 mt-1">
            No active emergencies currently awaiting responders in this jurisdiction.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((r) => {
            const isCritical = r.priority_level === 'Critical';

            return (
              <div
                key={r.request_id}
                className={`bg-white rounded-3xl border p-6 sm:p-7 shadow-sm space-y-5 transition flex flex-col justify-between ${
                  isCritical ? 'border-red-300 ring-2 ring-red-500/10' : 'border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs text-slate-400">#REQ-{r.request_id}</span>
                      <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                        {r.ai_classification || r.disaster_type}
                      </h2>
                    </div>
                    <PriorityBadge priority={r.priority_level} />
                  </div>

                  <div className="flex items-start text-xs text-slate-700 font-semibold">
                    <MapPin className="h-4 w-4 mr-1 text-red-500 shrink-0 mt-0.5" />
                    <span>{r.location}</span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    {r.description}
                  </p>

                  {/* AI Briefing */}
                  {r.summary && (
                    <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-indigo-800">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>AI Responder Summary:</span>
                      </div>
                      <p className="italic text-indigo-900 leading-relaxed">
                        "{r.summary}"
                      </p>
                    </div>
                  )}

                  {/* Caller Contact Info */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center">
                      <User className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      Victim / Caller: {r.citizen_name}
                    </span>
                    {r.citizen_phone && (
                      <span className="flex items-center font-mono">
                        <Phone className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        {r.citizen_phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Accept Button */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleAccept(r.request_id)}
                    disabled={acceptingId === r.request_id}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-60"
                  >
                    <LifeBuoy className="h-4 w-4" />
                    <span>
                      {acceptingId === r.request_id ? 'Assigning Mission...' : 'Accept Rescue & Dispatch Team'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
