'use client';

import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useLanguage } from '@/lib/i18n';
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Users,
  ChevronRight,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme, c } = useTheme();
  const { t } = useLanguage();

  const settingsSections = [
    {
      icon: Settings,
      title: t.settings.general,
      description: t.settings.generalDesc,
      color: c.textMuted,
      bgColor: c.cardBgHover,
    },
    {
      icon: Bell,
      title: t.settings.notifications,
      description: t.settings.notificationsDesc,
      color: c.info,
      bgColor: c.infoLight,
    },
    {
      icon: Shield,
      title: t.settings.security,
      description: t.settings.securityDesc,
      color: c.success,
      bgColor: c.successLight,
    },
    {
      icon: CreditCard,
      title: t.settings.billing,
      description: t.settings.billingDesc,
      color: c.warning,
      bgColor: c.warningLight,
    },
    {
      icon: Users,
      title: t.settings.team,
      description: t.settings.teamDesc,
      color: c.primary,
      bgColor: c.primaryLight,
    },
    {
      icon: Globe,
      title: t.settings.languageRegion,
      description: t.settings.languageRegionDesc,
      color: '#7C3AED',
      bgColor: '#F5F3FF',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title={t.settings.title}
        description={t.settings.description}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
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
              return (
                <button
                  key={section.title}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: index < settingsSections.length - 1 ? `1px solid ${c.borderLight}` : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: section.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: '24px', height: '24px', color: section.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                      {section.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0 0' }}>
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight style={{ width: '20px', height: '20px', color: c.textLight }} />
                </button>
              );
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
            <div style={{ padding: '20px', borderBottom: `1px solid ${c.borderLight}` }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette style={{ width: '16px', height: '16px', color: c.textMuted }} />
                {t.settings.appearance}
              </h3>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

          {/* Notification Preferences */}
          <div
            style={{
              backgroundColor: c.cardBg,
              borderRadius: '12px',
              border: `1px solid ${c.border}`,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ padding: '20px', borderBottom: `1px solid ${c.borderLight}` }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell style={{ width: '16px', height: '16px', color: c.textMuted }} />
                {t.settings.quickNotifications}
              </h3>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Email Alerts */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mail style={{ width: '20px', height: '20px', color: c.textMuted }} />
                  <span style={{ fontSize: '14px', color: c.textPrimary }}>{t.settings.emailAlerts}</span>
                </div>
                <div
                  style={{
                    width: '44px',
                    height: '24px',
                    backgroundColor: c.primary,
                    borderRadius: '12px',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: '2px',
                      top: '2px',
                      width: '20px',
                      height: '20px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>
              </div>

              {/* Push Notifications */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Smartphone style={{ width: '20px', height: '20px', color: c.textMuted }} />
                  <span style={{ fontSize: '14px', color: c.textPrimary }}>{t.settings.pushNotifications}</span>
                </div>
                <div
                  style={{
                    width: '44px',
                    height: '24px',
                    backgroundColor: c.border,
                    borderRadius: '12px',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: '2px',
                      top: '2px',
                      width: '20px',
                      height: '20px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      border: `1px solid ${c.border}`,
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div
            style={{
              background: 'linear-gradient(to bottom right, #111827, #374151)',
              borderRadius: '12px',
              padding: '20px',
              color: 'white',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: '700' }}>BT</span>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Barokah Travel</p>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', margin: '4px 0 0 0' }}>Professional Plan</p>
              </div>
            </div>
            <div style={{ fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{t.settings.storageUsed}</span>
                <span style={{ fontWeight: '500' }}>2.4 GB / 10 GB</span>
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
                    width: '24%',
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
