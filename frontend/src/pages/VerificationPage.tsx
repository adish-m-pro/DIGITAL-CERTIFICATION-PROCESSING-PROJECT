import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  ShieldCheck,
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  GraduationCap,
  Building,
  FileText,
  Download,
  ExternalLink,
  Search
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { verificationCode: urlCode } = useParams<{ verificationCode?: string }>();
  const [code, setCode] = useState(urlCode || '');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (urlCode) {
      verifyDocument(urlCode);
    }
  }, [urlCode]);

  const verifyDocument = async (searchCode: string) => {
    if (!searchCode.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await api.get(`/documents/verify/${searchCode.trim()}`);
      setData(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Document verification failed. No valid institutional record corresponds to this verification code.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    verifyDocument(code);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-4">
            Public Academic Document Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            National Institute of Advanced Technology &bull; Office of Academic Affairs & Records
          </p>
        </div>

        {/* Verification Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2 p-1.5 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter Verification Code (e.g. VERIFY-XYZ123) or scan QR code"
              className="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Verifying...' : 'Verify Now'}
            </button>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-12 text-center">
            <div className="w-10 h-10 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-200">Querying Official Institution Registry...</p>
            <p className="text-xs text-slate-400 mt-1">Validating digital signatures and issue timestamps</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-8 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-rose-400">Invalid or Unrecognized Certificate</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">{error}</p>
          </div>
        )}

        {/* Valid Certificate Result Card */}
        {data && (
          <div className="bg-slate-800/90 backdrop-blur-xl border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
            {/* Top Verified Ribbon */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Official Document Authenticated
                  </div>
                  <h2 className="text-xl font-bold text-white mt-0.5">{data.documentType}</h2>
                </div>
              </div>
              <span className="text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300">
                {data.documentNumber}
              </span>
            </div>

            {/* Document Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <User className="w-3.5 h-3.5 text-brand-400" /> Student Name
                </span>
                <p className="text-sm font-bold text-white mt-1">{data.studentName}</p>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <Award className="w-3.5 h-3.5 text-brand-400" /> Student Roll / ID
                </span>
                <p className="text-sm font-bold text-white mt-1">{data.studentIdNumber}</p>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <Building className="w-3.5 h-3.5 text-brand-400" /> Department
                </span>
                <p className="text-sm font-semibold text-white mt-1">{data.department}</p>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-brand-400" /> Degree & Course
                </span>
                <p className="text-sm font-semibold text-white mt-1">{data.course}</p>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" /> Issue Timestamp
                </span>
                <p className="text-sm font-semibold text-white mt-1">
                  {new Date(data.issuedDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verification Status
                </span>
                <p className="text-sm font-bold text-emerald-400 mt-1">{data.status}</p>
              </div>
            </div>

            {/* Issuing Authority & Actions */}
            <div className="pt-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Issuing Authority:</span> {data.issuingAuthority}
              </div>
              {data.fileUrl && (
                <a
                  href={data.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
                >
                  <FileText className="w-4 h-4" /> View Original Document
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
