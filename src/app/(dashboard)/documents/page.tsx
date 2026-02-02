'use client';

import { PageHeader } from '@/components/layout/page-header';
import { FileText, Upload, Download, Eye, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { DEFAULT_AGENCY } from '@/data/mock-agencies';
import { formatDate } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { useLanguage } from '@/lib/i18n';
import { useResponsive } from '@/lib/hooks/use-responsive';

export default function DocumentsPage() {
  const { c } = useTheme();
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();

  const statusConfig = {
    valid: {
      color: c.success,
      bgColor: c.successLight,
      borderColor: `rgba(22, 163, 74, 0.2)`,
      label: t.documents.valid,
      Icon: CheckCircle2,
    },
    expiring: {
      color: c.warning,
      bgColor: c.warningLight,
      borderColor: `rgba(217, 119, 6, 0.2)`,
      label: t.documents.expiringSoon,
      Icon: Clock,
    },
    expired: {
      color: c.error,
      bgColor: c.errorLight,
      borderColor: `rgba(220, 38, 38, 0.2)`,
      label: t.documents.expired,
      Icon: AlertCircle,
    },
  };

  const validCount = DEFAULT_AGENCY.documents.filter(d => d.status === 'valid').length;
  const expiringCount = DEFAULT_AGENCY.documents.filter(d => d.status === 'expiring').length;
  const expiredCount = DEFAULT_AGENCY.documents.filter(d => d.status === 'expired').length;

  // Responsive grid columns
  const statsGridColumns = isMobile ? '1fr' : 'repeat(3, 1fr)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <PageHeader
        title={t.documents.title}
        description={t.documents.description}
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
            <Upload style={{ width: '20px', height: '20px' }} />
            <span>{t.documents.uploadDocument}</span>
          </button>
        }
      />

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: statsGridColumns, gap: '16px' }}>
        {/* Valid Documents */}
        <div
          style={{
            backgroundColor: c.cardBg,
            background: `linear-gradient(to bottom right, ${c.successLight}, ${c.cardBg})`,
            borderRadius: '12px',
            border: `1px solid rgba(22, 163, 74, 0.2)`,
            padding: isMobile ? '16px' : '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircle2 style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px', color: c.success }} />
            </div>
            <div>
              <p style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: c.success, margin: 0 }}>
                {validCount}
              </p>
              <p style={{ fontSize: '14px', color: c.textSecondary, margin: 0 }}>{t.documents.validDocuments}</p>
            </div>
          </div>
        </div>

        {/* Expiring Soon */}
        <div
          style={{
            backgroundColor: c.cardBg,
            background: `linear-gradient(to bottom right, ${c.warningLight}, ${c.cardBg})`,
            borderRadius: '12px',
            border: `1px solid rgba(217, 119, 6, 0.2)`,
            padding: isMobile ? '16px' : '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Clock style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px', color: c.warning }} />
            </div>
            <div>
              <p style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: c.warning, margin: 0 }}>
                {expiringCount}
              </p>
              <p style={{ fontSize: '14px', color: c.textSecondary, margin: 0 }}>{t.documents.expiringSoon}</p>
            </div>
          </div>
        </div>

        {/* Expired */}
        <div
          style={{
            backgroundColor: c.cardBg,
            background: `linear-gradient(to bottom right, ${c.errorLight}, ${c.cardBg})`,
            borderRadius: '12px',
            border: `1px solid rgba(220, 38, 38, 0.2)`,
            padding: isMobile ? '16px' : '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertCircle style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px', color: c.error }} />
            </div>
            <div>
              <p style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: c.error, margin: 0 }}>
                {expiredCount}
              </p>
              <p style={{ fontSize: '14px', color: c.textSecondary, margin: 0 }}>{t.documents.expired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: isMobile ? '16px' : '20px', borderBottom: `1px solid ${c.borderLight}` }}>
          <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
            {t.documents.allDocuments}
          </h3>
          <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px', marginBottom: 0 }}>
            {t.documents.manageDocuments}
          </p>
        </div>

        {/* Document Items */}
        <div>
          {DEFAULT_AGENCY.documents.map((doc, index) => {
            const config = statusConfig[doc.status as keyof typeof statusConfig];
            return (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '16px',
                  padding: isMobile ? '16px' : '20px',
                  borderBottom: index < DEFAULT_AGENCY.documents.length - 1 ? `1px solid ${c.borderLight}` : 'none',
                  transition: 'background-color 0.2s',
                }}
              >
                {/* Icon + Content */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1, width: '100%' }}>
                  {/* Icon */}
                  <div
                    style={{
                      width: isMobile ? '48px' : '56px',
                      height: isMobile ? '48px' : '56px',
                      borderRadius: '12px',
                      backgroundColor: config.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText style={{ width: isMobile ? '24px' : '28px', height: isMobile ? '24px' : '28px', color: config.color }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                        {doc.name}
                      </h4>
                      <span
                        style={{
                          backgroundColor: config.bgColor,
                          color: config.color,
                          fontSize: '12px',
                          fontWeight: '500',
                          padding: '4px 10px',
                          borderRadius: '12px',
                        }}
                      >
                        {config.label}
                      </span>
                    </div>
                    {doc.number && (
                      <p
                        style={{
                          fontSize: '14px',
                          fontFamily: 'monospace',
                          color: c.textMuted,
                          marginBottom: '8px',
                        }}
                      >
                        {doc.number}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: c.textMuted, flexWrap: 'wrap' }}>
                      {doc.issueDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar style={{ width: '14px', height: '14px' }} />
                          {t.documents.issued}: {formatDate(doc.issueDate)}
                        </span>
                      )}
                      {doc.expiryDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock style={{ width: '14px', height: '14px' }} />
                          {t.documents.expires}: {formatDate(doc.expiryDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: isMobile ? 'flex-end' : 'center' }}>
                  <button
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Eye style={{ width: '16px', height: '16px', color: c.textMuted }} />
                  </button>
                  <button
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Download style={{ width: '16px', height: '16px', color: c.textMuted }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
