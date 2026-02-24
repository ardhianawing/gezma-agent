'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { Bell, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
  type NotificationPreferences,
} from '@/lib/services/notification-prefs.service';

export default function NotificationPreferencesPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings/notifications')
      .then((res) => res.json())
      .then((json) => setPrefs(json.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (category: string, channel: string) => {
    if (!prefs) return;
    setPrefs({
      ...prefs,
      [category]: {
        ...prefs[category],
        [channel]: !prefs[category][channel],
      },
    });
    setMessage(null);
  };

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Preferensi berhasil disimpan' });
      } else {
        setMessage({ type: 'error', text: 'Gagal menyimpan preferensi' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/settings" style={{ textDecoration: 'none' }}>
          <button style={{
            backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '8px',
            borderRadius: '8px', color: c.textSecondary, display: 'flex', alignItems: 'center',
          }}>
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
          </button>
        </Link>
        <PageHeader
          title="Preferensi Notifikasi"
          description="Atur notifikasi yang ingin Anda terima"
        />
      </div>

      <div style={{
        backgroundColor: c.cardBg,
        borderRadius: '12px',
        border: `1px solid ${c.border}`,
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: c.textSecondary }}>Memuat preferensi...</div>
        ) : !prefs ? (
          <div style={{ padding: '40px', textAlign: 'center', color: c.textSecondary }}>Gagal memuat preferensi</div>
        ) : (
          <>
            {/* Header Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `1fr ${NOTIFICATION_CHANNELS.map(() => '80px').join(' ')}`,
              padding: '12px 20px',
              borderBottom: `1px solid ${c.border}`,
              alignItems: 'center',
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: c.textSecondary }}>Kategori</div>
              {NOTIFICATION_CHANNELS.map((ch) => (
                <div key={ch.key} style={{ fontSize: '12px', fontWeight: '600', color: c.textSecondary, textAlign: 'center' }}>
                  {ch.label}
                </div>
              ))}
            </div>

            {/* Rows */}
            {NOTIFICATION_CATEGORIES.map((cat, idx) => (
              <div
                key={cat.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `1fr ${NOTIFICATION_CHANNELS.map(() => '80px').join(' ')}`,
                  padding: '16px 20px',
                  borderBottom: idx < NOTIFICATION_CATEGORIES.length - 1 ? `1px solid ${c.borderLight}` : 'none',
                  alignItems: 'center',
                  pointerEvents: saving ? 'none' : 'auto',
                  opacity: saving ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell style={{ width: '16px', height: '16px', color: c.textMuted }} />
                    <span style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>{cat.label}</span>
                  </div>
                  {!isMobile && (
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: '4px 0 0 24px' }}>{cat.description}</p>
                  )}
                </div>
                {NOTIFICATION_CHANNELS.map((ch) => {
                  const enabled = prefs[cat.key]?.[ch.key] ?? false;
                  return (
                    <div key={ch.key} style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggle(cat.key, ch.key)}
                        style={{
                          width: '40px',
                          height: '22px',
                          backgroundColor: enabled ? c.primary : c.border,
                          borderRadius: '11px',
                          position: 'relative',
                          cursor: 'pointer',
                          border: 'none',
                          padding: 0,
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: '2px',
                            left: enabled ? '20px' : '2px',
                            width: '18px',
                            height: '18px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            transition: 'left 0.2s',
                            border: enabled ? 'none' : `1px solid ${c.border}`,
                          }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Save Button & Message */}
      {prefs && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: saving ? c.textMuted : c.primary,
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            <Save style={{ width: '16px', height: '16px' }} />
            {saving ? 'Menyimpan...' : 'Simpan Preferensi'}
          </button>
          {message && (
            <span style={{
              fontSize: '14px',
              color: message.type === 'success' ? c.success : c.error,
            }}>
              {message.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
