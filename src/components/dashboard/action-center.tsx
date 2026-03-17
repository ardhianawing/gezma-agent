'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, FileX, ClipboardX, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

interface Alert {
  id: string;
  type: 'missing_docs' | 'incomplete_manifest' | 'license_expiring' | 'payment_pending';
  priority: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  count?: number;
  href: string;
}

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
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch('/api/dashboard/alerts');
        if (res.ok) {
          const json = await res.json();
          setAlerts(json.data || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

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

  return (
    <div
      data-tour="action-center"
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
        {!loading && alerts.length > 0 && (
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
            {alerts.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', fontSize: '14px', color: c.textMuted, padding: '24px 0' }}>
            Loading...
          </p>
        ) : alerts.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '14px', color: c.textMuted, padding: '24px 0' }}>
            Semua sudah beres! Tidak ada aksi yang diperlukan.
          </p>
        ) : (
          alerts.map((alert) => {
            const Icon = iconMap[alert.type] || AlertCircle;
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
                    minHeight: '44px',
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
                      {alert.title}
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: c.textMuted,
                      margin: '2px 0 0 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {alert.description}
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
