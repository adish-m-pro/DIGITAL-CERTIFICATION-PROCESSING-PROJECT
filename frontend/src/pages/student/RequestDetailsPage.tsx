import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { RequestItem } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { RequestTimeline } from '../../components/RequestTimeline';
import {
  ArrowLeft,
  Download,
  FileText,
  Paperclip,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  QrCode,
  ShieldCheck,
  UserCheck,
  Clock
} from 'lucide-react';

export const RequestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState<RequestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Approval / Action modal state
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'CORRECTION' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Resubmit state for student
  const [resubmitPurpose, setResubmitPurpose] = useState('');
  const [resubmitRemarks, setResubmitRemarks] = useState('');
  const [showResubmit, setShowResubmit] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await api.get(`/requests/${id}`);
      setRequest(res.data);
      setResubmitPurpose(res.data.purpose);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionType) return;
    if ((actionType === 'REJECT' || actionType === 'CORRECTION') && !remarks.trim()) {
      alert('Please enter a remark / reason for this action.');
      return;
    }

    setActionLoading(true);
    try {
      let endpoint = `/requests/${id}/approve`;
      if (actionType === 'REJECT') endpoint = `/requests/${id}/reject`;
      else if (actionType === 'CORRECTION') endpoint = `/requests/${id}/correction`;

      await api.post(endpoint, { remarks });
      setActionType(null);
      setRemarks('');
      await fetchRequest();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Workflow action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setActionLoading(true);
    try {
      await api.post(`/requests/${id}/generate`);
      await fetchRequest();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate PDF');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post(`/requests/${id}/resubmit`, {
        purpose: resubmitPurpose,
        additionalRemarks: resubmitRemarks
      });
      setShowResubmit(false);
      await fetchRequest();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to resubmit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTrackDownload = async () => {
    if (request?.generatedDocument) {
      try {
        await api.post(`/documents/${request.generatedDocument.id}/track-download`);
      } catch {
        // ignore
      }
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading request information...</div>;
  }

  if (error || !request) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Request Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Permission checks
  const canFacultyAct =
    user?.role === 'FACULTY' &&
    (request.status === 'UNDER_FACULTY_REVIEW' || request.status === 'SUBMITTED');

  const canHodAct =
    user?.role === 'HOD' &&
    request.status === 'UNDER_HOD_REVIEW';

  const canOfficeAct =
    (user?.role === 'OFFICE' || user?.role === 'ADMIN') &&
    (request.status === 'UNDER_OFFICE_PROCESSING' || request.status === 'HOD_APPROVED');

  const canStudentResubmit =
    user?.role === 'STUDENT' &&
    request.status === 'CORRECTION_REQUIRED';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 font-mono">
                {request.requestNumber}
              </h1>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {request.documentType.name} &bull; Submitted on {new Date(request.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Action Buttons for Approvers / Office */}
        <div className="flex items-center gap-2">
          {canFacultyAct && (
            <>
              <button
                onClick={() => setActionType('APPROVE')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Verify & Approve
              </button>
              <button
                onClick={() => setActionType('CORRECTION')}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Request Correction
              </button>
              <button
                onClick={() => setActionType('REJECT')}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}

          {canHodAct && (
            <>
              <button
                onClick={() => setActionType('APPROVE')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> HOD Endorse & Approve
              </button>
              <button
                onClick={() => setActionType('CORRECTION')}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                Send Back
              </button>
              <button
                onClick={() => setActionType('REJECT')}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}

          {canOfficeAct && (
            <button
              onClick={handleGeneratePDF}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {actionLoading ? 'Generating...' : 'Generate Verified Document PDF'}
            </button>
          )}

          {canStudentResubmit && (
            <button
              onClick={() => setShowResubmit(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Resubmit with Corrections
            </button>
          )}
        </div>
      </div>

      {/* Generated Document Download Banner (if ready) */}
      {request.generatedDocument && (
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 border-2 border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Officially Issued & Cryptographically Sealed
              </div>
              <h3 className="text-lg font-extrabold text-white mt-0.5">
                {request.documentType.name} is Ready!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Ref: <span className="font-mono text-emerald-300 font-bold">{request.generatedDocument.documentNumber}</span> &bull; Code: {request.generatedDocument.verificationCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={`/verify/${request.generatedDocument.verificationCode}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-emerald-400" /> Verify QR
            </Link>
            <a
              href={request.generatedDocument.fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              onClick={handleTrackDownload}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Official PDF
            </a>
          </div>
        </div>
      )}

      {/* Grid: Student & Request Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Request Details & Attachments */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              Application Particulars
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Document Type:</span>
                <p className="font-bold text-slate-900 mt-0.5">{request.documentType.name}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Department:</span>
                <p className="font-bold text-slate-900 mt-0.5">{request.department.name}</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl text-xs">
              <span className="text-slate-500 font-medium">Declared Purpose:</span>
              <p className="font-semibold text-slate-800 mt-1 leading-relaxed">
                "{request.purpose}"
              </p>
            </div>

            {request.additionalRemarks && (
              <div className="p-3.5 bg-slate-50 rounded-xl text-xs">
                <span className="text-slate-500 font-medium">Additional Student Remarks:</span>
                <p className="text-slate-700 mt-1 italic">
                  "{request.additionalRemarks}"
                </p>
              </div>
            )}

            {request.rejectionReason && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
                <div className="font-bold flex items-center gap-1.5 text-rose-800">
                  <XCircle className="w-4 h-4" /> Rejection Remark:
                </div>
                <p className="mt-1">{request.rejectionReason}</p>
              </div>
            )}

            {request.correctionRemarks && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Correction Instructions:
                </div>
                <p className="mt-1">{request.correctionRemarks}</p>
              </div>
            )}

            {/* Attachments */}
            {request.attachments && request.attachments.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Uploaded Supporting Attachments ({request.attachments.length})
                </span>
                <div className="space-y-2">
                  {request.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{att.fileOriginalName}</span>
                      </div>
                      <a
                        href={att.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 px-2 py-1 rounded bg-brand-50"
                      >
                        View / Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Workflow Timeline Component */}
          <RequestTimeline request={request} />
        </div>

        {/* Right 1 Col: Student Verified Academic Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-600" />
              Verified Student Record
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Student Name:</span>
                <p className="font-bold text-slate-900">{request.student.user.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Roll / ID Number:</span>
                <p className="font-mono font-bold text-brand-700">{request.student.studentIdNumber}</p>
              </div>
              <div>
                <span className="text-slate-400">Email Address:</span>
                <p className="text-slate-700">{request.student.user.email}</p>
              </div>
              <div>
                <span className="text-slate-400">Course & Program:</span>
                <p className="font-semibold text-slate-800">{request.student.course.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Academic Standing:</span>
                <p className="font-semibold text-slate-800">
                  Year {request.student.currentYear} &bull; Semester {request.student.currentSemester} ({request.student.academicBatch})
                </p>
              </div>
              <div>
                <span className="text-slate-400">Current CGPA:</span>
                <p className="font-bold text-emerald-600">{request.student.cgpa.toFixed(2)} / 10.0</p>
              </div>
              <div>
                <span className="text-slate-400">Assigned Faculty Advisor:</span>
                <p className="font-semibold text-slate-800">
                  {request.student.advisor?.user.name || 'Dr. Priya Sharma'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Dialog Modal */}
      {actionType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              {actionType === 'APPROVE' && 'Approve Document Request'}
              {actionType === 'REJECT' && 'Reject Document Request'}
              {actionType === 'CORRECTION' && 'Request Corrections from Student'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {actionType === 'APPROVE' && 'Verify and advance this request to the next workflow stage.'}
              {actionType === 'REJECT' && 'Provide a clear rejection reason for the applicant.'}
              {actionType === 'CORRECTION' && 'Explain what details or documents need correction.'}
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {actionType === 'APPROVE' ? 'Approval Remarks (Optional)' : 'Remarks / Reason (Required)'}
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActionType(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAction}
                disabled={actionLoading}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow ${
                  actionType === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : actionType === 'REJECT'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resubmit Modal for Student */}
      {showResubmit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleResubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95"
          >
            <h3 className="text-lg font-bold text-slate-900">Resubmit Application with Corrections</h3>
            <p className="text-xs text-slate-500 mt-1">
              Update your application details according to reviewer feedback.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Updated Purpose</label>
                <textarea
                  rows={2}
                  value={resubmitPurpose}
                  onChange={(e) => setResubmitPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correction Notes</label>
                <input
                  type="text"
                  value={resubmitRemarks}
                  onChange={(e) => setResubmitRemarks(e.target.value)}
                  placeholder="Explain the changes made..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResubmit(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow"
              >
                {actionLoading ? 'Resubmitting...' : 'Resubmit Now'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
