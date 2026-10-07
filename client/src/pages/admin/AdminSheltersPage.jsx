import React, { useState, useEffect } from 'react';
import { shelterService } from '../../services/api';
import { Home, Plus, Edit, Trash2, MapPin, Phone, X, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export default function AdminSheltersPage() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShelter, setEditingShelter] = useState(null);

  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    capacity: 100,
    available_slots: 100,
    contact_number: '',
    status: 'Available'
  });

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    setLoading(true);
    try {
      const res = await shelterService.getAllShelters();
      if (res.data) setShelters(res.data.shelters);
    } catch (err) {
      console.error('Failed to load shelters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingShelter(null);
    setForm({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      capacity: 100,
      available_slots: 100,
      contact_number: '',
      status: 'Available'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (shelter) => {
    setEditingShelter(shelter);
    setForm({
      name: shelter.name,
      address: shelter.address,
      latitude: shelter.latitude || '',
      longitude: shelter.longitude || '',
      capacity: shelter.capacity,
      available_slots: shelter.available_slots,
      contact_number: shelter.contact_number,
      status: shelter.status
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingShelter) {
        await shelterService.updateShelter(editingShelter.shelter_id, form);
      } else {
        await shelterService.createShelter(form);
      }
      setModalOpen(false);
      fetchShelters();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save shelter.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete relief shelter "${name}"?`)) return;
    try {
      await shelterService.deleteShelter(id);
      fetchShelters();
    } catch (err) {
      alert('Failed to delete shelter.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Home className="h-4 w-4" />
            <span>Module 4: Shelter Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Relief Shelters Directory
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Maintain safe havens, bed availability allocations, and evacuation camp logistics.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition flex items-center space-x-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Relief Shelter</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Loading shelter database...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Shelter Name</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Bed Slots</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shelters.map((s) => (
                  <tr key={s.shelter_id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs max-w-xs truncate">{s.address}</td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-bold text-slate-900">{s.available_slots}</span>
                      <span className="text-slate-400"> / {s.capacity} beds</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-700">{s.contact_number}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={s.status} /></td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.shelter_id, s.name)}
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {editingShelter ? 'Edit Shelter' : 'Add New Relief Shelter'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Shelter Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Central Community Hall Shelter"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. Near Bus Stand, Camp Area, Pune"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Total Capacity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Available Slots
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.available_slots}
                    onChange={(e) => setForm({ ...form, available_slots: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Hotline
                  </label>
                  <input
                    type="text"
                    required
                    value={form.contact_number}
                    onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                    placeholder="+91 20 2550 0100"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Full">Full</option>
                    <option value="Temporarily Closed">Temporarily Closed</option>
                  </select>
                </div>
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Save Shelter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
