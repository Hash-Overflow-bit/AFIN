import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FileText, CheckCircle, CreditCard, Send, Activity, DollarSign } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ActivityItem {
  id: string;
  action: string;
  details: any;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const getActionDetails = (action: string) => {
  switch (action) {
    case 'ORDER_CREATED':
      return { icon: FileText, color: 'text-sky-600', border: 'border-sky-200', bg: 'bg-sky-50', label: 'Order Submitted' };
    case 'ORDER_APPROVED':
      return { icon: CheckCircle, color: 'text-teal-600', border: 'border-teal-200', bg: 'bg-teal-50', label: 'Order Approved' };
    case 'PAYMENT_UPLOADED':
      return { icon: CreditCard, color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50', label: 'Payment Uploaded' };
    case 'PAYMENT_VERIFIED':
      return { icon: CheckCircle, color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50', label: 'Payment Verified' };
    case 'BOND_PUBLISHED':
      return { icon: Send, color: 'text-[#6a5fc1]', border: 'border-[#6a5fc1]/30', bg: 'bg-[#6a5fc1]/10', label: 'Bond Published' };
    case 'BOND_ALLOCATED':
      return { icon: Activity, color: 'text-fuchsia-600', border: 'border-fuchsia-200', bg: 'bg-fuchsia-50', label: 'Allocation Completed' };
    case 'COUPON_PAID':
      return { icon: DollarSign, color: 'text-green-600', border: 'border-green-200', bg: 'bg-green-50', label: 'Coupon Paid' };
    default:
      return { icon: Activity, color: 'text-slate-500', border: 'border-slate-200', bg: 'bg-slate-50', label: action };
  }
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-sm flex flex-col h-full relative hover:z-50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <h3 className="text-[#1f1633] font-bold text-lg tracking-tight">Audit Trail</h3>
            <Tooltip content="A chronologically ordered feed of recent critical financial transactions, such as order submissions, payment verifications, and bond allocations." />
          </div>
          <p className="text-[#79628c] text-sm mt-1">Real-time financial events</p>
        </div>
        <span className="px-2.5 py-1 bg-slate-50 border border-[#e5e7eb] rounded-md text-[10px] font-semibold text-[#79628c] uppercase tracking-widest">
          Live
        </span>
      </div>
      
      {activities.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#79628c] text-sm text-center py-8">No recent activity.</p>
        </div>
      ) : (
        <div className="overflow-y-auto pr-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pb-4">
          {activities.map((item, index) => {
            const { icon: Icon, color, bg, border, label } = getActionDetails(item.action);
            
            return (
              <div key={item.id} className="relative pl-4">
                {/* Timeline connector */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-[1.35rem] top-8 bottom-[-1.5rem] w-px bg-[#e5e7eb]"></div>
                )}
                
                <div className="flex gap-4">
                  <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full border ${border} ${bg} ${color} flex items-center justify-center z-10 shadow-sm`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-3.5 hover:bg-white transition-colors shadow-sm">
                    <p className="text-sm text-[#1f1633]">
                      <span className="font-semibold">
                        {item.user ? `${item.user.firstName} ${item.user.lastName}` : 'System'}
                      </span>{' '}
                      <span className="text-[#79628c] font-light">performed:</span>{' '}
                      <span className="font-medium text-[#422082]">{label}</span>
                    </p>
                    <p className="text-xs text-[#79628c] mt-1.5 font-medium tracking-wide">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
