'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, File, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({ onUpload, accept = 'application/pdf,image/jpeg,image/png', maxSizeMB = 10 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);
    
    const allowedTypes = accept.split(',').map(type => type.trim());
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError(`Invalid file type. Allowed types: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`);
      return;
    }

    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    setFile(selectedFile);
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

  const handleUploadClick = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    try {
      await onUpload(file);
      setSuccess(true);
      setFile(null); // Clear after success
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const typedErr = err as any;
      setError(typedErr.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {!file && !success && (
        <div
          className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors duration-200 ease-in-out ${
            isDragging
              ? 'border-accent-violet-mid bg-surface-press-light'
              : 'border-hairline-cool bg-surface-canvas-light hover:border-accent-violet-mid hover:bg-surface-press-light'
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
            disabled={uploading}
          />
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-press-stronger text-ink mb-4">
            <Upload size={24} />
          </div>
          <p className="text-[16px] font-semibold text-ink leading-[1.5] mb-2">
            Drag & drop your document here
          </p>
          <p className="text-[14px] font-normal text-ink/70 leading-[1.43]">
            or click to browse from your computer
          </p>
          <div className="flex gap-2 mt-4 text-[10px] font-semibold text-ink uppercase tracking-[0.25px] leading-[1.8]">
            <span className="px-2 py-1 rounded-[4px] bg-surface-press-stronger">PDF</span>
            <span className="px-2 py-1 rounded-[4px] bg-surface-press-stronger">JPEG</span>
            <span className="px-2 py-1 rounded-[4px] bg-surface-press-stronger">PNG</span>
            <span className="px-2 py-1 rounded-[4px] bg-surface-press-stronger">MAX {maxSizeMB}MB</span>
          </div>
        </div>
      )}

      {file && (
        <div className="flex items-center justify-between p-4 border border-hairline-cool rounded-[12px] bg-surface-canvas-light">
          <div className="flex items-center space-x-3 truncate">
            <div className="flex-shrink-0 p-2 rounded-[6px] bg-surface-press-stronger text-ink">
              <File size={20} />
            </div>
            <div className="truncate">
              <p className="text-[16px] font-medium text-ink leading-[1.5] truncate">{file.name}</p>
              <p className="text-[14px] font-normal text-ink/70 leading-[1.43]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
            <button
              onClick={() => setFile(null)}
              disabled={uploading}
              className="p-2 text-ink hover:bg-surface-press-light rounded-full transition-colors"
              title="Remove file"
            >
              <X size={20} />
            </button>
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="bg-primary text-on-primary font-bold text-[14px] uppercase tracking-[0.2px] leading-[1.14] px-[16px] py-[12px] rounded-[8px] hover:bg-surface-press-stronger hover:text-ink-press transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-center p-4 border border-accent-lime bg-surface-canvas-light rounded-[12px]">
          <CheckCircle className="text-accent-lime mr-3" size={24} />
          <div>
            <p className="text-[16px] font-semibold text-ink leading-[1.5]">Upload Complete</p>
            <p className="text-[14px] font-normal text-ink/70 leading-[1.43]">Your document has been submitted for KYC review.</p>
          </div>
          <button 
            onClick={() => setSuccess(false)}
            className="ml-auto bg-surface-press-stronger text-ink font-bold text-[14px] uppercase tracking-[0.2px] px-[16px] py-[8px] rounded-[8px] hover:bg-surface-press-light transition-colors"
          >
            Upload Another
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-[16px] font-medium rounded-[6px] border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
