'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

interface ServiceCategory {
  emoji: string;
  title: string;
  description: string;
  features: string[];
  color: string;
  cta: string;
}

interface DownloadFile {
  name: string;
  format: 'PDF' | 'XLSX' | 'DOCX';
  size: string;
}

interface ContactCard {
  emoji: string;
  title: string;
  detail: string;
  action: string;
}

const serviceCategories: ServiceCategory[] = [
  {
    emoji: '\u2696\uFE0F',
    title: 'Konsultasi Legal',
    description: 'Pendampingan izin PPIU, review kontrak, dan compliance regulasi',
    features: [
      'Konsultasi izin PPIU',
      'Review kontrak vendor',
      'Pendampingan audit Kemenag',
      'Update regulasi berkala',
    ],
    color: '#2563EB',
    cta: 'Hubungi Legal',
  },
  {
    emoji: '\uD83D\uDCC4',
    title: 'Partner Visa Resmi',
    description: 'Muassasah terverifikasi Saudi untuk proses visa cepat dan aman',
    features: [
      'Muassasah terverifikasi',
      'Proses visa 3-5 hari',
      'Tracking status real-time',
      'Support visa bermasalah',
    ],
    color: '#059669',
    cta: 'Lihat Partner',
  },
  {
    emoji: '\uD83D\uDCE5',
    title: 'Download Dokumen',
    description: 'Template, formulir, dan SOP siap pakai untuk operasional',
    features: [
      'Template kontrak jemaah',
      'Form manifest keberangkatan',
      'SOP operasional umrah',
      'Checklist dokumen jemaah',
    ],
    color: '#7C3AED',
    cta: 'Lihat Dokumen',
  },
  {
    emoji: '\uD83C\uDFA7',
    title: 'Support & Bantuan',
    description: 'Tim support siap membantu kebutuhan operasional Anda',
    features: [
      'Live chat 24/7',
      'Ticket support system',
      'Knowledge base lengkap',
      'Video tutorial',
    ],
    color: '#D97706',
    cta: 'Hubungi Support',
  },
  {
    emoji: '\uD83D\uDEE1\uFE0F',
    title: 'Partner Asuransi',
    description: 'Asuransi perjalanan umrah dengan coverage komprehensif',
    features: [
      'Asuransi perjalanan umrah',
      'Klaim cepat & mudah',
      'Coverage komprehensif',
      'Harga khusus member',
    ],
    color: '#DC2626',
    cta: 'Lihat Partner',
  },
  {
    emoji: '\uD83D\uDC65',
    title: 'Komunitas & Networking',
    description: 'Jaringan sesama travel agent untuk kolaborasi dan sharing',
    features: [
      'Gathering bulanan',
      'Webinar eksklusif',
      'Grup WhatsApp PPIU',
      'Direktori travel agent',
    ],
    color: '#0891B2',
    cta: 'Gabung Sekarang',
  },
];

const downloadFiles: DownloadFile[] = [
  { name: 'Template Kontrak Jemaah', format: 'PDF', size: '245 KB' },
  { name: 'Form Manifest Keberangkatan', format: 'XLSX', size: '128 KB' },
  { name: 'SOP Operasional Umrah', format: 'PDF', size: '512 KB' },
  { name: 'Checklist Dokumen Jemaah', format: 'PDF', size: '89 KB' },
  { name: 'Template Invoice', format: 'DOCX', size: '156 KB' },
  { name: 'Panduan Sistem GEZMA', format: 'PDF', size: '1.2 MB' },
];

const formatColors: Record<string, { bg: string; text: string }> = {
  PDF: { bg: '#FEF2F2', text: '#DC2626' },
  XLSX: { bg: '#F0FDF4', text: '#16A34A' },
  DOCX: { bg: '#EFF6FF', text: '#2563EB' },
};

const colorLightMap: Record<string, string> = {
  '#2563EB': '#EFF6FF',
  '#059669': '#ECFDF5',
  '#7C3AED': '#F3E8FF',
  '#D97706': '#FFFBEB',
  '#DC2626': '#FEF2F2',
  '#0891B2': '#ECFEFF',
};

export default function ServicesPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredFile, setHoveredFile] = useState<number | null>(null);
  const [hoveredContact, setHoveredContact] = useState<number | null>(null);

  const gridColumns = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

  const contactCards: ContactCard[] = [
    {
      emoji: '\uD83D\uDCAC',
      title: 'Live Chat',
      detail: 'Chat langsung dengan tim support kami',
      action: 'Mulai Chat',
    },
    {
      emoji: '\uD83D\uDCF1',
      title: 'WhatsApp',
      detail: '+62 812-3456-7890',
      action: 'Kirim Pesan',
    },
    {
      emoji: '\u2709\uFE0F',
      title: 'Email',
      detail: 'support@gezma.id',
      action: 'Kirim Email',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '32px' }}>
      <PageHeader
        title="Layanan"
        description="Layanan pendukung untuk operasional travel umrah Anda"
      />

      {/* Service Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: '20px' }}>
        {serviceCategories.map((service, index) => {
          const isHovered = hoveredCard === index;
          const lightBg = colorLightMap[service.color] || '#F3F4F6';
          return (
            <div
              key={service.title}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundColor: c.cardBg,
                border: '1px solid ' + c.border,
                borderRadius: '16px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all 0.2s ease',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: isHovered
                  ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                  : '0 1px 3px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: lightBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  lineHeight: 1,
                }}
              >
                {service.emoji}
              </div>

              {/* Title & Description */}
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: c.textPrimary,
                    margin: '0 0 6px 0',
                  }}
                >
                  {service.title}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: c.textMuted,
                    margin: 0,
                    lineHeight: '1.5',
                  }}
                >
                  {service.description}
                </p>
              </div>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {service.features.map((feature) => (
                  <div
                    key={feature}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: c.textSecondary,
                    }}
                  >
                    <span
                      style={{
                        color: '#16A34A',
                        fontWeight: '700',
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    {feature}
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => alert('Fitur ini akan segera tersedia')}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: '1px solid ' + service.color,
                  backgroundColor: isHovered ? service.color : 'transparent',
                  color: isHovered ? '#FFFFFF' : service.color,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: 'auto',
                }}
              >
                {service.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Download Documents Section */}
      <div
        style={{
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.border,
          borderRadius: '16px',
          padding: isMobile ? '20px' : '28px',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '700',
            color: c.textPrimary,
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '24px' }}>{'\uD83D\uDCE5'}</span> Download Dokumen
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {downloadFiles.map((file, index) => {
            const fc = formatColors[file.format];
            const isFileHovered = hoveredFile === index;
            return (
              <div
                key={file.name}
                onMouseEnter={() => setHoveredFile(index)}
                onMouseLeave={() => setHoveredFile(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '10px' : '16px',
                  padding: isMobile ? '12px 8px' : '14px 8px',
                  borderBottom: index < downloadFiles.length - 1 ? '1px solid ' + c.borderLight : 'none',
                  backgroundColor: isFileHovered ? c.cardBgHover : 'transparent',
                  borderRadius: '8px',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {/* File Icon */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: fc.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: fc.text,
                    flexShrink: 0,
                  }}
                >
                  {file.format === 'PDF' ? '\uD83D\uDCC4' : file.format === 'XLSX' ? '\uD83D\uDCCA' : '\uD83D\uDCC3'}
                </div>

                {/* File Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: c.textPrimary,
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {file.name}
                  </p>
                  {isMobile && (
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
                      {file.format} · {file.size}
                    </p>
                  )}
                </div>

                {/* Format Badge (desktop/tablet only) */}
                {!isMobile && (
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: fc.bg,
                      color: fc.text,
                      flexShrink: 0,
                    }}
                  >
                    {file.format}
                  </span>
                )}

                {/* Size (desktop/tablet only) */}
                {!isMobile && (
                  <span
                    style={{
                      fontSize: '13px',
                      color: c.textMuted,
                      width: '70px',
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    {file.size}
                  </span>
                )}

                {/* Download Button */}
                <button
                  onClick={() => alert('Fitur download akan segera tersedia')}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid ' + c.border,
                    backgroundColor: 'transparent',
                    color: c.textSecondary,
                    fontSize: '16px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                  title="Download"
                >
                  {'\u2B07'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Section - Hubungi Kami */}
      <div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '700',
            color: c.textPrimary,
            margin: '0 0 16px 0',
          }}
        >
          Hubungi Kami
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          {contactCards.map((contact, index) => {
            const isContactHovered = hoveredContact === index;
            return (
              <div
                key={contact.title}
                onMouseEnter={() => setHoveredContact(index)}
                onMouseLeave={() => setHoveredContact(null)}
                style={{
                  backgroundColor: c.cardBg,
                  border: '1px solid ' + c.border,
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                  transform: isContactHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isContactHovered
                    ? '0 8px 25px rgba(0, 0, 0, 0.1)'
                    : '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div
                  style={{
                    fontSize: '36px',
                    lineHeight: 1,
                  }}
                >
                  {contact.emoji}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: c.textPrimary,
                      margin: '0 0 4px 0',
                    }}
                  >
                    {contact.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: c.textMuted,
                      margin: 0,
                      lineHeight: '1.5',
                    }}
                  >
                    {contact.detail}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (contact.title === 'Live Chat') {
                      alert('Fitur live chat akan segera tersedia');
                    } else if (contact.title === 'WhatsApp') {
                      alert('Fitur WhatsApp akan segera tersedia');
                    } else {
                      alert('Fitur email akan segera tersedia');
                    }
                  }}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '10px',
                    border: '1px solid ' + c.primary,
                    backgroundColor: isContactHovered ? c.primary : 'transparent',
                    color: isContactHovered ? '#FFFFFF' : c.primary,
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginTop: '4px',
                  }}
                >
                  {contact.action}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
