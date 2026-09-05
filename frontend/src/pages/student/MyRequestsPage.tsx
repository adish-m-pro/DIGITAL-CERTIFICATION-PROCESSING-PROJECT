import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { RequestItem, DocumentType } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  FilePlus2,
  Sparkles
} from 'lucide-react';

export const MyRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDocType, setSelectedDocType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedStatus, selectedDocType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, typesRes] = await Promise.all([
        api.get('/requests', {
          params: {
            status: selectedStatus,
            documentTypeId: selectedDocType,
            search: search.trim() || undefined
          }
        }),
        api.get('/documents/types')
      ]);
      setRequests(reqRes.data);
      setDocTypes(typesRes.data);
    } catch (err) {
      console.error('Failed to load requests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-600" />
            My Submitted Document Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and track lifecycle approvals for all your requested academic certificates.
          </p>
        </div>
        <Link
          to="/student/request"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow transition-all shrink-0"
        >
          <FilePlus2 className="w-4 h-4" /> Request New Document
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Request Number (REQ-2026-...) or Purpose..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Document Types</option>
            {docTypes.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_FACULTY_REVIEW">Under Faculty Review</option>
            <option value="UNDER_HOD_REVIEW">Under HOD Review</option>
            <option value="UNDER_OFFICE_PROCESSING">Under Office Processing</option>
            <option value="READY_FOR_DOWNLOAD">Ready for Download</option>
            <option value="FACULTY_REJECTED">Faculty Rejected</option>
            <option value="HOD_REJECTED">HOD Rejected</option>
            <option value="CORRECTION_REQUIRED">Correction Required</option>
          </select>

          <button
            onClick={fetchData}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading document requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No matching requests found. Try adjusting your search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Request ID</th>
                  <th className="py-3.5 px-6">Document Type</th>
                  <th className="py-3.5 px-6">Purpose</th>
                  <th className="py-3.5 px-6">Submitted Date</th>
                  <th className="py-3.5 px-6">Current Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-brand-700">
                      {req.requestNumber}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {req.documentType.name}
                    </td>
                    <td className="py-4 px-6 text-slate-600 max-w-xs truncate" title={req.purpose}>
                      {req.purpose}
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
                          className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs transition-colors flex items-center gap-1"
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
