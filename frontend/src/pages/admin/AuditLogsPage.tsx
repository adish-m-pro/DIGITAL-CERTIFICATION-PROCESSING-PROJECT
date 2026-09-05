import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { History, Search, ShieldCheck, Clock, UserCheck } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.request?.requestNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-600" />
          Tamper-Proof Audit Trail Explorer
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chronological record of every submission, faculty evaluation, HOD signoff, and document generation event.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit log records by operator, action, or request ID..."
          className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading audit history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Operator User</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Recorded Action</th>
                  <th className="py-3.5 px-6 text-right">Associated Request</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'medium' })}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {log.user ? log.user.name : 'System Automated'}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.user ? log.user.role : 'SYSTEM'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-brand-700">
                      {log.request ? log.request.requestNumber : '—'}
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
