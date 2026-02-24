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
  Search,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { helpFAQs, helpCategories } from '@/data/mock-help';

export default function HelpPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredFAQs = useMemo(() => {
    let result = helpFAQs;

    if (activeCategory) {
      result = result.filter(faq => faq.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        faq =>
          faq.question.toLowerCase().includes(q) ||
          faq.answer.toLowerCase().includes(q) ||
          faq.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [searchQuery, activeCategory]);

  const categoryIcons: Record<string, string> = {
    'Akun & Login': '🔐',
    'Jamaah': '👥',
    'Paket & Perjalanan': '✈️',
    'Pembayaran': '💳',
    'Fitur Lainnya': '⚙️',
  };

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

      {/* Search */}
      <div
        style={{
          position: 'relative',
        }}
      >
        <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: c.textMuted }} />
        <input
          type="text"
          placeholder="Cari pertanyaan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            height: '48px',
            padding: '0 16px 0 42px',
            fontSize: '14px',
            border: `1px solid ${c.border}`,
            borderRadius: '10px',
            backgroundColor: c.cardBg,
            color: c.textPrimary,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: activeCategory === null ? '600' : '400',
            backgroundColor: activeCategory === null ? c.primary : c.cardBg,
            color: activeCategory === null ? 'white' : c.textSecondary,
            border: `1px solid ${activeCategory === null ? c.primary : c.border}`,
            borderRadius: '20px',
            cursor: 'pointer',
          }}
        >
          Semua ({helpFAQs.length})
        </button>
        {helpCategories.map(cat => {
          const count = helpFAQs.filter(f => f.category === cat).length;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '400',
                backgroundColor: isActive ? c.primary : c.cardBg,
                color: isActive ? 'white' : c.textSecondary,
                border: `1px solid ${isActive ? c.primary : c.border}`,
                borderRadius: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{categoryIcons[cat]}</span>
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion */}
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
            <span style={{ fontSize: '13px', fontWeight: '400', color: c.textMuted }}>
              {filteredFAQs.length} pertanyaan
            </span>
          </h3>
        </div>
        {filteredFAQs.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <HelpCircle style={{ width: '32px', height: '32px', color: c.textLight, margin: '0 auto 8px' }} />
            <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>
              Tidak ditemukan FAQ yang cocok dengan pencarian Anda.
            </p>
          </div>
        ) : (
          <div>
            {filteredFAQs.map((faq, i) => {
              const isOpen = openIndex === faq.id;
              return (
                <div key={faq.id} style={{ borderBottom: i < filteredFAQs.length - 1 ? `1px solid ${c.borderLight}` : 'none' }}>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : faq.id)}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', backgroundColor: c.cardBgHover, color: c.textMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {categoryIcons[faq.category]} {faq.category}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>{faq.question}</span>
                    </div>
                    <ChevronDown
                      style={{
                        width: '20px',
                        height: '20px',
                        color: c.textMuted,
                        flexShrink: 0,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div style={{ padding: `0 ${isMobile ? '16px' : '20px'} ${isMobile ? '16px' : '20px'}` }}>
                      <p style={{ fontSize: '14px', color: c.textSecondary, margin: 0, lineHeight: '1.6', paddingLeft: isMobile ? 0 : '70px' }}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
