import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FileText, CheckCircle, CreditCard, Send, Activity, DollarSign } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { useTranslations } from 'next-intl';

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


export function ActivityFeed({ activities }: ActivityFeedProps) {
  const t = useTranslations("Analytics");

  const getActionDetails = (action: string) => {
    switch (action) {
      case 'ORDER_CREATED':
        return { icon: FileText, color: 'text-sky-600', border: 'border-sky-200', bg: 'bg-sky-50', label: t('orderSubmitted') };
      case 'ORDER_APPROVED':
        return { icon: CheckCircle, color: 'text-teal-600', border: 'border-teal-200', bg: 'bg-teal-50', label: t('orderApproved') };
      case 'PAYMENT_UPLOADED':
        return { icon: CreditCard, color: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50', label: t('paymentUploaded') };
      case 'PAYMENT_VERIFIED':
        return { icon: CheckCircle, color: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50', label: t('paymentVerified') };
      case 'BOND_PUBLISHED':
        return { icon: Send, color: 'text-[#6a5fc1]', border: 'border-[#6a5fc1]/30', bg: 'bg-[#6a5fc1]/10', label: t('bondPublished') };
      case 'BOND_ALLOCATED':
        return { icon: Activity, color: 'text-fuchsia-600', border: 'border-fuchsia-200', bg: 'bg-fuchsia-50', label: t('allocationCompleted') };
      case 'COUPON_PAID':
        return { icon: DollarSign, color: 'text-green-600', border: 'border-green-200', bg: 'bg-green-50', label: t('couponPaid') };
      default:
        return { icon: Activity, color: 'text-slate-500', border: 'border-slate-200', bg: 'bg-slate-50', label: action };
    }
  };

  return (
    <div className="bg-white dark:bg-ink-deep border border-[#e5e7eb] dark:border-hairline-violet rounded-2xl p-6 shadow-sm flex flex-col h-full relative hover:z-50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <h3 className="text-[#1f1633] dark:text-white font-bold text-lg tracking-tight">{t('auditTrail')}</h3>
            <Tooltip content={t('auditTooltip')} />
          </div>
          <p className="text-[#79628c] dark:text-on-dark-muted text-sm mt-1">{t('auditSubtitle')}</p>
        </div>
        <span className="px-2.5 py-1 bg-slate-50 dark:bg-[#1a1130] border border-[#e5e7eb] dark:border-hairline-violet rounded-md text-[10px] font-semibold text-[#79628c] dark:text-on-dark-muted uppercase tracking-widest">
          {t('liveLabel')}
        </span>
      </div>
      
      {activities.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#79628c] dark:text-on-dark-muted text-sm text-center py-8">{t('noActivity')}</p>
        </div>
      ) : (
        <div className="overflow-y-auto pr-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pb-4">
          {activities.map((item, index) => {
            const { icon: Icon, color, bg, border, label } = getActionDetails(item.action);
            
            return (
              <div key={item.id} className="relative pl-4">
                {/* Timeline connector */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-[1.35rem] top-8 bottom-[-1.5rem] w-px bg-[#e5e7eb] dark:bg-hairline-violet"></div>
                )}
                
                <div className="flex gap-4">
                  <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full border ${border} ${bg} ${color} flex items-center justify-center z-10 shadow-sm`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 bg-[#f9fafb] dark:bg-[#1a1130] border border-[#e5e7eb] dark:border-hairline-violet rounded-xl p-3.5 hover:bg-white dark:hover:bg-[#1f1735]/40 transition-colors shadow-sm">
                    <p className="text-sm text-[#1f1633] dark:text-white">
                      <span className="font-semibold">
                        {item.user ? `${item.user.firstName} ${item.user.lastName}` : t('system')}
                      </span>{' '}
                      <span className="text-[#79628c] dark:text-on-dark-muted font-light">{t('performed')}</span>{' '}
                      <span className="font-medium text-[#422082] dark:text-accent-lime">{label}</span>
                    </p>
                    <p className="text-xs text-[#79628c] dark:text-on-dark-muted mt-1.5 font-medium tracking-wide">
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
