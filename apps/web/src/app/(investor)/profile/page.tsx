'use client';

import React, { useEffect, useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { api } from '@/lib/api';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function InvestorProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reuploadSlot, setReuploadSlot] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [submittingKyc, setSubmittingKyc] = useState(false);

  useEffect(() => {
    fetchData();
    // Poll every 5 seconds to auto-update status when broker accepts/rejects
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const [fetchError, setFetchError] = useState<string | null>(null);

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
      
      // We removed the individual fetchData() call here to avoid redundant API requests.
      // fetchData() is now called once at the end of handleSubmitKyc.
    } catch (err: unknown) {
      console.error('Upload failed', err);
      const typedErr = err as { response?: { data?: { message?: string } } };
      setError(typedErr.response?.data?.message || 'Failed to upload document.');
      throw err;
    }
  };

  const handleSubmitKyc = async () => {
    setSubmittingKyc(true);
    setError(null);
    try {
      // 1. Upload all pending selected files in parallel
      await Promise.all(
        Object.entries(selectedFiles).map(([docType, file]) => handleFileUpload(file, docType))
      );
      // 2. Submit the KYC application
      const res = await api.post('/investors/submit-kyc');
      // 3. Immediately update UI with new status and clear selection
      setProfile(res.data);
      setSelectedFiles({});
      await fetchData();
    } catch (err: unknown) {
      console.error('Failed to submit KYC', err);
      const typedErr = err as { response?: { data?: { message?: string } } };
      setError(typedErr.response?.data?.message || 'Failed to submit KYC documents.');
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
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const typedErr = error as any;
      console.error('Download failed', typedErr);
      setError(typedErr.response?.data?.message || 'Failed to download document. It may have been removed.');
    }
  };

  const getLatestDocForType = (type: string) => {
    const typeDocs = documents.filter(d => d.documentType === type);
    if (typeDocs.length === 0) return null;
    return typeDocs.reduce((latest, current) => {
      return new Date(current.uploadedAt) > new Date(latest.uploadedAt) ? current : latest;
    }, typeDocs[0]);
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'IDENTITY': return 'Proof of Identity';
      case 'TAX_NUMBER': return 'Proof of Tax Number (NUIT)';
      case 'ADDRESS': return 'Proof of Address';
      default: return type;
    }
  };

  const hasIdentity = documents.some(d => d.documentType === 'IDENTITY') || !!selectedFiles['IDENTITY'];
  const hasTaxNumber = documents.some(d => d.documentType === 'TAX_NUMBER') || !!selectedFiles['TAX_NUMBER'];
  const hasAddress = documents.some(d => d.documentType === 'ADDRESS') || !!selectedFiles['ADDRESS'];
  
  const selectedCount = (hasIdentity ? 1 : 0) + (hasTaxNumber ? 1 : 0) + (hasAddress ? 1 : 0);
  const allUploaded = selectedCount === 3;

  if (loading) {
    return <div className="text-ink">Loading profile...</div>;
  }

  if (fetchError) {
    return (
      <div className="p-6 max-w-4xl mx-auto mt-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <h3 className="font-bold mb-2">Critical Error Loading Profile</h3>
          <p>The backend API failed to return your profile data. The exact error is:</p>
          <code className="block bg-red-100 p-2 mt-2 rounded">{fetchError}</code>
          <p className="mt-4 text-sm">Please copy this error message and send it to the developer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-[30px] font-medium text-ink leading-[1.2] mb-8">Investor Profile</h2>
      
      {error && (
        <div className="mb-8 p-4 rounded-[8px] bg-red-50 text-red-700 border border-red-200 shadow-sm flex items-center">
          <AlertCircle size={20} className="mr-3 flex-shrink-0" />
          <p className="text-[14px] font-medium leading-[1.5]">{error}</p>
        </div>
      )}
      
      {/* KYC Status Banner */}
      <div className="mb-8 p-6 rounded-[12px] bg-surface-night text-on-primary shadow-level-1">
        <h3 className="text-[20px] font-semibold leading-[1.25] mb-2">KYC Verification Status</h3>
        <div className="flex items-center space-x-2 mt-4">
          {profile?.kycStatus === 'APPROVED' ? (
            <span className="flex items-center px-3 py-1 rounded-[4px] bg-accent-lime text-ink font-semibold text-[14px]">
              <CheckCircle size={16} className="mr-2" />
              Verified
            </span>
          ) : profile?.kycStatus === 'DOCUMENTS_SUBMITTED' ? (
            <span className="flex items-center px-3 py-1 rounded-[4px] bg-surface-press-light text-ink font-semibold text-[14px]">
              <Clock size={16} className="mr-2" />
              Under Review
            </span>
          ) : (
            <span className="flex items-center px-3 py-1 rounded-[4px] bg-red-100 text-red-800 font-semibold text-[14px]">
              <AlertCircle size={16} className="mr-2" />
              {profile?.kycStatus === 'REJECTED' ? 'Action Required' : 'Pending Documents'}
            </span>
          )}
        </div>
        {profile?.kycStatus === 'REJECTED' && profile?.kycRejectionReason && (
          <p className="mt-4 text-red-400 text-[14px]">{profile.kycRejectionReason}</p>
        )}
      </div>

      <div className="bg-surface-canvas-light border border-hairline-cloud rounded-[12px] p-[32px] mb-8">
        <h3 className="text-[24px] font-medium text-ink leading-[1.25] mb-6">Required KYC Documents</h3>
        <div className="text-[16px] text-ink/70 leading-[1.5] mb-8">
          To comply with regulatory requirements in the AFIN region (Mozambique), please upload all three required documents below:
        </div>

        <div className="space-y-6 mb-8">
          {[
            {
              id: 'IDENTITY',
              label: '1. Proof of Identity',
              desc: 'Bilhete de Identidade (BI), valid Passport, or DIRE.',
            },
            {
              id: 'TAX_NUMBER',
              label: '2. Proof of Tax Number (NUIT)',
              desc: 'Official NUIT declaration document.',
            },
            {
              id: 'ADDRESS',
              label: '3. Proof of Address',
              desc: 'Recent utility bill or bank statement (issued within the last 3 months).',
            },
          ].map((req) => {
            const doc = getLatestDocForType(req.id);
            const selectedFile = selectedFiles[req.id];
            const isSubmittedOrApproved = profile?.kycStatus === 'DOCUMENTS_SUBMITTED' || profile?.kycStatus === 'APPROVED';
            
            return (
              <div key={req.id} className="border border-hairline-cloud rounded-[12px] p-6 bg-surface-canvas hover:shadow-sm transition-all">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <h4 className="text-[18px] font-semibold text-ink leading-[1.3] flex items-center">
                      {req.label}
                      {doc && !reuploadSlot[req.id] && (
                        <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-[4px] bg-accent-lime/20 text-accent-lime-deep text-[12px] font-bold">
                          <CheckCircle size={14} className="mr-1" />
                          Uploaded
                        </span>
                      )}
                      {selectedFile && (
                        <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-[4px] bg-accent-violet/20 text-accent-violet-deep text-[12px] font-bold">
                          <CheckCircle size={14} className="mr-1" />
                          Selected
                        </span>
                      )}
                    </h4>
                    <p className="text-[14px] text-ink/70 mt-1 leading-[1.4]">{req.desc}</p>
                  </div>
                </div>

                {doc && !reuploadSlot[req.id] && !selectedFile && (
                  <div className="flex items-center justify-between p-4 bg-surface-press-light border border-hairline-cool rounded-[8px] mb-2">
                    <div className="truncate pr-4">
                      <p className="text-[14px] font-medium text-ink truncate">{doc.fileName}</p>
                      <p className="text-[12px] text-ink/60 mt-0.5">
                        Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleDownload(doc.id, doc.fileName)}
                        className="text-[14px] font-semibold text-accent-violet hover:text-accent-violet-deep transition-colors"
                      >
                        Download
                      </button>
                      {!isSubmittedOrApproved && (
                        <>
                          <span className="text-ink/30">|</span>
                          <button
                            onClick={() => {
                              setReuploadSlot(prev => ({ ...prev, [req.id]: true }));
                            }}
                            className="text-[14px] font-semibold text-red-600 hover:text-red-800 transition-colors"
                          >
                            Replace
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {selectedFile && (
                  <div className="flex items-center justify-between p-4 bg-surface-press-light border border-hairline-cool rounded-[8px] mb-2">
                    <div className="truncate pr-4">
                      <p className="text-[14px] font-medium text-ink truncate">{selectedFile.name}</p>
                      <p className="text-[12px] text-ink/60 mt-0.5">
                        Ready to upload on submit ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                      <button
                        onClick={() => {
                          const newFiles = { ...selectedFiles };
                          delete newFiles[req.id];
                          setSelectedFiles(newFiles);
                        }}
                        className="text-[14px] font-semibold text-red-600 hover:text-red-800 transition-colors"
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
                        className="mt-2 text-[14px] text-ink/60 hover:text-ink transition-colors underline"
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

        {/* KYC manual submission button */}
        <div className="border-t border-hairline-cloud pt-6 flex flex-col items-center">
          {['DOCUMENTS_SUBMITTED', 'APPROVED'].includes(profile?.kycStatus) ? (
            <p className="text-[14px] text-ink/60 font-semibold mb-4 text-center">
              Your documents are currently under review or already approved. No further action is required at this time.
            </p>
          ) : allUploaded ? (
            <p className="text-[14px] text-accent-lime-deep font-semibold mb-4 text-center">
              ✓ All required documents have been uploaded successfully.
            </p>
          ) : (
            <p className="text-[14px] text-red-600 font-semibold mb-4 text-center">
              ⚠ Please upload all three required documents above to submit for review.
            </p>
          )}
          <button
            onClick={handleSubmitKyc}
            disabled={!profile || !allUploaded || submittingKyc || ['DOCUMENTS_SUBMITTED', 'APPROVED'].includes(profile?.kycStatus)}
            className="w-full max-w-xs bg-primary text-on-primary font-bold text-[16px] uppercase tracking-[0.5px] py-4 rounded-[8px] hover:bg-surface-press-stronger hover:text-ink-press transition-all shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingKyc ? 'Submitting...' : 
             ['DOCUMENTS_SUBMITTED', 'APPROVED'].includes(profile?.kycStatus) ? 'Submitted' : 
             !profile ? 'Error: Profile is null' :
             !allUploaded ? `LOCKED (${selectedCount}/3 files ready)` : 
             'Submit for KYC Review'}
          </button>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="bg-surface-canvas-light border border-hairline-cloud rounded-[12px] p-[32px]">
          <h3 className="text-[24px] font-medium text-ink leading-[1.25] mb-6">Your Documents</h3>
          <ul className="space-y-4">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between p-4 border border-hairline-cloud rounded-[8px] hover:bg-surface-press-light transition-colors">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-[16px] font-medium text-ink leading-[1.5]">
                      {doc.fileName}{' '}
                      <span className="text-[12px] font-semibold px-2 py-0.5 rounded bg-surface-press text-ink/75 ml-2">
                        {getDocumentTypeLabel(doc.documentType)}
                      </span>
                    </p>
                    <p className="text-[14px] text-ink/70 leading-[1.43]">
                      Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownload(doc.id, doc.fileName)}
                  className="text-[14px] font-semibold text-accent-violet hover:text-accent-violet-deep transition-colors"
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
