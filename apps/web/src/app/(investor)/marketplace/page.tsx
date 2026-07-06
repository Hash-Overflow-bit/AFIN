'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { bondsApi, Bond } from '@/lib/api/bonds';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, TrendingUp, Calendar, Info, ArrowRight } from 'lucide-react';

export default function MarketplacePage() {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchBonds = async () => {
      setLoading(true);
      try {
        const result = await bondsApi.getBonds({ search: debouncedSearch, limit: 20 });
        setBonds(result.data);
      } catch (error) {
        console.error('Failed to fetch marketplace bonds:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBonds();
  }, [debouncedSearch]);

  const formatter = new Intl.NumberFormat('en-MZ', { style: 'currency', currency: 'MZN' });

  return (
    <div className="space-y-10 min-h-screen bg-white text-[#1f1633] font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-[#1f1633] leading-tight">
            Bond Marketplace
          </h1>
          <p className="text-[#79628c] mt-2 text-[16px]">Discover and invest in premium government bonds.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#cfcfdb]" size={20} />
          <input
            type="text"
            placeholder="Search bonds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#cfcfdb] rounded-[6px] pl-[40px] pr-[12px] py-[8px] text-[#1f1633] text-[16px] focus:outline-none focus:border-[#6a5fc1] focus:ring-1 focus:ring-[#9dc1f5] transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#150f23]"></div>
        </div>
      ) : bonds.length === 0 ? (
        <div className="text-center py-20 bg-[#f9fafb] rounded-[12px] border border-[#e5e7eb]">
          <div className="w-16 h-16 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="h-8 w-8 text-[#79628c]" />
          </div>
          <h3 className="text-[20px] font-bold text-[#1f1633]">No bonds available</h3>
          <p className="text-[#79628c] mt-2 text-[16px]">Check back later for new offerings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bonds.map((bond) => (
            <Link key={bond.id} href={`/marketplace/${bond.id}`} className="group block h-full">
              <div className="h-full bg-white rounded-[12px] border border-[#e5e7eb] p-[24px] hover:border-[#cfcfdb] hover:shadow-[rgba(0,0,0,0.1)_0_10px_15px_-3px] transition-all duration-300 relative flex flex-col">
                
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-[20px] font-bold text-[#1f1633] group-hover:text-[#422082] transition-colors line-clamp-2">
                    {bond.name}
                  </h3>
                  {bond.status === 'OPEN' ? (
                    <span className="shrink-0 ml-4 px-[8px] py-[4px] text-[10px] font-bold tracking-[0.25px] uppercase bg-emerald-50 text-emerald-700 rounded-[4px] border border-emerald-200">
                      OPEN
                    </span>
                  ) : bond.status === 'ALLOCATED' ? (
                    <span className="shrink-0 ml-4 px-[8px] py-[4px] text-[10px] font-bold tracking-[0.25px] uppercase bg-amber-50 text-amber-700 rounded-[4px] border border-amber-200">
                      SOLD OUT
                    </span>
                  ) : (
                    <span className="shrink-0 ml-4 px-[8px] py-[4px] text-[10px] font-bold tracking-[0.25px] uppercase bg-gray-100 text-gray-700 rounded-[4px] border border-gray-300">
                      CLOSED
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-[#f9fafb] p-3 rounded-[6px] border border-[#e5e7eb]">
                    <p className="text-[#79628c] text-[12px] font-semibold mb-1 flex items-center gap-1 uppercase tracking-[0.25px]">
                      <TrendingUp size={12}/> Yield
                    </p>
                    <p className="text-[24px] font-bold text-[#1f1633] leading-none">{bond.couponRate}%</p>
                  </div>
                  <div className="bg-[#f9fafb] p-3 rounded-[6px] border border-[#e5e7eb]">
                    <p className="text-[#79628c] text-[12px] font-semibold mb-1 flex items-center gap-1 uppercase tracking-[0.25px]">
                      <Calendar size={12}/> Maturity
                    </p>
                    <p className="text-[20px] font-bold text-[#1f1633] mt-1 leading-none">
                      {new Date(bond.maturityDate).getFullYear()}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex justify-between items-center pt-4 border-t border-[#e5e7eb]">
                  <div>
                    <p className="text-[12px] font-semibold text-[#79628c] uppercase tracking-[0.25px] mb-0.5">Min. Inv</p>
                    <p className="text-[14px] font-bold text-[#1f1633]">
                      {formatter.format(bond.minInvestment)}
                    </p>
                  </div>
                  <div className="text-[14px] font-bold text-[#6a5fc1] uppercase tracking-[0.2px] group-hover:text-[#422082] transition-colors flex items-center gap-1">
                    Details <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
