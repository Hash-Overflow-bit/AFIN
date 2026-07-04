'use client';

import React, { useEffect, useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { api } from '@/lib/api';
import { CheckCircle, Clock, AlertCircle, FileText, UploadCloud, Download, ShieldCheck, FileCheck2, UserCircle } from 'lucide-react';

export default function InvestorProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reuploadSlot, setReuploadSlot] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

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
  
  const selectedCount = (hasIdentity ? 1 : 0) + (hasTaxNumber ? 1 : 0) + (hasAddress ? 1 : 0);
  const allUploaded = selectedCount === 3;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#150f23]"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#f9fafb] p-8 text-[#1f1633] font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200">
            <h3 className="font-bold text-[18px] mb-2 flex items-center gap-2"><AlertCircle /> Critical Error Loading Profile</h3>
            <p className="mb-4">The backend API failed to return your profile data. The exact error is:</p>
            <code className="block bg-white border border-red-200 p-4 rounded-lg font-mono text-sm">{fetchError}</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#1f1633] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-[30px] font-bold text-[#1f1633] mb-2 leading-tight">Investor Profile & KYC</h1>
            <p className="text-[#79628c]">Manage your personal information and verification documents.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-[14px] font-medium leading-relaxed">{error}</p>
          </div>
        )}
        
        {/* Profile Status Card */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[#f9fafb] border border-[#cfcfdb] flex items-center justify-center flex-shrink-0 text-[#79628c]">
             <UserCircle size={40} strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-[20px] font-bold text-[#1f1633] mb-1">
               {profile?.user?.firstName} {profile?.user?.lastName}
            </h3>
            <p className="text-[#79628c] text-[14px] mb-4">{profile?.user?.email}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {profile?.kycStatus === 'APPROVED' ? (
                <span className="flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[12px] uppercase tracking-wider border border-emerald-200">
                  <ShieldCheck size={16} className="mr-1.5" />
                  Verified Investor
                </span>
              ) : profile?.kycStatus === 'DOCUMENTS_SUBMITTED' ? (
                <span className="flex items-center px-4 py-2 rounded-full bg-amber-50 text-amber-700 font-bold text-[12px] uppercase tracking-wider border border-amber-200">
                  <Clock size={16} className="mr-1.5" />
                  Review in Progress
                </span>
              ) : (
                <span className="flex items-center px-4 py-2 rounded-full bg-red-50 text-red-700 font-bold text-[12px] uppercase tracking-wider border border-red-200">
                  <AlertCircle size={16} className="mr-1.5" />
                  {profile?.kycStatus === 'REJECTED' ? 'Action Required' : 'Verification Required'}
                </span>
              )}
            </div>
            
            {profile?.kycStatus === 'REJECTED' && profile?.kycRejectionReason && (
              <p className="mt-4 text-red-600 text-[14px] font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                 Reason for rejection: {profile.kycRejectionReason}
              </p>
            )}
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 md:p-8 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#f0f0f0] flex items-center justify-center flex-shrink-0">
               <FileCheck2 className="text-[#79628c]" size={20} />
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-[#1f1633] mb-1">Required Documents</h3>
              <p className="text-[14px] text-[#79628c]">
                To comply with Mozambican regulations, please upload all three required documents below.
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {[
              {
                id: 'IDENTITY',
                label: 'Proof of Identity',
                desc: 'Bilhete de Identidade (BI), valid Passport, or DIRE.',
              },
              {
                id: 'TAX_NUMBER',
                label: 'Proof of Tax Number (NUIT)',
                desc: 'Official NUIT declaration document.',
              },
              {
                id: 'ADDRESS',
                label: 'Proof of Address',
                desc: 'Recent utility bill or bank statement (within 3 months).',
              },
            ].map((req) => {
              const doc = getLatestDocForType(req.id);
              const selectedFile = selectedFiles[req.id];
              const isSubmittedOrApproved = profile?.kycStatus === 'DOCUMENTS_SUBMITTED' || profile?.kycStatus === 'APPROVED';
              
              return (
                <div key={req.id} className="border border-[#e5e7eb] rounded-xl p-5 bg-[#f9fafb] hover:border-[#cfcfdb] transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-[16px] font-bold text-[#1f1633] flex items-center">
                        {req.label}
                        {doc && !reuploadSlot[req.id] && (
                          <span className="ml-3 inline-flex items-center px-2 py-1 rounded-[4px] bg-emerald-50 text-emerald-700 text-[10px] uppercase font-bold tracking-wider border border-emerald-200">
                            <CheckCircle size={12} className="mr-1" />
                            Uploaded
                          </span>
                        )}
                        {selectedFile && (
                          <span className="ml-3 inline-flex items-center px-2 py-1 rounded-[4px] bg-[#f0f0f0] text-[#1f1633] text-[10px] uppercase font-bold tracking-wider border border-[#cfcfdb]">
                            <UploadCloud size={12} className="mr-1" />
                            Selected
                          </span>
                        )}
                      </h4>
                      <p className="text-[13px] text-[#79628c] mt-1">{req.desc}</p>
                    </div>
                  </div>

                  {doc && !reuploadSlot[req.id] && !selectedFile && (
                    <div className="flex items-center justify-between p-4 bg-white border border-[#e5e7eb] rounded-lg">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="text-[#6a5fc1] flex-shrink-0" size={20} />
                        <div className="truncate">
                          <p className="text-[14px] font-bold text-[#1f1633] truncate">{doc.fileName}</p>
                          <p className="text-[12px] text-[#79628c]">
                            Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleDownload(doc.id, doc.fileName)}
                          className="text-[12px] font-bold text-[#6a5fc1] hover:text-[#422082] uppercase tracking-wider flex items-center gap-1"
                        >
                          <Download size={14} /> Download
                        </button>
                        {!isSubmittedOrApproved && (
                          <button
                            onClick={() => setReuploadSlot(prev => ({ ...prev, [req.id]: true }))}
                            className="text-[12px] font-bold text-red-600 hover:text-red-800 uppercase tracking-wider"
                          >
                            Replace
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedFile && (
                    <div className="flex items-center justify-between p-4 bg-white border border-[#e5e7eb] rounded-lg">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <UploadCloud className="text-[#6a5fc1] flex-shrink-0" size={20} />
                        <div className="truncate">
                          <p className="text-[14px] font-bold text-[#1f1633] truncate">{selectedFile.name}</p>
                          <p className="text-[12px] text-[#79628c]">
                            Ready to upload on submit ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
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
                          className="text-[12px] font-bold text-red-600 hover:text-red-800 uppercase tracking-wider"
                        >
                          Remove
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
                          className="mt-3 text-[13px] font-medium text-[#79628c] hover:text-[#1f1633] transition-colors"
                        >
                          Cancel replacement
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#e5e7eb] pt-8 flex flex-col items-center">
            {['DOCUMENTS_SUBMITTED', 'APPROVED'].includes(profile?.kycStatus) ? (
              <p className="text-[14px] text-[#79628c] font-medium mb-5 text-center bg-[#f9fafb] py-2 px-4 rounded-full border border-[#e5e7eb]">
                Your documents are under review or already approved. No action is required.
              </p>
            ) : allUploaded ? (
              <p className="text-[14px] text-emerald-700 font-bold mb-5 text-center flex items-center gap-2">
                <CheckCircle size={16} /> All required documents are ready for submission.
              </p>
            ) : (
              <p className="text-[14px] text-red-600 font-medium mb-5 text-center">
                Please upload all three required documents above to submit for review.
              </p>
            )}
            <button
              onClick={handleSubmitKyc}
              disabled={!profile || !allUploaded || submittingKyc || ['DOCUMENTS_SUBMITTED', 'APPROVED'].includes(profile?.kycStatus)}
              className="w-full md:w-auto md:min-w-[280px] py-[14px] px-[24px] rounded-[8px] font-bold text-[14px] uppercase tracking-[0.2px] transition-all duration-200
                disabled:bg-[#f0f0f0] disabled:text-[#79628c] disabled:border-[#e5e7eb] disabled:cursor-not-allowed
                bg-[#150f23] text-white hover:bg-[#efefef] hover:text-[#1a1a1a] shadow-[rgba(0,0,0,0.08)_0_2px_8px_0]"
            >
              {submittingKyc ? 'Submitting...' : 
               ['DOCUMENTS_SUBMITTED', 'APPROVED'].includes(profile?.kycStatus) ? 'Submitted' : 
               !profile ? 'Error: Profile is null' :
               !allUploaded ? `Upload ${3 - selectedCount} more files` : 
               'Submit for KYC Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
