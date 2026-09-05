import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { RequestItem } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Building,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';

export const HodDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING_HOD' | 'APPROVED' | 'ALL'>('PENDING_HOD');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load HOD requests', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingHodRequests = requests.filter(r => r.status === 'UNDER_HOD_REVIEW');
  const approvedHodRequests = requests.filter(r =>
    ['HOD_APPROVED', 'UNDER_OFFICE_PROCESSING', 'DOCUMENT_GENERATED', 'READY_FOR_DOWNLOAD', 'COMPLETED'].includes(r.status)
  );

  const displayedRequests =
    activeTab === 'PENDING_HOD'
      ? pendingHodRequests
      : activeTab === 'APPROVED'
      ? approvedHodRequests
      : requests;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-400/30 mb-2">
          <Building className="w-4 h-4" /> Head of Department (HOD) Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {user?.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Department-level executive review: Endorse faculty-verified certificates, audit student requests, and authorize formal issuance by the Academic Office.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div
          onClick={() => setActiveTab('PENDING_HOD')}
          className={`p-6 rounded-3xl border cursor-pointer transition-all ${
            activeTab === 'PENDING_HOD'
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending HOD Sign-off</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{pendingHodRequests.length}</div>
          <div className="text-xs text-purple-700 font-semibold mt-1">
            Faculty-verified & awaiting endorsement
          </div>
        </div>

        <div
          onClick={() => setActiveTab('APPROVED')}
          className={`p-6 rounded-3xl border cursor-pointer transition-all ${
            activeTab === 'APPROVED'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">HOD Approved</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{approvedHodRequests.length}</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            Forwarded to Academic Office
          </div>
        </div>

        <div
          onClick={() => setActiveTab('ALL')}
          className={`p-6 rounded-3xl border cursor-pointer transition-all ${
            activeTab === 'ALL'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">All Department Requests</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{requests.length}</div>
          <div className="text-xs text-slate-500 mt-1">Overall departmental volume</div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {activeTab === 'PENDING_HOD' ? 'Requests Requiring HOD Approval' : 'Department Request Log'}
            </h2>
            <p className="text-xs text-slate-500">
              Examine student profiles, previous faculty endorsements, and provide HOD authorization.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading requests...</div>
        ) : displayedRequests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No requests currently in this stage.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Request ID</th>
                  <th className="py-3.5 px-6">Student Name & ID</th>
                  <th className="py-3.5 px-6">Document Type</th>
                  <th className="py-3.5 px-6">Advisor Verification Status</th>
                  <th className="py-3.5 px-6">Current Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {displayedRequests.map((req) => {
                  const facultyApproval = req.approvals?.find(a => a.role === 'FACULTY');

                  return (
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
                      <td className="py-4 px-6">
                        {facultyApproval ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified by {facultyApproval.approver.name}
                          </div>
                        ) : (
                          <span className="text-slate-400">Not verified</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/student/requests/${req.id}`}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> HOD Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
