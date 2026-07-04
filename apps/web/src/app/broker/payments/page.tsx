'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, FileText, Download } from 'lucide-react';

export default function BrokerPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = async (id: string) => {
    if (!confirm('Are you sure you want to verify this payment?')) return;
    setActionLoading(id);
    try {
      await api.patch(`/payments/${id}/verify`);
      await fetchPayments();
    } catch (error: any) {
      console.error('Verify failed', error);
      alert(error.response?.data?.message || 'Failed to verify payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter reason for rejection:');
    if (!reason) return;
    setActionLoading(id);
    try {
      await api.patch(`/payments/${id}/reject`, { reason });
      await fetchPayments();
    } catch (error: any) {
      console.error('Reject failed', error);
      alert(error.response?.data?.message || 'Failed to reject payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (paymentId: string, fileName: string) => {
    try {
      const response = await api.get(`/payments/${paymentId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed', error);
      alert('Failed to download receipt.');
    }
  };

  const formatter = new Intl.NumberFormat('en-MZ', { style: 'currency', currency: 'MZN' });

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-[#1f1633] mb-2 leading-tight">Payment Verification</h1>
          <p className="text-[#79628c]">Review and verify uploaded bank transfer receipts from investors.</p>
        </div>
        <button onClick={fetchPayments} className="flex items-center gap-2 text-[14px] font-medium text-[#6a5fc1] hover:text-[#422082]">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#150f23]"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-[#79628c]" />
          </div>
          <h3 className="text-[20px] font-bold text-[#1f1633] mb-2">No Payments Found</h3>
          <p className="text-[#79628c]">There are currently no payment records in the system.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#cfcfdb] bg-[#f9fafb]">
                  <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider">Investor & Order</th>
                  <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider">Amount</th>
                  <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider">Receipt</th>
                  <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#1f1633]">{payment.investor?.firstName} {payment.investor?.lastName}</div>
                      <div className="text-[12px] text-[#79628c] mt-1 font-mono">{payment.order?.orderNumber}</div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap font-bold text-[#1f1633]">
                      {formatter.format(Number(payment.amount))}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {payment.receiptFileName ? (
                        <button
                          onClick={() => handleDownload(payment.id, payment.receiptFileName)}
                          className="flex items-center gap-2 text-[13px] font-bold text-[#6a5fc1] hover:text-[#422082] transition-colors"
                        >
                          <FileText size={16} /> Download
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No file</span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {payment.status === 'PENDING_VERIFICATION' ? (
                        <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-700 rounded-[4px] border border-amber-200 flex items-center gap-1 w-fit">
                          <RefreshCw size={12} /> Pending Review
                        </span>
                      ) : payment.status === 'VERIFIED' ? (
                        <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 rounded-[4px] border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-red-50 text-red-700 rounded-[4px] border border-red-200 flex items-center gap-1 w-fit">
                          <XCircle size={12} /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right space-x-3">
                      {payment.status === 'PENDING_VERIFICATION' && (
                        <>
                          <button
                            onClick={() => handleReject(payment.id)}
                            disabled={actionLoading === payment.id}
                            className="text-[12px] font-bold uppercase tracking-wider text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleVerify(payment.id)}
                            disabled={actionLoading === payment.id}
                            className="px-3 py-1.5 bg-[#150f23] text-white rounded-[4px] text-[12px] font-bold uppercase tracking-wider hover:bg-[#efefef] hover:text-[#1a1a1a] transition-colors disabled:opacity-50"
                          >
                            {actionLoading === payment.id ? 'Processing...' : 'Verify Payment'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
