'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function InvestorReviewPage({ params }: { params: { id: string } }) {
  const t = useTranslations("BrokerInvestorReview");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchInvestorData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchInvestorData = async () => {
    try {
      const response = await api.get(`/investors/${params.id}`);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch investor details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: string) => {
    try {
      await api.patch(`/investors/${params.id}/kyc`, {
        status,
        reason: status === 'REJECTED' ? rejectionReason : undefined,
      });
      // Redirect back to queue on success
      router.push('/broker/dashboard');
    } catch (error) {
      console.error(`Failed to ${status} investor`, error);
      alert(`Error updating KYC status to ${status}`);
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const response = await api.get(`/investors/documents/${docId}`, {
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
      alert('Failed to download document');
    }
  };

  if (loading) {
    return <div className="text-ink">{t('loading')}</div>;
  }

  if (!data) {
    return <div className="text-red-500">{t('notFound')}</div>;
  }

  const { profile, documents } = data;
  const user = profile.user;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/broker/dashboard" className="inline-flex items-center text-[14px] text-ink/70 hover:text-ink transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          {t('backToQueue')}
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[30px] font-medium text-ink leading-[1.2]">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-[16px] text-ink/70 mt-1">{user.email}</p>
        </div>
        <div>
          <span className={`inline-flex items-center px-4 py-2 rounded-[8px] font-bold text-[14px] ${
            profile.kycStatus === 'APPROVED' ? 'bg-accent-lime text-ink' :
            profile.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
            'bg-surface-press text-ink'
          }`}>
            {profile.kycStatus === 'APPROVED' && <CheckCircle size={16} className="mr-2" />}
            {profile.kycStatus === 'REJECTED' && <XCircle size={16} className="mr-2" />}
            {(profile.kycStatus === 'PENDING' || profile.kycStatus === 'DOCUMENTS_SUBMITTED') && <Clock size={16} className="mr-2" />}
            {profile.kycStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Profile Info */}
        <div className="bg-surface-canvas-light border border-hairline-cloud rounded-[12px] p-[32px]">
          <h3 className="text-[20px] font-semibold mb-6">{t('profileInfo')}</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-[12px] uppercase tracking-wider text-ink/50 font-bold mb-1">{t('dob')}</dt>
              <dd className="text-[16px] font-medium">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : t('txtNA')}</dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-wider text-ink/50 font-bold mb-1">{t('nationality')}</dt>
              <dd className="text-[16px] font-medium">{profile.nationality || t('txtNA')}</dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-wider text-ink/50 font-bold mb-1">{t('taxId')}</dt>
              <dd className="text-[16px] font-medium">{profile.taxId || t('txtNA')}</dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-wider text-ink/50 font-bold mb-1">{t('address')}</dt>
              <dd className="text-[16px] font-medium">
                {profile.addressLine1}
                {profile.addressLine2 && <><br />{profile.addressLine2}</>}
                <br />{profile.city}, {profile.country} {profile.postalCode}
              </dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-wider text-ink/50 font-bold mb-1">Employment</dt>
              <dd className="text-[16px] font-medium">
                {profile.employerName || t('txtNA')} ({profile.jobTitle || t('txtNA')})
              </dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-wider text-ink/50 font-bold mb-1">Source of Funds</dt>
              <dd className="text-[16px] font-medium">{profile.sourceOfFunds || t('txtNA')}</dd>
            </div>
          </dl>
        </div>

        {/* Documents */}
        <div className="bg-surface-canvas-light border border-hairline-cloud rounded-[12px] p-[32px]">
          <h3 className="text-[20px] font-semibold mb-6">{t('uploadedDocs')}</h3>
          {documents.length === 0 ? (
            <p className="text-[14px] text-ink/70">{t('noDocs')}</p>
          ) : (
            <ul className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {documents.map((doc: any) => (
                <li key={doc.id} className="flex flex-col p-4 border border-hairline-cloud rounded-[8px] bg-surface-canvas">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[14px] truncate pr-2 max-w-[70%]" title={doc.fileName}>{doc.fileName}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-surface-press text-ink/75 flex-shrink-0">
                      {doc.documentType === 'IDENTITY' ? t('docTypeIdentity') :
                       doc.documentType === 'TAX_NUMBER' ? t('docTypeNuit') :
                       doc.documentType === 'ADDRESS' ? t('docTypeAddress') : 
                       doc.documentType === 'PROOF_OF_INCOME' ? 'Proof of Income' :
                       doc.documentType === 'SOURCE_OF_FUNDS' ? 'Source of Funds' : doc.documentType}
                    </span>
                  </div>
                  <span className="text-[12px] text-ink/60 mb-3">
                    {Math.round(doc.fileSize / 1024)} KB • {t('uploaded')} {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => handleDownload(doc.id, doc.fileName)}
                    className="self-start text-[14px] font-semibold text-accent-violet hover:text-accent-violet-deep transition-colors"
                  >
                    {t('btnDownloadToView')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Action Panel */}
      {profile.kycStatus === 'DOCUMENTS_SUBMITTED' && (
        <div className="bg-surface-night text-on-primary rounded-[12px] p-[32px] shadow-level-1">
          <h3 className="text-[20px] font-semibold mb-6">{t('brokerAction')}</h3>
          
          <div className="flex space-x-4">
            <button
              onClick={() => handleAction('APPROVED')}
              className="px-6 py-3 bg-accent-lime text-ink rounded-[8px] font-bold hover:bg-[#aade38] transition-colors"
            >
              {t('btnApproveKyc')}
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              className="px-6 py-3 bg-transparent border-2 border-red-500 text-red-400 rounded-[8px] font-bold hover:bg-red-500 hover:text-white transition-colors"
            >
              {t('btnRejectRequest')}
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4">
          <div className="bg-surface-canvas-light text-ink rounded-[16px] w-full max-w-lg p-8 shadow-level-2 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-[24px] font-semibold mb-2">{t('modalRejectTitle')}</h3>
            <p className="text-[14px] text-ink/70 mb-6">
              You are about to reject this application. You can provide an optional reason to help the investor correct the issue.
            </p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-[14px] font-bold mb-2">{t('lblRejectReason')}</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-surface-canvas text-ink rounded-[8px] p-4 border border-hairline-cloud focus:border-accent-violet focus:outline-none"
                  rows={4}
                  placeholder={t('placeholderRejectReason')}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowRejectForm(false)}
                className="px-6 py-3 bg-transparent text-ink hover:text-accent-violet transition-colors font-medium"
              >
                {t('btnCancel')}
              </button>
              <button
                onClick={() => handleAction('REJECTED')}
                className="px-6 py-3 bg-red-500 text-white rounded-[8px] font-bold hover:bg-red-600 transition-colors"
              >
                {t('btnConfirmReject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
