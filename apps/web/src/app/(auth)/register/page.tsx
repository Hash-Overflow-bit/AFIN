"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Loader2, CheckCircle2, ChevronRight, ChevronLeft, Building2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { FileUpload } from "@/components/ui/FileUpload";

type Step = 'ROLE' | 'NAME' | 'FIRM' | 'CREDENTIALS' | 'DOCUMENTS' | 'SUCCESS';

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('ROLE');
  const [direction, setDirection] = useState(1);
  const [role, setRole] = useState<'INVESTOR' | 'BROKER'>('INVESTOR');
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
    licenseNumber: "",
  });
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const nextStep = (next: Step) => {
    setDirection(1);
    setStep(next);
  };

  const prevStep = (prev: Step) => {
    setDirection(-1);
    setStep(prev);
  };

  const handleRegister = async () => {
    setError("");
    setIsLoading(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role,
        ...(role === 'BROKER' && {
          companyName: formData.companyName,
          licenseNumber: formData.licenseNumber,
        }),
      };
      await api.post("/auth/register", payload);
      
      // Auto login to proceed to document upload
      const loginRes = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      
      login(loginRes.data, false);
      nextStep('DOCUMENTS');
    } catch (err: unknown) {
      const typedErr = err as any;
      if (Array.isArray(typedErr.response?.data?.message)) {
        setError(typedErr.response.data.message[0]);
      } else {
        setError(typedErr.response?.data?.message || "Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    await api.post('/investors/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const handleSubmitDocs = async () => {
    setError("");
    setIsLoading(true);
    try {
      await Promise.all(
        Object.entries(selectedFiles).map(([docType, file]) => handleFileUpload(file, docType))
      );
      await api.post('/investors/submit-kyc');
      nextStep('SUCCESS');
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload documents.");
    } finally {
      setIsLoading(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? -500 : 500,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0a0514] relative overflow-hidden py-12 text-on-primary">
      {/* Navbar Header */}
      <header className="w-full px-8 py-6 flex items-center z-20 relative">
        <Link href="/">
          <h1 className="font-logo text-white text-[28px] tracking-wider leading-none">
            AGBX
          </h1>
        </Link>
      </header>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <main className="flex-1 flex items-center justify-center p-6 z-10 relative w-full">
        <div className={`card-night w-full max-w-lg relative bg-surface-night/65 border border-hairline-violet/20 rounded-2xl overflow-hidden transition-all duration-300 ${step === 'DOCUMENTS' ? 'h-[700px]' : 'h-[540px]'}`}>
          <AnimatePresence initial={false} custom={direction}>
            {step === 'ROLE' && (
              <motion.div
                key="ROLE"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="absolute inset-0 p-10 flex flex-col h-full"
              >
                <div className="mb-8 text-center flex-shrink-0">
                  <h1 className="font-display text-[32px] font-bold leading-tight mb-2">
                    Join the Network
                  </h1>
                  <p className="text-on-dark-muted font-medium text-sm">Select your account type</p>
                </div>
                
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <button
                    onClick={() => { setRole('INVESTOR'); nextStep('NAME'); }}
                    className="group flex items-center p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent-lime/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 text-accent-lime" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-white">Investor</h3>
                      <p className="text-sm text-slate-400 mt-1">Purchase and manage sovereign bonds</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                  </button>

                  <button
                    onClick={() => { setRole('BROKER'); nextStep('NAME'); }}
                    className="group flex items-center p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent-violet/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <Building2 className="w-6 h-6 text-accent-violet" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-white">Broker</h3>
                      <p className="text-sm text-slate-400 mt-1">Issue bonds and manage clients</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                  </button>
                </div>

                <div className="mt-8 text-center flex-shrink-0">
                  <p className="text-slate-400 text-sm">
                    Already registered?{" "}
                    <Link href="/login" className="text-white font-bold hover:text-accent-lime transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'NAME' && (
              <motion.div
                key="NAME"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="absolute inset-0 p-10 flex flex-col h-full"
              >
                <button onClick={() => prevStep('ROLE')} className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center text-sm font-semibold transition-colors z-10">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </button>
                
                <div className="mt-12 mb-8 text-center flex-shrink-0">
                  <h1 className="font-display text-[32px] font-bold leading-tight mb-2">
                    What's your name?
                  </h1>
                  <p className="text-on-dark-muted font-medium text-sm">Let's get to know you</p>
                </div>
                
                <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="firstName">First Name</label>
                    <input id="firstName" type="text" className="w-full mt-2 p-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white text-white placeholder-white/30 text-lg font-medium transition-all" value={formData.firstName} onChange={handleChange} placeholder="Jane" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="lastName">Last Name</label>
                    <input id="lastName" type="text" className="w-full mt-2 p-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white text-white placeholder-white/30 text-lg font-medium transition-all" value={formData.lastName} onChange={handleChange} placeholder="Doe" />
                  </div>
                </div>

                <div className="mt-8 flex-shrink-0">
                  <button 
                    onClick={() => {
                      if (formData.firstName && formData.lastName) {
                        if (role === 'BROKER') nextStep('FIRM');
                        else nextStep('CREDENTIALS');
                      }
                    }} 
                    disabled={!formData.firstName || !formData.lastName}
                    className="btn-inverted w-full py-4 bg-white text-black font-bold rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'FIRM' && (
              <motion.div
                key="FIRM"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="absolute inset-0 p-10 flex flex-col h-full"
              >
                <button onClick={() => prevStep('NAME')} className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center text-sm font-semibold transition-colors z-10">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </button>
                
                <div className="mt-12 mb-8 text-center flex-shrink-0">
                  <h1 className="font-display text-[32px] font-bold leading-tight mb-2">
                    Firm Details
                  </h1>
                  <p className="text-on-dark-muted font-medium text-sm">Tell us about your brokerage</p>
                </div>
                
                <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="companyName">Brokerage Firm Name</label>
                    <input id="companyName" type="text" className="w-full mt-2 p-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white text-white placeholder-white/30 text-lg font-medium transition-all" value={formData.companyName} onChange={handleChange} placeholder="Capital Partners" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="licenseNumber">Intermediary License Number</label>
                    <input id="licenseNumber" type="text" className="w-full mt-2 p-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white text-white placeholder-white/30 text-lg font-medium transition-all" value={formData.licenseNumber} onChange={handleChange} placeholder="BVM-LIC-2026-987" />
                  </div>
                </div>

                <div className="mt-8 flex-shrink-0">
                  <button 
                    onClick={() => {
                      if (formData.companyName && formData.licenseNumber) {
                        nextStep('CREDENTIALS');
                      }
                    }} 
                    disabled={!formData.companyName || !formData.licenseNumber}
                    className="btn-inverted w-full py-4 bg-white text-black font-bold rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'CREDENTIALS' && (
              <motion.div
                key="CREDENTIALS"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="absolute inset-0 p-10 flex flex-col h-full"
              >
                <button onClick={() => { role === 'BROKER' ? prevStep('FIRM') : prevStep('NAME') }} className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center text-sm font-semibold transition-colors z-10">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </button>
                
                <div className="mt-12 mb-4 text-center flex-shrink-0">
                  <h1 className="font-display text-[32px] font-bold leading-tight mb-2">
                    Account Security
                  </h1>
                  <p className="text-on-dark-muted font-medium text-sm">How will you log in?</p>
                </div>
                
                <div className="flex-1 flex flex-col justify-center space-y-6">
                  {error && (
                    <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-md text-red-400 font-mono text-xs shadow-level-1">
                      <span className="font-bold uppercase tracking-console">Error:</span> {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="email">Work Email</label>
                    <input id="email" type="email" className="w-full mt-2 p-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white text-white placeholder-white/30 text-lg font-medium transition-all" value={formData.email} onChange={handleChange} placeholder="jane.doe@company.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide" htmlFor="password">Secure Password</label>
                    <input id="password" type="password" className="w-full mt-2 p-3.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white text-white placeholder-white/30 text-lg font-medium transition-all" value={formData.password} onChange={handleChange} placeholder="Min 8 characters" />
                  </div>
                </div>

                <div className="mt-8 flex-shrink-0">
                  <button 
                    onClick={handleRegister} 
                    disabled={!formData.email || !formData.password || formData.password.length < 8 || isLoading}
                    className="btn-inverted w-full py-4 bg-white text-black font-bold rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-lg"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {isLoading ? "Provisioning..." : "Create Account"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'DOCUMENTS' && (
              <motion.div
                key="DOCUMENTS"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="absolute inset-0 p-10 flex flex-col h-full overflow-y-auto custom-scrollbar"
              >
                <div className="mb-4 text-center flex-shrink-0">
                  <h1 className="font-display text-[28px] font-bold leading-tight mb-2">
                    Verify Your Identity
                  </h1>
                  <p className="text-on-dark-muted font-medium text-sm">Please upload the required documents</p>
                </div>
                
                <div className="flex-1 flex flex-col space-y-4">
                  {error && (
                    <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-md text-red-400 font-mono text-xs shadow-level-1">
                      <span className="font-bold uppercase tracking-console">Error:</span> {error}
                    </div>
                  )}

                  {role === 'INVESTOR' ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Proof of Identity (BI/Passport)</label>
                        <FileUpload onFileSelect={(file) => setSelectedFiles({ ...selectedFiles, IDENTITY: file })} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Tax Number (NUIT)</label>
                        <FileUpload onFileSelect={(file) => setSelectedFiles({ ...selectedFiles, TAX_NUMBER: file })} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Proof of Address</label>
                        <FileUpload onFileSelect={(file) => setSelectedFiles({ ...selectedFiles, ADDRESS: file })} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Broker License</label>
                        <FileUpload onFileSelect={(file) => setSelectedFiles({ ...selectedFiles, BROKER_LICENSE: file })} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Proof of Identity (Rep)</label>
                        <FileUpload onFileSelect={(file) => setSelectedFiles({ ...selectedFiles, IDENTITY: file })} />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-8 flex-shrink-0">
                  <button 
                    onClick={handleSubmitDocs} 
                    disabled={isLoading || (role === 'INVESTOR' ? Object.keys(selectedFiles).length < 3 : Object.keys(selectedFiles).length < 2)}
                    className="btn-inverted w-full py-4 bg-white text-black font-bold rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-lg"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {isLoading ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'SUCCESS' && (
              <motion.div
                key="SUCCESS"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="absolute inset-0 p-10 flex flex-col items-center justify-center h-full text-center"
              >
                <CheckCircle2 className="w-20 h-20 text-accent-lime mx-auto mb-6" />
                <h1 className="font-display text-4xl font-bold mb-4">Application Submitted</h1>
                <p className="text-on-dark-muted mb-8 text-base max-w-sm mx-auto leading-relaxed">
                  {role === 'BROKER' 
                    ? "Your application and documents have been submitted. You will be notified once an Administrator reviews your profile." 
                    : "Your application and documents have been submitted. Our team will review your profile shortly."}
                </p>
                <Link href="/login" className="btn-inverted w-full inline-flex justify-center py-4 bg-white text-black font-bold rounded-full hover:bg-slate-100 transition-colors text-lg">
                  Proceed to Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
