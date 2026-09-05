import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { RequestItem } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import {
  FilePlus2,
  Clock,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Download,
  Eye,
  Sparkles,
  BookOpen,
  Calendar,
  GraduationCap
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load student requests', err);
    } finally {
      setLoading(false);
    }
  };

  const student = user?.studentProfile;

  // Stats calculation
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r =>
    ['SUBMITTED', 'UNDER_FACULTY_REVIEW', 'UNDER_HOD_REVIEW', 'UNDER_OFFICE_PROCESSING'].includes(r.status)
  ).length;
  const approvedRequests = requests.filter(r =>
    ['FACULTY_APPROVED', 'HOD_APPROVED'].includes(r.status)
  ).length;
  const completedDocuments = requests.filter(r =>
    ['DOCUMENT_GENERATED', 'READY_FOR_DOWNLOAD', 'COMPLETED'].includes(r.status)
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Student Profile Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-400/30">
              <GraduationCap className="w-4 h-4" />
              Student Academic Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Manage your academic certification requests, monitor real-time faculty and HOD approvals, and download digitally signed documents.
            </p>
          </div>

          <Link
            to="/student/request"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-400 hover:to-indigo-400 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-500/30 hover:scale-105 transition-all shrink-0"
          >
            <FilePlus2 className="w-5 h-5" />
            + Request New Document
          </Link>
        </div>

        {/* Academic Details Strip */}
        {student && (
          <div className="mt-6 pt-6 border-t border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Student ID / Roll:</span>
              <p className="font-bold text-slate-100 text-sm">{student.studentIdNumber}</p>
            </div>
            <div>
              <span className="text-slate-400">Department:</span>
              <p className="font-bold text-slate-100 text-sm">{student.department.name}</p>
            </div>
            <div>
              <span className="text-slate-400">Current Standing:</span>
              <p className="font-bold text-slate-100 text-sm">Year {student.currentYear} &bull; Sem {student.currentSemester}</p>
            </div>
            <div>
              <span className="text-slate-400">Cumulative GPA:</span>
              <p className="font-bold text-emerald-400 text-sm">{student.cgpa.toFixed(2)} / 10.0</p>
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Requests</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalRequests}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-brand-500" /> Lifetime applications
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Review</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{pendingRequests}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">In approval pipeline</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">In Progress</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{approvedRequests}</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">Passed initial stages</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Ready & Completed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{completedDocuments}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Available for download</div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Document Requests</h2>
            <p className="text-xs text-slate-500">Click on any request to view its approval trail or download PDF</p>
          </div>
          <Link
            to="/student/my-requests"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View All ({totalRequests}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FilePlus2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No requests submitted yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click the button below to submit your first academic document request.
            </p>
            <Link
              to="/student/request"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow hover:bg-brand-500"
            >
              Request Document Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Request ID</th>
                  <th className="py-3.5 px-6">Document Type</th>
                  <th className="py-3.5 px-6">Submitted Date</th>
                  <th className="py-3.5 px-6">Current Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {requests.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-brand-700">
                      {req.requestNumber}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {req.documentType.name}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.generatedDocument && (
                          <a
                            href={req.generatedDocument.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <Link
                          to={`/student/requests/${req.id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Track
                        </Link>
                      </div>
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
