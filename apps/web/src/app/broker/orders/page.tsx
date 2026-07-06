'use client';

import { useState, useEffect } from 'react';
import { ordersApi, Order } from '@/lib/api/orders';
import { Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Eye } from 'lucide-react';

export default function BrokerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getAllOrders();
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

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this order and request payment from the investor?')) return;
    setActioningId(id);
    try {
      await ordersApi.approveOrder(id);
      await fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve order');
    } finally {
      setActioningId(null);
    }
  };

  const openRejectModal = (id: string) => {
    setSelectedOrderId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const submitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !rejectReason) return;
    
    setActioningId(selectedOrderId);
    try {
      await ordersApi.rejectOrder(selectedOrderId, rejectReason);
      setRejectModalOpen(false);
      await fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject order');
    } finally {
      setActioningId(null);
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
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-700 rounded-[4px] border border-gray-300 flex items-center gap-1 w-fit">
            <XCircle size={12} /> {status}
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
            <h1 className="text-[30px] font-bold text-[#1f1633] mb-2 leading-tight">Order Management</h1>
            <p className="text-[#79628c]">Review and process incoming investment orders.</p>
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
              <CheckCircle2 size={32} className="text-[#79628c]" />
            </div>
            <h3 className="text-[20px] font-bold text-[#1f1633] mb-2">Inbox Zero</h3>
            <p className="text-[#79628c]">There are no investment orders to review at this time.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#cfcfdb] bg-[#f9fafb]">
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider">Order No.</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider">Investor</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider">Bond</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider">Amount</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#f9fafb] transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-bold text-[#1f1633]">{order.orderNumber}</div>
                        <div className="text-[12px] text-[#79628c]">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-[#1f1633]">{order.investor?.firstName} {order.investor?.lastName}</div>
                        <div className="text-[12px] text-[#79628c]">{order.investor?.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-[#1f1633]">{order.bond?.name}</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap font-bold text-[#1f1633]">
                        {formatter.format(Number(order.requestedAmount))}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-right space-x-2">
                        {order.status === 'PENDING_REVIEW' && (
                          <>
                            <button
                              onClick={() => openRejectModal(order.id)}
                              disabled={actioningId === order.id}
                              className="px-3 py-1.5 border border-[#cfcfdb] text-[#1f1633] rounded-[4px] text-[12px] font-bold uppercase tracking-wider hover:bg-[#f9fafb] transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(order.id)}
                              disabled={actioningId === order.id}
                              className="px-3 py-1.5 bg-[#6a5fc1] text-white rounded-[4px] text-[12px] font-bold uppercase tracking-wider hover:bg-[#422082] transition-colors disabled:opacity-50 shadow-sm"
                            >
                              Approve
                            </button>
                          </>
                        )}
                        {order.status !== 'PENDING_REVIEW' && (
                           <span className="text-[12px] text-[#79628c] italic">Processed</span>
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

      {/* REJECT MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#150f23]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-[rgba(0,0,0,0.1)_0_10px_15px_-3px] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-[#e5e7eb]">
              <h2 className="text-[20px] font-bold text-[#1f1633]">Reject Order</h2>
            </div>
            
            <form onSubmit={submitReject} className="p-6 space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#1f1633] mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-white text-[#1f1633] text-[14px] rounded-[6px] border border-[#cfcfdb] py-[8px] px-[12px] focus:outline-none focus:border-[#6a5fc1] focus:ring-1 focus:ring-[#9dc1f5]"
                  placeholder="Explain why this order is being rejected..."
                ></textarea>
                <p className="text-[12px] text-[#79628c] mt-1">This reason will be visible to the investor.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="flex-1 py-[10px] rounded-[6px] font-bold text-[14px] uppercase tracking-[0.2px] text-[#1f1633] hover:bg-[#f9fafb]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!actioningId || !rejectReason}
                  className="flex-1 py-[10px] rounded-[6px] font-bold text-[14px] uppercase tracking-[0.2px] bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
