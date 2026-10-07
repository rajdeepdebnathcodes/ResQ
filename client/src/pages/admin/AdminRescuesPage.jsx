import React, { useState, useEffect } from 'react';
import { rescueService } from '../../services/api';
import { LifeBuoy, MapPin, User, Phone, Eye, Clock } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../../components/common/StatusBadge';
import { Link } from 'react-router-dom';

export default function AdminRescuesPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    fetchRescues();
  }, [statusFilter, priorityFilter]);

  const fetchRescues = async () => {
    setLoading(true);
    try {
      const res = await rescueService.getAllRescueRequests({
        status: statusFilter,
        priority: priorityFilter
      });
      if (res.data) setRequests(res.data.requests);
    } catch (err) {
      console.error('Failed to load rescue requests:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <LifeBuoy className="h-4 w-4" />
            <span>Emergency Dispatch Operations</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            All Rescue Operations
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitor civilian extraction missions, responder allocations, and completion rates.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
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

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Retrieving mission logs...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 text-slate-500">
          No rescue operations found matching the selected filter.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Request #</th>
                  <th className="py-3.5 px-4">Disaster & Location</th>
                  <th className="py-3.5 px-4">Citizen / Caller</th>
                  <th className="py-3.5 px-4">Assigned Volunteer</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.request_id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      #{r.request_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.ai_classification || r.disaster_type}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{r.location}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      <div>{r.citizen_name}</div>
                      <div className="text-slate-400 font-mono">{r.citizen_phone || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {r.volunteer_name ? (
                        <div>
                          <span className="font-semibold text-indigo-900">{r.volunteer_name}</span>
                          <span className="block text-slate-400 font-mono">{r.volunteer_phone || ''}</span>
                        </div>
                      ) : (
                        <span className="text-red-500 font-semibold text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4"><PriorityBadge priority={r.priority_level} /></td>
                    <td className="py-3.5 px-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/citizen/rescue/${r.request_id}`}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Inspect Timeline →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
