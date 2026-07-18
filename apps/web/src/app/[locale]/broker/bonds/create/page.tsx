'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { bondsApi } from '@/lib/api/bonds';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function CreateBondPage() {
  const t = useTranslations("Bonds");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    isin: '',
    couponRate: '',
    faceValue: '1000',
    minInvestment: '10000',
    totalIssuance: '1000000',
    maturityDate: '',
    couponFrequency: 'SEMI_ANNUAL',
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = t('errNameReq');
    
    if (!formData.isin.trim()) {
      newErrors.isin = t('errIsinReq');
    } else if (!/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(formData.isin.toUpperCase())) {
      newErrors.isin = t('errIsinInvalid');
    }

    const rate = parseFloat(formData.couponRate);
    if (isNaN(rate) || rate <= 0 || rate > 100) {
      newErrors.couponRate = t('errRateRange');
    }

    const faceVal = parseFloat(formData.faceValue);
    if (isNaN(faceVal) || faceVal <= 0) {
      newErrors.faceValue = t('errFaceValPos');
    }

    const issuance = parseFloat(formData.totalIssuance);
    if (isNaN(issuance) || issuance < faceVal) {
      newErrors.totalIssuance = t('errTotalIssuanceMin');
    }

    const minInv = parseFloat(formData.minInvestment);
    if (isNaN(minInv) || minInv < faceVal) {
      newErrors.minInvestment = t('errMinInvFace');
    } else if (minInv % faceVal !== 0) {
      newErrors.minInvestment = t('errMinInvMultiple');
    }

    const selectedDate = new Date(formData.maturityDate);
    const today = new Date();
    if (!formData.maturityDate) {
      newErrors.maturityDate = t('errMaturityReq');
    } else if (selectedDate <= today) {
      newErrors.maturityDate = t('errMaturityFuture');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await bondsApi.createBond({
        ...formData,
        isin: formData.isin.toUpperCase(),
        couponRate: parseFloat(formData.couponRate),
        faceValue: parseFloat(formData.faceValue),
        minInvestment: parseFloat(formData.minInvestment),
        totalIssuance: parseFloat(formData.totalIssuance),
        issueDate: new Date().toISOString(),
        maturityDate: new Date(formData.maturityDate).toISOString(),
      });
      router.push('/broker/bonds');
    } catch (error: any) {
      console.error('Error creating bond', error);
      const serverMsg = error.response?.data?.message;
      const msg = Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg;
      alert(`${t('failedCreate')} ${msg ? `Server says: ${msg}` : t('failedCreateFallback')}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-surface-canvas-light text-ink min-h-full">
      <Link href="/broker/bonds" className="inline-flex items-center gap-2 text-ink/60 hover:text-ink font-medium text-[14px] transition-colors mb-6">
        <ArrowLeft size={16} /> {t('backToBonds')}
      </Link>
      
      <div className="mb-8">
        <h1 className="text-[30px] font-medium leading-[1.2] text-primary tracking-tight">{t('createTitle')}</h1>
        <p className="text-[16px] text-ink/70 mt-2">{t('createSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-canvas-light p-8 rounded-xl border border-hairline-cloud shadow-level-1 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-ink">{t('lblBondName')}</label>
            <input 
              name="name" value={formData.name} onChange={handleChange}
              placeholder={t('placeholderBondName')}
              className={`w-full bg-surface-canvas-light border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-hairline-cool focus:ring-accent-violet'} rounded-md px-4 py-2 text-ink font-medium focus:ring-2 focus:outline-none transition-all shadow-sm`}
            />
            {errors.name && <p className="text-red-500 text-[12px] font-medium mt-1">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-ink">{t('lblIsin')}</label>
            <input 
              name="isin" value={formData.isin} onChange={handleChange}
              placeholder={t('placeholderIsin')}
              className={`w-full bg-surface-canvas-light border ${errors.isin ? 'border-red-500 focus:ring-red-500' : 'border-hairline-cool focus:ring-accent-violet'} rounded-md px-4 py-2 text-ink font-medium focus:ring-2 focus:outline-none transition-all shadow-sm`}
            />
            {errors.isin && <p className="text-red-500 text-[12px] font-medium mt-1">{errors.isin}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold text-ink">{t('lblCouponRate')}</label>
            <input 
              type="number" step="0.01" name="couponRate" value={formData.couponRate} onChange={handleChange}
              placeholder="10.5"
              className={`w-full bg-surface-canvas-light border ${errors.couponRate ? 'border-red-500 focus:ring-red-500' : 'border-hairline-cool focus:ring-accent-violet'} rounded-md px-4 py-2 text-ink font-medium focus:ring-2 focus:outline-none transition-all shadow-sm`}
            />
            {errors.couponRate && <p className="text-red-500 text-[12px] font-medium mt-1">{errors.couponRate}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold text-ink">{t('lblCouponFreq')}</label>
            <select 
              name="couponFrequency" value={formData.couponFrequency} onChange={handleChange}
              className="w-full bg-surface-canvas-light border border-hairline-cool rounded-md px-4 py-2 text-ink font-medium focus:ring-2 focus:ring-accent-violet focus:outline-none transition-all shadow-sm"
            >
              <option value="ANNUAL">{t('optAnnual')}</option>
              <option value="SEMI_ANNUAL">{t('optSemiAnnual')}</option>
              <option value="QUARTERLY">{t('optQuarterly')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold text-ink">{t('lblFaceValue')}</label>
            <input 
              type="number" name="faceValue" value={formData.faceValue} onChange={handleChange}
              className={`w-full bg-surface-canvas-light border ${errors.faceValue ? 'border-red-500 focus:ring-red-500' : 'border-hairline-cool focus:ring-accent-violet'} rounded-md px-4 py-2 text-ink font-medium focus:ring-2 focus:outline-none transition-all shadow-sm`}
            />
            {errors.faceValue && <p className="text-red-500 text-[12px] font-medium mt-1">{errors.faceValue}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold text-ink">{t('lblMinInvestment')}</label>
            <input 
              type="number" name="minInvestment" value={formData.minInvestment} onChange={handleChange}
              className={`w-full bg-surface-canvas-light border ${errors.minInvestment ? 'border-red-500 focus:ring-red-500' : 'border-hairline-cool focus:ring-accent-violet'} rounded-md px-4 py-2 text-ink font-medium focus:ring-2 focus:outline-none transition-all shadow-sm`}
            />
            {errors.minInvestment && <p className="text-red-500 text-[12px] font-medium mt-1">{errors.minInvestment}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold text-ink">{t('lblTotalIssuance')}</label>
            <input 
              type="number" name="totalIssuance" value={formData.totalIssuance} onChange={handleChange}
              className={`w-full bg-surface-canvas-light border ${errors.totalIssuance ? 'border-red-500 focus:ring-red-500' : 'border-hairline-cool focus:ring-accent-violet'} rounded-md px-4 py-2 text-ink font-medium focus:ring-2 focus:outline-none transition-all shadow-sm`}
            />
            {errors.totalIssuance && <p className="text-red-500 text-[12px] font-medium mt-1">{errors.totalIssuance}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[14px] font-bold text-ink">{t('lblMaturityDate')}</label>
            <input 
              type="date" name="maturityDate" value={formData.maturityDate} onChange={handleChange}
              className={`w-full bg-surface-canvas-light border ${errors.maturityDate ? 'border-red-500 focus:ring-red-500' : 'border-hairline-cool focus:ring-accent-violet'} rounded-md px-4 py-2 text-ink font-medium focus:ring-2 focus:outline-none transition-all shadow-sm`}
            />
            {errors.maturityDate && <p className="text-red-500 text-[12px] font-medium mt-1">{errors.maturityDate}</p>}
          </div>
        </div>

        <div className="pt-6 border-t border-hairline-cloud flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="inline-flex items-center gap-2 bg-ink hover:bg-ink-press disabled:opacity-50 text-surface-canvas-light px-8 py-3 rounded-md font-bold text-[14px] transition-colors shadow-level-1"
          >
            {loading ? <div className="animate-spin h-5 w-5 border-b-2 border-surface-canvas-light rounded-full"></div> : <Save size={18} />}
            {loading ? t('savingBtn') : t('saveDraftBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}
