'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { FileUpload } from '@/components/ui/FileUpload';
import { ShieldAlert, FileText, CheckCircle, Trash2, LogOut, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function BrokerOnboardingPage() {
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('BROKER_LICENSE');
  const t = useTranslations('Broker');
  const tNav = useTranslations('Navigation');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/investors/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);

    try {
      await api.post('/investors/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(t('documentUploadedSuccess'));
      fetchDocuments();
    } catch (err: any) {
      console.error('Error uploading document:', err);
      toast.error(err.response?.data?.message || t('documentUploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0514] text-on-primary flex flex-col relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-[20%] w-[600px] h-[600px] bg-accent-violet/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-[10%] w-[500px] h-[500px] bg-accent-lime/5 rounded-full blur-[120px]" />
      </div>

      {/* Header bar */}
      <header className="w-full flex items-center justify-between px-8 py-6 relative z-20 border-b border-white/5 bg-[#0a0514]/40 backdrop-blur-md">
        <h1 className="font-logo text-white text-3xl font-bold tracking-wider">AGBX</h1>
        <div className="flex items-center space-x-6">
          <LanguageSwitcher />
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-5 py-2.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded-full text-sm font-semibold text-white transition-all group"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            <span>{tNav('btnLogout')}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-12 relative z-10 flex flex-col lg:flex-row gap-12">
        {/* Left Column: Marketing & Excitement */}
        <div className="lg:w-1/2 flex flex-col justify-center space-y-10">
          <div>
            <h2 className="text-accent-violet font-bold tracking-widest uppercase text-sm mb-4">{t('onboardingTitle')}</h2>
            <h3 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
              {t('growBrokerage')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-lime to-emerald-400">{t('reachInvestors')}</span> <br />
              {t('modernizeBusiness')}
            </h3>
            
            <div className="space-y-5 text-lg text-white/70 leading-relaxed max-w-xl">
              <p>{t('onboardingDesc1')}</p>
              <p>{t('onboardingDesc2')}</p>
              <p>{t('onboardingDesc3')}</p>
            </div>
          </div>

          {/* User Details Mini-Card */}
          <div className="bg-[#1a1325] border border-white/5 p-6 rounded-2xl max-w-md">
            <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">{t('brokerProfileData')}</h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">{t('representative')}</span>
                <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">{t('emailAddress')}</span>
                <p className="text-white font-medium truncate">{user?.email}</p>
              </div>
              {user?.companyName && (
                <div className="col-span-2">
                  <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">{t('brokerageFirm')}</span>
                  <p className="text-white font-medium">{user?.companyName}</p>
                </div>
              )}
              {user?.licenseNumber && (
                <div className="col-span-2">
                  <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1">{t('licenseRegistration')}</span>
                  <p className="text-white font-mono text-xs">{user?.licenseNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status & Uploads */}
        <div className="lg:w-1/2 flex flex-col space-y-8">
          
          {/* Stunning Pending Status Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative bg-[#110b1f] border border-amber-500/30 p-8 rounded-3xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8" />
              
              <div className="flex items-start space-x-8">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <ShieldAlert className="w-8 h-8 text-amber-500 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t('applicationPending')}</h2>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                    {t('applicationPendingDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Document Upload Area */}
          <div className="bg-[#1a1325] border border-white/5 p-8 rounded-3xl flex-1 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white">{t('uploadCredentialsTitle')}</h3>
              <p className="text-sm text-slate-400 mt-2">
                {t('uploadCredentialsDesc')}
              </p>
            </div>

            <div className="flex space-x-3 mb-6">
              <button
                onClick={() => setDocType('BROKER_LICENSE')}
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-300 ${docType === 'BROKER_LICENSE'
                    ? 'border-accent-violet bg-accent-violet/10 text-white shadow-[0_0_15px_rgba(106,95,193,0.2)]'
                    : 'border-white/10 hover:border-white/20 text-slate-400 hover:text-white bg-white/[0.02]'
                  }`}
              >
                {t('brokerageLicenseTab')}
              </button>
              <button
                onClick={() => setDocType('BROKER_ID')}
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-300 ${docType === 'BROKER_ID'
                    ? 'border-accent-violet bg-accent-violet/10 text-white shadow-[0_0_15px_rgba(106,95,193,0.2)]'
                    : 'border-white/10 hover:border-white/20 text-slate-400 hover:text-white bg-white/[0.02]'
                  }`}
              >
                {t('identityProofTab')}
              </button>
            </div>

            <div className="relative flex-1 min-h-[200px] mb-8">
              {uploading && (
                <div className="absolute inset-0 bg-[#1a1325]/90 backdrop-blur-sm rounded-xl z-20 flex flex-col items-center justify-center space-y-4 border border-white/5">
                  <div className="w-12 h-12 border-4 border-accent-violet/30 border-t-accent-violet rounded-full animate-spin" />
                  <p className="text-sm font-bold text-white tracking-widest uppercase">{t('encryptingUploading')}</p>
                </div>
              )}
              <div className="h-full border-2 border-dashed border-white/10 rounded-xl overflow-hidden hover:border-accent-violet/50 transition-colors">
                <FileUpload onFileSelect={handleFileUpload} theme="dark" />
              </div>
            </div>

            {/* Uploaded Documents List */}
            <div className="space-y-4 mt-auto">
              <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center">
                <span>{t('secureUploads')}</span>
                <div className="ml-3 h-px flex-1 bg-white/5" />
              </h4>
              
              {loading ? (
                <div className="flex items-center justify-center space-x-3 py-6 bg-white/[0.02] rounded-xl border border-white/5">
                  <Loader2 className="w-5 h-5 text-accent-violet animate-spin" />
                  <span className="text-sm text-slate-400 font-medium">{t('syncingDocuments')}</span>
                </div>
              ) : documents.length === 0 ? (
                <div className="py-6 text-center bg-white/[0.02] rounded-xl border border-white/5">
                  <p className="text-sm text-slate-500 font-medium">{t('noCredentials')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="group flex items-center justify-between p-4 rounded-xl border border-white/10 bg-[#110b1f] hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300">
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-accent-violet/10 text-accent-violet flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate max-w-[200px]">{doc.fileName}</p>
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mt-1 inline-block">
                            {doc.documentType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
