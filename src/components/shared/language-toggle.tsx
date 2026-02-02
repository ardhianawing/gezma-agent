'use client';

import { useLanguage, Language } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { c } = useTheme();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'id' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 12px',
        borderRadius: '8px',
        border: `1px solid ${c.border}`,
        backgroundColor: c.cardBg,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        fontSize: '13px',
        fontWeight: '600',
      }}
      title={language === 'en' ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          backgroundColor: language === 'en' ? c.primary : c.cardBgHover,
          color: language === 'en' ? 'white' : c.textMuted,
          fontSize: '11px',
          fontWeight: '700',
          transition: 'all 0.15s ease',
        }}
      >
        EN
      </span>
      <span
        style={{
          color: c.textLight,
          fontSize: '12px',
        }}
      >
        /
      </span>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          backgroundColor: language === 'id' ? c.primary : c.cardBgHover,
          color: language === 'id' ? 'white' : c.textMuted,
          fontSize: '11px',
          fontWeight: '700',
          transition: 'all 0.15s ease',
        }}
      >
        ID
      </span>
    </button>
  );
}
