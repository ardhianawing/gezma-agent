'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { formatDate } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { useLanguage } from '@/lib/i18n';
import { useResponsive } from '@/lib/hooks/use-responsive';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  QrCode,
  CheckCircle2,
  Edit2,
  Copy,
  ExternalLink,
  Download
} from 'lucide-react';
import Link from 'next/link';

interface AgencyData {
  id: string;
  name: string;
  legalName: string;
  tagline: string | null;
  description: string | null;
  ppiuNumber: string | null;
  ppiuIssueDate: string | null;
  ppiuExpiryDate: string | null;
  ppiuStatus: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  verificationCode: string;
  isVerified: boolean;
  slug: string | null;
}

interface EditForm {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  website: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export default function AgencyPage() {
  const { c, theme } = useTheme();
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  const [agency, setAgency] = useState<AgencyData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '', legalName: '', tagline: '', description: '',
    phone: '', whatsapp: '', website: '',
    address: '', city: '', province: '', postalCode: '',
  });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Shared styles for the edit modal
  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', fontSize: '14px', color: c.textPrimary, backgroundColor: c.cardBgHover, border: `1px solid ${c.border}`, borderRadius: '12px', outline: 'none', boxSizing: 'border-box' as const };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: '500', color: c.textMuted, marginBottom: '8px' };
  const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: '80px', resize: 'vertical' as const };

  useEffect(() => {
    fetch('/api/agency')
      .then((res) => res.json())
      .then((data) => setAgency(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function openEdit() {
    if (!agency) return;
    setEditForm({
      name: agency.name || '',
      legalName: agency.legalName || '',
      tagline: agency.tagline || '',
      description: agency.description || '',
      phone: agency.phone || '',
      whatsapp: agency.whatsapp || '',
      website: agency.website || '',
      address: agency.address || '',
      city: agency.city || '',
      province: agency.province || '',
      postalCode: agency.postalCode || '',
    });
    setShowEdit(true);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/agency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setAgency(updated);
      setShowEdit(false);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: c.textMuted }}>Memuat data agency...</div>;
  }

  if (!agency) {
    return <div style={{ padding: '40px', textAlign: 'center', color: c.textMuted }}>Agency tidak ditemukan</div>;
  }

  // Responsive grid columns - use auto-fill for better tablet support
  const mainGridColumns = isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <PageHeader
        title={t.agency.title}
        description={t.agency.description}
        actions={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/agency/export');
                  if (!res.ok) return;
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `gezma-export-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch { /* ignore */ }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: c.cardBg,
                color: c.textSecondary,
                padding: '10px 16px',
                borderRadius: '8px',
                border: `1px solid ${c.border}`,
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <Download style={{ width: '18px', height: '18px' }} />
              <span>Export Data</span>
            </button>
            {agency.slug && (
              <Link
                href={`/verify/agency/${agency.slug}`}
                target="_blank"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: c.cardBg,
                  color: c.textSecondary,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${c.border}`,
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink style={{ width: '18px', height: '18px' }} />
                <span>Lihat Profil Publik</span>
              </Link>
            )}
            <button
              onClick={openEdit}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: c.primary,
                color: 'white',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <Edit2 style={{ width: '20px', height: '20px' }} />
              <span>{t.agency.editProfile}</span>
            </button>
          </div>
        }
      />

      {/* Edit Profile Modal */}
      {showEdit && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowEdit(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', margin: '0 16px', backgroundColor: c.cardBg, borderRadius: '16px', border: `1px solid ${c.border}`, padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary, margin: '0 0 20px 0' }}>{t.agency.editProfile}</h2>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Nama Brand</label>
                  <input
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nama Legal (PT)</label>
                  <input
                    required
                    value={editForm.legalName}
                    onChange={(e) => setEditForm((f) => ({ ...f, legalName: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tagline</label>
                <input
                  value={editForm.tagline}
                  onChange={(e) => setEditForm((f) => ({ ...f, tagline: e.target.value }))}
                  placeholder="Slogan singkat"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Deskripsi</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Tentang agensi"
                  style={textareaStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Telepon</label>
                  <input
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp</label>
                  <input
                    value={editForm.whatsapp}
                    onChange={(e) => setEditForm((f) => ({ ...f, whatsapp: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input
                  value={editForm.website}
                  onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Alamat</label>
                <input
                  value={editForm.address}
                  onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Kota</label>
                  <input
                    value={editForm.city}
                    onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Provinsi</label>
                  <input
                    value={editForm.province}
                    onChange={(e) => setEditForm((f) => ({ ...f, province: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Kode Pos</label>
                  <input
                    value={editForm.postalCode}
                    onChange={(e) => setEditForm((f) => ({ ...f, postalCode: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: c.textSecondary,
                    backgroundColor: 'transparent',
                    border: `1px solid ${c.border}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: c.primary,
                    border: 'none',
                    borderRadius: '10px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agency Header Card */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Dark Header */}
        <div
          style={{
            background: theme === 'dark' ? `linear-gradient(to right, ${c.cardBgHover}, ${c.cardBg})` : 'linear-gradient(to right, #111827, #374151)',
            padding: isMobile ? '20px' : '24px',
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '16px' : '24px', flexDirection: isMobile ? 'column' : 'row' }}>
            <div
              style={{
                width: isMobile ? '64px' : '80px',
                height: isMobile ? '64px' : '80px',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Building2 style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', margin: 0, color: 'white' }}>
                  {agency.name}
                </h2>
                {agency.isVerified && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#16A34A',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '500',
                      padding: '4px 10px',
                      borderRadius: '12px',
                    }}
                  >
                    <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                    {t.agency.verified}
                  </span>
                )}
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>{agency.legalName}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail style={{ width: '16px', height: '16px' }} />
                  {agency.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone style={{ width: '16px', height: '16px' }} />
                  {agency.phone}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Address Bar */}
        <div
          style={{
            padding: isMobile ? '16px 20px' : '20px 24px',
            backgroundColor: c.cardBgHover,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: c.textSecondary,
          }}
        >
          <MapPin style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          <span style={{ wordBreak: 'break-word' }}>{agency.address}, {agency.city}, {agency.province}</span>
        </div>
      </div>

      {/* Public Profile Link */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          padding: isMobile ? '16px' : '20px',
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary, margin: '0 0 4px 0' }}>
            Profil Publik
          </h3>
          <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>
            {agency.slug
              ? `Halaman publik Anda tersedia di /agency/${agency.slug}`
              : 'Atur slug agency untuk mengaktifkan halaman profil publik'
            }
          </p>
        </div>
        {agency.slug ? (
          <Link
            href={`/agency/${agency.slug}`}
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'white',
              backgroundColor: c.primary,
              borderRadius: '8px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <ExternalLink style={{ width: '14px', height: '14px' }} />
            Lihat Profil Publik
          </Link>
        ) : (
          <Link
            href="/settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: c.textSecondary,
              backgroundColor: 'transparent',
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Atur Slug
          </Link>
        )}
      </div>

      {/* 3-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: mainGridColumns, gap: isMobile ? '16px' : '24px' }}>
        {/* PPIU License */}
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '12px',
            border: `1px solid ${c.border}`,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: isMobile ? '16px' : '20px', borderBottom: `1px solid ${c.borderLight}` }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield style={{ width: '16px', height: '16px', color: c.success }} />
              {t.agency.ppiuLicense}
            </h3>
          </div>
          <div style={{ padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* License Badge */}
            <div
              style={{
                padding: '16px',
                background: `linear-gradient(to bottom right, ${c.successLight}, ${c.cardBg})`,
                borderRadius: '12px',
                border: `1px solid rgba(22, 163, 74, 0.2)`,
              }}
            >
              <span
                style={{
                  backgroundColor: c.successLight,
                  color: c.success,
                  fontSize: '12px',
                  fontWeight: '500',
                  padding: '4px 10px',
                  borderRadius: '12px',
                }}
              >
                {agency.ppiuStatus}
              </span>
              <p style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: '700', color: c.textPrimary, marginTop: '12px', marginBottom: 0, wordBreak: 'break-all' }}>
                {agency.ppiuNumber}
              </p>
            </div>

            {/* Dates */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${c.borderLight}`, flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: c.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  {t.agency.issued}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>
                  {agency.ppiuIssueDate ? formatDate(agency.ppiuIssueDate) : '-'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: c.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  {t.agency.expires}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>
                  {agency.ppiuExpiryDate ? formatDate(agency.ppiuExpiryDate) : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification QR */}
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '12px',
            border: `1px solid ${c.border}`,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: isMobile ? '16px' : '20px', borderBottom: `1px solid ${c.borderLight}` }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode style={{ width: '16px', height: '16px', color: c.textMuted }} />
              {t.agency.verification}
            </h3>
          </div>
          <div style={{ padding: isMobile ? '16px' : '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* QR Code */}
            <div
              style={{
                padding: isMobile ? '20px' : '24px',
                backgroundColor: c.cardBg,
                borderRadius: '12px',
                border: `2px dashed ${c.border}`,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: isMobile ? '96px' : '112px',
                    height: isMobile ? '96px' : '112px',
                    backgroundColor: '#111827',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  <QrCode style={{ width: isMobile ? '64px' : '80px', height: isMobile ? '64px' : '80px', color: 'white' }} />
                </div>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>{t.agency.scanToVerify}</p>
              </div>
            </div>

            {/* Verification Code */}
            <div
              style={{
                padding: '12px',
                backgroundColor: c.cardBgHover,
                borderRadius: '8px',
              }}
            >
              <p style={{ fontSize: '12px', color: c.textMuted, marginBottom: '4px' }}>{t.agency.verificationCode}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <code style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: '700', color: c.textPrimary }}>
                  {agency.verificationCode}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(agency.verificationCode).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={copied ? 'Tersalin!' : 'Salin kode'}
                >
                  {copied
                    ? <CheckCircle2 style={{ width: '16px', height: '16px', color: c.success }} />
                    : <Copy style={{ width: '16px', height: '16px', color: c.textMuted }} />
                  }
                </button>
              </div>
            </div>

            {/* Verified Badge */}
            {agency.isVerified && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: c.successLight,
                  borderRadius: '8px',
                  color: c.success,
                }}
              >
                <CheckCircle2 style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{t.agency.agencyVerified}</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
