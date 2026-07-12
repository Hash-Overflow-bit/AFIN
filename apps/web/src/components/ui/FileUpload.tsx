'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, File, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  theme?: 'light' | 'dark';
}

export function FileUpload({ onFileSelect, accept = 'application/pdf,image/jpeg,image/png', maxSizeMB = 10, theme = 'light' }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    
    const allowedTypes = accept.split(',').map(type => type.trim());
    
    if (!allowedTypes.includes(selectedFile.type)) {
      const typeNames = allowedTypes.map(t => 
        t.includes('/') ? t.split('/')[1].toUpperCase() : t.replace(/^\./, '').toUpperCase()
      );
      setError(`Invalid file type. Allowed types: ${typeNames.join(', ')}`);
      setCurrentFile(null);
      return;
    }

    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      setCurrentFile(null);
      return;
    }

    setCurrentFile(selectedFile);
    onFileSelect(selectedFile);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accept, maxSizeBytes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors duration-200 ease-in-out ${
          isDragging
            ? (theme === 'dark' ? 'border-red-500 bg-red-500/5' : 'border-accent-violet-mid bg-surface-press-light')
            : (theme === 'dark'
                ? 'border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
                : 'border-hairline-cool bg-surface-canvas-light hover:border-accent-violet-mid hover:bg-surface-press-light')
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className={`flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
          theme === 'dark' ? 'bg-white/5 text-white' : 'bg-surface-press-stronger text-ink'
        }`}>
          {currentFile ? <CheckCircle size={24} className="text-emerald-500" /> : <Upload size={24} />}
        </div>
        <p className={`text-[16px] font-semibold leading-[1.5] mb-2 text-center ${
          theme === 'dark' ? 'text-white' : 'text-ink'
        }`}>
          {currentFile ? "File selected successfully" : "Drag & drop your document here"}
        </p>
        <p className={`text-[14px] font-normal leading-[1.43] text-center px-4 ${
          theme === 'dark' ? 'text-slate-400' : 'text-ink/70'
        }`}>
          {currentFile ? "Click or drag another file to replace it" : "or click to browse from your computer"}
        </p>
        
        {!currentFile && (
          <div className={`flex gap-2 mt-4 text-[10px] font-semibold uppercase tracking-[0.25px] leading-[1.8] ${
            theme === 'dark' ? 'text-slate-400' : 'text-ink'
          }`}>
            <span className={`px-2 py-1 rounded-[4px] ${theme === 'dark' ? 'bg-white/5' : 'bg-surface-press-stronger'}`}>PDF</span>
            <span className={`px-2 py-1 rounded-[4px] ${theme === 'dark' ? 'bg-white/5' : 'bg-surface-press-stronger'}`}>JPEG</span>
            <span className={`px-2 py-1 rounded-[4px] ${theme === 'dark' ? 'bg-white/5' : 'bg-surface-press-stronger'}`}>PNG</span>
            <span className={`px-2 py-1 rounded-[4px] ${theme === 'dark' ? 'bg-white/5' : 'bg-surface-press-stronger'}`}>MAX {maxSizeMB}MB</span>
          </div>
        )}
      </div>

      {currentFile && !error && (
        <div className={`mt-4 p-3 flex items-center gap-3 text-[14px] font-medium rounded-[6px] border ${
          theme === 'dark'
            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          <File size={16} className="flex-shrink-0" />
          <span className="truncate flex-1">{currentFile.name}</span>
          <span className="text-xs opacity-70">{(currentFile.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
      )}

      {error && (
        <div className={`mt-4 p-3 text-[14px] font-medium rounded-[6px] border ${
          theme === 'dark'
            ? 'bg-red-950/20 text-red-400 border-red-500/30'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {error}
        </div>
      )}
    </div>
  );
}

