'use client';

import { useState, useEffect, CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/components/ui/toast';
import {
  ArrowLeft,
  MessageCircle,
  Save,
  Wifi,
  WifiOff,
  Send,
  CheckCircle,
  XCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Edit3,
  Check,
  X,
  Info,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

type WAProvider = 'fonnte' | 'wablas' | 'official';

interface WAConfig {
  provider: WAProvider | null;
  isEnabled: boolean;
  apiKey: string | null;
  senderNumber: string | null;
  lastTestAt: string | null;
  isConnected: boolean;
}

interface WATemplate {
  id: string;
  name: string;
  type: 'reminder' | 'status_update' | 'payment' | 'departure' | 'welcome' | 'custom';
  content: string;
  variables: string[];
  isActive: boolean;
}

const WA_GREEN = '#25D366';
const WA_GREEN_DARK = '#128C7E';
const WA_GREEN_LIGHT = '#DCF8C6';

const PROVIDER_OPTIONS: { value: WAProvider; label: string; description: string }[] = [
  { value: 'fonnte', label: 'Fonnte', description: 'API WhatsApp lokal Indonesia, mudah digunakan' },
  { value: 'wablas', label: 'Wablas', description: 'WhatsApp gateway populer, fitur lengkap' },
  { value: 'official', label: 'Official WA Business API', description: 'API resmi Meta, perlu verifikasi bisnis' },
];

const TYPE_LABELS: Record<string, string> = {
  welcome: 'Selamat Datang',
  payment: 'Pembayaran',
  status_update: 'Update Status',
  departure: 'Keberangkatan',
  reminder: 'Pengingat',
  custom: 'Custom',
};

const TYPE_COLORS: Record<string, string> = {
  welcome: '#16A34A',
  payment: '#D97706',
  status_update: '#2563EB',
  departure: '#7C3AED',
  reminder: '#DC2626',
  custom: '#6B7280',
};

export default function WhatsAppSettingsPage() {
  const router = useRouter();
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { addToast } = useToast();

  // Config state
  const [config, setConfig] = useState<WAConfig>({
    provider: null,
    isEnabled: false,
    apiKey: null,
    senderNumber: null,
    lastTestAt: null,
    isConnected: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Connection test
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Templates
  const [templates, setTemplates] = useState<WATemplate[]>([]);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Quick send
  const [quickPhone, setQuickPhone] = useState('');
  const [quickMessage, setQuickMessage] = useState('');
  const [quickSending, setQuickSending] = useState(false);
  const [quickResult, setQuickResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Hover states
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
    fetchTemplates();
  }, []);

  async function fetchConfig() {
    try {
      const res = await fetch('/api/integrations/whatsapp');
      const json = await res.json();
      if (json.data) setConfig(json.data);
    } catch {
      addToast({ type: 'error', title: 'Gagal memuat konfigurasi WhatsApp' });
    } finally {
      setLoading(false);
    }
  }

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/integrations/whatsapp/templates');
      const json = await res.json();
      if (json.data) setTemplates(json.data);
    } catch {
      addToast({ type: 'error', title: 'Gagal memuat template WhatsApp' });
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/integrations/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.provider,
          isEnabled: config.isEnabled,
          apiKey: config.apiKey,
          senderNumber: config.senderNumber,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveMessage({ type: 'error', text: json.error || 'Gagal menyimpan' });
      } else {
        setConfig(json.data);
        setSaveMessage({ type: 'success', text: 'Konfigurasi berhasil disimpan' });
        addToast({ type: 'success', title: 'Konfigurasi berhasil disimpan' });
      }
    } catch {
      setSaveMessage({ type: 'error', text: 'Terjadi kesalahan' });
      addToast({ type: 'error', title: 'Gagal menyimpan konfigurasi' });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/integrations/whatsapp/test', { method: 'POST' });
      const json = await res.json();
      if (json.data) {
        setTestResult(json.data);
        if (json.data.success) {
          setConfig((prev) => ({ ...prev, isConnected: true, lastTestAt: new Date().toISOString() }));
        }
      }
    } catch {
      setTestResult({ success: false, message: 'Gagal menguji koneksi' });
      addToast({ type: 'error', title: 'Gagal menguji koneksi' });
    } finally {
      setTesting(false);
    }
  }

  async function handleQuickSend() {
    if (!quickPhone || !quickMessage) return;
    setQuickSending(true);
    setQuickResult(null);
    try {
      const res = await fetch('/api/integrations/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: quickPhone, content: quickMessage }),
      });
      const json = await res.json();
      if (!res.ok) {
        setQuickResult({ type: 'error', text: json.error || 'Gagal mengirim' });
      } else if (json.data?.status === 'failed') {
        setQuickResult({ type: 'error', text: json.data.error || 'Gagal mengirim pesan' });
      } else {
        setQuickResult({ type: 'success', text: 'Pesan berhasil dikirim!' });
        addToast({ type: 'success', title: 'Pesan berhasil dikirim' });
        setQuickPhone('');
        setQuickMessage('');
      }
    } catch {
      setQuickResult({ type: 'error', text: 'Terjadi kesalahan' });
      addToast({ type: 'error', title: 'Gagal mengirim pesan' });
    } finally {
      setQuickSending(false);
    }
  }

  function handleTemplateToggle(id: string) {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
    );
  }

  function handleEditTemplate(id: string) {
    const tpl = templates.find((t) => t.id === id);
    if (tpl) {
      setEditingTemplateId(id);
      setEditContent(tpl.content);
    }
  }

  function handleSaveTemplate() {
    if (!editingTemplateId) return;
    setTemplates((prev) =>
      prev.map((t) => (t.id === editingTemplateId ? { ...t, content: editContent } : t))
    );
    setEditingTemplateId(null);
    setEditContent('');
  }

  function handleCancelEdit() {
    setEditingTemplateId(null);
    setEditContent('');
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

  const labelStyle: CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: c.textSecondary,
    marginBottom: '6px',
  };

  const btnPrimary = (id: string, customBg?: string): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
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

  const btnOutline = (id: string): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid ' + c.border,
    backgroundColor: hoveredBtn === id ? c.cardBgHover : 'transparent',
    color: c.textSecondary,
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  if (loading) {
    return (
      <div style={{ padding: isMobile ? '16px' : '32px', minHeight: '100vh', backgroundColor: c.pageBg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <Loader2 size={32} color={WA_GREEN} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '16px' : '32px', minHeight: '100vh', backgroundColor: c.pageBg }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <button
          onClick={() => router.push('/settings')}
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
                Integrasi WhatsApp
              </h1>
              <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>
                Konfigurasi API WhatsApp untuk notifikasi jamaah
              </p>
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: config.isConnected ? '#F0FDF4' : c.errorLight,
            border: '1px solid ' + (config.isConnected ? '#BBF7D0' : '#FECACA'),
          }}
        >
          {config.isConnected ? (
            <Wifi size={14} color={WA_GREEN} />
          ) : (
            <WifiOff size={14} color={c.error} />
          )}
          <span style={{ fontSize: '12px', fontWeight: 600, color: config.isConnected ? WA_GREEN_DARK : c.error }}>
            {config.isConnected ? 'Terhubung' : 'Tidak Terhubung'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
        {/* Left Column: Configuration */}
        <div>
          {/* Provider & Connection */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 20px 0' }}>
              Konfigurasi Provider
            </h2>

            {/* Enable Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary }}>Aktifkan WhatsApp</span>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
                  Aktifkan integrasi WhatsApp untuk mengirim notifikasi
                </p>
              </div>
              <button
                onClick={() => setConfig((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {config.isEnabled ? (
                  <ToggleRight size={36} color={WA_GREEN} />
                ) : (
                  <ToggleLeft size={36} color={c.textLight} />
                )}
              </button>
            </div>

            {/* Provider Select */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Provider WhatsApp</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={config.provider || ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, provider: (e.target.value || null) as WAProvider | null }))}
                  style={{
                    ...inputStyle,
                    appearance: 'none',
                    paddingRight: '36px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Pilih provider...</option>
                  {PROVIDER_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  color={c.textMuted}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
              </div>
              {config.provider && (
                <p style={{ fontSize: '12px', color: c.textMuted, margin: '6px 0 0 0' }}>
                  {PROVIDER_OPTIONS.find((p) => p.value === config.provider)?.description}
                </p>
              )}
            </div>

            {/* API Key */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>API Key</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={config.apiKey || ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Masukkan API key dari provider..."
                  style={{ ...inputStyle, paddingRight: '40px' }}
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  {showApiKey ? <EyeOff size={16} color={c.textMuted} /> : <Eye size={16} color={c.textMuted} />}
                </button>
              </div>
            </div>

            {/* Sender Number */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Nomor Pengirim</label>
              <input
                type="text"
                value={config.senderNumber || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, senderNumber: e.target.value }))}
                placeholder="+628123456789"
                style={inputStyle}
              />
              <p style={{ fontSize: '11px', color: c.textMuted, margin: '4px 0 0 0' }}>
                Gunakan format internasional: +62xxx
              </p>
            </div>

            {/* Test Connection */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleTestConnection}
                disabled={testing || !config.provider || !config.apiKey}
                onMouseEnter={() => setHoveredBtn('test')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...btnPrimary('test', WA_GREEN),
                  opacity: testing || !config.provider || !config.apiKey ? 0.5 : 1,
                  cursor: testing || !config.provider || !config.apiKey ? 'not-allowed' : 'pointer',
                }}
              >
                {testing ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Wifi size={16} />
                )}
                {testing ? 'Menguji...' : 'Test Koneksi'}
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                onMouseEnter={() => setHoveredBtn('save')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...btnPrimary('save'),
                  opacity: saving ? 0.5 : 1,
                }}
              >
                {saving ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>

            {/* Test Result */}
            {testResult && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: testResult.success ? '#F0FDF4' : c.errorLight,
                  border: '1px solid ' + (testResult.success ? '#BBF7D0' : '#FECACA'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                {testResult.success ? (
                  <CheckCircle size={18} color={WA_GREEN} />
                ) : (
                  <XCircle size={18} color={c.error} />
                )}
                <span style={{ fontSize: '13px', color: testResult.success ? WA_GREEN_DARK : c.error, fontWeight: 500 }}>
                  {testResult.message}
                </span>
              </div>
            )}

            {/* Save Message */}
            {saveMessage && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: saveMessage.type === 'success' ? '#F0FDF4' : c.errorLight,
                  border: '1px solid ' + (saveMessage.type === 'success' ? '#BBF7D0' : '#FECACA'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                {saveMessage.type === 'success' ? (
                  <CheckCircle size={18} color={WA_GREEN} />
                ) : (
                  <XCircle size={18} color={c.error} />
                )}
                <span
                  style={{
                    fontSize: '13px',
                    color: saveMessage.type === 'success' ? WA_GREEN_DARK : c.error,
                    fontWeight: 500,
                  }}
                >
                  {saveMessage.text}
                </span>
              </div>
            )}

            {/* Last Test */}
            {config.lastTestAt && (
              <p style={{ fontSize: '11px', color: c.textMuted, marginTop: '10px' }}>
                Terakhir diuji: {new Date(config.lastTestAt).toLocaleString('id-ID')}
              </p>
            )}
          </div>

          {/* Quick Send */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={18} color={WA_GREEN} />
              Kirim Cepat
            </h2>
            <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 16px 0' }}>
              Kirim pesan WhatsApp langsung untuk testing
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Nomor Tujuan</label>
              <input
                type="text"
                value={quickPhone}
                onChange={(e) => setQuickPhone(e.target.value)}
                placeholder="+628123456789"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Pesan</label>
              <textarea
                value={quickMessage}
                onChange={(e) => setQuickMessage(e.target.value)}
                placeholder="Tulis pesan Anda..."
                rows={4}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <button
              onClick={handleQuickSend}
              disabled={quickSending || !quickPhone || !quickMessage}
              onMouseEnter={() => setHoveredBtn('quick-send')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                ...btnPrimary('quick-send', WA_GREEN),
                opacity: quickSending || !quickPhone || !quickMessage ? 0.5 : 1,
                cursor: quickSending || !quickPhone || !quickMessage ? 'not-allowed' : 'pointer',
              }}
            >
              {quickSending ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Send size={16} />
              )}
              {quickSending ? 'Mengirim...' : 'Kirim Pesan Test'}
            </button>

            {quickResult && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: quickResult.type === 'success' ? '#F0FDF4' : c.errorLight,
                  border: '1px solid ' + (quickResult.type === 'success' ? '#BBF7D0' : '#FECACA'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                {quickResult.type === 'success' ? (
                  <CheckCircle size={18} color={WA_GREEN} />
                ) : (
                  <XCircle size={18} color={c.error} />
                )}
                <span
                  style={{
                    fontSize: '13px',
                    color: quickResult.type === 'success' ? WA_GREEN_DARK : c.error,
                    fontWeight: 500,
                  }}
                >
                  {quickResult.text}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Templates */}
        <div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
                Template Pesan
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  backgroundColor: c.infoLight,
                }}
              >
                <Info size={12} color={c.info} />
                <span style={{ fontSize: '11px', color: c.info, fontWeight: 500 }}>
                  {templates.filter((t) => t.isActive).length} aktif
                </span>
              </div>
            </div>

            {/* Variables Reference */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: WA_GREEN_LIGHT,
                border: '1px solid #BBF7D0',
                marginBottom: '16px',
              }}
            >
              <p style={{ fontSize: '12px', fontWeight: 600, color: WA_GREEN_DARK, margin: '0 0 6px 0' }}>
                Variabel yang tersedia:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['{{nama}}', '{{tanggal}}', '{{status}}', '{{sisa_bayar}}', '{{kode_booking}}'].map((v) => (
                  <span
                    key={v}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #BBF7D0',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: WA_GREEN_DARK,
                    }}
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* Template List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid ' + (editingTemplateId === tpl.id ? WA_GREEN : c.borderLight),
                    backgroundColor: editingTemplateId === tpl.id ? (c.pageBg) : c.cardBg,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Template Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary }}>
                        {tpl.name}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          backgroundColor: TYPE_COLORS[tpl.type] || '#6B7280',
                        }}
                      >
                        {TYPE_LABELS[tpl.type] || tpl.type}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {editingTemplateId === tpl.id ? (
                        <>
                          <button
                            onClick={handleSaveTemplate}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: WA_GREEN,
                              cursor: 'pointer',
                            }}
                          >
                            <Check size={14} color="#FFFFFF" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid ' + c.border,
                              backgroundColor: c.cardBg,
                              cursor: 'pointer',
                            }}
                          >
                            <X size={14} color={c.textMuted} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditTemplate(tpl.id)}
                            onMouseEnter={() => setHoveredBtn('edit-' + tpl.id)}
                            onMouseLeave={() => setHoveredBtn(null)}
                            style={btnOutline('edit-' + tpl.id)}
                          >
                            <Edit3 size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleTemplateToggle(tpl.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            {tpl.isActive ? (
                              <ToggleRight size={28} color={WA_GREEN} />
                            ) : (
                              <ToggleLeft size={28} color={c.textLight} />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Template Content */}
                  {editingTemplateId === tpl.id ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={6}
                      style={{
                        ...inputStyle,
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                        lineHeight: '1.5',
                      }}
                    />
                  ) : (
                    <p
                      style={{
                        fontSize: '12px',
                        color: c.textMuted,
                        margin: 0,
                        lineHeight: '1.5',
                        whiteSpace: 'pre-line',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {tpl.content}
                    </p>
                  )}

                  {/* Variables used */}
                  {editingTemplateId !== tpl.id && tpl.variables.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {tpl.variables.map((v) => (
                        <span
                          key={v}
                          style={{
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontFamily: 'monospace',
                            backgroundColor: c.borderLight,
                            color: c.textMuted,
                          }}
                        >
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
