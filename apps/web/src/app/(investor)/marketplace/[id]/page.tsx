'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bondsApi, Bond } from '@/lib/api/bonds';
import { ordersApi } from '@/lib/api/orders';
import { ArrowLeft, CheckCircle2, AlertCircle, ShieldAlert, X } from 'lucide-react';
import Link from 'next/link';

export default function BondDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [bond, setBond] = useState<Bond | null>(null);
  const [loading, setLoading] = useState(true);
  
  // In a real app, this would come from the AuthContext
  const [kycStatus, setKycStatus] = useState('APPROVED'); 

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [orderError, setOrderError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBond = async () => {
      try {
        const data = await bondsApi.getBondById(params.id);
        setBond(data);
      } catch (error) {
        console.error('Failed to fetch bond details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBond();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#150f23]"></div>
      </div>
    );
  }

  if (!bond) {
    return (
      <div className="min-h-screen bg-white text-[#1f1633] p-8">
        <div className="max-w-4xl mx-auto text-center mt-20">
          <h2 className="text-2xl font-bold">Bond not found</h2>
          <Link href="/marketplace" className="text-[#6a5fc1] mt-4 inline-block hover:underline font-medium">Return to Marketplace</Link>
        </div>
      </div>
    );
  }

  const formatter = new Intl.NumberFormat('en-MZ', { style: 'currency', currency: 'MZN' });

  const handleInvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');
    setIsSubmitting(true);

    try {
      await ordersApi.createOrder({
        bondId: bond.id,
        requestedAmount: Number(amount),
      });
      setIsModalOpen(false);
      router.push('/orders');
    } catch (err: any) {
      setOrderError(err.response?.data?.message || 'Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1f1633] font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-[#79628c] hover:text-[#1f1633] font-medium transition-colors">
          <ArrowLeft size={18} /> Back to Marketplace
        </Link>

        {kycStatus === 'PENDING' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-amber-800 font-bold">KYC Approval Required</h4>
              <p className="text-amber-700 text-sm mt-1">Your account is currently under review. You must be fully verified by a broker before you can invest in bonds.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-[30px] font-bold text-[#1f1633] mb-2 leading-tight">{bond.name}</h1>
                  <p className="text-[#79628c] font-medium">{bond.issuer}</p>
                </div>
                {bond.status === 'OPEN' ? (
                  <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 rounded-[4px] border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={12}/> OPEN
                  </span>
                ) : bond.status === 'ALLOCATED' ? (
                  <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-700 rounded-[4px] border border-amber-200 flex items-center gap-1">
                    SOLD OUT
                  </span>
                ) : (
                  <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-700 rounded-[4px] border border-gray-300 flex items-center gap-1">
                    CLOSED
                  </span>
                )}
              </div>
              
              <div className="prose max-w-none text-[#1f1633] leading-relaxed">
                <p>This government bond is issued by the {bond.issuer}. It offers a fixed return over the specified maturity period, making it a stable addition to your investment portfolio.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 shadow-sm">
              <h3 className="text-[24px] font-bold mb-6 text-[#1f1633]">Bond Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[14px] text-[#79628c]">ISIN</p>
                  <p className="font-semibold">{bond.isin || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] text-[#79628c]">Currency</p>
                  <p className="font-semibold">{bond.currency}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] text-[#79628c]">Face Value</p>
                  <p className="font-semibold">{formatter.format(bond.faceValue)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] text-[#79628c]">Coupon Frequency</p>
                  <p className="font-semibold capitalize">{bond.couponFrequency?.replace('_', ' ').toLowerCase()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] text-[#79628c]">Issue Date</p>
                  <p className="font-semibold">{new Date(bond.issueDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] text-[#79628c]">Maturity Date</p>
                  <p className="font-semibold">{new Date(bond.maturityDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Investment Card */}
          <div className="space-y-6">
            <div className="bg-[#150f23] rounded-xl p-8 shadow-lg relative overflow-hidden">
              <h3 className="text-[20px] font-bold text-white mb-6">Investment Summary</h3>
              
              <div className="space-y-6 mb-8 relative z-10">
                <div>
                  <p className="text-[14px] text-[#cfcfdb] mb-1">Fixed Coupon Rate</p>
                  <p className="text-[40px] font-bold text-[#c2ef4e] leading-none">{bond.couponRate}%</p>
                </div>
                <div>
                  <p className="text-[14px] text-[#cfcfdb] mb-1">Minimum Investment</p>
                  <p className="text-[24px] font-bold text-white">{formatter.format(bond.minInvestment)}</p>
                </div>
              </div>

              <button
                disabled={kycStatus !== 'APPROVED' || bond.status !== 'OPEN'}
                onClick={() => setIsModalOpen(true)}
                className="w-full py-[12px] px-[16px] rounded-[8px] font-bold text-[14px] tracking-[0.2px] uppercase transition-all duration-200
                  disabled:bg-[#362d59] disabled:text-[#cfcfdb] disabled:cursor-not-allowed
                  bg-[#6a5fc1] text-white hover:bg-[#422082] shadow-[rgba(0,0,0,0.08)_0_2px_8px_0]
                "
              >
                {bond.status !== 'OPEN' ? 'NOT AVAILABLE' : kycStatus === 'APPROVED' ? 'Invest Now' : 'KYC Required'}
              </button>
              
              {kycStatus === 'APPROVED' && (
                <p className="text-[12px] text-center text-[#bdb8c0] mt-4 flex items-center justify-center gap-1">
                  <AlertCircle size={14}/> Capital is at risk
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* INVESTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#150f23]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-[rgba(0,0,0,0.1)_0_10px_15px_-3px] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-[#e5e7eb]">
              <h2 className="text-[24px] font-bold text-[#1f1633]">Place Investment</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#79628c] hover:text-[#1f1633] transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleInvestSubmit} className="p-6 space-y-6">
              
              <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#79628c]">Bond:</span>
                  <span className="font-bold text-[#1f1633]">{bond.name}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#79628c]">Min Investment:</span>
                  <span className="font-bold text-[#1f1633]">{formatter.format(bond.minInvestment)}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#79628c]">Multiple Step:</span>
                  <span className="font-bold text-[#1f1633]">{formatter.format(bond.faceValue)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#1f1633] mb-2">
                  Investment Amount ({bond.currency})
                </label>
                <input
                  type="number"
                  required
                  min={Number(bond.minInvestment)}
                  step={Number(bond.faceValue)}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white text-[#1f1633] text-[16px] rounded-[6px] border border-[#cfcfdb] py-[8px] px-[12px] focus:outline-none focus:border-[#6a5fc1] focus:ring-1 focus:ring-[#9dc1f5]"
                  placeholder={`e.g. ${bond.minInvestment}`}
                />
                <p className="text-[12px] text-[#79628c] mt-2">
                  Must be a multiple of {formatter.format(bond.faceValue)}
                </p>
              </div>

              {orderError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{orderError}</p>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-[12px] px-[16px] rounded-[8px] font-bold text-[14px] uppercase tracking-[0.2px] text-[#1f1633] border border-[#cfcfdb] hover:bg-[#f9fafb]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !amount}
                  className="flex-1 py-[12px] px-[16px] rounded-[8px] font-bold text-[14px] uppercase tracking-[0.2px] bg-[#6a5fc1] text-white hover:bg-[#422082] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
