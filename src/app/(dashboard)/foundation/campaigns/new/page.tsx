'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

const CATEGORIES = [
  { value: 'bencana', emoji: '\u{1F6A8}' },
  { value: 'masjid', emoji: '\u{1F54C}' },
  { value: 'yatim', emoji: '\u{1F91D}' },
  { value: 'kesehatan', emoji: '\u{1F3E5}' },
  { value: 'pendidikan', emoji: '\u{1F4DA}' },
  { value: 'pelatihan', emoji: '\u{1F4BC}' },
  { value: 'umrah_dhuafa', emoji: '\u{1F4FF}' },
];

export default function NewCampaignPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'bencana',
    targetAmount: '',
    deadline: '',
    imageUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const getCategoryLabel = (cat: string): string => {
    const labels: Record<string, string> = {
      bencana: t.foundation.categoryBencana,
      masjid: t.foundation.categoryMasjid,
      yatim: t.foundation.categoryYatim,
      kesehatan: t.foundation.categoryKesehatan,
      pendidikan: t.foundation.categoryPendidikan,
      pelatihan: t.foundation.categoryPelatihan,
      umrah_dhuafa: t.foundation.categoryUmrahDhuafa,
    };
    return labels[cat] || cat;
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.title.trim() || !form.description.trim() || !form.targetAmount) {
      setError('Judul, deskripsi, dan target dana wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/foundation/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          targetAmount: parseFloat(form.targetAmount),
          deadline: form.deadline || null,
          imageUrl: form.imageUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.foundation.donateError);
        return;
      }

      router.push('/foundation/campaigns');
    } catch {
      setError(t.foundation.donateError);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    minHeight: '46px',
    borderRadius: '10px',
    border: '1px solid ' + c.border,
    backgroundColor: c.cardBg,
    color: c.textPrimary,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: c.textSecondary,
    marginBottom: '6px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Kampanye Baru"
        description="Buat kampanye donasi baru untuk Gezma Foundation"
        actions={
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              minHeight: '44px',
              borderRadius: '10px',
              border: '1px solid ' + c.border,
              backgroundColor: 'transparent',
              color: c.textSecondary,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
            Kembali
          </button>
        }
      />

      <div
        style={{
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.border,
          borderRadius: '16px',
          padding: isMobile ? '20px' : '32px',
          maxWidth: '680px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label style={labelStyle}>Judul Kampanye *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Contoh: Bantu Korban Banjir Kalimantan"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = c.primary; }}
              onBlur={(e) => { e.target.style.borderColor = c.border; }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Deskripsi *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ceritakan latar belakang, kebutuhan, dan rencana penggunaan dana..."
              rows={5}
              style={{
                ...inputStyle,
                minHeight: '120px',
                resize: 'vertical',
              }}
              onFocus={(e) => { e.target.style.borderColor = c.primary; }}
              onBlur={(e) => { e.target.style.borderColor = c.border; }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Kategori *</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: '8px',
              }}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = form.category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.value })}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid ' + c.primary : '1px solid ' + c.border,
                      backgroundColor: isSelected ? c.primaryLight : 'transparent',
                      color: isSelected ? c.primary : c.textSecondary,
                      fontSize: '12px',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{cat.emoji}</span>
                    <span>{getCategoryLabel(cat.value)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Amount */}
          <div>
            <label style={labelStyle}>Target Dana (Rp) *</label>
            <input
              type="number"
              value={form.targetAmount}
              onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              placeholder="Contoh: 50000000"
              min="1"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = c.primary; }}
              onBlur={(e) => { e.target.style.borderColor = c.border; }}
            />
            {form.targetAmount && (
              <p style={{ fontSize: '12px', color: c.textMuted, marginTop: '4px' }}>
                = {parseFloat(form.targetAmount || '0').toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
              </p>
            )}
          </div>

          {/* Deadline */}
          <div>
            <label style={labelStyle}>Batas Waktu (opsional)</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = c.primary; }}
              onBlur={(e) => { e.target.style.borderColor = c.border; }}
            />
          </div>

          {/* Image URL */}
          <div>
            <label style={labelStyle}>URL Gambar (opsional)</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = c.primary; }}
              onBlur={(e) => { e.target.style.borderColor = c.border; }}
            />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '12px 24px',
                minHeight: '48px',
                borderRadius: '10px',
                border: '1px solid ' + c.border,
                backgroundColor: 'transparent',
                color: c.textSecondary,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                minHeight: '48px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: submitting ? c.border : c.primary,
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s',
              }}
            >
              <Save style={{ width: '18px', height: '18px' }} />
              {submitting ? 'Menyimpan...' : 'Simpan Kampanye'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
