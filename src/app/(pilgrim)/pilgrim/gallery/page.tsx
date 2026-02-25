'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Loader2 } from 'lucide-react';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const RED = '#DC2626';

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  uploadedAt: string;
}

export default function GalleryPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { addToast } = useToast();
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('URL foto diperlukan');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/pilgrim-portal/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), caption: caption.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal mengunggah');
      setPhotos([json.photo, ...photos]);
      setUrl('');
      setCaption('');
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

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{
          fontSize: isMobile ? '22px' : '26px',
          fontWeight: 700,
          color: c.textPrimary,
          margin: '0 0 4px 0',
        }}>
          {'\u{1F4F8}'} Galeri Foto
        </h1>
        <p style={{
          fontSize: '14px',
          color: c.textMuted,
          margin: 0,
        }}>
          Simpan kenangan perjalanan umrah Anda
        </p>
      </div>

      {/* Upload form */}
      <div style={{
        backgroundColor: c.cardBg,
        border: '1px solid ' + c.border,
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: c.textPrimary,
          margin: '0 0 12px 0',
        }}>
          Tambah Foto
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="url"
            placeholder="URL Foto (https://...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              padding: '10px 14px',
              fontSize: '14px',
              border: '1px solid ' + c.border,
              borderRadius: '8px',
              backgroundColor: c.pageBg,
              color: c.textPrimary,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <input
            type="text"
            placeholder="Keterangan (opsional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{
              padding: '10px 14px',
              fontSize: '14px',
              border: '1px solid ' + c.border,
              borderRadius: '8px',
              backgroundColor: c.pageBg,
              color: c.textPrimary,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {error && (
            <p style={{ fontSize: '12px', color: RED, margin: 0 }}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              backgroundColor: GREEN,
              border: 'none',
              borderRadius: '10px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {submitting && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
              {submitting ? 'Mengunggah...' : 'Simpan Foto'}
            </span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <p style={{ textAlign: 'center', color: c.textMuted, fontSize: '14px' }}>
          Memuat galeri...
        </p>
      )}

      {/* Empty state */}
      {!loading && photos.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: c.textMuted,
        }}>
          <span style={{ fontSize: '48px' }}>{'\u{1F4F7}'}</span>
          <p style={{ fontSize: '16px', margin: '12px 0 4px 0', fontWeight: 500 }}>
            Belum ada foto
          </p>
          <p style={{ fontSize: '13px', margin: 0 }}>
            Tambahkan foto kenangan perjalanan umrah Anda
          </p>
        </div>
      )}

      {/* Photo grid */}
      {!loading && photos.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr',
          gap: '12px',
        }}>
          {photos.map((photo) => (
            <div key={photo.id} style={{
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                width: '100%',
                paddingTop: '100%',
                position: 'relative',
                backgroundColor: c.pageBg,
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption || 'Foto'}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div style={{ padding: '10px 12px' }}>
                {photo.caption && (
                  <p style={{
                    fontSize: '12px',
                    color: c.textPrimary,
                    margin: '0 0 6px 0',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {photo.caption}
                  </p>
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontSize: '10px',
                    color: c.textLight,
                  }}>
                    {new Date(photo.uploadedAt).toLocaleDateString('id-ID')}
                  </span>
                  <button
                    onClick={() => setDeletePhotoId(photo.id)}
                    disabled={deletingId === photo.id}
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: RED,
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      opacity: deletingId === photo.id ? 0.5 : 1,
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
}
