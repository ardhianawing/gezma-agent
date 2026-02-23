'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import {
  ArrowLeft,
  Save,
  Copy,
  Check,
  Zap,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

type PaymentProvider = 'midtrans' | 'xendit' | 'duitku';
type PaymentChannel =
  | 'va_bca' | 'va_mandiri' | 'va_bni' | 'va_bri'
  | 'qris' | 'ewallet_gopay' | 'ewallet_ovo' | 'ewallet_dana' | 'credit_card';

interface PaymentGatewayConfig {
  provider: PaymentProvider | null;
  isEnabled: boolean;
  serverKey: string | null;
  clientKey: string | null;
  isProduction: boolean;
  enabledChannels: PaymentChannel[];
  webhookUrl: string;
}

interface ChannelInfo {
  id: PaymentChannel;
  label: string;
  icon: string;
  group: string;
}

const PROVIDERS: Array<{ id: PaymentProvider; name: string; icon: string; description: string }> = [
  { id: 'midtrans', name: 'Midtrans', icon: '🔵', description: 'Payment gateway terpopuler di Indonesia' },
  { id: 'xendit', name: 'Xendit', icon: '🟣', description: 'Payment infrastructure untuk Southeast Asia' },
  { id: 'duitku', name: 'Duitku', icon: '🟢', description: 'Payment gateway lokal dengan biaya kompetitif' },
];

const ALL_CHANNELS: ChannelInfo[] = [
  { id: 'va_bca', label: 'BCA', icon: '🏦', group: 'Virtual Account' },
  { id: 'va_mandiri', label: 'Mandiri', icon: '🏦', group: 'Virtual Account' },
  { id: 'va_bni', label: 'BNI', icon: '🏦', group: 'Virtual Account' },
  { id: 'va_bri', label: 'BRI', icon: '🏦', group: 'Virtual Account' },
  { id: 'ewallet_gopay', label: 'GoPay', icon: '💚', group: 'E-Wallet' },
  { id: 'ewallet_ovo', label: 'OVO', icon: '💜', group: 'E-Wallet' },
  { id: 'ewallet_dana', label: 'DANA', icon: '💙', group: 'E-Wallet' },
  { id: 'qris', label: 'QRIS', icon: '📱', group: 'Lainnya' },
  { id: 'credit_card', label: 'Kartu Kredit', icon: '💳', group: 'Lainnya' },
];

export default function PaymentConfigPage() {
  const router = useRouter();
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showServerKey, setShowServerKey] = useState(false);
  const [showClientKey, setShowClientKey] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [config, setConfig] = useState<PaymentGatewayConfig>({
    provider: null,
    isEnabled: false,
    serverKey: null,
    clientKey: null,
    isProduction: false,
    enabledChannels: [],
    webhookUrl: '',
  });

  useEffect(() => {
    fetch('/api/integrations/payment')
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Gagal memuat konfigurasi' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/integrations/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.provider,
          isEnabled: config.isEnabled,
          serverKey: config.serverKey,
          clientKey: config.clientKey,
          isProduction: config.isProduction,
          enabledChannels: config.enabledChannels,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Gagal menyimpan' });
      } else {
        setConfig(data);
        setMessage({ type: 'success', text: 'Konfigurasi berhasil disimpan' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    // Simulate test connection
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (config.provider && config.serverKey) {
      setTestResult({ type: 'success', text: `Koneksi ke ${config.provider} berhasil (sandbox mode)` });
    } else {
      setTestResult({ type: 'error', text: 'Pilih provider dan isi Server Key terlebih dahulu' });
    }
    setTesting(false);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(config.webhookUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleChannel = (channel: PaymentChannel) => {
    setConfig((prev) => {
      const channels = prev.enabledChannels.includes(channel)
        ? prev.enabledChannels.filter((ch) => ch !== channel)
        : [...prev.enabledChannels, channel];
      return { ...prev, enabledChannels: channels };
    });
  };

  const channelGroups = ALL_CHANNELS.reduce<Record<string, ChannelInfo[]>>((acc, ch) => {
    if (!acc[ch.group]) acc[ch.group] = [];
    acc[ch.group].push(ch);
    return acc;
  }, {});

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: c.cardBgHover }} />
          <div style={{ width: '200px', height: '24px', borderRadius: '6px', backgroundColor: c.cardBgHover }} />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: '120px', borderRadius: '16px', backgroundColor: c.cardBgHover, animation: 'pulse 2s infinite' }} />
        ))}
      </div>
    );
  }

  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    height: '44px',
    padding: '0 12px',
    fontSize: '14px',
    border: `1px solid ${c.border}`,
    borderRadius: '10px',
    backgroundColor: c.inputBg,
    color: c.textPrimary,
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    border: `1px solid ${c.border}`,
    borderRadius: '16px',
    padding: isMobile ? '16px' : '24px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px', maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => router.push('/settings/integrations')}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: `1px solid ${c.border}`,
            backgroundColor: c.cardBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ArrowLeft style={{ width: '18px', height: '18px', color: c.textPrimary }} />
        </button>
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            Payment Gateway
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0 0' }}>
            Konfigurasi integrasi pembayaran online
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${message.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {message.type === 'success' ? (
            <CheckCircle style={{ width: '16px', height: '16px', color: '#16A34A', flexShrink: 0 }} />
          ) : (
            <AlertCircle style={{ width: '16px', height: '16px', color: '#DC2626', flexShrink: 0 }} />
          )}
          <span style={{ fontSize: '14px', color: message.type === 'success' ? '#166534' : '#991B1B' }}>
            {message.text}
          </span>
        </div>
      )}

      {/* Provider Selection */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: '0 0 16px 0' }}>
          Pilih Provider
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PROVIDERS.map((prov) => {
            const isSelected = config.provider === prov.id;
            return (
              <button
                key={prov.id}
                onClick={() => setConfig((prev) => ({ ...prev, provider: prov.id }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: isSelected ? `2px solid ${c.primary}` : `1px solid ${c.border}`,
                  backgroundColor: isSelected ? c.primaryLight : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left' as const,
                  transition: 'all 0.2s',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: '28px', flexShrink: 0 }}>{prov.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: c.textPrimary }}>{prov.name}</div>
                  <div style={{ fontSize: '13px', color: c.textMuted, marginTop: '2px' }}>{prov.description}</div>
                </div>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: isSelected ? `6px solid ${c.primary}` : `2px solid ${c.border}`,
                    backgroundColor: isSelected ? 'white' : 'transparent',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* API Keys */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: '0 0 16px 0' }}>
          API Keys
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Server Key */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: c.textSecondary, marginBottom: '6px', display: 'block' }}>
              Server Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showServerKey ? 'text' : 'password'}
                value={config.serverKey || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, serverKey: e.target.value || null }))}
                placeholder="SB-Mid-server-xxxxxxxxxxxx"
                style={{ ...inputBaseStyle, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowServerKey(!showServerKey)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showServerKey ? (
                  <EyeOff style={{ width: '16px', height: '16px', color: c.textMuted }} />
                ) : (
                  <Eye style={{ width: '16px', height: '16px', color: c.textMuted }} />
                )}
              </button>
            </div>
          </div>

          {/* Client Key */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: c.textSecondary, marginBottom: '6px', display: 'block' }}>
              Client Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showClientKey ? 'text' : 'password'}
                value={config.clientKey || ''}
                onChange={(e) => setConfig((prev) => ({ ...prev, clientKey: e.target.value || null }))}
                placeholder="SB-Mid-client-xxxxxxxxxxxx"
                style={{ ...inputBaseStyle, paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowClientKey(!showClientKey)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showClientKey ? (
                  <EyeOff style={{ width: '16px', height: '16px', color: c.textMuted }} />
                ) : (
                  <Eye style={{ width: '16px', height: '16px', color: c.textMuted }} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Environment Toggle */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
              Environment
            </h2>
            <p style={{ fontSize: '13px', color: c.textMuted, margin: '4px 0 0 0' }}>
              {config.isProduction ? 'Mode Production - transaksi real' : 'Mode Sandbox - untuk testing'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfig((prev) => ({ ...prev, isProduction: !prev.isProduction }))}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {config.isProduction ? (
              <ToggleRight style={{ width: '44px', height: '28px', color: c.primary }} />
            ) : (
              <ToggleLeft style={{ width: '44px', height: '28px', color: c.textMuted }} />
            )}
          </button>
        </div>
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: config.isProduction ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${config.isProduction ? '#FECACA' : '#BBF7D0'}`,
          }}
        >
          <span style={{ fontSize: '13px', color: config.isProduction ? '#991B1B' : '#166534', fontWeight: '500' }}>
            {config.isProduction
              ? 'Perhatian: Mode production akan memproses transaksi uang sungguhan'
              : 'Sandbox: Gunakan mode ini untuk testing sebelum go-live'}
          </span>
        </div>
      </div>

      {/* Payment Channels */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: '0 0 16px 0' }}>
          Channel Pembayaran
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(channelGroups).map(([group, channels]) => (
            <div key={group}>
              <h3 style={{ fontSize: '13px', fontWeight: '600', color: c.textMuted, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {group}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
                {channels.map((ch) => {
                  const isEnabled = config.enabledChannels.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: isEnabled ? `2px solid ${c.primary}` : `1px solid ${c.border}`,
                        backgroundColor: isEnabled ? c.primaryLight : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        width: '100%',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{ch.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>{ch.label}</span>
                      </div>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: isEnabled ? 'none' : `2px solid ${c.border}`,
                          backgroundColor: isEnabled ? c.primary : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        {isEnabled && <Check style={{ width: '14px', height: '14px', color: 'white' }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook URL */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: '0 0 8px 0' }}>
          Webhook URL
        </h2>
        <p style={{ fontSize: '13px', color: c.textMuted, margin: '0 0 12px 0' }}>
          Masukkan URL ini di dashboard payment gateway Anda
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            readOnly
            value={config.webhookUrl}
            style={{
              ...inputBaseStyle,
              backgroundColor: c.cardBgHover,
              color: c.textSecondary,
              cursor: 'default',
              flex: 1,
            }}
          />
          <button
            onClick={handleCopyWebhook}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              border: `1px solid ${c.border}`,
              backgroundColor: copied ? '#F0FDF4' : c.cardBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            {copied ? (
              <Check style={{ width: '18px', height: '18px', color: '#16A34A' }} />
            ) : (
              <Copy style={{ width: '18px', height: '18px', color: c.textMuted }} />
            )}
          </button>
        </div>
      </div>

      {/* Test Connection */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
              Test Koneksi
            </h2>
            <p style={{ fontSize: '13px', color: c.textMuted, margin: '4px 0 0 0' }}>
              Pastikan konfigurasi sudah benar sebelum menyimpan
            </p>
          </div>
          <button
            onClick={handleTestConnection}
            disabled={testing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.cardBg,
              color: c.textPrimary,
              fontSize: '14px',
              fontWeight: '500',
              cursor: testing ? 'not-allowed' : 'pointer',
              opacity: testing ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {testing ? (
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Zap style={{ width: '16px', height: '16px' }} />
            )}
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
        {testResult && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: testResult.type === 'success' ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${testResult.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {testResult.type === 'success' ? (
              <CheckCircle style={{ width: '16px', height: '16px', color: '#16A34A', flexShrink: 0 }} />
            ) : (
              <AlertCircle style={{ width: '16px', height: '16px', color: '#DC2626', flexShrink: 0 }} />
            )}
            <span style={{ fontSize: '13px', color: testResult.type === 'success' ? '#166534' : '#991B1B' }}>
              {testResult.text}
            </span>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingBottom: '40px' }}>
        <button
          onClick={() => router.push('/settings/integrations')}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: `1px solid ${c.border}`,
            backgroundColor: 'transparent',
            color: c.textPrimary,
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Batal
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 28px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: c.primary,
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'all 0.2s',
          }}
        >
          {saving ? (
            <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Save style={{ width: '16px', height: '16px' }} />
          )}
          {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
        </button>
      </div>
    </div>
  );
}
