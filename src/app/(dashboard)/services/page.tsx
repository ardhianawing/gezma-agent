'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/lib/hooks/use-toast';

interface PlatformService {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  category: string;
  features: string[];
  ctaText: string;
  ctaLink?: string;
}

interface PlatformDocument {
  id: string;
  name: string;
  format: string;
  fileSize: string;
  fileUrl?: string;
  downloadCount: number;
}

interface ContactCard {
  emoji: string;
  title: string;
  detail: string;
  action: string;
}

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
  const { showToast } = useToast();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredFile, setHoveredFile] = useState<number | null>(null);
  const [hoveredContact, setHoveredContact] = useState<number | null>(null);
  const [services, setServices] = useState<PlatformService[]>([]);
  const [documents, setDocuments] = useState<PlatformDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const gridColumns = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          const data = await res.json();
          setServices(data.services);
          setDocuments(data.documents);
        }
      } catch {
        showToast('Gagal memuat data layanan', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showToast]);

  const handleDownload = async (doc: PlatformDocument) => {
    try {
      await fetch(`/api/services/documents/${doc.id}/download`, { method: 'POST' });
      if (doc.fileUrl) {
        window.open(doc.fileUrl, '_blank');
      } else {
        showToast('File belum tersedia untuk diunduh', 'warning');
      }
    } catch {
      showToast('Gagal mengunduh dokumen', 'error');
    }
  };

  const contactCards: ContactCard[] = [
    { emoji: '\uD83D\uDCAC', title: 'Live Chat', detail: 'Chat langsung dengan tim support kami', action: 'Mulai Chat' },
    { emoji: '\uD83D\uDCF1', title: 'WhatsApp', detail: '+62 812-3456-7890', action: 'Kirim Pesan' },
    { emoji: '\u2709\uFE0F', title: 'Email', detail: 'support@gezma.id', action: 'Kirim Email' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '32px' }}>
        <PageHeader title="Layanan" description="Layanan pendukung untuk operasional travel umrah Anda" />
        <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '16px',
              padding: '28px',
              height: '280px',
            }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: c.borderLight, marginBottom: '16px' }} />
              <div style={{ height: '18px', width: '60%', backgroundColor: c.borderLight, borderRadius: '4px', marginBottom: '8px' }} />
              <div style={{ height: '14px', width: '100%', backgroundColor: c.borderLight, borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '32px' }}>
      <PageHeader title="Layanan" description="Layanan pendukung untuk operasional travel umrah Anda" />

      {/* Service Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: '20px' }}>
        {services.map((service, index) => {
          const isHovered = hoveredCard === index;
          const lightBg = colorLightMap[service.color] || '#F3F4F6';
          return (
            <div
              key={service.id}
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
                boxShadow: isHovered ? '0 8px 25px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', backgroundColor: lightBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', lineHeight: 1,
              }}>
                {service.emoji}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: c.textPrimary, margin: '0 0 6px 0' }}>{service.title}</h3>
                <p style={{ fontSize: '14px', color: c.textMuted, margin: 0, lineHeight: '1.5' }}>{service.description}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {service.features.map((feature) => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: c.textSecondary }}>
                    <span style={{ color: '#16A34A', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>{'\u2713'}</span>
                    {feature}
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  if (service.ctaLink) {
                    if (service.ctaLink.startsWith('http')) {
                      window.open(service.ctaLink, '_blank');
                    } else if (service.ctaLink.startsWith('#')) {
                      document.getElementById(service.ctaLink.slice(1))?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = service.ctaLink;
                    }
                  }
                }}
                style={{
                  width: '100%', padding: '10px 16px', borderRadius: '10px',
                  border: '1px solid ' + service.color,
                  backgroundColor: isHovered ? service.color : 'transparent',
                  color: isHovered ? '#FFFFFF' : service.color,
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.2s ease', marginTop: 'auto',
                }}
              >
                {service.ctaText}
              </button>
            </div>
          );
        })}
      </div>

      {/* Download Documents Section */}
      <div
        id="download-dokumen-section"
        style={{
          backgroundColor: c.cardBg, border: '1px solid ' + c.border,
          borderRadius: '16px', padding: isMobile ? '20px' : '28px',
        }}
      >
        <h2 style={{
          fontSize: '20px', fontWeight: '700', color: c.textPrimary, margin: '0 0 20px 0',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '24px' }}>{'\uD83D\uDCE5'}</span> Download Dokumen
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {documents.map((file, index) => {
            const fc = formatColors[file.format] || formatColors.PDF;
            const isFileHovered = hoveredFile === index;
            return (
              <div
                key={file.id}
                onMouseEnter={() => setHoveredFile(index)}
                onMouseLeave={() => setHoveredFile(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '16px',
                  padding: isMobile ? '12px 8px' : '14px 8px',
                  borderBottom: index < documents.length - 1 ? '1px solid ' + c.borderLight : 'none',
                  backgroundColor: isFileHovered ? c.cardBgHover : 'transparent',
                  borderRadius: '8px', transition: 'background-color 0.15s ease',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', backgroundColor: fc.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '600', color: fc.text, flexShrink: 0,
                }}>
                  {file.format === 'PDF' ? '\uD83D\uDCC4' : file.format === 'XLSX' ? '\uD83D\uDCCA' : '\uD83D\uDCC3'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {file.name}
                  </p>
                  {isMobile && (
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
                      {file.format} · {file.fileSize}
                    </p>
                  )}
                </div>
                {!isMobile && (
                  <span style={{
                    padding: '2px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                    backgroundColor: fc.bg, color: fc.text, flexShrink: 0,
                  }}>
                    {file.format}
                  </span>
                )}
                {!isMobile && (
                  <span style={{ fontSize: '13px', color: c.textMuted, width: '70px', textAlign: 'right', flexShrink: 0 }}>
                    {file.fileSize}
                  </span>
                )}
                <button
                  onClick={() => handleDownload(file)}
                  aria-label={'Download ' + file.name}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    border: '1px solid ' + c.border, backgroundColor: 'transparent',
                    color: c.textSecondary, fontSize: '16px', cursor: 'pointer', flexShrink: 0,
                    transition: 'all 0.15s ease', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', padding: 0,
                  }}
                  title="Download"
                >
                  {'\u2B07'}
                </button>
              </div>
            );
          })}
          {documents.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: c.textMuted, fontSize: '14px' }}>
              Belum ada dokumen tersedia
            </div>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: c.textPrimary, margin: '0 0 16px 0' }}>
          Hubungi Kami
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
          {contactCards.map((contact, index) => {
            const isContactHovered = hoveredContact === index;
            return (
              <div
                key={contact.title}
                onMouseEnter={() => setHoveredContact(index)}
                onMouseLeave={() => setHoveredContact(null)}
                style={{
                  backgroundColor: c.cardBg, border: '1px solid ' + c.border, borderRadius: '16px',
                  padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', gap: '12px', transition: 'all 0.2s ease',
                  transform: isContactHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isContactHovered ? '0 8px 25px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ fontSize: '36px', lineHeight: 1 }}>{contact.emoji}</div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: c.textPrimary, margin: '0 0 4px 0' }}>{contact.title}</h3>
                  <p style={{ fontSize: '13px', color: c.textMuted, margin: 0, lineHeight: '1.5' }}>{contact.detail}</p>
                </div>
                <button
                  onClick={() => {
                    if (contact.title === 'WhatsApp') {
                      window.open('https://wa.me/6281234567890?text=Halo%20GEZMA%2C%20saya%20butuh%20bantuan', '_blank');
                    } else if (contact.title === 'Email') {
                      window.open('mailto:support@gezma.id?subject=Bantuan%20GEZMA', '_blank');
                    } else {
                      showToast('Fitur live chat akan segera tersedia', 'info');
                    }
                  }}
                  style={{
                    padding: '8px 24px', borderRadius: '10px', border: '1px solid ' + c.primary,
                    backgroundColor: isContactHovered ? c.primary : 'transparent',
                    color: isContactHovered ? '#FFFFFF' : c.primary,
                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                    transition: 'all 0.2s ease', marginTop: '4px',
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
