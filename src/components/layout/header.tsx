'use client';

import { Bell, Search, Menu, ChevronDown } from 'lucide-react';
import { LanguageToggle } from '@/components/shared/language-toggle';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useLanguage();
  const { c } = useTheme();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        backgroundColor: c.headerBg,
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${c.borderLight}`,
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          height: '72px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        {/* Left side - Menu button (mobile) + Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          {/* Mobile menu button - hidden on desktop */}
          <button
            onClick={onMenuClick}
            style={{
              padding: '10px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'none',
            }}
          >
            <Menu style={{ width: '20px', height: '20px', color: c.textMuted }} />
          </button>

          {/* Search */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                color: c.textLight,
                pointerEvents: 'none',
              }}
            />
            <input
              type="search"
              placeholder={t.header.searchPlaceholder}
              style={{
                width: '100%',
                height: '48px',
                paddingLeft: '48px',
                paddingRight: '16px',
                borderRadius: '12px',
                border: `1px solid ${c.border}`,
                backgroundColor: c.inputBg,
                fontSize: '14px',
                color: c.textPrimary,
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
            />
          </div>
        </div>

        {/* Right side - Theme Toggle + Language Toggle + Notifications + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Toggle */}
          <LanguageToggle />

          {/* Notifications */}
          <button
            style={{
              position: 'relative',
              padding: '10px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <Bell style={{ width: '20px', height: '20px', color: c.textMuted }} />
            {/* Notification dot */}
            <span
              style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: c.primary,
              }}
            />
          </button>

          {/* Divider */}
          <div
            style={{
              height: '32px',
              width: '1px',
              backgroundColor: c.border,
              margin: '0 8px',
            }}
          />

          {/* User Menu */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>AD</span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                Admin
              </p>
              <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>
                Barokah Travel
              </p>
            </div>
            <ChevronDown style={{ width: '16px', height: '16px', color: c.textLight }} />
          </button>
        </div>
      </div>
    </header>
  );
}
