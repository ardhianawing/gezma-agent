'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/components/ui/toast';
import { Mail, Save, ChevronLeft, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

interface EmailTemplate {
  id: string;
  event: string;
  subject: string;
  bodyHtml: string;
  isActive: boolean;
}

const EVENT_CONFIG: Record<string, { label: string; description: string; defaultSubject: string; defaultBody: string }> = {
  welcome: {
    label: 'Selamat Datang',
    description: 'Dikirim saat jemaah baru didaftarkan ke sistem',
    defaultSubject: 'Selamat Datang, {{name}}!',
    defaultBody: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Assalamualaikum {{name}},</h2>
  <p>Selamat datang di {{agency}}. Kami senang Anda bergabung untuk perjalanan umrah bersama kami.</p>
  <p>Tim kami akan menghubungi Anda untuk informasi lebih lanjut.</p>
  <p>Jazakallahu khairan,<br/>{{agency}}</p>
</div>`,
  },
  payment_reminder: {
    label: 'Pengingat Pembayaran',
    description: 'Dikirim sebagai pengingat pembayaran yang belum lunas',
    defaultSubject: 'Pengingat Pembayaran - {{agency}}',
    defaultBody: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Assalamualaikum {{name}},</h2>
  <p>Ini adalah pengingat bahwa Anda memiliki pembayaran yang belum diselesaikan.</p>
  <p>Mohon segera lakukan pembayaran sebelum tanggal {{date}}.</p>
  <p>Jazakallahu khairan,<br/>{{agency}}</p>
</div>`,
  },
  departure_reminder: {
    label: 'Pengingat Keberangkatan',
    description: 'Dikirim menjelang tanggal keberangkatan',
    defaultSubject: 'Pengingat Keberangkatan - {{date}}',
    defaultBody: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Assalamualaikum {{name}},</h2>
  <p>Keberangkatan umrah Anda dijadwalkan pada tanggal {{date}}.</p>
  <p>Pastikan semua dokumen Anda sudah lengkap dan siap.</p>
  <p>Jazakallahu khairan,<br/>{{agency}}</p>
</div>`,
  },
};

export default function EmailTemplatesPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [formSubject, setFormSubject] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formActive, setFormActive] = useState(true);
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    fetch('/api/settings/email-templates')
      .then((res) => res.json())
      .then((json) => setTemplates(json.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function getTemplate(event: string): EmailTemplate | undefined {
    return templates.find((t) => t.event === event);
  }

  function handleEdit(event: string) {
    const existing = getTemplate(event);
    const config = EVENT_CONFIG[event];
    setEditingEvent(event);
    setFormSubject(existing?.subject || config.defaultSubject);
    setFormBody(existing?.bodyHtml || config.defaultBody);
    setFormActive(existing?.isActive ?? true);
    setSaveSuccess('');
  }

  function handleCancel() {
    setEditingEvent(null);
    setFormSubject('');
    setFormBody('');
    setSaveSuccess('');
  }

  async function handleSave() {
    if (!editingEvent) return;
    setSaving(true);
    setSaveSuccess('');
    try {
      const res = await fetch('/api/settings/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: editingEvent,
          subject: formSubject,
          bodyHtml: formBody,
          isActive: formActive,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setTemplates((prev) => {
          const idx = prev.findIndex((t) => t.event === editingEvent);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = saved;
            return next;
          }
          return [...prev, saved];
        });
        setSaveSuccess('Template berhasil disimpan');
        addToast({ type: 'success', title: 'Template berhasil disimpan' });
        setTimeout(() => {
          setEditingEvent(null);
          setSaveSuccess('');
        }, 1500);
      } else {
        addToast({ type: 'error', title: 'Gagal menyimpan template' });
      }
    } catch {
      addToast({ type: 'error', title: 'Gagal menyimpan template' });
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    color: c.textPrimary,
    backgroundColor: c.cardBg,
    border: `1px solid ${c.border}`,
    borderRadius: '12px',
    outline: 'none',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '200px',
    fontFamily: 'monospace',
    fontSize: '13px',
    lineHeight: '1.6',
    resize: 'vertical' as const,
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: c.textMuted }}>
        Memuat template email...
      </div>
    );
  }

  // Editing view
  if (editingEvent) {
    const config = EVENT_CONFIG[editingEvent];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: c.cardBg,
              border: `1px solid ${c.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: c.textMuted,
            }}
          >
            <ChevronLeft style={{ width: '18px', height: '18px' }} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
              Edit: {config.label}
            </h1>
            <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0' }}>{config.description}</p>
          </div>
        </div>

        {/* Form */}
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '16px',
            border: `1px solid ${c.border}`,
            padding: isMobile ? '20px' : '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>Status Template</span>
            <button
              type="button"
              onClick={() => setFormActive(!formActive)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: `1px solid ${c.border}`,
                backgroundColor: formActive ? '#DEF7EC' : c.cardBg,
                color: formActive ? '#03543F' : c.textMuted,
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {formActive ? (
                <ToggleRight style={{ width: '16px', height: '16px' }} />
              ) : (
                <ToggleLeft style={{ width: '16px', height: '16px' }} />
              )}
              {formActive ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>

          {/* Subject */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: c.textMuted, marginBottom: '8px' }}>
              Subject
            </label>
            <input
              type="text"
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              placeholder="Subject email..."
              style={inputStyle}
            />
          </div>

          {/* Body HTML */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: c.textMuted, marginBottom: '8px' }}>
              Body HTML
            </label>
            <textarea
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="<div>...</div>"
              style={textareaStyle}
            />
          </div>

          {/* Variable hints */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: c.pageBg,
              border: `1px solid ${c.border}`,
            }}
          >
            <p style={{ fontSize: '12px', fontWeight: '600', color: c.textMuted, margin: '0 0 6px' }}>
              Variable Placeholders:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['{{name}}', '{{agency}}', '{{date}}'].map((v) => (
                <span
                  key={v}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: c.cardBg,
                    border: `1px solid ${c.border}`,
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: c.textPrimary,
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: c.textMuted, margin: '6px 0 0' }}>
              Variabel akan diganti dengan data aktual saat email dikirim.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
            {saveSuccess && (
              <span style={{ fontSize: '13px', color: c.success, alignSelf: 'center' }}>{saveSuccess}</span>
            )}
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                color: c.textSecondary,
                backgroundColor: c.cardBg,
                border: `1px solid ${c.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                backgroundColor: saving ? c.textMuted : c.primary,
                border: 'none',
                borderRadius: '12px',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {saving ? (
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Save style={{ width: '16px', height: '16px' }} />
              )}
              {saving ? 'Menyimpan...' : 'Simpan Template'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
          Email Templates
        </h1>
        <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0' }}>
          Kelola template email untuk berbagai event otomatis
        </p>
      </div>

      {/* Template Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '20px',
        }}
      >
        {Object.entries(EVENT_CONFIG).map(([event, config]) => {
          const template = getTemplate(event);
          const hasCustom = !!template;

          return (
            <div
              key={event}
              style={{
                backgroundColor: c.cardBg,
                borderRadius: '16px',
                border: `1px solid ${c.border}`,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s ease',
              }}
              onClick={() => handleEdit(event)}
            >
              {/* Icon + Status */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: c.pageBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Mail style={{ width: '22px', height: '22px', color: c.primary }} />
                </div>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: hasCustom
                      ? (template.isActive ? '#DEF7EC' : '#FDE8E8')
                      : c.pageBg,
                    color: hasCustom
                      ? (template.isActive ? '#03543F' : '#9B1C1C')
                      : c.textMuted,
                  }}
                >
                  {hasCustom ? (template.isActive ? 'Aktif' : 'Nonaktif') : 'Default'}
                </span>
              </div>

              {/* Title & description */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: '0 0 4px' }}>
                  {config.label}
                </h3>
                <p style={{ fontSize: '13px', color: c.textMuted, margin: 0, lineHeight: '1.5' }}>
                  {config.description}
                </p>
              </div>

              {/* Subject preview */}
              {hasCustom && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: c.pageBg,
                    fontSize: '12px',
                    color: c.textSecondary,
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Subject: {template.subject}
                </div>
              )}

              {/* Edit hint */}
              <p style={{ fontSize: '12px', color: c.primary, margin: 0, fontWeight: '500' }}>
                Klik untuk {hasCustom ? 'edit' : 'kustomisasi'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
