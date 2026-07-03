'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, File, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({ onFileSelect, accept = 'application/pdf,image/jpeg,image/png', maxSizeMB = 10 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(`Invalid file type. Allowed types: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`);
      return;
    }

    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

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

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-[16px] font-medium rounded-[6px] border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}

