'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '../navigation';
import { useParams } from 'next/navigation';
import { Globe, Loader2 } from 'lucide-react';
import { useTransition, useState, useEffect } from 'react';

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const [displayLocale, setDisplayLocale] = useState(currentLocale);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  // Sync state if locale changes externally
  useEffect(() => {
    setDisplayLocale(currentLocale);
  }, [currentLocale]);

  const toggleLocale = () => {
    const nextLocale = displayLocale === 'pt' ? 'en' : 'pt';
    setDisplayLocale(nextLocale);
    
    // Explicitly set cookie so next-intl middleware persists preference
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    startTransition(() => {
      // Pass pathname as a string, next-intl will automatically handle the locale prefix
      router.replace(pathname as any, { locale: nextLocale });
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className={`flex items-center space-x-2 text-sm font-semibold transition-colors rounded-full px-3 py-1.5 ${
        isPending ? 'opacity-50 cursor-not-allowed bg-white/5 text-slate-400' : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10'
      }`}
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
      <span>{displayLocale === 'pt' ? 'PT' : 'EN'}</span>
    </button>
  );
}
