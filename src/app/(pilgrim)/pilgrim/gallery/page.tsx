'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useLanguage } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';

const GREEN = '#059669';
const RED = '#DC2626';

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  uploadedAt: string;
}

export default function GalleryPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const { t } = useLanguage();

  const gridCols = isMobile ? '1fr 1fr' : isTablet ? '1fr 1fr 1fr' : '1fr 1fr 1fr 1fr';

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/pilgrim-portal/gallery');
      const json = await res.json();
      if (res.ok) setPhotos(json.photos || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPhotos(); }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Format file harus JPG, PNG, atau WebP');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Pilih foto terlebih dahulu');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (caption.trim()) formData.append('caption', caption.trim());

      const res = await fetch('/api/pilgrim-portal/gallery', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        // Fallback: try URL-based upload if file upload not supported
        const urlRes = await fetch('/api/pilgrim-portal/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: previewUrl || `uploaded://${selectedFile.name}`,
            caption: caption.trim() || undefined,
          }),
        });
        const urlJson = await urlRes.json();
        if (!urlRes.ok) throw new Error(urlJson.error || 'Gagal mengunggah');
        setPhotos([urlJson.photo, ...photos]);
      } else {
        setPhotos([json.photo, ...photos]);
      }

      clearFile();
      setCaption('');
      addToast({ type: 'success', title: 'Foto berhasil diunggah' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePhotoId) return;
    setDeletingId(deletePhotoId);
    try {
      const res = await fetch('/api/pilgrim-portal/gallery/' + deletePhotoId, { method: 'DELETE' });
      if (res.ok) {
        setPhotos(photos.filter((p) => p.id !== deletePhotoId));
        addToast({ type: 'success', title: 'Foto berhasil dihapus' });
      } else {
        addToast({ type: 'error', title: 'Gagal menghapus foto' });
      }
    } catch {
      addToast({ type: 'error', title: 'Terjadi kesalahan' });
    } finally {
      setDeletingId(null);
      setDeletePhotoId(null);
    }
  };

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = photo.caption ? `${photo.caption}.jpg` : `gezma-photo-${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: open in new tab
      window.open(photo.url, '_blank');
    }
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 700, color: c.textPrimary, margin: '0 0 4px 0' }}>
          Galeri Foto
        </h1>
        <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>
          Simpan kenangan perjalanan umrah Anda
        </p>
      </div>

      {/* Upload form */}
      <div style={{
        backgroundColor: c.cardBg, border: '1px solid ' + c.border,
        borderRadius: '16px', padding: '20px', marginBottom: '16px',
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary, margin: '0 0 12px 0' }}>
          Tambah Foto
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* File input area */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {!selectedFile ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '24px', border: `2px dashed ${c.border}`, borderRadius: '12px',
                backgroundColor: c.pageBg, cursor: 'pointer', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: '8px',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.borderColor = GREEN; }}
              onMouseLeave={(e) => { (e.currentTarget).style.borderColor = c.border; }}
            >
              <span style={{ fontSize: '32px' }}>📷</span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: c.textSecondary }}>
                Pilih foto dari perangkat
              </span>
              <span style={{ fontSize: '12px', color: c.textLight }}>
                JPG, PNG, WebP — Maks 5MB
              </span>
            </button>
          ) : (
            <div style={{
              position: 'relative', borderRadius: '12px', overflow: 'hidden',
              border: '1px solid ' + c.border,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl || ''}
                alt="Preview"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
              />
              <button
                onClick={clearFile}
                style={{
                  position: 'absolute', top: '8px', right: '8px',
                  width: '28px', height: '28px', borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
                  border: 'none', cursor: 'pointer', fontSize: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
              <div style={{
                position: 'absolute', bottom: '8px', left: '8px',
                padding: '4px 10px', borderRadius: '6px',
                backgroundColor: 'rgba(0,0,0,0.6)', color: 'white',
                fontSize: '11px',
              }}>
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
              </div>
            </div>
          )}

          <input
            type="text"
            placeholder="Keterangan (opsional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{
              padding: '10px 14px', fontSize: '14px',
              border: '1px solid ' + c.border, borderRadius: '8px',
              backgroundColor: c.pageBg, color: c.textPrimary,
              outline: 'none', boxSizing: 'border-box', width: '100%',
            }}
          />

          {error && <p style={{ fontSize: '12px', color: RED, margin: 0 }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedFile}
            style={{
              padding: '12px', fontSize: '14px', fontWeight: 600,
              color: '#FFFFFF', backgroundColor: GREEN,
              border: 'none', borderRadius: '10px',
              cursor: submitting || !selectedFile ? 'not-allowed' : 'pointer',
              opacity: submitting || !selectedFile ? 0.5 : 1,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {submitting && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
              {submitting ? t.common.processing : t.common.save}
            </span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ textAlign: 'center', color: c.textMuted, fontSize: '14px' }}>Memuat galeri...</p>
      )}

      {/* Empty state */}
      {!loading && photos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: c.textMuted }}>
          <span style={{ fontSize: '48px' }}>📷</span>
          <p style={{ fontSize: '16px', margin: '12px 0 4px 0', fontWeight: 500 }}>Belum ada foto</p>
          <p style={{ fontSize: '13px', margin: 0 }}>Tambahkan foto kenangan perjalanan umrah Anda</p>
        </div>
      )}

      {/* Photo grid */}
      {!loading && photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '12px' }}>
          {photos.map((photo) => (
            <div key={photo.id} style={{
              backgroundColor: c.cardBg, border: '1px solid ' + c.border,
              borderRadius: '12px', overflow: 'hidden', position: 'relative',
            }}>
              <div
                onClick={() => setPreviewPhoto(photo)}
                style={{ width: '100%', paddingTop: '100%', position: 'relative', backgroundColor: c.pageBg, cursor: 'pointer' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption || 'Foto'}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div style={{ padding: '10px 12px' }}>
                {photo.caption && (
                  <p style={{
                    fontSize: '12px', color: c.textPrimary, margin: '0 0 6px 0',
                    fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {photo.caption}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10px', color: c.textLight }}>
                    {new Date(photo.uploadedAt).toLocaleDateString('id-ID')}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleDownload(photo)}
                      style={{
                        fontSize: '11px', fontWeight: 600, color: GREEN,
                        backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '8px 6px', minHeight: '36px',
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      {t.common.download}
                    </button>
                    <button
                      onClick={() => setDeletePhotoId(photo.id)}
                      disabled={deletingId === photo.id}
                      style={{
                        fontSize: '11px', fontWeight: 600, color: RED,
                        backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '8px 6px', minHeight: '36px',
                        opacity: deletingId === photo.id ? 0.5 : 1,
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      {t.common.delete}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo preview modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 200, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewPhoto.url}
            alt={previewPhoto.caption || 'Foto'}
            style={{ maxWidth: '90%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
            onClick={(e) => e.stopPropagation()}
          />
          {previewPhoto.caption && (
            <p style={{ color: 'white', fontSize: '14px', marginTop: '12px', textAlign: 'center' }}>
              {previewPhoto.caption}
            </p>
          )}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); handleDownload(previewPhoto); }}
              style={{
                padding: '10px 20px', fontSize: '13px', fontWeight: 600,
                color: '#FFFFFF', backgroundColor: GREEN,
                border: 'none', borderRadius: '8px', cursor: 'pointer',
              }}
            >
              {t.common.download}
            </button>
            <button
              onClick={() => setPreviewPhoto(null)}
              style={{
                padding: '10px 20px', fontSize: '13px', fontWeight: 600,
                color: 'white', backgroundColor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer',
              }}
            >
              {t.common.close}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deletePhotoId}
        onClose={() => setDeletePhotoId(null)}
        onConfirm={handleDelete}
        title="Hapus foto ini?"
        description="Foto akan dihapus permanen dari galeri."
        confirmLabel="Hapus"
        variant="destructive"
      />

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
