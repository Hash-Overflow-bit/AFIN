'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  ShieldAlert, ChevronLeft, ChevronRight, X, 
  Loader2, Filter, Calendar, Terminal 
} from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [uniqueActions, setUniqueActions] = useState<string[]>([]);
  
  // Drawer state for JSON log details
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(actionFilter && { action: actionFilter }),
        ...(userIdFilter && { userId: userIdFilter }),
      });
      const response = await api.get(`/admin/activity-logs?${query.toString()}`);
      setLogs(response.data.logs);
      setTotal(response.data.total);
      setPages(response.data.pages);
      
      // Auto-extract unique actions for filtering drop-down if not already set
      if (uniqueActions.length === 0 && response.data.logs.length > 0) {
        // Fetch a wider batch to populate the filter dropdown comprehensively
        const broadRes = await api.get('/admin/activity-logs?limit=100');
        const actions = Array.from(new Set((broadRes.data.logs || []).map((l: any) => l.action))) as string[];
        setUniqueActions(actions);
      }
    } catch (err: any) {
      console.error('Failed to fetch activity logs:', err);
      toast.error('Failed to load system audit trails.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, userIdFilter]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f1633]">Security & Activity Audit Trails</h1>
          <p className="text-sm text-[#79628c] mt-1">Chronological log of security checks, financial distributions, database mutations, and administrative events.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-hairline-cool shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center space-x-2 text-slate-700 text-sm font-semibold">
          <Filter className="w-4 h-4 text-red-500" />
          <span>Filters:</span>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="border border-hairline-cool px-3 py-2 rounded-lg outline-none text-sm font-medium text-ink bg-white focus:border-red-500 transition-colors w-full"
          >
            <option value="">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter by User ID (UUID)..."
            value={userIdFilter}
            onChange={(e) => { setUserIdFilter(e.target.value); setPage(1); }}
            className="border border-hairline-cool px-3 py-2 rounded-lg outline-none text-sm font-medium text-ink focus:border-red-500 transition-colors w-full"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-hairline-cool shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-24 text-[#79628c] space-y-2">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-lg font-semibold">No audit logs found</p>
            <p className="text-sm">Activities appear here dynamically as events trigger across the network.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-night/5 text-xs font-semibold text-[#79628c] border-b border-hairline-cool">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Resource Type</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-cool text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-xs text-[#79628c] flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs font-bold text-red-700 bg-red-50 border border-red-200/50 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      {log.user ? (
                        <div>
                          <div className="font-semibold text-ink-deep">
                            {log.user.firstName} {log.user.lastName}
                          </div>
                          <div className="text-xs text-[#79628c]">{log.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-[#79628c] italic font-medium">System / Anonymous</span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {log.resourceType ? (
                        <div className="space-y-0.5">
                          <span className="text-xs">{log.resourceType}</span>
                          {log.resourceId && (
                            <div className="text-[10px] text-[#79628c] font-mono select-all truncate max-w-[120px]" title={log.resourceId}>
                              {log.resourceId}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-600">{log.ipAddress || '—'}</td>
                    <td className="p-4 text-right">
                      <Tooltip 
                        position="left"
                        content="Inspect log parameters: view the raw database mutation details, user agent parameters, and action metadata payload."
                      >
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="flex items-center space-x-1 border border-hairline-cool hover:bg-[#1f1633] hover:text-white hover:border-[#1f1633] px-2.5 py-1 rounded text-xs font-semibold text-slate-700 transition-all ml-auto"
                        >
                          <Terminal className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="p-4 border-t border-hairline-cool flex items-center justify-between bg-slate-50">
            <span className="text-xs text-[#79628c]">
              Showing page {page} of {pages} ({total} entries total)
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(prev => prev - 1)}
                className="p-1 rounded border border-hairline-cool hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(prev => prev + 1)}
                className="p-1 rounded border border-hairline-cool hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAILS DRAWER */}
      {selectedLog && (
        <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white z-50 shadow-2xl flex flex-col border-l border-hairline-cool animation-slide-in">
          <div className="p-6 border-b border-hairline-cool flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-bold text-[#1f1633] text-lg">Inspect Activity Trace</h3>
              <p className="text-xs text-[#79628c] mt-0.5">Metadata parameters parsed for audit ID {selectedLog.id}</p>
            </div>
            <button 
              onClick={() => setSelectedLog(null)}
              className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm border-b border-hairline-cool pb-4">
                <div>
                  <span className="block text-xs font-semibold text-[#79628c] uppercase">Action Name</span>
                  <span className="font-mono font-bold text-red-700 mt-1 inline-block">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-[#79628c] uppercase">Timestamp</span>
                  <span className="font-semibold text-ink-deep mt-1 inline-block">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm border-b border-hairline-cool pb-4">
                <div>
                  <span className="block text-xs font-semibold text-[#79628c] uppercase">Actor Email</span>
                  <span className="font-semibold text-ink-deep mt-1 inline-block">{selectedLog.user?.email || 'System'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-[#79628c] uppercase">IP Address</span>
                  <span className="font-mono text-slate-700 mt-1 inline-block">{selectedLog.ipAddress || '—'}</span>
                </div>
              </div>

              {selectedLog.resourceType && (
                <div className="text-sm border-b border-hairline-cool pb-4">
                  <span className="block text-xs font-semibold text-[#79628c] uppercase">Resource Reference</span>
                  <span className="font-medium text-slate-700 mt-1 inline-block">
                    Type: <span className="font-semibold">{selectedLog.resourceType}</span> | ID: <span className="font-mono text-xs">{selectedLog.resourceId || '—'}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[#79628c] uppercase">JSON Payload Details</span>
              <pre className="text-xs bg-slate-900 text-slate-100 p-4 rounded-xl font-mono overflow-x-auto shadow-inner max-h-[300px]">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>
          </div>

          <div className="p-6 border-t border-hairline-cool bg-slate-50 flex justify-end">
            <button
              onClick={() => setSelectedLog(null)}
              className="px-4 py-2 bg-[#1f1633] hover:bg-[#2b1f47] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
