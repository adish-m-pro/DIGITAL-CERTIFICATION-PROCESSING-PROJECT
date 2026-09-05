import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { RequestItem } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import {
  FileCheck2,
  Clock,
  Sparkles,
  Download,
  Eye,
  FileText,
  Search,
  CheckCircle2,
  QrCode
} from 'lucide-react';

export const OfficeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING_GENERATE' | 'GENERATED' | 'ALL'>('PENDING_GENERATE');
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load office queue', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (requestId: string) => {
    setGeneratingId(requestId);
    try {
      await api.post(`/requests/${requestId}/generate`);
      await fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate document');
    } finally {
      setGeneratingId(null);
    }
  };

  const pendingGenerateRequests = requests.filter(r =>
    ['UNDER_OFFICE_PROCESSING', 'HOD_APPROVED'].includes(r.status)
  );

  const generatedRequests = requests.filter(r =>
    ['DOCUMENT_GENERATED', 'READY_FOR_DOWNLOAD', 'COMPLETED'].includes(r.status)
  );

  const displayedRequests =
    activeTab === 'PENDING_GENERATE'
      ? pendingGenerateRequests
      : activeTab === 'GENERATED'
      ? generatedRequests
      : requests;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 mb-2">
          <FileCheck2 className="w-4 h-4" /> Academic Office & Registrar Desk
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Document Processing & Generation Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Process verified academic document applications, generate tamper-proof cryptographic PDFs with embedded QR codes, and archive official certificates.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div
          onClick={() => setActiveTab('PENDING_GENERATE')}
          className={`p-6 rounded-3xl border cursor-pointer transition-all ${
            activeTab === 'PENDING_GENERATE'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ready for PDF Generation</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{pendingGenerateRequests.length}</div>
          <div className="text-xs text-amber-700 font-semibold mt-1">
            Approved by HOD & waiting PDF stamping
          </div>
        </div>

        <div
          onClick={() => setActiveTab('GENERATED')}
          className={`p-6 rounded-3xl border cursor-pointer transition-all ${
            activeTab === 'GENERATED'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Documents Issued</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{generatedRequests.length}</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            Signed with active QR verification
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
            <span className="text-xs font-bold text-slate-500">Total University Requests</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{requests.length}</div>
          <div className="text-xs text-slate-500 mt-1">Overall collegiate requests</div>
        </div>
      </div>

      {/* Office Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {activeTab === 'PENDING_GENERATE' ? 'Pending PDF Generation Queue' : 'Academic Office Ledger'}
            </h2>
            <p className="text-xs text-slate-500">
              Generate official PDF certificates and preview generated verification QR links.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading document queue...</div>
        ) : displayedRequests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No requests currently in this processing category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Request ID</th>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Document Type</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Office Action</th>
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
                      {req.department.code}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.generatedDocument ? (
                          <>
                            <Link
                              to={`/verify/${req.generatedDocument.verificationCode}`}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Verify QR Portal"
                            >
                              <QrCode className="w-4 h-4 text-brand-600" />
                            </Link>
                            <a
                              href={req.generatedDocument.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
                            >
                              <Download className="w-3.5 h-3.5" /> PDF Ready
                            </a>
                          </>
                        ) : (
                          <button
                            onClick={() => handleGenerate(req.id)}
                            disabled={generatingId === req.id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {generatingId === req.id ? 'Generating...' : 'Generate PDF'}
                          </button>
                        )}
                        <Link
                          to={`/student/requests/${req.id}`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Details"
                        >
                          <Eye className="w-4 h-4" />
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
