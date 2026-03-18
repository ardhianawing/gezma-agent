'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Send, Clock, Mail, ToggleLeft, ToggleRight, FileText, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useLanguage } from '@/lib/i18n';

interface ScheduledReport {
  id: string;
  frequency: string;
  reportType: string;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  emailTo: string;
  isActive: boolean;
  lastSentAt: string | null;
  createdAt: string;
}

const FREQ_LABELS: Record<string, string> = { weekly: 'Mingguan', monthly: 'Bulanan' };
const TYPE_LABELS: Record<string, string> = { financial: 'Keuangan', pilgrim: 'Jemaah', trip: 'Trip' };
const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function ScheduledReportsPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const router = useRouter();

  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { addToast } = useToast();
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);

  // Form state
  const [frequency, setFrequency] = useState('weekly');
  const [reportType, setReportType] = useState('financial');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [emailTo, setEmailTo] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/settings/scheduled-reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const resetForm = () => {
    setFrequency('weekly');
    setReportType('financial');
    setDayOfWeek(1);
    setDayOfMonth(1);
    setEmailTo('');
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (r: ScheduledReport) => {
    setFrequency(r.frequency);
    setReportType(r.reportType);
    setDayOfWeek(r.dayOfWeek ?? 1);
    setDayOfMonth(r.dayOfMonth ?? 1);
    setEmailTo(r.emailTo);
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!emailTo) {
      setMessage({ type: 'error', text: 'Email wajib diisi' });
      return;
    }
    setFormLoading(true);
    setMessage(null);

    try {
      const body = { frequency, reportType, dayOfWeek, dayOfMonth, emailTo };
      const url = editingId
        ? `/api/settings/scheduled-reports/${editingId}`
        : '/api/settings/scheduled-reports';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: editingId ? 'Berhasil diperbarui' : 'Berhasil dibuat' });
        resetForm();
        fetchReports();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Gagal menyimpan' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteReportId) return;
    try {
      const res = await fetch(`/api/settings/scheduled-reports/${deleteReportId}`, { method: 'DELETE' });
      if (res.ok) {
        setReports(reports.filter(r => r.id !== deleteReportId));
        addToast({ type: 'success', title: 'Berhasil dihapus' });
      }
    } catch {
      addToast({ type: 'error', title: 'Gagal menghapus' });
    }
    setDeleteReportId(null);
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/settings/scheduled-reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setReports(reports.map(r => r.id === id ? { ...r, isActive: !currentActive } : r));
      }
    } catch { /* ignore */ }
  };

  const handleSendNow = async (id: string) => {
    setSending(id);
    setMessage(null);
    try {
      const res = await fetch('/api/reports/send-scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `Laporan berhasil dikirim ke ${data.sentTo}` });
        fetchReports();
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal mengirim' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setSending(null);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', fontSize: '14px',
    border: `1px solid ${c.border}`, borderRadius: '8px',
    backgroundColor: c.inputBg, color: c.textPrimary,
    outline: 'none', boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => router.push('/settings')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '8px',
            border: `1px solid ${c.border}`, backgroundColor: c.cardBg,
            color: c.textSecondary, fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}
        >
          <ArrowLeft style={{ width: '14px', height: '14px' }} />
          {t.common.back}
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: c.textPrimary, margin: 0 }}>
            Laporan Terjadwal
          </h1>
          <p style={{ fontSize: '13px', color: c.textMuted, margin: '4px 0 0 0' }}>
            Kirim laporan otomatis ke email secara berkala
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '10px 16px', borderRadius: '8px',
            border: 'none', backgroundColor: c.primary, color: 'white',
            fontSize: '14px', fontWeight: 500, cursor: 'pointer',
          }}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
          {t.common.add}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          backgroundColor: message.type === 'success' ? c.successLight : c.errorLight,
          color: message.type === 'success' ? c.success : c.error,
          fontSize: '14px', fontWeight: 500,
        }}>
          {message.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{
          backgroundColor: c.cardBg, borderRadius: '12px',
          border: `1px solid ${c.border}`, padding: isMobile ? '16px' : '24px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 16px 0' }}>
            {editingId ? t.common.edit : t.common.add}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textMuted, marginBottom: '6px' }}>
                Frekuensi
              </label>
              <select value={frequency} onChange={e => setFrequency(e.target.value)} style={selectStyle}>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textMuted, marginBottom: '6px' }}>
                Tipe Laporan
              </label>
              <select value={reportType} onChange={e => setReportType(e.target.value)} style={selectStyle}>
                <option value="financial">Keuangan</option>
                <option value="pilgrim">Jemaah</option>
                <option value="trip">Trip</option>
              </select>
            </div>
            {frequency === 'weekly' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textMuted, marginBottom: '6px' }}>
                  Hari Pengiriman
                </label>
                <select value={dayOfWeek} onChange={e => setDayOfWeek(Number(e.target.value))} style={selectStyle}>
                  {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
            )}
            {frequency === 'monthly' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textMuted, marginBottom: '6px' }}>
                  Tanggal Pengiriman
                </label>
                <select value={dayOfMonth} onChange={e => setDayOfMonth(Number(e.target.value))} style={selectStyle}>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: c.textMuted, marginBottom: '6px' }}>
                Email Tujuan
              </label>
              <input
                type="email"
                value={emailTo}
                onChange={e => setEmailTo(e.target.value)}
                placeholder="email@contoh.com"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
            <button
              onClick={resetForm}
              style={{
                padding: '10px 20px', borderRadius: '8px',
                border: `1px solid ${c.border}`, backgroundColor: 'transparent',
                color: c.textSecondary, fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleSubmit}
              disabled={formLoading}
              style={{
                padding: '10px 20px', borderRadius: '8px',
                border: 'none', backgroundColor: c.primary, color: 'white',
                fontSize: '14px', fontWeight: 500, cursor: formLoading ? 'not-allowed' : 'pointer',
                opacity: formLoading ? 0.7 : 1,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {formLoading && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
                {formLoading ? t.common.saving : (editingId ? t.common.update : t.common.save)}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: c.textMuted }}>{t.common.loadingData}</div>
      ) : reports.length === 0 ? (
        <div style={{
          backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`,
        }}>
          <EmptyState icon={FileText} title={t.common.noData} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reports.map(r => (
            <div key={r.id} style={{
              backgroundColor: c.cardBg, borderRadius: '12px',
              border: `1px solid ${c.border}`, padding: isMobile ? '16px' : '20px',
              opacity: r.isActive ? 1 : 0.6,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                      backgroundColor: c.primaryLight, color: c.primary,
                    }}>
                      {TYPE_LABELS[r.reportType] || r.reportType}
                    </span>
                    <span style={{
                      padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                      backgroundColor: c.cardBgHover, color: c.textSecondary,
                    }}>
                      {FREQ_LABELS[r.frequency] || r.frequency}
                      {r.frequency === 'weekly' && r.dayOfWeek !== null ? ` - ${DAY_NAMES[r.dayOfWeek]}` : ''}
                      {r.frequency === 'monthly' && r.dayOfMonth !== null ? ` - Tgl ${r.dayOfMonth}` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: c.textMuted }}>
                    <Mail style={{ width: '13px', height: '13px' }} />
                    {r.emailTo}
                  </div>
                  {r.lastSentAt && (
                    <p style={{ fontSize: '12px', color: c.textLight, margin: '4px 0 0 0' }}>
                      Terakhir dikirim: {new Date(r.lastSentAt).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                  <button
                    onClick={() => handleToggle(r.id, r.isActive)}
                    title={r.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', padding: '6px',
                      borderRadius: '6px', border: 'none', backgroundColor: 'transparent',
                      cursor: 'pointer', color: r.isActive ? c.success : c.textMuted,
                    }}
                  >
                    {r.isActive ? <ToggleRight style={{ width: '22px', height: '22px' }} /> : <ToggleLeft style={{ width: '22px', height: '22px' }} />}
                  </button>
                  <button
                    onClick={() => handleSendNow(r.id)}
                    disabled={sending === r.id}
                    title="Kirim Sekarang"
                    style={{
                      display: 'inline-flex', alignItems: 'center', padding: '6px 10px',
                      borderRadius: '6px', border: `1px solid ${c.border}`,
                      backgroundColor: c.cardBg, cursor: sending === r.id ? 'not-allowed' : 'pointer',
                      color: c.primary, fontSize: '12px', fontWeight: 500, gap: '4px',
                      opacity: sending === r.id ? 0.7 : 1,
                    }}
                  >
                    {sending === r.id ? (
                      <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Send style={{ width: '13px', height: '13px' }} />
                    )}
                    {sending === r.id ? 'Mengirim...' : 'Kirim'}
                  </button>
                  <button
                    onClick={() => openEdit(r)}
                    style={{
                      padding: '6px 10px', borderRadius: '6px',
                      border: `1px solid ${c.border}`, backgroundColor: c.cardBg,
                      color: c.textSecondary, fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    Ubah
                  </button>
                  <button
                    onClick={() => setDeleteReportId(r.id)}
                    title="Hapus"
                    style={{
                      display: 'inline-flex', alignItems: 'center', padding: '6px',
                      borderRadius: '6px', border: 'none', backgroundColor: 'transparent',
                      cursor: 'pointer', color: c.error,
                    }}
                  >
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteReportId}
        onClose={() => setDeleteReportId(null)}
        onConfirm={handleDelete}
        title="Hapus laporan terjadwal?"
        description="Laporan akan dihapus dan tidak akan dikirim lagi."
        confirmLabel="Hapus"
        variant="destructive"
      />
    </div>
  );
}
