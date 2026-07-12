'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { FileUpload } from '@/components/ui/FileUpload';
import { ShieldAlert, FileText, CheckCircle, Trash2, LogOut, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BrokerOnboardingPage() {
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('BROKER_LICENSE');

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
      toast.success('Document uploaded successfully!');
      fetchDocuments();
    } catch (err: any) {
      console.error('Error uploading document:', err);
      toast.error(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas-dark text-on-primary flex flex-col relative overflow-hidden" style={{ backgroundColor: '#0a0514' }}>
      {/* Background radial gradient */}
      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none rounded-full blur-[150px]"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none rounded-full blur-[150px]"
        style={{
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%)'
        }}
      />

      {/* Header bar */}
      <header className="w-full flex items-center justify-between px-8 py-6 relative z-10 border-b border-white/5 bg-[#0a0514]/40 backdrop-blur-md">
        <h1 className="font-logo text-white text-3xl font-bold tracking-wider">AGBX</h1>
        <button
          onClick={logout}
          className="flex items-center space-x-2 px-4 py-2 border border-white/10 hover:bg-white/5 rounded-full text-sm font-semibold text-slate-300 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Status & Profile Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-night/45 p-6 rounded-2xl border border-white/10 backdrop-blur-xl shadow-level-3 space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-500 animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Application Pending</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your broker profile registration has been submitted and is awaiting administrative activation.
              </p>
            </div>

            <hr className="border-white/5" />

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Representative</span>
                <p className="text-white font-medium mt-0.5">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Email Address</span>
                <p className="text-white font-medium mt-0.5">{user?.email}</p>
              </div>
              {user?.companyName && (
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Brokerage Firm</span>
                  <p className="text-white font-medium mt-0.5">{user?.companyName}</p>
                </div>
              )}
              {user?.licenseNumber && (
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">License Registration</span>
                  <p className="text-white font-mono mt-0.5 text-xs">{user?.licenseNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Document Upload and Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-night/45 p-8 rounded-2xl border border-white/10 backdrop-blur-xl shadow-level-3 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-white">Upload Credentials</h3>
              <p className="text-sm text-slate-300 mt-1">
                Provide verifying documents (such as your Brokerage License or Identity ID) so the system administrators can review your firm.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDocType('BROKER_LICENSE')}
                className={`p-3 rounded-lg border text-left text-sm font-semibold transition-all ${
                  docType === 'BROKER_LICENSE'
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-white/10 hover:border-white/20 text-slate-400 hover:text-white'
                }`}
              >
                Brokerage License
              </button>
              <button
                onClick={() => setDocType('BROKER_ID')}
                className={`p-3 rounded-lg border text-left text-sm font-semibold transition-all ${
                  docType === 'BROKER_ID'
                    ? 'border-red-500 bg-red-500/10 text-white'
                    : 'border-white/10 hover:border-white/20 text-slate-400 hover:text-white'
                }`}
              >
                Identity Proof (ID/Passport)
              </button>
            </div>

            <div className="relative">
              {uploading && (
                <div className="absolute inset-0 bg-surface-night/80 rounded-xl z-20 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                  <p className="text-sm font-medium text-white">Uploading file...</p>
                </div>
              )}
              <FileUpload onFileSelect={handleFileUpload} theme="dark" />
            </div>

            {/* Uploaded Documents List */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Uploaded Documents</h4>
              {loading ? (
                <div className="flex items-center space-x-2 py-4">
                  <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                  <span className="text-xs text-slate-400">Fetching uploads...</span>
                </div>
              ) : documents.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No credentials uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-2 rounded-lg bg-white/5 text-white">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate max-w-[250px]">{doc.fileName}</p>
                          <span className="text-[10px] font-mono text-slate-300 bg-white/5 px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block">
                            {doc.documentType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
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
