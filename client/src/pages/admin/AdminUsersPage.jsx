import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { Users, Search, Trash2, ShieldCheck, HeartHandshake, User } from 'lucide-react';
import { RoleBadge } from '../../components/common/StatusBadge';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers({ role: roleFilter, search });
      if (res.data) setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      alert('Failed to update role.');
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user account "${name}"?`)) return;
    try {
      await userService.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-1">
            <Users className="h-4 w-4" />
            <span>Identity & Access Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            User Accounts & Roles
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Supervise registered platform participants, volunteer verification, and role assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </form>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="citizen">Citizens</option>
            <option value="volunteer">Volunteers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500">Querying directory...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role Badge</th>
                  <th className="py-3.5 px-4">Volunteer Status / Skills</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Assign Role</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.user_id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4"><RoleBadge role={u.role} /></td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {u.role === 'volunteer' ? (
                        <div>
                          <span className="font-semibold capitalize text-indigo-700">
                            ● {u.availability_status || 'available'}
                          </span>
                          <span className="block text-slate-400 truncate max-w-xs">{u.skills}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                        className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(u.user_id, u.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete User"
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
    </div>
  );
}
