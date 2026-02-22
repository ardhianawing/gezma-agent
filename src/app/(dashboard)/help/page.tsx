'use client';

import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import {
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    q: 'Bagaimana cara menambah jemaah baru?',
    a: 'Buka menu Jamaah di sidebar, lalu klik tombol "Tambah Jamaah". Isi semua data yang diperlukan dan klik Simpan.',
  },
  {
    q: 'Bagaimana cara mencatat pembayaran jemaah?',
    a: 'Buka halaman detail jemaah, scroll ke bagian Payment History, lalu klik "Tambah Pembayaran". Isi jumlah, tipe, metode, dan tanggal pembayaran.',
  },
  {
    q: 'Bagaimana cara membuat paket umrah baru?',
    a: 'Buka menu Paket di sidebar, klik "Tambah Paket", lalu isi informasi paket termasuk harga, hotel, dan itinerary.',
  },
  {
    q: 'Bagaimana cara mengubah status jemaah?',
    a: 'Buka halaman detail jemaah, pada bagian Status & Payment terdapat dropdown untuk mengubah status jemaah.',
  },
  {
    q: 'Bagaimana cara mengelola dokumen jemaah?',
    a: 'Buka halaman detail jemaah, pada bagian Documents Anda dapat mengupload dan mengelola dokumen seperti KTP, paspor, foto, dan lainnya.',
  },
  {
    q: 'Bagaimana cara mengubah profil agensi?',
    a: 'Buka menu Agensi di sidebar, lalu klik tombol "Ubah Profil" untuk mengedit informasi agensi Anda.',
  },
];

export default function HelpPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <PageHeader
        title="Pusat Bantuan"
        description="Temukan jawaban untuk pertanyaan umum atau hubungi tim support kami"
      />

      {/* Contact Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { icon: Mail, label: 'Email', value: 'support@gezma.id', color: '#3B82F6', bg: '#DBEAFE' },
          { icon: Phone, label: 'Telepon', value: '(021) 1234-5678', color: '#10B981', bg: '#D1FAE5' },
          { icon: MessageSquare, label: 'WhatsApp', value: '+62 812-3456-7890', color: '#22C55E', bg: '#DCFCE7' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              style={{
                backgroundColor: c.cardBg,
                borderRadius: '12px',
                border: `1px solid ${c.border}`,
                padding: isMobile ? '16px' : '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: item.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: '24px', height: '24px', color: item.color }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>{item.label}</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: '4px 0 0 0' }}>{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: isMobile ? '16px' : '20px', borderBottom: `1px solid ${c.borderLight}` }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen style={{ width: '18px', height: '18px', color: c.textMuted }} />
            Pertanyaan Umum (FAQ)
          </h3>
        </div>
        <div>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: i < faqs.length - 1 ? `1px solid ${c.borderLight}` : 'none' }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: isMobile ? '16px' : '20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>{faq.q}</span>
                <ChevronDown
                  style={{
                    width: '20px',
                    height: '20px',
                    color: c.textMuted,
                    flexShrink: 0,
                    transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>
              {openIndex === i && (
                <div style={{ padding: `0 ${isMobile ? '16px' : '20px'} ${isMobile ? '16px' : '20px'}` }}>
                  <p style={{ fontSize: '14px', color: c.textSecondary, margin: 0, lineHeight: '1.6' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
