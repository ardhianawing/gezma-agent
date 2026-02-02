'use client';

import Link from 'next/link';
import { UserPlus, Package, Plane, FileText, Building2, Settings } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

export function QuickActions() {
  const { t } = useLanguage();
  const { c } = useTheme();

  const actions = [
    {
      title: t.quickActions.addPilgrim,
      description: t.pilgrims.registerNew,
      icon: UserPlus,
      href: '/pilgrims/new',
      color: c.primary,
      bgColor: c.primaryLight,
    },
    {
      title: t.quickActions.createPackage,
      description: t.packages.buildNew,
      icon: Package,
      href: '/packages/new',
      color: c.info,
      bgColor: c.infoLight,
    },
    {
      title: t.quickActions.newTrip,
      description: t.trips.scheduleNew,
      icon: Plane,
      href: '/trips/new',
      color: c.success,
      bgColor: c.successLight,
    },
    {
      title: t.quickActions.documents,
      description: t.documents.manageAgencyDocs,
      icon: FileText,
      href: '/documents',
      color: c.warning,
      bgColor: c.warningLight,
    },
    {
      title: t.quickActions.agencyProfile,
      description: t.agency.updateCompanyInfo,
      icon: Building2,
      href: '/agency',
      color: '#7C3AED',
      bgColor: '#F5F3FF',
    },
    {
      title: t.quickActions.settings,
      description: t.settings.configureSystem,
      icon: Settings,
      href: '/settings',
      color: c.textMuted,
      bgColor: c.cardBgHover,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: c.cardBg,
        borderRadius: '12px',
        border: `1px solid ${c.border}`,
        overflow: 'hidden',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: `1px solid ${c.borderLight}` }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
          {t.dashboard.quickActions}
        </h2>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          {actions.map((action) => (
            <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: c.cardBgHover,
                  borderRadius: '8px',
                  border: `1px solid ${c.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: action.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <action.icon style={{ width: '20px', height: '20px', color: action.color }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary, margin: 0 }}>
                    {action.title}
                  </p>
                  <p style={{ fontSize: '13px', color: c.textMuted, margin: '2px 0 0 0' }}>
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
