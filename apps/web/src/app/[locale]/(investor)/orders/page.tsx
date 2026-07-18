'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { api } from '@/lib/api';
import { ordersApi, Order } from '@/lib/api/orders';
import { Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Eye, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { Skeleton, SkeletonRow } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function InvestorOrdersPage() {
  const t = useTranslations("Orders");
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
    if (!confirm(t('confirmCancel'))) return;
    setCancellingId(id);
    try {
      await ordersApi.cancelOrder(id);
      await fetchOrders(); // refresh
    } catch (error) {
      console.error('Failed to cancel order', error);
      alert(t('failedCancel'));
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
      setUploadError(error.response?.data?.message || t('failedUpload'));
    } finally {
      setUploadingPayment(false);
    }
  };

  const formatter = new Intl.NumberFormat('en-MZ', { style: 'currency', currency: 'MZN' });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-[4px] border border-amber-200 dark:border-amber-900/50 flex items-center gap-1 w-fit">
            <Clock size={12} /> {t('statusPendingReview')}
          </span>
        );
      case 'AWAITING_PAYMENT':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-[4px] border border-blue-200 dark:border-blue-900/50 flex items-center gap-1 w-fit">
            <RefreshCw size={12} /> {t('statusAwaitingPayment')}
          </span>
        );
      case 'REJECTED':
      case 'PAYMENT_REJECTED':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-[4px] border border-red-200 dark:border-red-900/50 flex items-center gap-1 w-fit">
            <XCircle size={12} /> {t('statusRejected')}
          </span>
        );
      case 'PAYMENT_SUBMITTED':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 rounded-[4px] border border-purple-200 dark:border-purple-900/50 flex items-center gap-1 w-fit">
            <Clock size={12} /> {t('statusVerifyingPayment')}
          </span>
        );
      case 'PAYMENT_VERIFIED':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-[4px] border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1 w-fit">
            <CheckCircle2 size={12} /> {t('statusPaymentVerified')}
          </span>
        );
      case 'ALLOCATED':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 rounded-[4px] border border-indigo-200 dark:border-indigo-900/50 flex items-center gap-1 w-fit">
            <CheckCircle2 size={12} /> {t('statusAllocated')}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-400 rounded-[4px] border border-gray-300 dark:border-slate-800 flex items-center gap-1 w-fit">
            <XCircle size={12} /> {t('statusCancelled')}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-400 rounded-[4px] border border-gray-300 dark:border-slate-800 flex items-center gap-1 w-fit">
            {status}
          </span>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 pb-12 max-w-[1440px] mx-auto text-[#1f1633] dark:text-white"
    >
      <div className="space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[30px] font-bold text-[#1f1633] dark:text-white mb-2 leading-tight">{t('title')}</h1>
            <p className="text-[#79628c] dark:text-on-dark-muted">{t('subtitle')}</p>
          </div>
          <button 
            onClick={fetchOrders} 
            className="flex items-center gap-2 text-[14px] font-semibold text-[#6a5fc1] dark:text-accent-lime hover:text-[#422082] dark:hover:text-white transition-colors"
          >
            <RefreshCw size={16} /> {t('refresh')}
          </button>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#cfcfdb] dark:border-hairline-violet bg-[#f9fafb] dark:bg-[#1a1130]">
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] dark:text-on-dark-muted uppercase">{t('orderNo')}</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] dark:text-on-dark-muted uppercase">{t('bond')}</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] dark:text-on-dark-muted uppercase">{t('amount')}</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] dark:text-on-dark-muted uppercase text-right">{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  <SkeletonRow cols={4} />
                  <SkeletonRow cols={4} />
                  <SkeletonRow cols={4} />
                </tbody>
              </table>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState 
            icon={AlertCircle}
            title={t('noOrdersTitle')}
            description={t('noOrdersDesc')}
            actionLabel={t('browseMarketplace')}
            onAction={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/marketplace';
              }
            }}
          />
        ) : (
          <div className="bg-white dark:bg-ink-deep rounded-xl border border-[#e5e7eb] dark:border-hairline-violet shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#cfcfdb] dark:border-hairline-violet bg-[#f9fafb] dark:bg-[#1a1130]">
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] dark:text-on-dark-muted uppercase tracking-wider">{t('orderNo')}</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] dark:text-on-dark-muted uppercase tracking-wider">{t('bond')}</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] dark:text-on-dark-muted uppercase tracking-wider">{t('amount')}</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] dark:text-on-dark-muted uppercase tracking-wider">{t('date')}</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] dark:text-on-dark-muted uppercase tracking-wider">{t('status')}</th>
                    <th className="py-4 px-6 text-[12px] font-semibold text-[#79628c] dark:text-on-dark-muted uppercase tracking-wider text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb] dark:divide-hairline-violet text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#f9fafb] dark:hover:bg-[#1f1735]/40 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-bold text-[#1f1633] dark:text-white">{order.orderNumber}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-[#1f1633] dark:text-white">{order.bond?.name}</div>
                        <div className="text-[12px] text-[#79628c] dark:text-on-dark-muted">{t('rate')}: {order.bond?.couponRate}%</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap font-bold text-[#1f1633] dark:text-white">
                        {formatter.format(Number(order.requestedAmount))}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-[14px] text-[#79628c] dark:text-on-dark-muted">
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
                            className="text-[12px] font-bold uppercase tracking-wider text-red-600 hover:text-red-800 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
                          >
                            {cancellingId === order.id ? t('cancelling') : t('cancel')}
                          </button>
                        )}
                        {['REJECTED', 'PAYMENT_REJECTED'].includes(order.status) && order.rejectionReason && (
                          <button 
                            onClick={() => alert(`Rejection Reason: ${order.rejectionReason}`)}
                            className="text-[12px] font-bold uppercase tracking-wider text-[#6a5fc1] dark:text-accent-lime hover:text-[#422082] dark:hover:text-white transition-colors"
                          >
                            {t('viewReason')}
                          </button>
                        )}
                        {(order.status === 'AWAITING_PAYMENT' || order.status === 'PAYMENT_REJECTED') && (
                          <button 
                            onClick={() => setPayingOrderId(order.id)}
                            className="px-3 py-1.5 bg-[#c2ef4e] text-[#1f1633] rounded-[4px] text-[12px] font-bold uppercase tracking-wider hover:bg-[#a6d830] transition-colors shadow-sm"
                          >
                            {t('uploadReceiptBtn')}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-ink-deep border border-slate-200 dark:border-hairline-violet rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <button 
              onClick={() => {
                setPayingOrderId(null);
                setPaymentFile(null);
                setUploadError(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <XCircle size={24} />
            </button>
            <h2 className="text-[20px] font-bold text-[#1f1633] dark:text-white mb-2 flex items-center gap-2">
              <UploadCloud size={24} className="text-[#6a5fc1] dark:text-accent-lime" /> {t('uploadReceiptTitle')}
            </h2>
            <p className="text-[#79628c] dark:text-on-dark-muted text-[14px] mb-6">
              {t('uploadReceiptDesc')}
            </p>
            
            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-900/50">
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
                <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-accent-lime flex items-center gap-1">
                  <CheckCircle2 size={16} /> {paymentFile.name} {t('readyToUpload')}
                </p>
              )}
            </div>

            <button
              onClick={handleUploadPayment}
              disabled={!paymentFile || uploadingPayment}
              className="w-full py-3 bg-[#6a5fc1] dark:bg-accent-violet-deep text-white rounded-lg font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-[#422082] dark:hover:bg-accent-violet shadow-sm transition-all"
            >
              {uploadingPayment ? t('uploading') : t('submitProof')}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
