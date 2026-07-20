'use client';

import React, { useEffect, useState, useRef } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { api } from '@/lib/api';
import { CheckCircle, Clock, AlertCircle, FileText, UploadCloud, Download, ShieldCheck, FileCheck2, UserCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function InvestorProfilePage() {
  const t = useTranslations("InvestorProfile");
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reuploadSlot, setReuploadSlot] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [employerName, setEmployerName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const hasInitializedForms = useRef(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setFetchError(null);
      const [profileRes, docsRes] = await Promise.all([
        api.get('/investors/profile'),
        api.get('/investors/documents'),
      ]);
      setProfile(profileRes.data);
      setDocuments(docsRes.data);
      
      if (profileRes.data && !hasInitializedForms.current) {
        setEmployerName(profileRes.data.employerName || '');
        setJobTitle(profileRes.data.jobTitle || '');
        setSourceOfFunds(profileRes.data.sourceOfFunds || '');
        hasInitializedForms.current = true;
      }
    } catch (error: any) {
      console.error('Failed to fetch profile data', error);
      setFetchError(error?.response?.data?.message || error?.message || 'Unknown network error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      await api.post('/investors/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (err: any) {
      console.error('Upload failed', err);
      setError(err.response?.data?.message || 'Failed to upload document.');
      throw err;
    }
  };

  const handleSubmitKyc = async () => {
    setSubmittingKyc(true);
    setError(null);
    try {
      await Promise.all(
        Object.entries(selectedFiles).map(([docType, file]) => handleFileUpload(file, docType))
      );
      
      await api.patch('/investors/profile', {
        employerName,
        jobTitle,
        sourceOfFunds,
        dateOfBirth: profile?.dateOfBirth || "1990-01-01",
        nationality: profile?.nationality || "Mozambique",
        taxId: profile?.taxId || "123456789",
        addressLine1: profile?.addressLine1 || "Maputo",
        city: profile?.city || "Maputo",
        country: profile?.country || "Mozambique"
      });

      const res = await api.post('/investors/submit-kyc');
      setProfile(res.data);
      setSelectedFiles({});
      await fetchData();
    } catch (err: any) {
      console.error('Failed to submit KYC', err);
      setError(err.response?.data?.message || 'Failed to submit KYC documents.');
    } finally {
      setSubmittingKyc(false);
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      setError(null);
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
    } catch (error: any) {
      console.error('Download failed', error);
      setError(error.response?.data?.message || 'Failed to download document. It may have been removed.');
    }
  };

  const getLatestDocForType = (type: string) => {
    const typeDocs = documents.filter(d => d.documentType === type);
    if (typeDocs.length === 0) return null;
    return typeDocs.reduce((latest, current) => {
      return new Date(current.uploadedAt) > new Date(latest.uploadedAt) ? current : latest;
    }, typeDocs[0]);
  };

  const hasIdentity = documents.some(d => d.documentType === 'IDENTITY') || !!selectedFiles['IDENTITY'];
  const hasTaxNumber = documents.some(d => d.documentType === 'TAX_NUMBER') || !!selectedFiles['TAX_NUMBER'];
  const hasAddress = documents.some(d => d.documentType === 'ADDRESS') || !!selectedFiles['ADDRESS'];
  const hasProofOfIncome = documents.some(d => d.documentType === 'PROOF_OF_INCOME') || !!selectedFiles['PROOF_OF_INCOME'];

  const selectedCount = (hasIdentity ? 1 : 0) + (hasTaxNumber ? 1 : 0) + (hasAddress ? 1 : 0) + (hasProofOfIncome ? 1 : 0);
  const allUploaded = selectedCount === 4 && employerName.trim() !== '' && jobTitle.trim() !== '' && sourceOfFunds.trim() !== '';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6a5fc1]"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="space-y-8 pb-12 max-w-[1440px] mx-auto">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200">
            <h3 className="font-bold text-[18px] mb-2 flex items-center gap-2"><AlertCircle /> {t('errLoadProfile')}</h3>
            <p className="mb-4">{t('errLoadProfileDesc')}</p>
            <code className="block bg-white border border-red-200 p-4 rounded-lg font-mono text-sm">{fetchError}</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8 pb-12 max-w-[1440px] mx-auto text-[#1f1633] dark:text-white"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-[#1f1633] dark:text-white mb-2 leading-tight">{t('title')}</h1>
          <p className="text-[#79628c] dark:text-on-dark-muted">{t('subtitle')}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <p className="text-[14px] font-medium leading-relaxed">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (35%) - Profile Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white dark:bg-ink-deep rounded-2xl border border-[#e5e7eb] dark:border-hairline-violet p-6 md:p-8 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-[#f9fafb] dark:bg-[#1a1130] border border-[#cfcfdb] dark:border-[#362d59] flex items-center justify-center flex-shrink-0 text-[#79628c] dark:text-on-dark-muted mb-4">
              <UserCircle size={56} strokeWidth={1.5} />
            </div>
            <h3 className="text-[22px] font-bold text-[#1f1633] dark:text-white mb-1">
              {profile?.user?.firstName} {profile?.user?.lastName}
            </h3>
            <p className="text-[#79628c] dark:text-on-dark-muted text-[14px] mb-6">{profile?.user?.email}</p>

            <div className="flex flex-col items-center gap-3 w-full">
              {profile?.kycStatus === 'APPROVED' ? (
                <span className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold text-[12px] uppercase tracking-wider border border-emerald-200 dark:border-emerald-900/50">
                  <ShieldCheck size={16} className="mr-1.5" />
                  {t('statusVerified')}
                </span>
              ) : profile?.kycStatus === 'DOCUMENTS_SUBMITTED' ? (
                <span className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold text-[12px] uppercase tracking-wider border border-amber-200 dark:border-amber-900/50">
                  <Clock size={16} className="mr-1.5" />
                  {t('statusReview')}
                </span>
              ) : (
                <span className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 font-bold text-[12px] uppercase tracking-wider border border-red-200 dark:border-red-900/50">
                  <AlertCircle size={16} className="mr-1.5" />
                  {profile?.kycStatus === 'REJECTED' ? t('statusActionRequired') : t('statusVerificationRequired')}
                </span>
              )}
            </div>

            {profile?.kycStatus === 'REJECTED' && profile?.kycRejectionReason && (
              <p className="mt-4 text-red-600 dark:text-red-400 text-[14px] font-medium bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 text-left w-full">
                <span className="font-bold block mb-1 uppercase tracking-wider text-[11px]">{t('reasonRejected')}</span> 
                {profile.kycRejectionReason}
              </p>
            )}
          </div>
          
          {/* Employment Details Form */}
          <div className="bg-white dark:bg-ink-deep rounded-2xl border border-[#e5e7eb] dark:border-hairline-violet p-6 md:p-8 shadow-sm flex flex-col mt-4">
            <h3 className="text-[18px] font-bold text-[#1f1633] dark:text-white mb-4">
              {t('employmentDetailsTitle')}
            </h3>
            <p className="text-[14px] text-[#79628c] dark:text-on-dark-muted mb-6">
              {t('employmentDetailsDesc')}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#1f1633] dark:text-white mb-2 uppercase tracking-wide">
                  {t('employerName')} *
                </label>
                <input
                  type="text"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  disabled={['DOCUMENTS_SUBMITTED', 'APPROVED'].includes(profile?.kycStatus)}
                  className="w-full bg-[#f9fafb] dark:bg-[#1a1130] border border-[#e5e7eb] dark:border-[#362d59] rounded-xl px-4 py-3 text-[#1f1633] dark:text-white text-[15px] focus:outline-none focus:border-[#6a5fc1] dark:focus:border-accent-violet transition-colors disabled:opacity-50"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#1f1633] dark:text-white mb-2 uppercase tracking-wide">
                  {t('jobTitle')} *
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  disabled={['DOCUMENTS_SUBMITTED', 'APPROVED'].includes(profile?.kycStatus)}
                  className="w-full bg-[#f9fafb] dark:bg-[#1a1130] border border-[#e5e7eb] dark:border-[#362d59] rounded-xl px-4 py-3 text-[#1f1633] dark:text-white text-[15px] focus:outline-none focus:border-[#6a5fc1] dark:focus:border-accent-violet transition-colors disabled:opacity-50"
                  placeholder="e.g. Software Engineer"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#1f1633] dark:text-white mb-2 uppercase tracking-wide">
                  {t('sourceOfFunds')} *
                </label>
                <input
                  type="text"
                  value={sourceOfFunds}
                  onChange={(e) => setSourceOfFunds(e.target.value)}
                  disabled={['DOCUMENTS_SUBMITTED', 'APPROVED'].includes(profile?.kycStatus)}
                  className="w-full bg-[#f9fafb] dark:bg-[#1a1130] border border-[#e5e7eb] dark:border-[#362d59] rounded-xl px-4 py-3 text-[#1f1633] dark:text-white text-[15px] focus:outline-none focus:border-[#6a5fc1] dark:focus:border-accent-violet transition-colors disabled:opacity-50"
                  placeholder={t('sourceOfFundsPlaceholder')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (65%) - Documents */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-ink-deep rounded-2xl border border-[#e5e7eb] dark:border-hairline-violet p-6 md:p-8 shadow-sm h-full">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#1a1130] flex items-center justify-center flex-shrink-0 text-[#6a5fc1] dark:text-accent-lime">
                <FileCheck2 size={24} />
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-[#1f1633] dark:text-white mb-1">{t('reqDocsTitle')}</h3>
                <p className="text-[14px] text-[#79628c] dark:text-on-dark-muted">
                  To comply with Mozambican regulations, please upload all three required documents below.
                </p>
              </div>
            </div>

          <div className="space-y-4 mb-8">
            {[
              {
                id: 'IDENTITY',
                label: t('docIdentity'),
                desc: t('docIdentityDesc'),
              },
              {
                id: 'TAX_NUMBER',
                label: t('docNuit'),
                desc: t('docNuitDesc'),
              },
              {
                id: 'ADDRESS',
                label: t('docAddress'),
                desc: t('docAddressDesc'),
              },
              {
                id: 'PROOF_OF_INCOME',
                label: t('docProofOfIncome'),
                desc: t('docProofOfIncomeDesc'),
              },
              {
                id: 'SOURCE_OF_FUNDS',
                label: t('docSourceOfFunds'),
                desc: t('docSourceOfFundsDesc'),
              },
            ].map((req) => {
              const doc = getLatestDocForType(req.id);
              const selectedFile = selectedFiles[req.id];
              const isSubmittedOrApproved = profile?.kycStatus === 'DOCUMENTS_SUBMITTED' || profile?.kycStatus === 'APPROVED';

              return (
                <div key={req.id} className="border border-[#e5e7eb] dark:border-[#362d59] rounded-xl p-5 bg-[#f9fafb] dark:bg-[#1a1130] hover:border-[#cfcfdb] dark:hover:border-hairline-violet transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-[16px] font-bold text-[#1f1633] dark:text-white flex items-center">
                        {req.label}
                        {doc && !reuploadSlot[req.id] && (
                          <span className="ml-3 inline-flex items-center px-2 py-1 rounded-[4px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[10px] uppercase font-bold tracking-wider border border-emerald-200 dark:border-emerald-900/50">
                            <CheckCircle size={12} className="mr-1" />
                            {t('badgeUploaded')}
                          </span>
                        )}
                        {selectedFile && (
                          <span className="ml-3 inline-flex items-center px-2 py-1 rounded-[4px] bg-[#f0f0f0] dark:bg-[#0a0514] text-[#1f1633] dark:text-white text-[10px] uppercase font-bold tracking-wider border border-[#cfcfdb] dark:border-[#362d59]">
                            <UploadCloud size={12} className="mr-1" />
                            {t('badgeSelected')}
                          </span>
                        )}
                      </h4>
                      <p className="text-[13px] text-[#79628c] dark:text-on-dark-muted mt-1">{req.desc}</p>
                    </div>
                  </div>

                  {doc && !reuploadSlot[req.id] && !selectedFile && (
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-[#362d59] rounded-lg">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="text-[#6a5fc1] dark:text-accent-lime flex-shrink-0" size={20} />
                        <div className="truncate">
                          <p className="text-[14px] font-bold text-[#1f1633] dark:text-white truncate">{doc.fileName}</p>
                          <p className="text-[12px] text-[#79628c] dark:text-on-dark-muted">
                            {t('txtUploadedOn')} {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleDownload(doc.id, doc.fileName)}
                          className="text-[12px] font-bold text-[#6a5fc1] dark:text-accent-lime hover:text-[#422082] dark:hover:text-white uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                          <Download size={14} /> {t('btnDownload')}
                        </button>
                        {!isSubmittedOrApproved && (
                          <button
                            onClick={() => setReuploadSlot(prev => ({ ...prev, [req.id]: true }))}
                            className="text-[12px] font-bold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 uppercase tracking-wider transition-colors"
                          >
                            {t('btnReplace')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedFile && (
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-[#362d59] rounded-lg">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <UploadCloud className="text-[#6a5fc1] dark:text-accent-lime flex-shrink-0" size={20} />
                        <div className="truncate">
                          <p className="text-[14px] font-bold text-[#1f1633] dark:text-white truncate">{selectedFile.name}</p>
                          <p className="text-[12px] text-[#79628c] dark:text-on-dark-muted">
                            {t('txtReadyUpload')} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center ml-4 flex-shrink-0">
                        <button
                          onClick={() => {
                            const newFiles = { ...selectedFiles };
                            delete newFiles[req.id];
                            setSelectedFiles(newFiles);
                          }}
                          className="text-[12px] font-bold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 uppercase tracking-wider transition-colors"
                        >
                          {t('btnRemove')}
                        </button>
                      </div>
                    </div>
                  )}

                  {((!doc && !selectedFile) || (reuploadSlot[req.id] && !selectedFile)) && !isSubmittedOrApproved && (
                    <div className="mt-4">
                      <FileUpload
                        onFileSelect={(file) => {
                          setSelectedFiles(prev => ({ ...prev, [req.id]: file }));
                          setReuploadSlot(prev => ({ ...prev, [req.id]: false }));
                        }}
                        accept="application/pdf,image/jpeg,image/png"
                        maxSizeMB={10}
                      />
                      {doc && reuploadSlot[req.id] && (
                        <button
                          onClick={() => setReuploadSlot(prev => ({ ...prev, [req.id]: false }))}
                          className="mt-3 text-[13px] font-medium text-[#79628c] dark:text-on-dark-muted hover:text-[#1f1633] dark:hover:text-white transition-colors"
                        >
                          {t('btnCancelReplace')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#e5e7eb] dark:border-[#362d59] pt-8 flex flex-col items-center">
            {['DOCUMENTS_SUBMITTED', 'APPROVED'].includes(profile?.kycStatus) ? (
              <p className="text-[14px] text-[#79628c] dark:text-on-dark-muted font-medium mb-5 text-center bg-[#f9fafb] dark:bg-[#1a1130] py-2 px-4 rounded-full border border-[#e5e7eb] dark:border-[#362d59]">
                Your documents are under review or already approved. No action is required.
              </p>
            ) : allUploaded ? (
              <p className="text-[14px] text-emerald-700 dark:text-emerald-400 font-bold mb-5 text-center flex items-center gap-2">
                <CheckCircle size={16} /> All required documents and details are ready for submission.
              </p>
            ) : (
              <p className="text-[14px] text-red-600 dark:text-red-400 font-medium mb-5 text-center">
                Please upload all required documents and fill employment details above to submit for review.
              </p>
            )}
            <button
              onClick={handleSubmitKyc}
              disabled={!profile || !allUploaded || submittingKyc || ['DOCUMENTS_SUBMITTED', 'APPROVED'].includes(profile?.kycStatus)}
              className="w-full py-[14px] px-[24px] rounded-lg font-bold text-[14px] uppercase tracking-[0.2px] transition-all duration-200
                disabled:bg-[#f0f0f0] dark:disabled:bg-[#1a1130] disabled:text-[#cfcfdb] dark:disabled:text-[#362d59] disabled:border-transparent disabled:cursor-not-allowed
                bg-[#6a5fc1] dark:bg-accent-violet-deep text-white hover:bg-[#422082] dark:hover:bg-accent-violet shadow-sm"
            >
              {submittingKyc ? t('btnSubmitting') :
                ['DOCUMENTS_SUBMITTED', 'APPROVED'].includes(profile?.kycStatus) ? t('btnSubmitted') :
                  !profile ? 'Error: Profile is null' :
                    !allUploaded ? "Please complete all fields and required documents" :
                      t('btnSubmit')}
            </button>
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
}
