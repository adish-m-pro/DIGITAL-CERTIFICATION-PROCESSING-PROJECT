import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { RequestItem } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'PENDING' | 'ALL' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load faculty requests', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingRequests = requests.filter(r =>
    ['SUBMITTED', 'UNDER_FACULTY_REVIEW'].includes(r.status)
  );

  const approvedRequests = requests.filter(r =>
    r.status !== 'SUBMITTED' && r.status !== 'UNDER_FACULTY_REVIEW' && !r.status.includes('FACULTY_REJECTED')
  );

  const rejectedRequests = requests.filter(r => r.status === 'FACULTY_REJECTED');

  const displayedRequests =
    selectedFilter === 'PENDING'
      ? pendingRequests
      : selectedFilter === 'APPROVED'
      ? approvedRequests
      : selectedFilter === 'REJECTED'
      ? rejectedRequests
      : requests;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-brand-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30 mb-2">
          <Users className="w-4 h-4" /> Faculty & Advisor Verification Desk
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Welcome, {user?.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Review academic eligibility, verify student attendance and grades, and approve or request corrections for departmental document applications.
        </p>

        {user?.facultyProfile && (
          <div className="mt-4 pt-4 border-t border-slate-700/80 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span><strong className="text-white">Designation:</strong> {user.facultyProfile.designation}</span>
            <span>&bull;</span>
            <span><strong className="text-white">Department:</strong> {user.facultyProfile.department.name}</span>
            <span>&bull;</span>
            <span><strong className="text-white">Faculty Code:</strong> {user.facultyProfile.facultyCode}</span>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div
          onClick={() => setSelectedFilter('PENDING')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            selectedFilter === 'PENDING'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Verification</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{pendingRequests.length}</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">Requires your review</div>
        </div>

        <div
          onClick={() => setSelectedFilter('APPROVED')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            selectedFilter === 'APPROVED'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Verified & Approved</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{approvedRequests.length}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Passed to HOD/Office</div>
        </div>

        <div
          onClick={() => setSelectedFilter('REJECTED')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            selectedFilter === 'REJECTED'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rejected Applications</span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{rejectedRequests.length}</div>
          <div className="text-[11px] text-rose-700 font-semibold mt-1">Declined with remarks</div>
        </div>

        <div
          onClick={() => setSelectedFilter('ALL')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            selectedFilter === 'ALL'
              ? 'bg-brand-50 border-brand-300 ring-2 ring-brand-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Department Requests</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{requests.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">All applications</div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {selectedFilter === 'PENDING' ? 'Pending Advisor Reviews' : 'Assigned Student Requests'}
            </h2>
            <p className="text-xs text-slate-500">
              Click 'Review Request' to assess student details, purpose, and approve or reject.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading student requests...</div>
        ) : displayedRequests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No requests matching the selected category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Request ID</th>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Document Type</th>
                  <th className="py-3.5 px-6">Academic Info</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {displayedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-brand-700">
                      {req.requestNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{req.student.user.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{req.student.studentIdNumber}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {req.documentType.name}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      Year {req.student.currentYear} &bull; CGPA: <span className="font-bold text-emerald-600">{req.student.cgpa.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/student/requests/${req.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review Request
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
};
