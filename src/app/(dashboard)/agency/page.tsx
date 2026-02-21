'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { formatDate } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { useLanguage } from '@/lib/i18n';
import { useResponsive } from '@/lib/hooks/use-responsive';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  QrCode,
  CheckCircle2,
  Edit2,
  Copy
} from 'lucide-react';

interface AgencyData {
  id: string;
  name: string;
  legalName: string;
  tagline: string | null;
  description: string | null;
  ppiuNumber: string | null;
  ppiuIssueDate: string | null;
  ppiuExpiryDate: string | null;
  ppiuStatus: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  verificationCode: string;
  isVerified: boolean;
}

export default function AgencyPage() {
  const { c } = useTheme();
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  const [agency, setAgency] = useState<AgencyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agency')
      .then((res) => res.json())
      .then((data) => setAgency(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Memuat data agency...</div>;
  }

  if (!agency) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Agency tidak ditemukan</div>;
  }

  // Responsive grid columns - use auto-fill for better tablet support
  const mainGridColumns = isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <PageHeader
        title={t.agency.title}
        description={t.agency.description}
        actions={
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: c.primary,
              color: 'white',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <Edit2 style={{ width: '20px', height: '20px' }} />
            <span>{t.agency.editProfile}</span>
          </button>
        }
      />

      {/* Agency Header Card */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Dark Header */}
        <div
          style={{
            background: 'linear-gradient(to right, #111827, #374151)',
            padding: isMobile ? '20px' : '24px',
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '16px' : '24px', flexDirection: isMobile ? 'column' : 'row' }}>
            <div
              style={{
                width: isMobile ? '64px' : '80px',
                height: isMobile ? '64px' : '80px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Building2 style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', margin: 0, color: 'white' }}>
                  {agency.name}
                </h2>
                {agency.isVerified && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#16A34A',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '500',
                      padding: '4px 10px',
                      borderRadius: '12px',
                    }}
                  >
                    <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                    {t.agency.verified}
                  </span>
                )}
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>{agency.legalName}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail style={{ width: '16px', height: '16px' }} />
                  {agency.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone style={{ width: '16px', height: '16px' }} />
                  {agency.phone}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Address Bar */}
        <div
          style={{
            padding: isMobile ? '16px 20px' : '20px 24px',
            backgroundColor: c.cardBgHover,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: c.textSecondary,
          }}
        >
          <MapPin style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          <span style={{ wordBreak: 'break-word' }}>{agency.address}, {agency.city}, {agency.province}</span>
        </div>
      </div>

      {/* 3-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: mainGridColumns, gap: isMobile ? '16px' : '24px' }}>
        {/* PPIU License */}
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
              <Shield style={{ width: '16px', height: '16px', color: c.success }} />
              {t.agency.ppiuLicense}
            </h3>
          </div>
          <div style={{ padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* License Badge */}
            <div
              style={{
                padding: '16px',
                background: `linear-gradient(to bottom right, ${c.successLight}, ${c.cardBg})`,
                borderRadius: '12px',
                border: `1px solid rgba(22, 163, 74, 0.2)`,
              }}
            >
              <span
                style={{
                  backgroundColor: c.successLight,
                  color: c.success,
                  fontSize: '12px',
                  fontWeight: '500',
                  padding: '4px 10px',
                  borderRadius: '12px',
                }}
              >
                {agency.ppiuStatus}
              </span>
              <p style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: '700', color: c.textPrimary, marginTop: '12px', marginBottom: 0, wordBreak: 'break-all' }}>
                {agency.ppiuNumber}
              </p>
            </div>

            {/* Dates */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${c.borderLight}`, flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: c.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  {t.agency.issued}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>
                  {agency.ppiuIssueDate ? formatDate(agency.ppiuIssueDate) : '-'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: c.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  {t.agency.expires}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>
                  {agency.ppiuExpiryDate ? formatDate(agency.ppiuExpiryDate) : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification QR */}
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
              <QrCode style={{ width: '16px', height: '16px', color: c.textMuted }} />
              {t.agency.verification}
            </h3>
          </div>
          <div style={{ padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* QR Code */}
            <div
              style={{
                padding: isMobile ? '20px' : '24px',
                backgroundColor: c.cardBg,
                borderRadius: '12px',
                border: `2px dashed ${c.border}`,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: isMobile ? '96px' : '112px',
                    height: isMobile ? '96px' : '112px',
                    backgroundColor: '#111827',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  <QrCode style={{ width: isMobile ? '64px' : '80px', height: isMobile ? '64px' : '80px', color: 'white' }} />
                </div>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>{t.agency.scanToVerify}</p>
              </div>
            </div>

            {/* Verification Code */}
            <div
              style={{
                padding: '12px',
                backgroundColor: c.cardBgHover,
                borderRadius: '8px',
              }}
            >
              <p style={{ fontSize: '12px', color: c.textMuted, marginBottom: '4px' }}>{t.agency.verificationCode}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <code style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: '700', color: c.textPrimary }}>
                  {agency.verificationCode}
                </code>
                <button
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Copy style={{ width: '16px', height: '16px', color: c.textMuted }} />
                </button>
              </div>
            </div>

            {/* Verified Badge */}
            {agency.isVerified && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: c.successLight,
                  borderRadius: '8px',
                  color: c.success,
                }}
              >
                <CheckCircle2 style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{t.agency.agencyVerified}</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
