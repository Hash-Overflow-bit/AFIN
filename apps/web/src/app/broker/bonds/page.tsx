'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { bondsApi, Bond } from '@/lib/api/bonds';
import { api } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Plus, Activity, Ban, PlayCircle } from 'lucide-react';

export default function BrokerBondsPage() {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const fetchBonds = async () => {
    setLoading(true);
    try {
      const result = await bondsApi.getBonds({
        search: debouncedSearch,
        status: statusFilter || undefined,
        limit: 50,
      });
      setBonds(result.data);
    } catch (error) {
      console.error('Failed to fetch bonds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonds();
  }, [debouncedSearch, statusFilter]);

  const handlePublish = async (id: string) => {
    if (!confirm('Are you sure you want to publish this bond? It will become visible to all investors.')) return;
    try {
      await bondsApi.publishBond(id);
      fetchBonds();
    } catch (error) {
      console.error('Failed to publish bond:', error);
      alert('Failed to publish bond.');
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm('Are you sure you want to close this bond? No further investments will be allowed.')) return;
    try {
      await bondsApi.closeBond(id);
      fetchBonds();
    } catch (error) {
      console.error('Failed to close bond:', error);
      alert('Failed to close bond.');
    }
  };

  const handleRunAllocation = async (id: string) => {
    if (!confirm('Run the Allocation Engine? This will distribute bonds to all investors with verified payments.')) return;
    try {
      const res = await api.post(`/allocations/run/${id}`);
      alert(res.data.message);
      fetchBonds();
    } catch (error: any) {
      console.error('Failed to run allocation:', error);
      alert(error.response?.data?.message || 'Failed to run allocation.');
    }
  };

  return (
    <div className="bg-surface-canvas-light text-ink min-h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[30px] font-medium leading-[1.2] text-primary tracking-tight">Bond Management</h1>
          <p className="text-[16px] text-ink/70 mt-1">Manage government bond offerings and their lifecycle.</p>
        </div>
        <Link 
          href="/broker/bonds/create" 
          className="inline-flex items-center gap-2 bg-accent-violet hover:bg-accent-violet-deep text-on-primary px-5 py-2.5 rounded-md font-bold text-[14px] transition-colors shadow-level-1"
        >
          <Plus size={18} />
          Create Bond
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center bg-surface-press-light p-4 rounded-lg border border-hairline-cloud mb-8 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50" size={18} />
          <input
            type="text"
            placeholder="Search bonds by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-canvas-light border border-hairline-cloud rounded-md pl-10 pr-4 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent-violet focus:border-transparent transition-all shadow-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface-canvas-light border border-hairline-cloud rounded-md px-4 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent-violet shadow-sm"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
          <option value="ALLOCATED">Allocated</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-canvas-light rounded-lg border border-hairline-cloud overflow-hidden shadow-level-1">
        <table className="w-full text-left text-[14px] text-ink">
          <thead className="bg-surface-press-light border-b border-hairline-cloud text-[12px] uppercase font-bold text-ink/60 tracking-console">
            <tr>
              <th className="px-6 py-4">Bond Name</th>
              <th className="px-6 py-4">Coupon Rate</th>
              <th className="px-6 py-4">Maturity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-cloud">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-ink/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-violet mx-auto"></div>
                </td>
              </tr>
            ) : bonds.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-ink/60 font-medium">
                  No bonds found matching your criteria.
                </td>
              </tr>
            ) : (
              bonds.map((bond) => (
                <tr key={bond.id} className="hover:bg-surface-press-light/50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-primary">{bond.name}</td>
                  <td className="px-6 py-4 font-mono">{bond.couponRate}%</td>
                  <td className="px-6 py-4">{new Date(bond.maturityDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[12px] font-bold 
                      ${bond.status === 'OPEN' ? 'bg-[#eefcf2] text-[#12b76a] border border-[#12b76a]/20' : 
                        bond.status === 'DRAFT' ? 'bg-[#fffaeb] text-[#f79009] border border-[#f79009]/20' : 
                        'bg-surface-press-stronger text-ink/70 border border-hairline-cloud'}`}
                    >
                      {bond.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bond.status === 'DRAFT' && (
                      <button 
                        onClick={() => handlePublish(bond.id)}
                        className="text-accent-violet hover:text-accent-violet-deep flex items-center gap-1 font-bold text-[13px] transition-colors"
                        title="Publish"
                      >
                        <Activity size={16} /> Publish
                      </button>
                    )}
                    {bond.status === 'OPEN' && (
                      <button 
                        onClick={() => handleClose(bond.id)}
                        className="text-ink/60 hover:text-ink flex items-center gap-1 font-bold text-[13px] transition-colors"
                        title="Close"
                      >
                        <Ban size={16} /> Close
                      </button>
                    )}
                    {(bond.status === 'CLOSED' || bond.status === 'OPEN') && (
                      <button 
                        onClick={() => handleRunAllocation(bond.id)}
                        className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-bold text-[13px] transition-colors ml-2"
                        title="Run Allocation"
                      >
                        <PlayCircle size={16} /> Run Allocation
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
