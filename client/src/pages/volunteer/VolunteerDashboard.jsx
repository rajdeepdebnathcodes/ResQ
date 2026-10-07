import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rescueService, userService } from '../../services/api';
import {
  HeartHandshake, LifeBuoy, CheckCircle2, Clock,
  MapPin, Phone, ArrowRight, Activity, ShieldAlert
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../../components/common/StatusBadge';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState(user?.availability_status || 'available');
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    fetchVolunteerData();
  }, []);

  const fetchVolunteerData = async () => {
    setLoading(true);
    try {
      const [pendingRes, myRes] = await Promise.all([
        rescueService.getPendingRequests(),
        rescueService.getMyAssignedRequests()
      ]);
      if (pendingRes.data) setPendingRequests(pendingRes.data.requests);
      if (myRes.data) setMyAssignments(myRes.data.requests);
    } catch (err) {
      console.error('Error loading volunteer desk:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setSavingStatus(true);
    try {
      await userService.updateVolunteerStatus({ availability_status: newStatus });
      setAvailability(newStatus);
    } catch (err) {
      alert('Failed to update availability status.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await rescueService.acceptRescueRequest(requestId);
      alert('Rescue request claimed! You are now the designated responder.');
      fetchVolunteerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept rescue request.');
    }
  };

  const activeAssigned = myAssignments.filter(r => r.status !== 'Completed' && r.status !== 'Cancelled');
  const completedAssigned = myAssignments.filter(r => r.status === 'Completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Volunteer Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <HeartHandshake className="h-4 w-4" />
            <span>Volunteer Operations Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
            Responder: {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {user?.skills ? `Skills: ${user.skills}` : 'Disaster Relief & Search/Rescue Team'}
          </p>
        </div>

        {/* Live Availability Status Switcher */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex flex-col space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Duty Status:
          </span>
          <div className="flex items-center space-x-1.5">
            {['available', 'busy', 'offline'].map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                disabled={savingStatus}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                  availability === st
                    ? st === 'available'
                      ? 'bg-emerald-600 text-white'
                      : st === 'busy'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-600 text-white'
                    : 'bg-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Queue: Pending Rescues</div>
            <div className="text-3xl font-black text-red-600 mt-1">{pendingRequests.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Active Operations</div>
            <div className="text-3xl font-black text-indigo-600 mt-1">{activeAssigned.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <LifeBuoy className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rescues Completed</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">{completedAssigned.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Pending Rescues Awaiting Claim */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Pending Rescue Queue</h2>
            <p className="text-xs text-slate-500">Unassigned emergencies prioritized by AI threat rating</p>
          </div>
          <Link
            to="/volunteer/pending-rescues"
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center"
          >
            <span>Full Queue ({pendingRequests.length})</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Scanning frequency...</p>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No pending rescue requests at this moment. All logged incidents are currently assigned or stable.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.slice(0, 4).map((req) => (
              <div
                key={req.request_id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-300 transition space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-base">
                      {req.ai_classification || req.disaster_type}
                    </span>
                    <PriorityBadge priority={req.priority_level} />
                  </div>
                  <div className="flex items-center text-xs text-slate-600 mb-2 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-red-500 mr-1 shrink-0" />
                    <span>{req.location}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {req.summary || req.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Caller: {req.citizen_name}</span>
                  <button
                    onClick={() => handleAcceptRequest(req.request_id)}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition"
                  >
                    Accept Dispatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Active Assigned Operations */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">My Assigned Rescue Missions</h2>
          <p className="text-xs text-slate-500">Operations currently under your active management</p>
        </div>

        {myAssignments.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            You do not have any active rescue missions assigned. Claim one from the pending queue above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Disaster</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Citizen Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myAssignments.map((a) => (
                  <tr key={a.request_id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {a.ai_classification || a.disaster_type}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{a.location}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-700">
                      {a.citizen_name} ({a.citizen_phone || 'N/A'})
                    </td>
                    <td className="py-3.5 px-4"><StatusBadge status={a.status} /></td>
                    <td className="py-3.5 px-4"><PriorityBadge priority={a.priority_level} /></td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/volunteer/rescue/${a.request_id}`}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Manage & Update →
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
