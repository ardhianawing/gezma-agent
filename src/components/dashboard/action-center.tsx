'use client';

import Link from 'next/link';
import { AlertCircle, FileX, ClipboardX, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

interface Alert {
  id: string;
  type: 'missing_docs' | 'incomplete_manifest' | 'license_expiring' | 'payment_pending';
  priority: 'critical' | 'high' | 'medium';
  titleKey: string;
  descriptionKey: string;
  count?: number;
  href: string;
}

const mockAlerts: Alert[] = [
  {
    id: 'alert_001',
    type: 'missing_docs',
    priority: 'critical',
    titleKey: 'missingDocuments',
    descriptionKey: 'pilgrimsIncomplete',
    count: 8,
    href: '/pilgrims?filter=missing_docs',
  },
  {
    id: 'alert_002',
    type: 'incomplete_manifest',
    priority: 'high',
    titleKey: 'incompleteManifest',
    descriptionKey: 'needsConfirmation',
    href: '/trips/trip_001',
  },
  {
    id: 'alert_003',
    type: 'license_expiring',
    priority: 'medium',
    titleKey: 'licenseExpiring',
    descriptionKey: 'licenseExpiresIn',
    href: '/agency',
  },
];

const iconMap = {
  missing_docs: FileX,
  incomplete_manifest: ClipboardX,
  license_expiring: AlertTriangle,
  payment_pending: AlertCircle,
};

export function ActionCenter() {
  const { t } = useLanguage();
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const priorityColors = {
    critical: c.error,
    high: c.warning,
    medium: c.info,
  };

  const priorityBgColors = {
    critical: c.errorLight,
    high: c.warningLight,
    medium: c.infoLight,
  };

  const getAlertTitle = (alert: Alert) => {
    const titles: Record<string, string> = {
      missingDocuments: t.dashboard.missingDocuments,
      incompleteManifest: t.dashboard.incompleteManifest,
      licenseExpiring: t.dashboard.licenseExpiring,
    };
    return titles[alert.titleKey] || alert.titleKey;
  };

  const getAlertDescription = (alert: Alert) => {
    if (alert.type === 'missing_docs') {
      return `${alert.count} ${t.dashboard.pilgrimsIncomplete}`;
    }
    if (alert.type === 'incomplete_manifest') {
      return `Umrah Reguler - Maret 2026 ${t.dashboard.needsConfirmation}`;
    }
    if (alert.type === 'license_expiring') {
      return `${t.dashboard.licenseExpiresIn} 45 ${t.dashboard.days}`;
    }
    return '';
  };

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
      <div
        style={{
          padding: isMobile ? '16px' : '24px',
          borderBottom: `1px solid ${c.borderLight}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
            {t.dashboard.actionCenter}
          </h2>
          <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px', marginBottom: 0, display: isMobile ? 'none' : 'block' }}>
            {t.dashboard.actionCenterDesc}
          </p>
        </div>
        <span
          style={{
            backgroundColor: c.errorLight,
            color: c.error,
            fontSize: '14px',
            fontWeight: '600',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {mockAlerts.length}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {mockAlerts.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '14px', color: c.textMuted, padding: '24px 0' }}>
            All caught up! No actions required.
          </p>
        ) : (
          mockAlerts.map((alert) => {
            const Icon = iconMap[alert.type];
            return (
              <Link key={alert.id} href={alert.href} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '12px' : '16px',
                    padding: isMobile ? '12px' : '16px',
                    backgroundColor: c.cardBg,
                    borderRadius: '8px',
                    border: `1px solid ${c.border}`,
                    borderLeft: `4px solid ${priorityColors[alert.priority]}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: isMobile ? '36px' : '40px',
                      height: isMobile ? '36px' : '40px',
                      borderRadius: '8px',
                      backgroundColor: priorityBgColors[alert.priority],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: isMobile ? '18px' : '20px', height: isMobile ? '18px' : '20px', color: priorityColors[alert.priority] }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: c.textPrimary,
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {getAlertTitle(alert)}
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: c.textMuted,
                      margin: '2px 0 0 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {getAlertDescription(alert)}
                    </p>
                  </div>

                  {/* Badge */}
                  {alert.count && (
                    <span
                      style={{
                        backgroundColor: priorityBgColors[alert.priority],
                        color: priorityColors[alert.priority],
                        fontSize: '12px',
                        fontWeight: '500',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        flexShrink: 0,
                      }}
                    >
                      {alert.count}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
