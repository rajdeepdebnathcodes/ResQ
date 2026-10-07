import React, { useState, useEffect } from 'react';
import { alertService } from '../../services/api';
import { Radio, Plus, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';
import { PriorityBadge } from '../../components/common/StatusBadge';

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    message: '',
    alert_type: 'General',
    severity: 'Medium',
    location: 'All Affected Areas'
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertService.getAllAlerts();
      if (res.data) setAlerts(res.data.alerts);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await alertService.createAlert(form);
      setModalOpen(false);
      setForm({
        title: '',
        message: '',
        alert_type: 'General',
        severity: 'Medium',
        location: 'All Affected Areas'
      });
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to broadcast alert.');
    }
  };

  const handleToggle = async (alertId, currentActive) => {
    try {
      await alertService.updateAlert(alertId, { is_active: !currentActive });
      fetchAlerts();
    } catch (err) {
      alert('Failed to update alert state.');
    }
  };

  const handleDelete = async (alertId) => {
    if (!window.confirm('Delete this emergency alert?')) return;
    try {
      await alertService.deleteAlert(alertId);
      fetchAlerts();
    } catch (err) {
      alert('Failed to delete alert.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Radio className="h-4 w-4" />
            <span>Module 5: Emergency Broadcast Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Emergency Alerts & Warnings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Broadcast life-safety warnings, meteorological advisories, and evacuation mandates.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow transition flex items-center space-x-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Broadcast New Alert</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Retrieving alert transmissions...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Title & Type</th>
                  <th className="py-3.5 px-4">Region</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Broadcasted</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alerts.map((a) => (
                  <tr key={a.alert_id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{a.title}</div>
                      <div className="text-xs text-slate-500">{a.alert_type}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">{a.location}</td>
                    <td className="py-3.5 px-4"><PriorityBadge priority={a.severity} /></td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggle(a.alert_id, a.is_active)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          a.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {a.is_active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        <span>{a.is_active ? 'Active' : 'Archived'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(a.alert_id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Alert"
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

      {/* Broadcast Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                Broadcast Emergency Alert
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alert Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Flash Flood Evacuation Notice"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Alert Type
                  </label>
                  <select
                    value={form.alert_type}
                    onChange={(e) => setForm({ ...form, alert_type: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Evacuation">Evacuation</option>
                    <option value="Weather Warning">Weather Warning</option>
                    <option value="Safety Instruction">Safety Instruction</option>
                    <option value="Emergency">Emergency</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Severity Level
                  </label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Affected Geographic Area
                </label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Riverside Sectors 1-6 & Sangam Bridge"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Advisory Message
                </label>
                <textarea
                  rows="3"
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Enter detailed safety directives for residents..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
