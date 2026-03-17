'use client';

import { useState, useRef } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { usePilgrim } from '@/lib/contexts/pilgrim-context';
import { useToast } from '@/components/ui/toast';
import { useLanguage } from '@/lib/i18n';

const PILGRIM_GREEN = '#059669';

// DOCUMENT_LABELS are set inside the component using t

const REQUIRED_DOCS = ['ktp', 'passport', 'photo', 'kk', 'vaccine', 'akta'];

// getStatusStyle is defined inside the component to access translations

export default function PilgrimDocumentsPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { data, refreshData } = usePilgrim();
  const { addToast } = useToast();
  const { t } = useLanguage();

  const DOCUMENT_LABELS: Record<string, string> = {
    ktp: t.pilgrimDocs.ktp,
    passport: t.pilgrimDocs.passport,
    photo: t.pilgrimDocs.photo,
    kk: t.pilgrimDocs.kk,
    vaccine: t.pilgrimDocs.vaccine,
    akta: t.pilgrimDocs.akta,
    book_nikah: t.pilgrimDocs.bookNikah,
    surat_mahram: t.pilgrimDocs.suratMahram,
  };

  function getStatusStyle(status: string): { bg: string; text: string; label: string } {
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

  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDocType, setActiveDocType] = useState<string | null>(null);

  if (!data) return null;

  const { documents } = data;

  const handleUploadClick = (docType: string) => {
    setActiveDocType(docType);
    setError(null);
    setSuccess(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDocType) return;

    // Reset input
    e.target.value = '';

    // Validate client-side
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB.');
      return;
    }

    setUploading(activeDocType);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', activeDocType);

      const res = await fetch('/api/pilgrim-portal/documents', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
      });

      const json = await res.json();
      if (res.ok) {
        setSuccess(`${DOCUMENT_LABELS[activeDocType] || activeDocType} berhasil diunggah.`);
        addToast({ type: 'success', title: `${DOCUMENT_LABELS[activeDocType] || activeDocType} berhasil diunggah` });
        refreshData?.();
      } else {
        const errMsg = json.error || 'Gagal mengunggah file.';
        setError(errMsg);
        addToast({ type: 'error', title: errMsg });
      }
    } catch {
      setError('Gagal terhubung ke server.');
      addToast({ type: 'error', title: 'Gagal terhubung ke server' });
    } finally {
      setUploading(null);
      setActiveDocType(null);
    }
  };

  const completedCount = documents.filter(d => d.status !== 'missing').length;

  return (
    <div>
      <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 700, color: c.textPrimary, margin: '0 0 4px 0' }}>
        Dokumen
      </h1>
      <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 20px 0' }}>
        Unggah dokumen yang diperlukan untuk perjalanan umrah Anda.
      </p>

      {/* Progress */}
      <div style={{
        backgroundColor: c.cardBg, border: '1px solid ' + c.border,
        borderRadius: '12px', padding: '16px', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: c.textPrimary }}>{t.pilgrimPortal.docTitle}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: PILGRIM_GREEN }}>{completedCount}/{documents.length}</span>
        </div>
        <div style={{ height: '8px', backgroundColor: c.borderLight, borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${documents.length > 0 ? (completedCount / documents.length) * 100 : 0}%`,
            backgroundColor: PILGRIM_GREEN, borderRadius: '4px', transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#FEF2F2', color: '#DC2626', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#F0FDF4', color: '#16A34A', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
          {success}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Document cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '12px',
      }}>
        {documents.map((doc) => {
          const statusInfo = getStatusStyle(doc.status);
          const isUploading = uploading === doc.type;
          return (
            <div key={doc.type} style={{
              backgroundColor: c.cardBg, border: '1px solid ' + c.border,
              borderRadius: '14px', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary }}>
                      {doc.label}
                    </span>
                    {doc.required && (
                      <span style={{ fontSize: '10px', color: '#DC2626', fontWeight: 700 }}>*</span>
                    )}
                  </div>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  color: statusInfo.text, backgroundColor: statusInfo.bg,
                  padding: '3px 10px', borderRadius: '20px',
                }}>
                  {statusInfo.label}
                </span>
              </div>

              {/* File name if uploaded */}
              {doc.status !== 'missing' && 'fileName' in doc && doc.fileName && (
                <p style={{ fontSize: '12px', color: c.textMuted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {String(doc.fileName)}
                </p>
              )}

              {/* Upload button */}
              {doc.status !== 'verified' && (
                <button
                  onClick={() => handleUploadClick(doc.type)}
                  disabled={isUploading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '12px', minHeight: '44px', borderRadius: '10px', border: 'none',
                    backgroundColor: doc.status === 'missing' ? PILGRIM_GREEN : c.pageBg,
                    color: doc.status === 'missing' ? '#FFFFFF' : c.textSecondary,
                    fontSize: '14px', fontWeight: 600, cursor: isUploading ? 'not-allowed' : 'pointer',
                    opacity: isUploading ? 0.7 : 1,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  {isUploading ? 'Mengunggah...' : doc.status === 'missing' ? 'Unggah Dokumen' : 'Unggah Ulang'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: '12px', color: c.textLight, marginTop: '16px', textAlign: 'center' }}>
        * Dokumen wajib &bull; Format: JPG, PNG, WebP, PDF &bull; Maks 5MB
      </p>
    </div>
  );
}
