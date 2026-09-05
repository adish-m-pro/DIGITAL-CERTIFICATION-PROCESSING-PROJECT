import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Building,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('STUDENT');
  const [departmentId, setDepartmentId] = useState('');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, deptsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/departments')
      ]);
      setUsers(usersRes.data);
      setDepartments(deptsRes.data);
      if (deptsRes.data.length > 0) {
        setDepartmentId(deptsRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load user management', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const selectedDept = departments.find(d => d.id === departmentId);
      const courseId = selectedDept?.courses?.[0]?.id || '';

      await api.post('/admin/users', {
        name,
        email,
        password,
        role,
        departmentId,
        studentIdNumber: role === 'STUDENT' ? studentIdNumber || `STU${Date.now().toString().slice(-4)}` : undefined,
        courseId: role === 'STUDENT' ? courseId : undefined
      });

      setShowAddModal(false);
      setName('');
      setEmail('');
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create user');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.studentProfile?.studentIdNumber?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            Institutional User Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provision and manage faculty accounts, student credentials, HOD authorizations, and office officers.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Provision New User
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name, email, or Student ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none"
        >
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Students</option>
          <option value="FACULTY">Faculty Advisors</option>
          <option value="HOD">HODs</option>
          <option value="OFFICE">Academic Office</option>
          <option value="ADMIN">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Name & ID</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">System Role</th>
                  <th className="py-3.5 px-6">Affiliation / Dept</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredUsers.map((u) => {
                  let roleBadge = 'bg-slate-100 text-slate-700';
                  if (u.role === 'STUDENT') roleBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                  else if (u.role === 'FACULTY') roleBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                  else if (u.role === 'HOD') roleBadge = 'bg-purple-50 text-purple-700 border-purple-200';
                  else if (u.role === 'OFFICE') roleBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  else if (u.role === 'ADMIN') roleBadge = 'bg-rose-50 text-rose-700 border-rose-200';

                  const dept =
                    u.studentProfile?.department?.name ||
                    u.facultyProfile?.department?.name ||
                    'University Wide';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        {u.studentProfile && (
                          <div className="text-[11px] font-mono text-brand-700">
                            {u.studentProfile.studentIdNumber}
                          </div>
                        )}
                        {u.facultyProfile && (
                          <div className="text-[11px] font-mono text-indigo-600">
                            {u.facultyProfile.facultyCode}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadge}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600">{dept}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {u.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-900">Provision New Institutional User</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Johnathan Doe"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@college.edu"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty / Advisor</option>
                  <option value="HOD">Head of Department (HOD)</option>
                  <option value="OFFICE">Academic Office</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {role === 'STUDENT' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student ID / Roll Number</label>
                <input
                  type="text"
                  value={studentIdNumber}
                  onChange={(e) => setStudentIdNumber(e.target.value)}
                  placeholder="STU2026..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                required
              />
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow"
              >
                {modalLoading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
