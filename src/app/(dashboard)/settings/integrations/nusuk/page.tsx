'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { PageHeader } from '@/components/layout/page-header';
import { BackButton } from '@/components/shared/back-button';
import {
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

interface NusukConfigData {
  isEnabled: boolean;
  apiKey: string | null;
  baseUrl: string;
  lastSyncAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
}

export default function NusukIntegrationPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const [config, setConfig] = useState<NusukConfigData>({
    isEnabled: false,
    apiKey: null,
    baseUrl: 'https://api.nusuk.sa/v1',
    lastSyncAt: null,
    syncStatus: 'idle',
  });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [baseUrlInput, setBaseUrlInput] = useState('https://api.nusuk.sa/v1');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; errors: number } | null>(null);

  // Feature toggles
  const [hotelSync, setHotelSync] = useState(true);
  const [visaSubmission, setVisaSubmission] = useState(true);
  const [statusTracking, setStatusTracking] = useState(true);

  useEffect(() => {
    fetch('/api/integrations/nusuk')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          const data = json.data as NusukConfigData;
          setConfig(data);
          setApiKeyInput(data.apiKey || '');
          setBaseUrlInput(data.baseUrl);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/integrations/nusuk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKeyInput,
          baseUrl: baseUrlInput,
          isEnabled: config.isEnabled,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveMessage({ type: 'error', text: json.error || 'Gagal menyimpan konfigurasi' });
      } else {
        setConfig(json.data);
        setSaveMessage({ type: 'success', text: 'Konfigurasi berhasil disimpan' });
      }
    } catch {
      setSaveMessage({ type: 'error', text: 'Terjadi kesalahan jaringan' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    // Mock: always succeeds after 1s delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTestResult({ type: 'success', text: 'Koneksi berhasil! API Nusuk merespons dengan benar.' });
    setTesting(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    // Mock sync
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSyncResult({ synced: 42, errors: 0 });
    setConfig((prev) => ({
      ...prev,
      lastSyncAt: new Date().toISOString(),
      syncStatus: 'success',
    }));
    setSyncing(false);
  };

  const handleToggleEnabled = async () => {
    const newEnabled = !config.isEnabled;
    setConfig((prev) => ({ ...prev, isEnabled: newEnabled }));
    try {
      await fetch('/api/integrations/nusuk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: newEnabled }),
      });
    } catch {
      setConfig((prev) => ({ ...prev, isEnabled: !newEnabled }));
    }
  };

  const maskedKey = apiKeyInput
    ? apiKeyInput.slice(0, 4) + '\u2022'.repeat(Math.max(0, apiKeyInput.length - 8)) + apiKeyInput.slice(-4)
    : '';

  const cardStyle = {
    backgroundColor: c.cardBg,
    border: '1px solid ' + c.border,
    borderRadius: '16px',
    padding: '20px',
  };

  const labelStyle = {
    fontSize: '13px' as const,
    fontWeight: '500' as const,
    color: c.textSecondary,
    marginBottom: '6px',
    display: 'block' as const,
  };

  const inputStyle = {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    fontSize: '14px',
    border: '1px solid ' + c.border,
    borderRadius: '10px',
    backgroundColor: c.inputBg,
    color: c.textPrimary,
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const ToggleSwitch = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: '44px',
        height: '24px',
        backgroundColor: value ? c.primary : c.border,
        borderRadius: '12px',
        position: 'relative',
        cursor: 'pointer',
        border: 'none',
        padding: 0,
        transition: 'background-color 0.2s',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: value ? '22px' : '2px',
          width: '20px',
          height: '20px',
          backgroundColor: 'white',
          borderRadius: '50%',
          transition: 'left 0.2s',
          border: value ? 'none' : '1px solid ' + c.border,
        }}
      />
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <BackButton href="/settings/integrations" />
        <PageHeader
          title="Nusuk API"
          description="Konfigurasi integrasi dengan platform Nusuk Saudi Arabia"
        />
      </div>

      {/* Enable/Disable Toggle */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: config.isEnabled ? c.successLight : c.cardBgHover,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
          >
            {'\u{1f54b}'}
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
              Integrasi Nusuk
            </p>
            <p style={{ fontSize: '13px', color: c.textMuted, margin: '2px 0 0 0' }}>
              {config.isEnabled ? 'Terhubung dan aktif' : 'Nonaktif'}
            </p>
          </div>
        </div>
        <ToggleSwitch value={config.isEnabled} onChange={handleToggleEnabled} />
      </div>

      {/* API Configuration */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: c.textPrimary, margin: '0 0 16px 0' }}>
          Konfigurasi API
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* API Key */}
          <div>
            <label style={labelStyle}>API Key</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={showApiKey ? apiKeyInput : maskedKey}
                onChange={(e) => {
                  if (showApiKey) setApiKeyInput(e.target.value);
                }}
                onFocus={() => setShowApiKey(true)}
                placeholder="Masukkan API key dari Nusuk"
                style={{
                  ...inputStyle,
                  paddingRight: '44px',
                }}
              />
              <button
                type="button"
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
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showApiKey ? (
                  <EyeOff style={{ width: '16px', height: '16px', color: c.textMuted }} />
                ) : (
                  <Eye style={{ width: '16px', height: '16px', color: c.textMuted }} />
                )}
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label style={labelStyle}>Base URL</label>
            <input
              type="text"
              value={baseUrlInput}
              onChange={(e) => setBaseUrlInput(e.target.value)}
              placeholder="https://api.nusuk.sa/v1"
              style={inputStyle}
            />
          </div>

          {/* Save + Test Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: c.primary,
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
            </button>

            <button
              onClick={handleTestConnection}
              disabled={testing}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1px solid ' + c.border,
                backgroundColor: 'transparent',
                color: c.textPrimary,
                fontSize: '14px',
                fontWeight: '500',
                cursor: testing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: testing ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {testing ? (
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <RefreshCw style={{ width: '16px', height: '16px' }} />
              )}
              {testing ? 'Menguji...' : 'Test Koneksi'}
            </button>
          </div>

          {/* Messages */}
          {saveMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: saveMessage.type === 'success' ? c.successLight : c.errorLight,
                fontSize: '13px',
                color: saveMessage.type === 'success' ? c.success : c.error,
              }}
            >
              {saveMessage.type === 'success' ? (
                <CheckCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              ) : (
                <XCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              )}
              {saveMessage.text}
            </div>
          )}

          {testResult && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: testResult.type === 'success' ? c.successLight : c.errorLight,
                fontSize: '13px',
                color: testResult.type === 'success' ? c.success : c.error,
              }}
            >
              {testResult.type === 'success' ? (
                <CheckCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              ) : (
                <XCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              )}
              {testResult.text}
            </div>
          )}
        </div>
      </div>

      {/* Sync Status */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: c.textPrimary, margin: '0 0 16px 0' }}>
          Sinkronisasi
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Last sync info */}
          <div
            style={{
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '12px',
            }}
          >
            <div>
              <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>Sinkronisasi Terakhir</p>
              <p style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary, margin: '4px 0 0 0' }}>
                {config.lastSyncAt
                  ? new Date(config.lastSyncAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'Belum pernah disinkronkan'}
              </p>
            </div>

            <button
              onClick={handleSync}
              disabled={syncing}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: c.primary,
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: syncing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: syncing ? 0.7 : 1,
                transition: 'opacity 0.2s',
                flexShrink: 0,
              }}
            >
              {syncing ? (
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <RefreshCw style={{ width: '16px', height: '16px' }} />
              )}
              {syncing ? 'Menyinkronkan...' : 'Sync Sekarang'}
            </button>
          </div>

          {/* Sync result */}
          {syncResult && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: syncResult.errors > 0 ? c.warningLight : c.successLight,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle style={{ width: '16px', height: '16px', color: c.success }} />
                <span style={{ fontSize: '14px', fontWeight: '500', color: c.success }}>
                  {syncResult.synced} hotel berhasil disinkronkan
                </span>
              </div>
              {syncResult.errors > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <XCircle style={{ width: '16px', height: '16px', color: c.error }} />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: c.error }}>
                    {syncResult.errors} error
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feature Toggles */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: c.textPrimary, margin: '0 0 16px 0' }}>
          Fitur
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {/* Hotel Inventory Sync */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 0',
              borderBottom: '1px solid ' + c.borderLight,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>{'\u{1f3e8}'}</span>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary, margin: 0 }}>
                  Hotel Inventory Sync
                </p>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
                  Sinkronisasi otomatis ketersediaan hotel dari Nusuk
                </p>
              </div>
            </div>
            <ToggleSwitch value={hotelSync} onChange={() => setHotelSync(!hotelSync)} />
          </div>

          {/* Visa Submission */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 0',
              borderBottom: '1px solid ' + c.borderLight,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>{'\u{1f4c4}'}</span>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary, margin: 0 }}>
                  Visa Submission
                </p>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
                  Kirim permohonan visa langsung melalui API Nusuk
                </p>
              </div>
            </div>
            <ToggleSwitch value={visaSubmission} onChange={() => setVisaSubmission(!visaSubmission)} />
          </div>

          {/* Status Tracking */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>{'\u{1f4cd}'}</span>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary, margin: 0 }}>
                  Status Tracking
                </p>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
                  Pantau status visa dan booking secara realtime
                </p>
              </div>
            </div>
            <ToggleSwitch value={statusTracking} onChange={() => setStatusTracking(!statusTracking)} />
          </div>
        </div>
      </div>

      {/* Spin animation for Loader2 */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
