'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { bondsApi, Bond } from '@/lib/api/bonds';
import { useTranslations } from 'next-intl';
import { PlayCircle, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface ProjectedAllocation {
  orderId: string;
  investorId: string;
  investorName: string;
  requestedAmount: number;
  allocatedAmount: number;
  unitsAllocated: number;
}

interface AllocationPreview {
  bondId: string;
  bondName: string;
  totalSupply: number;
  totalDemand: number;
  ratio: number;
  totalAllocated: number;
  projectedAllocations: ProjectedAllocation[];
}

export default function BrokerAllocationsPage() {
  const t = useTranslations("BrokerAllocations");
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [selectedBondId, setSelectedBondId] = useState<string>('');
  const [preview, setPreview] = useState<AllocationPreview | null>(null);
  const [loadingBonds, setLoadingBonds] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const fetchBonds = async () => {
      try {
        const res = await bondsApi.getBonds({ limit: 100 });
        console.log('Fetched bonds response:', res);
        const bondsArray = Array.isArray(res) ? res : (res.data || []);
        const eligibleBonds = bondsArray.filter((b: Bond) => b.status === 'OPEN' || b.status === 'CLOSED' || b.status === 'ALLOCATED');
        console.log('Eligible bonds for dropdown:', eligibleBonds);
        setBonds(eligibleBonds);
      } catch (err) {
        console.error('Failed to fetch bonds', err);
      } finally {
        setLoadingBonds(false);
      }
    };
    fetchBonds();
  }, []);

  const handleBondSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bondId = e.target.value;
    setSelectedBondId(bondId);
    if (!bondId) {
      setPreview(null);
      return;
    }

    setLoadingPreview(true);
    try {
      const res = await api.get(`/allocations/bond/${bondId}`);
      setPreview(res.data);
    } catch (err) {
      console.error('Failed to fetch preview', err);
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleRunAllocation = async () => {
    if (!preview) return;
    if (!confirm(t('confirmExecute', { bondName: preview.bondName }))) return;

    setRunning(true);
    try {
      const res = await api.post(`/allocations/run/${preview.bondId}`);
      alert(res.data.message);
      // Reload bonds to update status
      const updatedBonds = await bondsApi.getBonds();
      setBonds(updatedBonds.data.filter((b: Bond) => b.status === 'OPEN' || b.status === 'CLOSED'));
      setPreview(null);
      setSelectedBondId('');
    } catch (err: any) {
      console.error('Allocation failed', err);
      alert(err.response?.data?.message || t('failedAllocation'));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-surface-canvas-light text-ink min-h-full">
      <div className="mb-8">
        <h1 className="text-[30px] font-medium leading-[1.2] text-primary tracking-tight">{t('title')}</h1>
        <p className="text-[16px] text-ink/70 mt-1">{t('subtitle')}</p>
      </div>

      <div className="bg-surface-press-light p-6 rounded-lg border border-hairline-cloud mb-8 shadow-sm">
        <label className="block text-[14px] font-bold text-ink/70 uppercase tracking-console mb-2">
          {t('selectBondLabel')}
        </label>
        <select
          value={selectedBondId}
          onChange={handleBondSelect}
          disabled={loadingBonds}
          className="w-full md:w-1/2 bg-surface-canvas-light border border-hairline-cloud rounded-md px-4 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent-violet shadow-sm"
        >
          <option value="">{t('selectBondOption')}</option>
          {bonds.map(b => (
            <option key={b.id} value={b.id}>{b.name} ({b.status})</option>
          ))}
        </select>
      </div>

      {loadingPreview && (
        <div className="flex justify-center py-12">
          <RefreshCw className="animate-spin text-accent-violet h-8 w-8" />
        </div>
      )}

      {preview && !loadingPreview && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface-canvas-light p-4 rounded-lg border border-hairline-cloud shadow-sm text-center">
              <p className="text-[12px] uppercase font-bold text-ink/60 tracking-console mb-1">{t('metricsTotalSupply')}</p>
              <p className="text-[24px] font-medium text-primary">{preview.totalSupply.toLocaleString()}</p>
            </div>
            <div className="bg-surface-canvas-light p-4 rounded-lg border border-hairline-cloud shadow-sm text-center">
              <p className="text-[12px] uppercase font-bold text-ink/60 tracking-console mb-1">{t('metricsTotalDemand')}</p>
              <p className="text-[24px] font-medium text-primary">{preview.totalDemand.toLocaleString()}</p>
            </div>
            <div className="bg-surface-canvas-light p-4 rounded-lg border border-hairline-cloud shadow-sm text-center">
              <p className="text-[12px] uppercase font-bold text-ink/60 tracking-console mb-1">{t('metricsAllocationRatio')}</p>
              <p className="text-[24px] font-medium text-primary">{(preview.ratio * 100).toFixed(2)}%</p>
            </div>
            <div className="bg-surface-canvas-light p-4 rounded-lg border border-hairline-cloud shadow-sm text-center">
              <p className="text-[12px] uppercase font-bold text-ink/60 tracking-console mb-1">{t('metricsProjectedDist')}</p>
              <p className="text-[24px] font-medium text-emerald-600">{preview.totalAllocated.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRunAllocation}
              disabled={running || preview.projectedAllocations.length === 0}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-3 rounded-md font-bold text-[14px] transition-colors shadow-level-1"
            >
              {running ? <RefreshCw className="animate-spin" size={18} /> : <PlayCircle size={18} />}
              {running ? t('btnExecuting') : t('btnExecute')}
            </button>
          </div>

          <div className="bg-surface-canvas-light rounded-lg border border-hairline-cloud overflow-hidden shadow-level-1">
            <div className="p-4 bg-surface-press-light border-b border-hairline-cloud flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600" />
              <h2 className="font-bold text-ink">{t('tableTitle')}</h2>
            </div>
            <table className="w-full text-left text-[14px] text-ink">
              <thead className="bg-surface-canvas border-b border-hairline-cloud text-[12px] uppercase font-bold text-ink/60 tracking-console">
                <tr>
                  <th className="px-6 py-4">{t('colInvestorName')}</th>
                  <th className="px-6 py-4 text-right">{t('colRequested')}</th>
                  <th className="px-6 py-4 text-right">{t('colAllocated')}</th>
                  <th className="px-6 py-4 text-right">{t('colUnits')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-cloud">
                {preview.projectedAllocations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-ink/50">
                      <AlertCircle className="mx-auto mb-2 opacity-50" size={24} />
                      {t('noVerifiedPayments')}
                    </td>
                  </tr>
                ) : (
                  preview.projectedAllocations.map((alloc) => (
                    <tr key={alloc.orderId} className="hover:bg-surface-press-light/50 transition-colors">
                      <td className="px-6 py-4 font-semibold">{alloc.investorName}</td>
                      <td className="px-6 py-4 text-right font-mono">{alloc.requestedAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-600 font-bold">{alloc.allocatedAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">{alloc.unitsAllocated}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
