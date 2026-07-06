'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { api } from '@/lib/api';
import { ordersApi, Order } from '@/lib/api/orders';
import { Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Eye, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function InvestorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this pending order?')) return;
    setCancellingId(id);
    try {
      await ordersApi.cancelOrder(id);
      await fetchOrders(); // refresh
    } catch (error) {
      console.error('Failed to cancel order', error);
      alert('Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleUploadPayment = async () => {
    if (!payingOrderId || !paymentFile) return;
    setUploadingPayment(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', paymentFile);
      
      await api.post(`/payments/${payingOrderId}/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setPayingOrderId(null);
      setPaymentFile(null);
      await fetchOrders();
    } catch (error: any) {
      console.error('Upload failed', error);
      setUploadError(error.response?.data?.message || 'Failed to upload receipt.');
    } finally {
      setUploadingPayment(false);
    }
  };

  const formatter = new Intl.NumberFormat('en-MZ', { style: 'currency', currency: 'MZN' });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-700 rounded-[4px] border border-amber-200 flex items-center gap-1 w-fit">
            <Clock size={12} /> Pending Review
          </span>
        );
      case 'AWAITING_PAYMENT':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 rounded-[4px] border border-blue-200 flex items-center gap-1 w-fit">
            <RefreshCw size={12} /> Awaiting Payment
          </span>
        );
      case 'REJECTED':
      case 'PAYMENT_REJECTED':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-red-50 text-red-700 rounded-[4px] border border-red-200 flex items-center gap-1 w-fit">
            <XCircle size={12} /> Rejected
          </span>
        );
      case 'PAYMENT_SUBMITTED':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-purple-50 text-purple-700 rounded-[4px] border border-purple-200 flex items-center gap-1 w-fit">
            <Clock size={12} /> Verifying Payment
          </span>
        );
      case 'PAYMENT_VERIFIED':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 rounded-[4px] border border-emerald-200 flex items-center gap-1 w-fit">
            <CheckCircle2 size={12} /> Payment Verified
          </span>
        );
      case 'ALLOCATED':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 rounded-[4px] border border-indigo-200 flex items-center gap-1 w-fit">
            <CheckCircle2 size={12} /> Allocated
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-700 rounded-[4px] border border-gray-300 flex items-center gap-1 w-fit">
            <XCircle size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-700 rounded-[4px] border border-gray-300 flex items-center gap-1 w-fit">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-[1152px] mx-auto">
      <div className="space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[30px] font-bold text-[#1f1633] mb-2 leading-tight">My Investment Orders</h1>
            <p className="text-[#79628c]">Track and manage your bond allocations.</p>
          </div>
          <button onClick={fetchOrders} className="flex items-center gap-2 text-[14px] font-medium text-[#6a5fc1] hover:text-[#422082]">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#150f23]"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-[#79628c]" />
            </div>
            <h3 className="text-[20px] font-bold text-[#1f1633] mb-2">No Orders Found</h3>
            <p className="text-[#79628c] mb-6">You haven't placed any investment orders yet.</p>
            <Link 
              href="/marketplace" 
              className="inline-block px-[16px] py-[12px] bg-[#6a5fc1] text-white rounded-[8px] font-bold text-[14px] tracking-[0.2px] uppercase hover:bg-[#422082] transition-colors shadow-sm"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#cfcfdb] bg-[#f9fafb]">
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider">Order No.</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider">Bond</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider">Amount</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider">Date</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#f9fafb] transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-bold text-[#1f1633]">{order.orderNumber}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-[#1f1633]">{order.bond?.name}</div>
                        <div className="text-[12px] text-[#79628c]">Rate: {order.bond?.couponRate}%</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap font-bold text-[#1f1633]">
                        {formatter.format(Number(order.requestedAmount))}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-[14px] text-[#79628c]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        {order.status === 'PENDING_REVIEW' && (
                          <button
                            onClick={() => handleCancel(order.id)}
                            disabled={cancellingId === order.id}
                            className="text-[12px] font-bold uppercase tracking-wider text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                        {['REJECTED', 'PAYMENT_REJECTED'].includes(order.status) && order.rejectionReason && (
                          <button 
                            onClick={() => alert(`Rejection Reason: ${order.rejectionReason}`)}
                            className="text-[12px] font-bold uppercase tracking-wider text-[#6a5fc1] hover:text-[#422082]"
                          >
                            View Reason
                          </button>
                        )}
                        {(order.status === 'AWAITING_PAYMENT' || order.status === 'PAYMENT_REJECTED') && (
                          <button 
                            onClick={() => setPayingOrderId(order.id)}
                            className="px-3 py-1.5 bg-[#c2ef4e] text-[#1f1633] rounded-[4px] text-[12px] font-bold uppercase tracking-wider hover:bg-[#a6d830] transition-colors"
                          >
                            Upload Receipt
                          </button>
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

      {/* Payment Modal */}
      {payingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <button 
              onClick={() => {
                setPayingOrderId(null);
                setPaymentFile(null);
                setUploadError(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"
            >
              <XCircle size={24} />
            </button>
            <h2 className="text-[20px] font-bold text-[#1f1633] mb-2 flex items-center gap-2">
              <UploadCloud size={24} className="text-[#6a5fc1]" /> Upload Receipt
            </h2>
            <p className="text-[#79628c] text-[14px] mb-6">
              Please upload the proof of your bank transfer. Ensure the reference number is clearly visible.
            </p>
            
            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {uploadError}
              </div>
            )}

            <div className="mb-6">
              <FileUpload 
                onFileSelect={(file) => setPaymentFile(file)}
                accept="application/pdf,image/jpeg,image/png"
                maxSizeMB={10}
              />
              {paymentFile && (
                <p className="mt-2 text-sm font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={16} /> {paymentFile.name} ready to upload
                </p>
              )}
            </div>

            <button
              onClick={handleUploadPayment}
              disabled={!paymentFile || uploadingPayment}
              className="w-full py-3 bg-[#6a5fc1] text-white rounded-lg font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-[#422082] shadow-sm transition-colors"
            >
              {uploadingPayment ? 'Uploading...' : 'Submit Payment Proof'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
