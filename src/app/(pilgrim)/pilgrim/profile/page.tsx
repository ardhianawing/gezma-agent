'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { usePilgrim } from '@/lib/contexts/pilgrim-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { useLanguage } from '@/lib/i18n';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_DARK = '#047857';
const STAR_YELLOW = '#F59E0B';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// getDocStatusInfo is defined inside the component to access translations

export default function ProfilePage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { data, logout, refreshData } = usePilgrim();
  const router = useRouter();
  const { addToast } = useToast();
  const { t } = useLanguage();

  function getDocStatusInfo(status: string): { bg: string; text: string; label: string } {
    switch (status) {
      case 'verified':
        return { bg: '#F0FDF4', text: '#16A34A', label: t.pilgrimDocs.statusVerified };
      case 'uploaded':
        return { bg: '#FFFBEB', text: '#D97706', label: t.pilgrimDocs.statusUploaded };
      case 'missing':
      default:
        return { bg: '#FEF2F2', text: '#DC2626', label: t.pilgrimDocs.statusMissing };
    }
  }

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ phone: '', email: '', whatsapp: '', address: '' });
  const [editSaving, setEditSaving] = useState(false);

  // Referral state
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState({ totalReferrals: 0, completedReferrals: 0 });
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);

  // Testimonial state
  const [canReview, setCanReview] = useState(false);
  const [existingTestimonial, setExistingTestimonial] = useState<{ rating: number; comment: string; createdAt: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchReferral = useCallback(() => {
    fetch('/api/pilgrim-portal/referral')
      .then(res => res.json())
      .then(d => {
        setReferralCode(d.referralCode || null);
        setReferralStats({
          totalReferrals: d.totalReferrals ?? 0,
          completedReferrals: d.completedReferrals ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchReferral();
    // Fetch testimonial data
    fetch('/api/pilgrim-portal/testimonial')
      .then(res => res.json())
      .then(d => {
        setCanReview(d.canReview || false);
        if (d.testimonial) setExistingTestimonial(d.testimonial);
      })
      .catch(() => {});
  }, [fetchReferral]);

  async function handleGenerateReferral() {
    setReferralLoading(true);
    try {
      const res = await fetch('/api/pilgrim-portal/referral', { method: 'POST' });
      const d = await res.json();
      if (d.referralCode) {
        setReferralCode(d.referralCode);
        fetchReferral();
      }
    } catch {
      addToast({ type: 'error', title: 'Gagal membuat kode referral' });
    } finally {
      setReferralLoading(false);
    }
  }

  function handleCopyReferral() {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode).then(() => {
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    }).catch(() => {
      addToast({ type: 'error', title: 'Gagal menyalin kode referral' });
    });
  }

  function handleStartEdit() {
    if (!data) return;
    setEditData({
      phone: data.pilgrim.phone || '',
      email: data.pilgrim.email || '',
      whatsapp: '',
      address: data.pilgrim.address || '',
    });
    setEditMode(true);
  }

  async function handleSaveProfile() {
    setEditSaving(true);
    try {
      const res = await fetch('/api/pilgrim-portal/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Gagal memperbarui profil');
      addToast({ type: 'success', title: 'Profil berhasil diperbarui' });
      setEditMode(false);
      refreshData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui profil';
      addToast({ type: 'error', title: msg });
    } finally {
      setEditSaving(false);
    }
  }

  async function handleSubmitReview() {
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Pilih rating 1-5');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Tulis komentar Anda');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const res = await fetch('/api/pilgrim-portal/testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment.trim() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Gagal mengirim ulasan');
      setExistingTestimonial(d.testimonial);
      setCanReview(false);
      setReviewSuccess(true);
      addToast({ type: 'success', title: 'Ulasan berhasil dikirim' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim ulasan';
      setReviewError(msg);
      addToast({ type: 'error', title: msg });
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (!data) return null;

  const { pilgrim, agency, documents } = data;

  const handleLogout = () => {
    logout();
    router.replace('/pilgrim/login');
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    border: '1px solid ' + c.border,
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 600,
    color: c.textPrimary,
    margin: '0 0 14px 0',
  };

  const infoRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '10px 0',
    borderBottom: '1px solid ' + c.borderLight,
    gap: '12px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    color: c.textMuted,
    flexShrink: 0,
    minWidth: '100px',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: c.textPrimary,
    textAlign: 'right' as const,
    wordBreak: 'break-word' as const,
  };

  const verifiedCount = documents.filter(d => d.status === 'verified').length;
  const requiredDocs = documents.filter(d => d.required);
  const missingRequired = requiredDocs.filter(d => d.status === 'missing').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', paddingBottom: '80px' }}>
      {/* Profile header */}
      <div style={{
        ...cardStyle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
        border: 'none',
        color: 'white',
        borderRadius: '16px',
        padding: '32px 20px',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          marginBottom: '12px',
          border: '3px solid rgba(255,255,255,0.5)',
        }}>
          {pilgrim.gender === 'female' ? '👩' : '👨'}
        </div>
        <h1 style={{
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: 700,
          margin: '0 0 4px 0',
        }}>
          {pilgrim.name}
        </h1>
        <p style={{
          fontSize: '13px',
          opacity: 0.9,
          margin: '0 0 8px 0',
        }}>
          Kode Booking: <strong>{pilgrim.bookingCode}</strong>
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 14px',
          borderRadius: '20px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          Status: {pilgrim.status.charAt(0).toUpperCase() + pilgrim.status.slice(1)}
        </div>
      </div>

      {/* Personal info */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>👤 Data Pribadi</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { label: 'Nama Lengkap', value: pilgrim.name },
            { label: 'NIK', value: pilgrim.nik },
            { label: 'Jenis Kelamin', value: pilgrim.gender === 'male' ? 'Laki-laki' : 'Perempuan' },
            { label: 'Tempat Lahir', value: pilgrim.birthPlace || '-' },
            { label: 'Tanggal Lahir', value: pilgrim.birthDate ? formatDate(pilgrim.birthDate) : '-' },
            { label: 'Alamat', value: pilgrim.address || '-' },
            { label: 'Kota', value: pilgrim.city || '-' },
            { label: 'Provinsi', value: pilgrim.province || '-' },
          ].map((row, i) => (
            <div key={i} style={{
              ...infoRowStyle,
              borderBottom: i === 7 ? 'none' : '1px solid ' + c.borderLight,
            }}>
              <span style={labelStyle}>{row.label}</span>
              <span style={valueStyle}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact info */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ ...sectionTitleStyle, margin: 0 }}>📱 Kontak</h2>
          {!editMode && (
            <button
              onClick={handleStartEdit}
              style={{
                padding: '5px 14px',
                fontSize: '12px',
                fontWeight: 600,
                color: GREEN,
                backgroundColor: GREEN_LIGHT,
                border: '1px solid ' + GREEN,
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              {t.common.edit}
            </button>
          )}
        </div>

        {editMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {([
              { key: 'phone' as const, label: 'Telepon' },
              { key: 'email' as const, label: 'Email' },
              { key: 'whatsapp' as const, label: 'WhatsApp' },
              { key: 'address' as const, label: 'Alamat' },
            ]).map(field => (
              <div key={field.key}>
                <label style={{ fontSize: '12px', color: c.textMuted, marginBottom: '4px', display: 'block' }}>
                  {field.label}
                </label>
                <input
                  value={editData[field.key]}
                  onChange={e => setEditData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid ' + c.border,
                    borderRadius: '8px',
                    backgroundColor: c.pageBg,
                    color: c.textPrimary,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => setEditMode(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: c.textPrimary,
                  backgroundColor: c.pageBg,
                  border: '1px solid ' + c.border,
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={editSaving}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: GREEN,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: editSaving ? 'not-allowed' : 'pointer',
                  opacity: editSaving ? 0.7 : 1,
                }}
              >
                {editSaving ? t.common.saving : t.common.save}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { label: 'Telepon', value: pilgrim.phone },
              { label: 'Email', value: pilgrim.email },
            ].map((row, i) => (
              <div key={i} style={{
                ...infoRowStyle,
                borderBottom: i === 1 ? 'none' : '1px solid ' + c.borderLight,
              }}>
                <span style={labelStyle}>{row.label}</span>
                <span style={valueStyle}>{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Room assignment */}
      {(pilgrim.roomNumber || pilgrim.roomType) && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>🏨 Kamar</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}>
            {pilgrim.roomNumber && (
              <div style={{
                padding: '14px',
                backgroundColor: GREEN_LIGHT,
                borderRadius: '10px',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '11px', color: GREEN_DARK, margin: '0 0 4px 0', fontWeight: 500 }}>
                  Nomor Kamar
                </p>
                <p style={{ fontSize: '20px', fontWeight: 700, color: GREEN, margin: 0 }}>
                  {pilgrim.roomNumber}
                </p>
              </div>
            )}
            {pilgrim.roomType && (
              <div style={{
                padding: '14px',
                backgroundColor: GREEN_LIGHT,
                borderRadius: '10px',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '11px', color: GREEN_DARK, margin: '0 0 4px 0', fontWeight: 500 }}>
                  Tipe Kamar
                </p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: GREEN, margin: 0, textTransform: 'capitalize' }}>
                  {pilgrim.roomType}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ ...sectionTitleStyle, margin: 0 }}>📄 Dokumen</h2>
          <span style={{
            fontSize: '12px',
            color: missingRequired > 0 ? '#DC2626' : GREEN,
            fontWeight: 600,
          }}>
            {verifiedCount}/{documents.length} terverifikasi
          </span>
        </div>

        {missingRequired > 0 && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: '#FEF2F2',
            borderRadius: '10px',
            marginBottom: '12px',
            border: '1px solid #FCA5A5',
          }}>
            <p style={{ fontSize: '12px', color: '#DC2626', margin: 0, fontWeight: 500 }}>
              ⚠️ {missingRequired} dokumen wajib belum dilengkapi
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {documents.map(doc => {
            const statusInfo = getDocStatusInfo(doc.status);
            return (
              <div key={doc.type} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: c.pageBg,
                borderRadius: '10px',
                border: '1px solid ' + c.borderLight,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: c.textPrimary,
                  }}>
                    {doc.label}
                  </span>
                  {doc.required && (
                    <span style={{ fontSize: '10px', color: '#DC2626', fontWeight: 600 }}>*</span>
                  )}
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: statusInfo.text,
                  backgroundColor: statusInfo.bg,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap',
                }}>
                  {statusInfo.label}
                </span>
              </div>
            );
          })}
        </div>

        <p style={{
          fontSize: '11px',
          color: c.textLight,
          margin: '12px 0 0 0',
          textAlign: 'center',
        }}>
          * Hubungi travel agent untuk mengunggah/memperbarui dokumen
        </p>
      </div>

      {/* Travel Agent */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>{'\u{1F3E2}'} {t.pilgrimPortal.agencyTitle}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <span style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: GREEN_LIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
          }}>
            {agency.logoEmoji}
          </span>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
              {agency.name}
            </p>
            <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
              {agency.address}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href={'https://wa.me/' + (agency.whatsapp?.replace(/[^0-9]/g, '') || '')}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px',
              minHeight: '44px',
              backgroundColor: '#25D366',
              color: '#FFFFFF',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
              boxSizing: 'border-box',
            }}
          >
            {'\u{1F4AC}'} {t.pilgrimPortal.agencyWa}
          </a>
          <a
            href={'tel:' + agency.phone}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px',
              minHeight: '44px',
              backgroundColor: c.pageBg,
              color: c.textPrimary,
              border: '1px solid ' + c.border,
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 600,
              boxSizing: 'border-box',
            }}
          >
            {'\u{1F4DE}'} {t.pilgrimPortal.agencyPhone}
          </a>
        </div>
      </div>

      {/* Ajak Teman (Referral) */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>🤝 Ajak Teman</h2>
        <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 14px 0', lineHeight: 1.5 }}>
          Bagikan kode referral Anda dan dapatkan bonus poin ketika teman mendaftar!
        </p>

        {referralCode ? (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: GREEN_LIGHT,
              borderRadius: '10px',
              marginBottom: '12px',
            }}>
              <code style={{
                flex: 1,
                fontSize: '18px',
                fontWeight: 700,
                color: GREEN_DARK,
                fontFamily: 'monospace',
                letterSpacing: '1px',
              }}>
                {referralCode}
              </code>
              <button
                onClick={handleCopyReferral}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'white',
                  backgroundColor: referralCopied ? '#16A34A' : GREEN,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {referralCopied ? 'Tersalin!' : 'Salin'}
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: c.pageBg,
                borderRadius: '10px',
                textAlign: 'center',
                border: '1px solid ' + c.borderLight,
              }}>
                <p style={{ fontSize: '20px', fontWeight: 700, color: GREEN, margin: '0 0 2px 0' }}>
                  {referralStats.totalReferrals}
                </p>
                <p style={{ fontSize: '11px', color: c.textMuted, margin: 0 }}>Total Referral</p>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: c.pageBg,
                borderRadius: '10px',
                textAlign: 'center',
                border: '1px solid ' + c.borderLight,
              }}>
                <p style={{ fontSize: '20px', fontWeight: 700, color: GREEN, margin: '0 0 2px 0' }}>
                  {referralStats.completedReferrals}
                </p>
                <p style={{ fontSize: '11px', color: c.textMuted, margin: 0 }}>Berhasil</p>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={handleGenerateReferral}
            disabled={referralLoading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'white',
              backgroundColor: GREEN,
              border: 'none',
              borderRadius: '10px',
              cursor: referralLoading ? 'not-allowed' : 'pointer',
              opacity: referralLoading ? 0.6 : 1,
            }}
          >
            {referralLoading ? 'Membuat...' : 'Buat Kode Referral'}
          </button>
        )}
      </div>

      {/* Beri Ulasan */}
      {(canReview || existingTestimonial) && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>{'\u{2B50}'} Beri Ulasan</h2>

          {existingTestimonial ? (
            <div>
              {reviewSuccess && (
                <p style={{
                  fontSize: '13px',
                  color: GREEN,
                  fontWeight: 600,
                  margin: '0 0 12px 0',
                }}>
                  Terima kasih atas ulasan Anda!
                </p>
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '8px',
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      fontSize: '22px',
                      color: star <= existingTestimonial.rating ? STAR_YELLOW : '#D1D5DB',
                    }}
                  >
                    {'\u{2B50}'}
                  </span>
                ))}
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: c.textPrimary,
                  marginLeft: '6px',
                }}>
                  {existingTestimonial.rating}/5
                </span>
              </div>
              <p style={{
                fontSize: '14px',
                color: c.textPrimary,
                margin: '0 0 8px 0',
                lineHeight: 1.5,
                fontStyle: 'italic',
              }}>
                &ldquo;{existingTestimonial.comment}&rdquo;
              </p>
              {existingTestimonial.createdAt && (
                <p style={{ fontSize: '11px', color: c.textLight, margin: 0 }}>
                  Dikirim {new Date(existingTestimonial.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
            </div>
          ) : canReview ? (
            <div>
              <p style={{
                fontSize: '13px',
                color: c.textMuted,
                margin: '0 0 14px 0',
                lineHeight: 1.5,
              }}>
                Perjalanan Anda telah selesai. Bagikan pengalaman Anda!
              </p>

              {/* Star rating */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px',
              }}>
                <span style={{ fontSize: '13px', color: c.textMuted, marginRight: '4px' }}>Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{
                      fontSize: '28px',
                      color: star <= reviewRating ? STAR_YELLOW : '#D1D5DB',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      minWidth: '44px',
                      minHeight: '44px',
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {'\u{2B50}'}
                  </button>
                ))}
              </div>

              {/* Comment */}
              <textarea
                placeholder="Tulis ulasan Anda..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid ' + c.border,
                  borderRadius: '10px',
                  backgroundColor: c.pageBg,
                  color: c.textPrimary,
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  marginBottom: '10px',
                }}
              />

              {reviewError && (
                <p style={{ fontSize: '12px', color: '#DC2626', margin: '0 0 8px 0' }}>
                  {reviewError}
                </p>
              )}

              <button
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: GREEN,
                  border: 'none',
                  borderRadius: '10px',
                  cursor: reviewSubmitting ? 'not-allowed' : 'pointer',
                  opacity: reviewSubmitting ? 0.7 : 1,
                }}
              >
                {reviewSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '15px',
          fontWeight: 600,
          color: '#DC2626',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '12px',
          cursor: 'pointer',
          marginTop: '8px',
        }}
      >
        {t.common.signOut}
      </button>

      {/* App info */}
      <p style={{
        fontSize: '11px',
        color: c.textLight,
        textAlign: 'center',
        margin: '16px 0 0 0',
      }}>
        {t.pilgrimPortal.brand} v1.0 — {t.pilgrimPortal.subtitle}
      </p>
    </div>
  );
}
