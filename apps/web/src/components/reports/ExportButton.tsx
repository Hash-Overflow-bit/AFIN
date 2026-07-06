'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ExportButtonProps {
  type: string;
}

export function ExportButton({ type }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await api.get(`/reports/export/${type}`, {
        responseType: 'blob',
      });

      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      // Create hidden link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `afin_${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#f9fafb] hover:bg-[#f3f4f6] text-[#422082] border border-[#e5e7eb] rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      Download CSV
    </button>
  );
}
