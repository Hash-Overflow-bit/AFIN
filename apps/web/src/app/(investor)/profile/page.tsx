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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, docsRes] = await Promise.all([
        api.get('/investors/profile'),
        api.get('/investors/documents'),
      ]);
      setProfile(profileRes.data);
      setDocuments(docsRes.data);
    } catch (error) {
      console.error('Failed to fetch profile data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    await api.post('/investors/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Refresh data to show new document and updated KYC status
    await fetchData();
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

  if (loading) {
    return <div className="text-ink">Loading profile...</div>;
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
        <div className="text-[16px] text-ink/70 leading-[1.5] mb-6 space-y-2">
          <p>To comply with regulatory requirements in the AFIN region (Mozambique), please provide the following documents:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Proof of Identity:</strong> Bilhete de Identidade (BI), valid Passport, or DIRE.</li>
            <li><strong>Proof of Tax Number (NUIT):</strong> Official NUIT declaration document.</li>
            <li><strong>Proof of Address:</strong> Recent utility bill or bank statement (issued within the last 3 months).</li>
          </ul>
        </div>
        
        <FileUpload 
          onUpload={handleFileUpload} 
          accept="application/pdf,image/jpeg,image/png" 
          maxSizeMB={10} 
        />
      </div>

      {documents.length > 0 && (
        <div className="bg-surface-canvas-light border border-hairline-cloud rounded-[12px] p-[32px]">
          <h3 className="text-[24px] font-medium text-ink leading-[1.25] mb-6">Your Documents</h3>
          <ul className="space-y-4">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between p-4 border border-hairline-cloud rounded-[8px] hover:bg-surface-press-light transition-colors">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-[16px] font-medium text-ink leading-[1.5]">{doc.fileName}</p>
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
