'use client';

import { useState, useEffect, useMemo, CSSProperties } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';
import {
  ArrowLeft,
  MessageCircle,
  Send,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  CheckSquare,
  Square,
  AlertCircle,
  Plane,
} from 'lucide-react';

const WA_GREEN = '#25D366';
const WA_GREEN_DARK = '#128C7E';

interface WATemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  variables: string[];
  isActive: boolean;
}

interface Recipient {
  pilgrimId: string;
  name: string;
  phone: string;
  status: string;
  selected: boolean;
}

interface BroadcastResult {
  status: 'completed' | 'partial';
  totalSent: number;
  totalFailed: number;
}

// Mock trip data
const MOCK_TRIP = {
  id: '',
  name: 'Umrah Reguler - Maret 2026',
  departureDate: '2026-03-15',
  status: 'confirmed',
  pilgrimCount: 12,
};

// Mock pilgrims for the trip
const MOCK_PILGRIMS: Omit<Recipient, 'selected'>[] = [
  { pilgrimId: 'plg-001', name: 'Ahmad Fauzi', phone: '+6281234567890', status: 'confirmed' },
  { pilgrimId: 'plg-002', name: 'Siti Aminah', phone: '+6281234567891', status: 'confirmed' },
  { pilgrimId: 'plg-003', name: 'Muhammad Rizki', phone: '+6281234567892', status: 'confirmed' },
  { pilgrimId: 'plg-004', name: 'Fatimah Zahra', phone: '+6281234567893', status: 'confirmed' },
  { pilgrimId: 'plg-005', name: 'Abdul Rahman', phone: '+6281234567894', status: 'pending_payment' },
  { pilgrimId: 'plg-006', name: 'Nur Hidayah', phone: '+6281234567895', status: 'confirmed' },
  { pilgrimId: 'plg-007', name: 'Hasan Basri', phone: '+6281234567896', status: 'confirmed' },
  { pilgrimId: 'plg-008', name: 'Aisyah Putri', phone: '+6281234567897', status: 'pending_document' },
  { pilgrimId: 'plg-009', name: 'Umar Faruq', phone: '+6281234567898', status: 'confirmed' },
  { pilgrimId: 'plg-010', name: 'Khadijah Sari', phone: '+6281234567899', status: 'confirmed' },
  { pilgrimId: 'plg-011', name: 'Ibrahim Malik', phone: '+6281234567800', status: 'confirmed' },
  { pilgrimId: 'plg-012', name: 'Maryam Husna', phone: '+6281234567801', status: 'pending_payment' },
];

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Terkonfirmasi',
  pending_payment: 'Menunggu Bayar',
  pending_document: 'Menunggu Dokumen',
  cancelled: 'Dibatalkan',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: '#F0FDF4', text: '#16A34A' },
  pending_payment: { bg: '#FFFBEB', text: '#D97706' },
  pending_document: { bg: '#EFF6FF', text: '#2563EB' },
  cancelled: { bg: '#FEF2F2', text: '#DC2626' },
};

export default function BroadcastPage() {
  const params = useParams();
  const router = useRouter();
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const tripId = params.id as string;

  // State
  const [templates, setTemplates] = useState<WATemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [broadcastResult, setBroadcastResult] = useState<BroadcastResult | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const trip = { ...MOCK_TRIP, id: tripId };

  useEffect(() => {
    fetchTemplates();
    setRecipients(MOCK_PILGRIMS.map((p) => ({ ...p, selected: true })));
  }, []);

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/integrations/whatsapp/templates');
      const json = await res.json();
      if (json.data) {
        setTemplates(json.data.filter((t: WATemplate) => t.isActive));
      }
    } catch {
      // ignore
    }
  }

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const selectedRecipients = useMemo(
    () => recipients.filter((r) => r.selected),
    [recipients]
  );

  const allSelected = recipients.length > 0 && recipients.every((r) => r.selected);

  function toggleAll() {
    const newVal = !allSelected;
    setRecipients((prev) => prev.map((r) => ({ ...r, selected: newVal })));
  }

  function toggleRecipient(pilgrimId: string) {
    setRecipients((prev) =>
      prev.map((r) => (r.pilgrimId === pilgrimId ? { ...r, selected: !r.selected } : r))
    );
  }

  function getPreviewMessage(template: WATemplate, recipientName: string): string {
    let msg = template.content;
    msg = msg.replace(/\{\{nama\}\}/g, recipientName);
    msg = msg.replace(/\{\{tanggal\}\}/g, new Date(trip.departureDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    msg = msg.replace(/\{\{status\}\}/g, 'Terkonfirmasi');
    msg = msg.replace(/\{\{sisa_bayar\}\}/g, '5.000.000');
    msg = msg.replace(/\{\{kode_booking\}\}/g, 'UMR-2026-0315');
    return msg;
  }

  async function handleSendBroadcast() {
    if (!selectedTemplate || selectedRecipients.length === 0) return;

    setSending(true);
    setSendProgress(0);
    setBroadcastResult(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setSendProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 20;
      });
    }, 300);

    try {
      const res = await fetch('/api/integrations/whatsapp/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          templateContent: selectedTemplate.content,
          recipients: selectedRecipients.map((r) => ({
            phone: r.phone,
            name: r.name,
            pilgrimId: r.pilgrimId,
          })),
        }),
      });

      clearInterval(progressInterval);
      setSendProgress(100);

      const json = await res.json();
      if (json.data) {
        setBroadcastResult({
          status: json.data.status,
          totalSent: json.data.totalSent,
          totalFailed: json.data.totalFailed,
        });
      }
    } catch {
      clearInterval(progressInterval);
      setBroadcastResult({
        status: 'partial',
        totalSent: 0,
        totalFailed: selectedRecipients.length,
      });
    } finally {
      setSending(false);
    }
  }

  // Styles
  const cardStyle: CSSProperties = {
    backgroundColor: c.cardBg,
    border: '1px solid ' + c.border,
    borderRadius: '16px',
    padding: isMobile ? '16px' : '24px',
    marginBottom: '20px',
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid ' + c.border,
    backgroundColor: c.inputBg,
    color: c.textPrimary,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const btnPrimary = (id: string, customBg?: string): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: customBg || c.primary,
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    transform: hoveredBtn === id ? 'translateY(-2px)' : 'none',
    boxShadow: hoveredBtn === id ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
  });

  return (
    <div style={{ padding: isMobile ? '16px' : '32px', minHeight: '100vh', backgroundColor: c.pageBg }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <button
          onClick={() => router.push(`/trips/${tripId}`)}
          onMouseEnter={() => setHoveredBtn('back')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: '1px solid ' + c.border,
            backgroundColor: hoveredBtn === 'back' ? c.cardBgHover : c.cardBg,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowLeft size={20} color={c.textSecondary} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: WA_GREEN,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageCircle size={22} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: c.textPrimary, margin: 0 }}>
                {t.trips.title}
              </h1>
              <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>
                {t.trips.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Info Card */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: c.primaryLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plane size={24} color={c.primary} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: c.textPrimary, margin: '0 0 4px 0' }}>
              {trip.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: c.textMuted }}>
                <Calendar size={14} />
                {new Date(trip.departureDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: c.textMuted }}>
                <Users size={14} />
                {trip.pilgrimCount} jamaah
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
        {/* Left: Template & Preview */}
        <div>
          {/* Template Selector */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: c.textPrimary, margin: '0 0 14px 0' }}>
              {t.common.select || "Select Template"}
            </h3>

            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: 'none',
                  paddingRight: '36px',
                  cursor: 'pointer',
                }}
              >
                <option value="">Pilih template...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.type})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                color={c.textMuted}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
            </div>

            {/* Preview */}
            {selectedTemplate && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: c.textSecondary, margin: '0 0 10px 0' }}>
                  Preview Pesan
                </h4>
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#ECE5DD',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#DCF8C6',
                      maxWidth: '85%',
                      marginLeft: 'auto',
                      position: 'relative',
                    }}
                  >
                    <p style={{ fontSize: '13px', color: '#303030', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {getPreviewMessage(
                        selectedTemplate,
                        selectedRecipients.length > 0 ? selectedRecipients[0].name : 'Ahmad Fauzi'
                      )}
                    </p>
                    <span style={{ fontSize: '10px', color: '#8C8C8C', float: 'right', marginTop: '4px' }}>
                      {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: c.textMuted, margin: '8px 0 0 0' }}>
                  Variabel akan diganti otomatis per penerima
                </p>
              </div>
            )}
          </div>

          {/* Send Button & Results */}
          <div style={cardStyle}>
            <button
              onClick={handleSendBroadcast}
              disabled={sending || !selectedTemplate || selectedRecipients.length === 0}
              onMouseEnter={() => setHoveredBtn('broadcast')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                ...btnPrimary('broadcast', WA_GREEN),
                width: '100%',
                justifyContent: 'center',
                padding: '14px 24px',
                fontSize: '15px',
                opacity: sending || !selectedTemplate || selectedRecipients.length === 0 ? 0.5 : 1,
                cursor: sending || !selectedTemplate || selectedRecipients.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {sending ? (
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Send size={18} />
              )}
              {sending
                ? 'Mengirim Broadcast...'
                : `Kirim ke ${selectedRecipients.length} Penerima`}
            </button>

            {/* Progress Bar */}
            {sending && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: c.textMuted }}>Mengirim pesan...</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: WA_GREEN }}>
                    {Math.round(sendProgress)}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: c.borderLight,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${sendProgress}%`,
                      height: '100%',
                      borderRadius: '4px',
                      backgroundColor: WA_GREEN,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Broadcast Result */}
            {broadcastResult && !sending && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: broadcastResult.totalFailed === 0 ? '#F0FDF4' : '#FFFBEB',
                  border: '1px solid ' + (broadcastResult.totalFailed === 0 ? '#BBF7D0' : '#FDE68A'),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  {broadcastResult.totalFailed === 0 ? (
                    <CheckCircle size={20} color={WA_GREEN} />
                  ) : (
                    <AlertCircle size={20} color="#D97706" />
                  )}
                  <span style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary }}>
                    {broadcastResult.totalFailed === 0 ? 'Broadcast Berhasil!' : 'Broadcast Sebagian Berhasil'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#F0FDF4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckCircle size={16} color="#16A34A" />
                    </div>
                    <div>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#16A34A' }}>
                        {broadcastResult.totalSent}
                      </span>
                      <p style={{ fontSize: '11px', color: c.textMuted, margin: 0 }}>Terkirim</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#FEF2F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <XCircle size={16} color="#DC2626" />
                    </div>
                    <div>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#DC2626' }}>
                        {broadcastResult.totalFailed}
                      </span>
                      <p style={{ fontSize: '11px', color: c.textMuted, margin: 0 }}>Gagal</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recipient List */}
        <div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
                {t.trips.title}
              </h3>
              <span style={{ fontSize: '12px', color: c.textMuted }}>
                {selectedRecipients.length} / {recipients.length} dipilih
              </span>
            </div>

            {/* Select All */}
            <button
              onClick={toggleAll}
              onMouseEnter={() => setHoveredBtn('select-all')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid ' + c.border,
                backgroundColor: hoveredBtn === 'select-all' ? c.cardBgHover : 'transparent',
                cursor: 'pointer',
                width: '100%',
                marginBottom: '12px',
                transition: 'all 0.15s ease',
              }}
            >
              {allSelected ? (
                <CheckSquare size={18} color={WA_GREEN} />
              ) : (
                <Square size={18} color={c.textMuted} />
              )}
              <span style={{ fontSize: '13px', fontWeight: 500, color: c.textPrimary }}>
                {allSelected ? 'Batalkan Semua' : 'Pilih Semua'}
              </span>
            </button>

            {/* Recipient Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '460px', overflowY: 'auto' }}>
              {recipients.map((r) => {
                const statusStyle = STATUS_COLORS[r.status] || STATUS_COLORS.confirmed;
                return (
                  <div
                    key={r.pilgrimId}
                    onClick={() => toggleRecipient(r.pilgrimId)}
                    onMouseEnter={() => setHoveredRow(r.pilgrimId)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      backgroundColor: hoveredRow === r.pilgrimId ? c.cardBgHover : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {r.selected ? (
                      <CheckSquare size={18} color={WA_GREEN} style={{ flexShrink: 0 }} />
                    ) : (
                      <Square size={18} color={c.textLight} style={{ flexShrink: 0 }} />
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: c.textPrimary, display: 'block' }}>
                        {r.name}
                      </span>
                      <span style={{ fontSize: '11px', color: c.textMuted }}>
                        {r.phone}
                      </span>
                    </div>

                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: 600,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        flexShrink: 0,
                      }}
                    >
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
