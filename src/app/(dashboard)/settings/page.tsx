'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useLanguage } from '@/lib/i18n';
import { useResponsive } from '@/lib/hooks/use-responsive';
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Users,
  Plug,
  ChevronRight,
  Moon,
  Sun,
  Check,
  Lock,
  Eye,
  EyeOff,
  CalendarClock,
  FileText,
  Loader2,
} from 'lucide-react';

interface AgencyInfo {
  name: string;
}

export default function SettingsPage() {
  const { theme, setTheme, c } = useTheme();
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  const [agency, setAgency] = useState<AgencyInfo | null>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async () => {
    setPwMessage(null);
    if (!currentPassword || !newPassword) {
      setPwMessage({ type: 'error', text: 'Semua field harus diisi' });
      return;
    }
    if (newPassword.length < 6) {
      setPwMessage({ type: 'error', text: 'Password baru minimal 6 karakter' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMessage({ type: 'error', text: data.error || 'Gagal mengubah password' });
      } else {
        setPwMessage({ type: 'success', text: 'Password berhasil diubah' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPwMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setPwLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/agency')
      .then((res) => res.json())
      .then((data) => setAgency(data))
      .catch(() => {});
  }, []);

  const settingsSections = [
    {
      icon: Settings,
      title: t.settings.general,
      description: t.settings.generalDesc,
      color: c.textMuted,
      bgColor: c.cardBgHover,
      href: null as string | null,
    },
    {
      icon: Bell,
      title: t.settings.notifications,
      description: t.settings.notificationsDesc,
      color: c.info,
      bgColor: c.infoLight,
      href: '/settings/notifications',
    },
    {
      icon: Shield,
      title: t.settings.security,
      description: t.settings.securityDesc,
      color: c.success,
      bgColor: c.successLight,
      href: '/settings/security',
    },
    {
      icon: CreditCard,
      title: t.settings.billing,
      description: t.settings.billingDesc,
      color: c.warning,
      bgColor: c.warningLight,
      href: null,
    },
    {
      icon: Users,
      title: t.settings.team,
      description: t.settings.teamDesc,
      color: c.primary,
      bgColor: c.primaryLight,
      href: '/settings/users',
    },
    {
      icon: Plug,
      title: 'Integrasi',
      description: 'Nusuk API, Payment Gateway, WhatsApp',
      color: '#059669',
      bgColor: '#ECFDF5',
      href: '/settings/integrations',
    },
    {
      icon: CalendarClock,
      title: 'Laporan Terjadwal',
      description: 'Kirim laporan otomatis ke email secara berkala',
      color: '#0EA5E9',
      bgColor: '#E0F2FE',
      href: '/settings/scheduled-reports',
    },
    {
      icon: FileText,
      title: 'Template Email',
      description: 'Kelola template email notifikasi',
      color: '#D946EF',
      bgColor: '#FAE8FF',
      href: '/settings/email-templates',
    },
    {
      icon: Globe,
      title: t.settings.languageRegion,
      description: t.settings.languageRegionDesc,
      color: '#7C3AED',
      bgColor: '#F5F3FF',
      href: null,
    },
  ];

  // Responsive grid columns - use auto-fit for better tablet support
  const mainGridColumns = isMobile || isTablet ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))';

  const agencyInitials = agency?.name
    ? agency.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '..';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <PageHeader
        title={t.settings.title}
        description={t.settings.description}
      />

      <div style={{ display: 'grid', gridTemplateColumns: mainGridColumns, gap: isMobile ? '16px' : '24px' }}>
        {/* Left Column - Settings Menu */}
        <div>
          <div
            style={{
              backgroundColor: c.cardBg,
              borderRadius: '12px',
              border: `1px solid ${c.border}`,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}
          >
            {settingsSections.map((section, index) => {
              const Icon = section.icon;
              const content = (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: isMobile ? '16px' : '20px',
                    backgroundColor: 'transparent',
                    borderBottom: index < settingsSections.length - 1 ? `1px solid ${c.borderLight}` : 'none',
                    cursor: section.href ? 'pointer' : 'default',
                    textAlign: 'left' as const,
                    opacity: section.href ? 1 : 0.6,
                  }}
                >
                  <div
                    style={{
                      width: isMobile ? '40px' : '48px',
                      height: isMobile ? '40px' : '48px',
                      borderRadius: '12px',
                      backgroundColor: section.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px', color: section.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                      {section.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0 0', display: isMobile ? 'none' : 'block' }}>
                      {section.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {!section.href && (
                      <span style={{ fontSize: '11px', color: c.textLight, backgroundColor: c.cardBgHover, padding: '2px 8px', borderRadius: '6px' }}>
                        Soon
                      </span>
                    )}
                    <ChevronRight style={{ width: '20px', height: '20px', color: c.textLight }} />
                  </div>
                </div>
              );

              if (section.href) {
                return (
                  <Link key={section.title} href={section.href} style={{ textDecoration: 'none', display: 'block' }}>
                    {content}
                  </Link>
                );
              }

              return <div key={section.title}>{content}</div>;
            })}
          </div>
        </div>

        {/* Right Column - Quick Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Theme Toggle */}
          <div
            style={{
              backgroundColor: c.cardBg,
              borderRadius: '12px',
              border: `1px solid ${c.border}`,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ padding: isMobile ? '16px' : '20px', borderBottom: `1px solid ${c.borderLight}` }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette style={{ width: '16px', height: '16px', color: c.textMuted }} />
                {t.settings.appearance}
              </h3>
            </div>
            <div style={{ padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Light Mode */}
              <button
                onClick={() => setTheme('light')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '8px',
                  border: theme === 'light' ? `2px solid ${c.primary}` : `1px solid ${c.border}`,
                  backgroundColor: theme === 'light' ? c.primaryLight : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Sun style={{ width: '20px', height: '20px', color: '#F59E0B' }} />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>{t.settings.lightMode}</span>
                </div>
                {theme === 'light' && (
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: c.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check style={{ width: '12px', height: '12px', color: 'white' }} />
                  </div>
                )}
              </button>

              {/* Dark Mode */}
              <button
                onClick={() => setTheme('dark')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '8px',
                  border: theme === 'dark' ? `2px solid ${c.primary}` : `1px solid ${c.border}`,
                  backgroundColor: theme === 'dark' ? c.primaryLight : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Moon style={{ width: '20px', height: '20px', color: c.textMuted }} />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>{t.settings.darkMode}</span>
                </div>
                {theme === 'dark' && (
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: c.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check style={{ width: '12px', height: '12px', color: 'white' }} />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Security - Password Change */}
          <div
            style={{
              backgroundColor: c.cardBg,
              borderRadius: '12px',
              border: `1px solid ${c.border}`,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: isMobile ? '16px' : '20px', borderBottom: `1px solid ${c.borderLight}` }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock style={{ width: '16px', height: '16px', color: c.textMuted }} />
                Ubah Password
              </h3>
            </div>
            <div style={{ padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Current Password */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: c.textSecondary, marginBottom: '4px', display: 'block' }}>
                  Password Saat Ini
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 40px 0 12px',
                      fontSize: '14px',
                      border: `1px solid ${c.border}`,
                      borderRadius: '8px',
                      backgroundColor: c.inputBg,
                      color: c.textPrimary,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    {showCurrentPw ? <EyeOff style={{ width: '16px', height: '16px', color: c.textMuted }} /> : <Eye style={{ width: '16px', height: '16px', color: c.textMuted }} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: c.textSecondary, marginBottom: '4px', display: 'block' }}>
                  Password Baru
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 40px 0 12px',
                      fontSize: '14px',
                      border: `1px solid ${c.border}`,
                      borderRadius: '8px',
                      backgroundColor: c.inputBg,
                      color: c.textPrimary,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    {showNewPw ? <EyeOff style={{ width: '16px', height: '16px', color: c.textMuted }} /> : <Eye style={{ width: '16px', height: '16px', color: c.textMuted }} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: c.textSecondary, marginBottom: '4px', display: 'block' }}>
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    fontSize: '14px',
                    border: `1px solid ${c.border}`,
                    borderRadius: '8px',
                    backgroundColor: c.inputBg,
                    color: c.textPrimary,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Message */}
              {pwMessage && (
                <p style={{
                  fontSize: '13px',
                  color: pwMessage.type === 'success' ? c.success : c.error,
                  margin: 0,
                }}>
                  {pwMessage.text}
                </p>
              )}

              {/* Submit */}
              <button
                onClick={handlePasswordChange}
                disabled={pwLoading}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: c.primary,
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: pwLoading ? 'not-allowed' : 'pointer',
                  opacity: pwLoading ? 0.7 : 1,
                }}
              >
                {pwLoading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Menyimpan...
                  </span>
                ) : 'Ubah Password'}
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div
            style={{
              background: 'linear-gradient(to bottom right, #111827, #374151)',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '20px',
              color: 'white',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div
                style={{
                  width: isMobile ? '40px' : '48px',
                  height: isMobile ? '40px' : '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: '700' }}>{agencyInitials}</span>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{agency?.name || '...'}</p>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', margin: '4px 0 0 0' }}>Professional Plan</p>
              </div>
            </div>
            <div style={{ fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{t.settings.storageUsed}</span>
                <span style={{ fontWeight: '500' }}>— / 10 GB</span>
              </div>
              <div
                style={{
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '0%',
                    height: '100%',
                    background: `linear-gradient(to right, ${c.primary}, #F87171)`,
                    borderRadius: '9999px',
                  }}
                />
              </div>
            </div>
            <button
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'transparent',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {t.settings.upgradePlan}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
