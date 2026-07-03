'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function BrokerDashboardPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await api.get('/investors/kyc-queue');
      setQueue(response.data);
    } catch (error) {
      console.error('Failed to fetch KYC queue', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-ink">Loading KYC queue...</div>;
  }

  return (
    <div className="w-full">
      <h2 className="text-[30px] font-medium text-ink leading-[1.2] mb-8">KYC Verification Queue</h2>
      
      <div className="bg-surface-canvas-light border border-hairline-cloud rounded-[12px] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-press-light border-b border-hairline-cloud">
              <th className="py-4 px-6 font-semibold text-[14px] text-ink/70">Investor</th>
              <th className="py-4 px-6 font-semibold text-[14px] text-ink/70">Email</th>
              <th className="py-4 px-6 font-semibold text-[14px] text-ink/70">Status</th>
              <th className="py-4 px-6 font-semibold text-[14px] text-ink/70">Submitted</th>
              <th className="py-4 px-6 font-semibold text-[14px] text-ink/70 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[14px] text-ink/70">
                  No pending KYC applications.
                </td>
              </tr>
            ) : (
              queue.map((profile) => (
                <tr key={profile.id} className="border-b border-hairline-cloud hover:bg-surface-press-light transition-colors">
                  <td className="py-4 px-6 text-[16px] font-medium text-ink">
                    {profile.user.firstName} {profile.user.lastName}
                  </td>
                  <td className="py-4 px-6 text-[14px] text-ink/70">
                    {profile.user.email}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-[4px] text-[12px] font-bold ${
                      profile.kycStatus === 'DOCUMENTS_SUBMITTED' 
                        ? 'bg-accent-violet/20 text-accent-violet-deep' 
                        : 'bg-surface-press text-ink'
                    }`}>
                      {profile.kycStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[14px] text-ink/70">
                    {new Date(profile.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link 
                      href={`/broker/investor/${profile.user.id}`}
                      className="inline-block px-4 py-2 bg-surface-night text-on-primary rounded-[8px] font-medium text-[14px] hover:bg-surface-night/90 transition-colors"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
