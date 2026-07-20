'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { FileUpload } from '@/components/ui/FileUpload';
import { CheckCircle, AlertCircle, Building2, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyEmploymentPage() {
  const { token } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      api.get(`/public/verify-employment/${token}`)
        .then(res => {
          setData(res.data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.response?.data?.message || 'Invalid or expired verification link.');
          setLoading(false);
        });
    }
  }, [token]);

  const handleSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/public/verify-employment/${token}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6a5fc1]"></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-[20px] font-bold text-[#1f1633] mb-2">Link Invalid</h2>
          <p className="text-[#79628c] text-[15px] leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-6">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border border-[#e5e7eb]">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-[24px] font-bold text-[#1f1633] mb-2">Thank You!</h2>
          <p className="text-[#79628c] text-[15px] leading-relaxed mb-6">
            The employment verification documents for <strong className="text-[#1f1633]">{data?.investorName}</strong> have been successfully submitted. You may now close this window.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-6 font-sans text-[#1f1633]">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] overflow-hidden">
          <div className="bg-[#1f1633] p-8 text-white text-center">
            <Building2 size={48} className="mx-auto mb-4 text-[#cfcfdb]" strokeWidth={1.5} />
            <h1 className="text-[24px] font-bold mb-2">Verify Employment</h1>
            <p className="text-[#cfcfdb] text-[15px]">Secure document portal for AGBX</p>
          </div>
          
          <div className="p-8">
            <p className="text-[15px] leading-relaxed text-[#79628c] mb-6">
              Your employee, <strong className="text-[#1f1633]">{data.investorName}</strong> ({data.jobTitle}), has requested to open an investment account. 
              Please verify their employment by securely uploading a Proof of Income (Pay Slip) or an Employment Verification Letter on company letterhead.
            </p>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-3 mb-6">
                <AlertCircle size={20} className="flex-shrink-0" />
                <p className="text-[14px] font-medium">{error}</p>
              </div>
            )}

            <div className="mb-6">
              {file ? (
                <div className="flex items-center justify-between p-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <UploadCloud className="text-[#6a5fc1] flex-shrink-0" size={24} />
                    <div className="truncate">
                      <p className="text-[14px] font-bold text-[#1f1633] truncate">{file.name}</p>
                      <p className="text-[12px] text-[#79628c]">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-[13px] font-bold text-red-600 hover:text-red-800 ml-4"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <FileUpload
                  onFileSelect={(f) => setFile(f)}
                  accept="application/pdf,image/jpeg,image/png"
                  maxSizeMB={10}
                />
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!file || submitting}
              className="w-full py-4 bg-[#6a5fc1] hover:bg-[#5b51a8] text-white rounded-xl font-bold uppercase tracking-wider text-[14px] disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting securely...' : 'Submit Documents'}
            </button>
            <p className="text-center text-[12px] text-[#79628c] mt-4 flex items-center justify-center gap-1">
              <CheckCircle size={12} /> Encrypted & Secure Upload
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
