'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Package } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

interface Goods {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  status: string;
  imageUrl: string | null;
  agency: { name: string };
  createdAt: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  pakaian: '\u{1F455}',
  ibadah: '\u{1F4FF}',
  elektronik: '\u{1F4F1}',
  lainnya: '\u{1F4E6}',
};

const STATUS_COLORS: Record<string, string> = {
  available: '#16A34A',
  requested: '#D97706',
  delivered: '#6B7280',
};

const CATEGORIES = ['all', 'pakaian', 'ibadah', 'elektronik', 'lainnya'] as const;

export default function GoodsPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();

  const [goods, setGoods] = useState<Goods[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'pakaian', condition: 'baik', imageUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchGoods = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (activeCategory !== 'all') params.set('category', activeCategory);
      const res = await fetch(`/api/foundation/goods?${params}`);
      if (res.ok) {
        const data = await res.json();
        setGoods(data.goods || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchGoods(); }, [fetchGoods]);

  const filtered = goods.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddGoods = async () => {
    setFormError('');
    if (!form.title || !form.description) {
      setFormError('Judul dan deskripsi wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/foundation/goods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageUrl: form.imageUrl || null }),
      });
      if (res.ok) {
        setShowAddForm(false);
        setForm({ title: '', description: '', category: 'pakaian', condition: 'baik', imageUrl: '' });
        fetchGoods();
      } else {
        const data = await res.json();
        setFormError(data.error || 'Gagal menyimpan barang');
      }
    } catch {
      setFormError('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: string): string => {
    const labels: Record<string, string> = {
      all: 'Semua',
      pakaian: t.foundation.categoryPakaian,
      ibadah: t.foundation.categoryIbadah,
      elektronik: t.foundation.categoryElektronik,
      lainnya: t.foundation.categoryLainnya,
    };
    return labels[cat] || cat;
  };

  const gridCols = isMobile ? 1 : isTablet ? 2 : 3;

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    minHeight: '44px',
    borderRadius: '10px',
    border: '1px solid ' + c.border,
    backgroundColor: c.cardBg,
    color: c.textPrimary,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title={t.foundation.goodsTitle}
        description={t.foundation.goodsDesc}
        actions={
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              minHeight: '44px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: c.primary,
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus style={{ width: '18px', height: '18px' }} />
            {t.foundation.addGoodsBtn}
          </button>
        }
      />

      {/* Add Form */}
      {showAddForm && (
        <div
          style={{
            backgroundColor: c.cardBg,
            border: '1px solid ' + c.border,
            borderRadius: '14px',
            padding: '24px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: '0 0 20px' }}>
            Tambah Barang Donasi
          </h3>

          {formError && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>
              {formError}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c.textSecondary, marginBottom: '6px' }}>Judul *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nama barang" style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = c.primary; }} onBlur={(e) => { e.target.style.borderColor = c.border; }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c.textSecondary, marginBottom: '6px' }}>Kategori</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="pakaian">{t.foundation.categoryPakaian}</option>
                <option value="ibadah">{t.foundation.categoryIbadah}</option>
                <option value="elektronik">{t.foundation.categoryElektronik}</option>
                <option value="lainnya">{t.foundation.categoryLainnya}</option>
              </select>
            </div>

            <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c.textSecondary, marginBottom: '6px' }}>Deskripsi *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Jelaskan kondisi dan detail barang" rows={3}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
                onFocus={(e) => { e.target.style.borderColor = c.primary; }} onBlur={(e) => { e.target.style.borderColor = c.border; }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c.textSecondary, marginBottom: '6px' }}>Kondisi</label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="baik">{t.foundation.conditionBaik}</option>
                <option value="cukup_baik">{t.foundation.conditionCukupBaik}</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c.textSecondary, marginBottom: '6px' }}>URL Gambar (opsional)</label>
              <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = c.primary; }} onBlur={(e) => { e.target.style.borderColor = c.border; }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button" onClick={() => { setShowAddForm(false); setFormError(''); }}
              style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid ' + c.border, backgroundColor: 'transparent', color: c.textSecondary, fontSize: '14px', cursor: 'pointer' }}
            >
              Batal
            </button>
            <button
              type="button" onClick={handleAddGoods} disabled={submitting}
              style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: submitting ? c.border : c.primary, color: '#fff', fontSize: '14px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', minHeight: '40px', borderRadius: '20px',
                border: isActive ? '2px solid ' + c.primary : '1px solid ' + c.border,
                backgroundColor: isActive ? c.primaryLight : c.cardBg,
                color: isActive ? c.primary : c.textSecondary,
                fontWeight: isActive ? 600 : 400, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {cat !== 'all' && <span>{CATEGORY_EMOJI[cat]}</span>}
              {getCategoryLabel(cat)}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: c.textMuted, pointerEvents: 'none' }} />
        <input type="text" placeholder="Cari barang..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 12px 10px 36px', minHeight: '44px', borderRadius: '10px', border: '1px solid ' + c.border, backgroundColor: c.cardBg, color: c.textPrimary, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          onFocus={(e) => { e.target.style.borderColor = c.primary; }} onBlur={(e) => { e.target.style.borderColor = c.border; }} />
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: c.cardBg, borderRadius: '14px', border: '1px solid ' + c.border }}>
          <p style={{ color: c.textMuted }}>{t.foundation.loadingData}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: c.cardBg, borderRadius: '14px', border: '1px solid ' + c.border }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>{'\u{1F4E6}'}</div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 4px' }}>{t.foundation.emptyTitle}</p>
          <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>{t.foundation.emptyDesc}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: '16px' }}>
          {filtered.map((item) => {
            const emoji = CATEGORY_EMOJI[item.category] || '\u{1F4E6}';
            const statusColor = STATUS_COLORS[item.status] || c.textMuted;
            const statusLabel: Record<string, string> = {
              available: t.foundation.statusAvailable,
              requested: t.foundation.statusRequested,
              delivered: t.foundation.statusDelivered,
            };
            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: c.cardBg,
                  border: '1px solid ' + c.border,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
              >
                <div
                  style={{
                    height: '120px',
                    background: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                  }}
                >
                  {item.imageUrl ? (
                    <img loading="lazy" src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : emoji}
                </div>

                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: c.textPrimary, margin: 0, flex: 1, paddingRight: '8px', lineHeight: '1.3' }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: statusColor, backgroundColor: statusColor + '18', padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                      {statusLabel[item.status] || item.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: c.textSecondary, margin: '0 0 12px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: c.pageBg, border: '1px solid ' + c.borderLight, fontSize: '11px', color: c.textMuted }}>
                      {getCategoryLabel(item.category)}
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: c.pageBg, border: '1px solid ' + c.borderLight, fontSize: '11px', color: c.textMuted }}>
                      {item.condition === 'baik' ? t.foundation.conditionBaik : t.foundation.conditionCukupBaik}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '10px', borderTop: '1px solid ' + c.borderLight }}>
                    <Package style={{ width: '12px', height: '12px', color: c.textMuted }} />
                    <span style={{ fontSize: '12px', color: c.textMuted }}>
                      {item.agency?.name || '-'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
