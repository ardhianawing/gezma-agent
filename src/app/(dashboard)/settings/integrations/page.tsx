'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { PageHeader } from '@/components/layout/page-header';
import { BackButton } from '@/components/shared/back-button';
import {
import { useLanguage } from '@/lib/i18n';
  ChevronRight,
  Wifi,
  WifiOff,
  Clock,
} from 'lucide-react';

interface IntegrationCard {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  statusLabel: string;
  href: string | null;
  comingSoon: boolean;
}

interface NusukConfigData {
  isEnabled: boolean;
  lastSyncAt: string | null;
}

export default function IntegrationsPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();
  const [nusukConfig, setNusukConfig] = useState<NusukConfigData | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/integrations/nusuk')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setNusukConfig(json.data);
      })
      .catch(() => {});
  }, []);

  const integrations: IntegrationCard[] = [
    {
      id: 'nusuk',
      name: 'Nusuk API',
      icon: '\u{1f54b}',
      description: 'Integrasi resmi dengan platform Nusuk Saudi Arabia untuk manajemen hotel, visa, dan inventori umrah/haji.',
      status: nusukConfig?.isEnabled ? 'active' : 'inactive',
      statusLabel: nusukConfig?.isEnabled ? 'Aktif' : 'Nonaktif',
      href: '/settings/integrations/nusuk',
      comingSoon: false,
    },
    {
      id: 'payment',
      name: 'Payment Gateway',
      icon: '\u{1f4b3}',
      description: 'Terima pembayaran online via transfer bank, kartu kredit, dan e-wallet untuk kemudahan jemaah.',
      status: 'inactive',
      statusLabel: 'Nonaktif',
      href: null,
      comingSoon: true,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      icon: '\u{1f4ac}',
      description: 'Kirim notifikasi otomatis, pengingat pembayaran, dan update status via WhatsApp ke jemaah.',
      status: 'inactive',
      statusLabel: 'Nonaktif',
      href: null,
      comingSoon: true,
    },
    {
      id: 'umrahcash',
      name: 'UmrahCash',
      icon: '\u{1f4b0}',
      description: 'Pembayaran lintas negara IDR ke SAR dengan kurs kompetitif dan transfer cepat ke bank Saudi.',
      status: 'pending',
      statusLabel: 'Menunggu',
      href: '/settings/integrations/umrahcash',
      comingSoon: false,
    },
  ];

  const getStatusColor = (status: IntegrationCard['status']) => {
    switch (status) {
      case 'active':
        return { bg: c.successLight, text: c.success, dot: c.success };
      case 'inactive':
        return { bg: c.cardBgHover, text: c.textMuted, dot: c.textLight };
      case 'pending':
        return { bg: c.warningLight, text: c.warning, dot: c.warning };
    }
  };

  const gridColumns = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <BackButton href="/settings" />
        <PageHeader
          title={t.settings.integrations}
          description={t.settings.generalDesc}
        />
      </div>

      {/* Summary Bar */}
      <div
        style={{
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.border,
          borderRadius: '16px',
          padding: isMobile ? '16px' : '20px',
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '16px',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wifi style={{ width: '18px', height: '18px', color: c.success }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary }}>
            {integrations.filter((i) => i.status === 'active').length} Aktif
          </span>
        </div>
        <div
          style={{
            width: isMobile ? '100%' : '1px',
            height: isMobile ? '1px' : '24px',
            backgroundColor: c.border,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WifiOff style={{ width: '18px', height: '18px', color: c.textLight }} />
          <span style={{ fontSize: '14px', color: c.textMuted }}>
            {integrations.filter((i) => i.status === 'inactive').length} Nonaktif
          </span>
        </div>
        <div
          style={{
            width: isMobile ? '100%' : '1px',
            height: isMobile ? '1px' : '24px',
            backgroundColor: c.border,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock style={{ width: '18px', height: '18px', color: c.warning }} />
          <span style={{ fontSize: '14px', color: c.textMuted }}>
            {integrations.filter((i) => i.status === 'pending').length} Menunggu
          </span>
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: isMobile ? '12px' : '16px',
        }}
      >
        {integrations.map((integration) => {
          const statusColor = getStatusColor(integration.status);
          const isHovered = hoveredCard === integration.id;

          const cardContent = (
            <div
              onMouseEnter={() => setHoveredCard(integration.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundColor: c.cardBg,
                border: integration.status === 'active'
                  ? '1px solid ' + c.success
                  : '1px solid ' + c.border,
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                cursor: integration.href ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                transform: isHovered && integration.href ? 'translateY(-2px)' : 'none',
                boxShadow: isHovered && integration.href
                  ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                  : 'none',
              }}
            >
              {/* Header: Icon + Status */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: integration.status === 'active' ? c.successLight : c.cardBgHover,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}
                >
                  {integration.icon}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: statusColor.bg,
                    fontSize: '12px',
                    fontWeight: '600',
                    color: statusColor.text,
                  }}
                >
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: statusColor.dot,
                    }}
                  />
                  {integration.statusLabel}
                </div>
              </div>

              {/* Name + Description */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: '0 0 6px 0' }}>
                  {integration.name}
                </h3>
                <p style={{ fontSize: '13px', color: c.textMuted, margin: 0, lineHeight: '1.5' }}>
                  {integration.description}
                </p>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                {integration.comingSoon && !integration.href ? (
                  <span
                    style={{
                      fontSize: '12px',
                      color: c.textLight,
                      backgroundColor: c.cardBgHover,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontWeight: '500',
                    }}
                  >
                    Coming Soon
                  </span>
                ) : (
                  <span style={{ fontSize: '13px', fontWeight: '500', color: c.primary }}>
                    Konfigurasi
                  </span>
                )}
                {integration.href && (
                  <ChevronRight style={{ width: '18px', height: '18px', color: c.textLight }} />
                )}
              </div>
            </div>
          );

          if (integration.href) {
            return (
              <Link
                key={integration.id}
                href={integration.href}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                {cardContent}
              </Link>
            );
          }

          return <div key={integration.id}>{cardContent}</div>;
        })}
      </div>
    </div>
  );
}
