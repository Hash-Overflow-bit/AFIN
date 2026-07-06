'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ReportTable, ColumnDef } from '@/components/reports/ReportTable';
import { ExportButton } from '@/components/reports/ExportButton';
import { FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

type ReportType = 'investors' | 'bonds' | 'orders' | 'aum';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('investors');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReportData = async (type: ReportType) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get(`/reports/data/${type}`);
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch report data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(activeTab);
  }, [activeTab]);

  const tabs: { id: ReportType; label: string }[] = [
    { id: 'investors', label: 'Investors' },
    { id: 'bonds', label: 'Bonds' },
    { id: 'orders', label: 'Orders' },
    { id: 'aum', label: 'AUM' },
  ];

  // Define columns based on active tab
  const getColumns = (): ColumnDef[] => {
    switch (activeTab) {
      case 'investors':
        return [
          { key: 'firstName', label: 'First Name' },
          { key: 'lastName', label: 'Last Name' },
          { key: 'email', label: 'Email' },
          { key: 'status', label: 'Account Status', format: (v) => <span className="uppercase text-xs font-bold tracking-wider">{v}</span> },
          { key: 'kycStatus', label: 'KYC Status', format: (v) => <span className="uppercase text-xs font-bold tracking-wider">{v}</span> },
          { key: 'joinedDate', label: 'Joined', format: (v) => v ? format(new Date(v), 'MMM dd, yyyy') : 'N/A' },
        ];
      case 'bonds':
        return [
          { key: 'name', label: 'Bond Name' },
          { key: 'isin', label: 'ISIN' },
          { key: 'faceValue', label: 'Face Value (MZN)', format: (v) => Number(v).toLocaleString() },
          { key: 'couponRate', label: 'Coupon Rate', format: (v) => `${v}%` },
          { key: 'status', label: 'Status', format: (v) => <span className="uppercase text-xs font-bold tracking-wider">{v}</span> },
          { key: 'issueDate', label: 'Issue Date', format: (v) => v ? format(new Date(v), 'MMM dd, yyyy') : 'N/A' },
        ];
      case 'orders':
        return [
          { key: 'id', label: 'Order ID', format: (v) => v.slice(0, 8) },
          { key: 'bondName', label: 'Bond Name' },
          { key: 'investorName', label: 'Investor Name' },
          { key: 'requestedAmount', label: 'Requested', format: (v) => `${Number(v).toLocaleString()} MZN` },
          { key: 'allocatedAmount', label: 'Allocated', format: (v) => `${Number(v).toLocaleString()} MZN` },
          { key: 'status', label: 'Status', format: (v) => <span className="uppercase text-xs font-bold tracking-wider">{v}</span> },
          { key: 'createdAt', label: 'Date', format: (v) => v ? format(new Date(v), 'MMM dd, yyyy') : 'N/A' },
        ];
      case 'aum':
        return [
          { key: 'investorName', label: 'Investor Name' },
          { key: 'bondName', label: 'Bond Name' },
          { key: 'faceValueHeld', label: 'Holdings (MZN)', format: (v) => Number(v).toLocaleString() },
          { key: 'status', label: 'Status', format: (v) => <span className="uppercase text-xs font-bold tracking-wider">{v}</span> },
          { key: 'lastUpdated', label: 'Last Updated', format: (v) => v ? format(new Date(v), 'MMM dd, yyyy') : 'N/A' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="max-w-[1152px] mx-auto pb-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1f1633] leading-tight flex items-center gap-3">
            <FileSpreadsheet className="text-[#6a5fc1]" size={32} />
            Data Reports
          </h1>
          <p className="text-[#79628c] mt-2 text-sm">
            Raw datasets and exportable lists for platform auditing.
          </p>
        </div>
        <div>
          <ExportButton type={activeTab} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e7eb] space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-semibold tracking-wide transition-colors relative ${
              activeTab === tab.id
                ? 'text-[#6a5fc1]'
                : 'text-[#a08ab3] hover:text-[#79628c]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#6a5fc1] rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {error ? (
        <div className="bg-white border border-rose-200 rounded-2xl p-8 w-full text-center shadow-sm">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <p className="text-[#1f1633] font-medium">{error}</p>
        </div>
      ) : (
        <ReportTable columns={getColumns()} data={data} isLoading={isLoading} />
      )}

    </div>
  );
}
