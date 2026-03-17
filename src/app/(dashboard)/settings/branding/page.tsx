'use client';

import { useState, useEffect } from 'react';
import { Palette, Save, RotateCcw, Loader2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/components/ui/toast';
import { useBranding } from '@/lib/contexts/branding-context';
import { useLanguage } from '@/lib/i18n';

export default function BrandingSettingsPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { branding, refreshBranding } = useBranding();
  const { t } = useLanguage();

  const [primaryColor, setPrimaryColor] = useState('#F60000');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [appTitle, setAppTitle] = useState('');
  const [logoLightUrl, setLogoLightUrl] = useState('');
  const [logoDarkUrl, setLogoDarkUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setPrimaryColor(branding.primaryColor || '#F60000');
    setSecondaryColor(branding.secondaryColor || '');
    setAppTitle(branding.appTitle || '');
    setLogoLightUrl(branding.logoLightUrl || '');
    setLogoDarkUrl(branding.logoDarkUrl || '');
    setFaviconUrl(branding.faviconUrl || '');
    setCustomDomain((branding as unknown as Record<string, string>).customDomain || '');
  }, [branding]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/agency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryColor,
          secondaryColor: secondaryColor || null,
          appTitle: appTitle || null,
          logoLightUrl: logoLightUrl || null,
          logoDarkUrl: logoDarkUrl || null,
          faviconUrl: faviconUrl || null,
          customDomain: customDomain || null,
        }),
      });
      if (res.ok) {
        setMessage(t.settings.brandingSaveSuccess);
        addToast({ type: 'success', title: t.settings.brandingSaveSuccess });
        await refreshBranding();
      } else {
        setMessage(t.settings.brandingSaveError);
        addToast({ type: 'error', title: t.settings.brandingSaveError });
      }
    } catch {
      setMessage(t.common.errorGeneric);
      addToast({ type: 'error', title: t.common.errorGeneric });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPrimaryColor('#F60000');
    setSecondaryColor('');
    setAppTitle('');
    setLogoLightUrl('');
    setLogoDarkUrl('');
    setFaviconUrl('');
    setCustomDomain('');
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: `1px solid ${c.border}`,
    backgroundColor: c.inputBg,
    color: c.textPrimary,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '600' as const,
    color: c.textSecondary,
    marginBottom: '6px',
    display: 'block' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
          White-Label Branding
        </h1>
        <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>
          Kustomisasi tampilan aplikasi sesuai identitas agensi Anda.
        </p>
      </div>

      {/* Form */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          padding: isMobile ? '20px' : '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Palette style={{ width: '20px', height: '20px', color: c.primary }} />
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>{t.settings.branding}</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* App Title */}
          <div>
            <label style={labelStyle}>{t.settings.branding}</label>
            <input
              type="text"
              value={appTitle}
              onChange={e => setAppTitle(e.target.value)}
              placeholder="GEZMA Agent"
              style={inputStyle}
            />
          </div>

          {/* Colors */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Warna Utama (Primary)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  style={{ width: '48px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }}
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Warna Sekunder</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={secondaryColor || '#666666'}
                  onChange={e => setSecondaryColor(e.target.value)}
                  style={{ width: '48px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }}
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={e => setSecondaryColor(e.target.value)}
                  placeholder="Opsional"
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
            </div>
          </div>

          {/* Logo URLs */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Logo (Light Theme URL)</label>
              <input
                type="text"
                value={logoLightUrl}
                onChange={e => setLogoLightUrl(e.target.value)}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Logo (Dark Theme URL)</label>
              <input
                type="text"
                value={logoDarkUrl}
                onChange={e => setLogoDarkUrl(e.target.value)}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
          </div>

          {/* Favicon */}
          <div>
            <label style={labelStyle}>Favicon URL</label>
            <input
              type="text"
              value={faviconUrl}
              onChange={e => setFaviconUrl(e.target.value)}
              placeholder="https://..."
              style={inputStyle}
            />
          </div>

          {/* Custom Domain */}
          <div>
            <label style={labelStyle}>Custom Domain</label>
            <input
              type="text"
              value={customDomain}
              onChange={e => setCustomDomain(e.target.value)}
              placeholder="umrah.yourdomain.com"
              style={inputStyle}
            />
            <p style={{ fontSize: '12px', color: c.textMuted, margin: '4px 0 0 0' }}>
              Gunakan domain kustom untuk white-label portal Anda. Hubungi support untuk setup DNS.
            </p>
          </div>

          {/* Live Preview */}
          <div>
            <label style={labelStyle}>Live Preview</label>
            <div
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: `2px dashed ${c.border}`,
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
                  backgroundColor: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '16px',
                  flexShrink: 0,
                }}
              >
                {(appTitle || 'GZ').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: '18px', fontWeight: '700', color: primaryColor, margin: 0 }}>
                  {appTitle || 'GEZMA'}
                </p>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
                  Tampilan sidebar & header Anda
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button
              onClick={handleReset}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: `1px solid ${c.border}`,
                backgroundColor: 'transparent',
                color: c.textSecondary,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw style={{ width: '16px', height: '16px' }} />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: primaryColor,
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {saving ? (
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Save style={{ width: '16px', height: '16px' }} />
              )}
              {saving ? 'Menyimpan...' : t.common.save}
            </button>
          </div>

          {message && (
            <p style={{ fontSize: '14px', color: message.includes('berhasil') ? c.success : c.error, margin: 0 }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
