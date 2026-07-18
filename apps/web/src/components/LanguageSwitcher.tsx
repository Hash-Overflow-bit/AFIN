'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'pt' ? 'en' : 'pt';
    
    // Explicitly set the cookie so next-intl middleware respects the new language
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    
    // Strip current locale prefix if present
    let pathWithoutLocale = pathname;
    if (pathname.startsWith('/pt')) {
      pathWithoutLocale = pathname.replace(/^\/pt/, '') || '/';
    } else if (pathname.startsWith('/en')) {
      pathWithoutLocale = pathname.replace(/^\/en/, '') || '/';
    }

    // Build new path: default locale (pt) has no prefix, en gets /en prefix
    const newPath = nextLocale === 'pt' 
      ? pathWithoutLocale 
      : `/en${pathWithoutLocale}`;
    
    window.location.href = newPath;
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center space-x-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full"
    >
      <Globe className="w-4 h-4" />
      <span>{locale === 'pt' ? 'PT' : 'EN'}</span>
    </button>
  );
}
