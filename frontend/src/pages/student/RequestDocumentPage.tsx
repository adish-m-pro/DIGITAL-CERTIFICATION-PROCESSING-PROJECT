import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { DocumentType } from '../../types';
import confetti from 'canvas-confetti';
import {
  Award,
  GraduationCap,
  MailCheck,
  BookCheck,
  ShieldCheck,
  BadgeCheck,
  Languages,
  FileText,
  Clock,
  ArrowRight,
  Upload,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  AlertCircle
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Award,
  GraduationCap,
  MailCheck,
  BookCheck,
  ShieldCheck,
  BadgeCheck,
  Languages,
  FileText
};

export const RequestDocumentPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [purpose, setPurpose] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [additionalRemarks, setAdditionalRemarks] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const [loading, setLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    fetchDocTypes();
  }, []);

  const fetchDocTypes = async () => {
    try {
      const res = await api.get('/documents/types');
      setDocumentTypes(res.data);
    } catch (err) {
      console.error('Failed to fetch doc types', err);
    } finally {
      setTypesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    if (!purpose.trim()) {
      setError('Please enter the purpose of the document.');
      return;
    }

    if (selectedDoc.requiresUpload && (!files || files.length === 0)) {
      setError(`Please upload the required supporting document (${selectedDoc.uploadDocLabel || 'Attachment'}).`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('documentTypeId', selectedDoc.id);
      formData.append('purpose', purpose);
      if (requiredDate) formData.append('requiredDate', requiredDate);
      if (additionalRemarks) formData.append('additionalRemarks', additionalRemarks);

      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append('attachments', files[i]);
        }
      }

      const res = await api.post('/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSuccessData(res.data.request);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit document request.');
    } finally {
      setLoading(false);
    }
  };

  const student = user?.studentProfile;

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in zoom-in-95">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Request Submitted Successfully!</h2>
          <p className="text-sm text-slate-500 mt-2">
            Your application has been registered into the academic automation workflow.
          </p>

          <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Tracking Reference:</span>
              <span className="font-mono font-bold text-brand-700">{successData.requestNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Document Type:</span>
              <span className="font-semibold text-slate-900">{selectedDoc?.name}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Current Lifecycle Status:</span>
              <span className="font-bold text-blue-600">{successData.status.replace(/_/g, ' ')}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/student/requests/${successData.id}`)}
              className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              Track Request Timeline <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSuccessData(null);
                setSelectedDoc(null);
                setPurpose('');
                setAdditionalRemarks('');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Award className="w-7 h-7 text-brand-600" />
          Request Academic Document
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select the official collegiate document you require and complete the verification form below.
        </p>
      </div>

      {/* Document Selection Grid */}
      <div className="space-y-4">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Step 1: Select Document Type
        </label>
        {typesLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading document catalogs...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              const IconComp = ICON_MAP[doc.icon] || FileText;

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/50 shadow-md ring-2 ring-brand-200'
                      : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {doc.estimatedDays} Days
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-3">{doc.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{doc.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {doc.requiresUpload ? (
                      <span className="text-amber-600 text-[11px] font-medium flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Upload Required
                      </span>
                    ) : (
                      <span className="text-emerald-600 text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Direct Verification
                      </span>
                    )}
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-brand-700' : 'text-slate-400'
                      }`}
                    >
                      {isSelected ? 'Selected ✓' : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 2: Request Form (Shown once document selected) */}
      {selectedDoc && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              Step 2: Request Information for {selectedDoc.name}
            </h2>
            <p className="text-xs text-slate-500">
              Verified institutional credentials will be automatically affixed to this document.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Auto-populated Verified Student Profile Information (Read-Only) */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-brand-600" /> Auto-Populated Verified Academic Records (Locked)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Student Name:</span>
                <p className="font-bold text-slate-800">{user?.name}</p>
              </div>
              <div>
                <span className="text-slate-500">Student ID / Roll:</span>
                <p className="font-bold text-slate-800">{student?.studentIdNumber || 'STU2023001'}</p>
              </div>
              <div>
                <span className="text-slate-500">Department:</span>
                <p className="font-bold text-slate-800">{student?.department?.name || 'CSE'}</p>
              </div>
              <div>
                <span className="text-slate-500">Program / Degree:</span>
                <p className="font-bold text-slate-800">{student?.course?.name || 'B.Tech CSE'}</p>
              </div>
              <div>
                <span className="text-slate-500">Academic Standing:</span>
                <p className="font-bold text-slate-800">Year {student?.currentYear} &bull; Sem {student?.currentSemester}</p>
              </div>
              <div>
                <span className="text-slate-500">Faculty Advisor:</span>
                <p className="font-bold text-slate-800">{student?.advisor?.user?.name || 'Assigned Advisor'}</p>
              </div>
            </div>
          </div>

          {/* Dynamic Purpose & Required Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Purpose of Document <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Higher Education Scholarship Application, Bank Education Loan, Visa Processing, Internship..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Required By Date (Optional)
              </label>
              <input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Additional Remarks for Approvers (Optional)
              </label>
              <input
                type="text"
                value={additionalRemarks}
                onChange={(e) => setAdditionalRemarks(e.target.value)}
                placeholder="Any special endorsements or notes..."
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supporting Attachments {selectedDoc.requiresUpload && <span className="text-rose-500">* ({selectedDoc.uploadDocLabel})</span>}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-2xl hover:border-brand-400 bg-slate-50/50 transition-all">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-9 w-9 text-slate-400" />
                <div className="flex text-xs text-slate-600">
                  <label className="relative cursor-pointer bg-transparent rounded-md font-bold text-brand-600 hover:text-brand-500">
                    <span>Upload files</span>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setFiles(e.target.files)}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-[11px] text-slate-500">PDF, PNG, JPG up to 10MB</p>
                {files && files.length > 0 && (
                  <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                    {files.length} file(s) attached: {Array.from(files).map((f) => f.name).join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setSelectedDoc(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-600/20 transition-all flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Submit Application <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
