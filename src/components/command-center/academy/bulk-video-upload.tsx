'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Film, ArrowRight, FolderUp } from 'lucide-react';
import { useResponsive } from '@/lib/hooks/use-responsive';

const cc = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  cardBg: '#FFFFFF',
  pageBg: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
};

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_RETRIES = 3;
const CONCURRENT_CHUNK_UPLOADS = 3;

interface Lesson {
  id: string;
  title: string;
}

interface BulkVideoUploadProps {
  courseId: string;
  lessons: Lesson[];
  onComplete: () => void;
}

type FileStatus = 'pending' | 'uploading' | 'completing' | 'processing' | 'done' | 'error' | 'skipped';

interface FileEntry {
  file: File;
  lessonId: string | '';
  lessonTitle: string;
  status: FileStatus;
  progress: number;
  speed: string;
  error: string | null;
}

/**
 * Try to match a filename to a lesson by:
 * 1. Numeric prefix matching (e.g., "01-introduction.mp4" -> lesson at index 0)
 * 2. Fuzzy title matching (e.g., "pengenalan-haji.mp4" matches "Pengenalan Haji")
 */
function matchFileToLesson(fileName: string, lessons: Lesson[]): { lessonId: string; lessonTitle: string } | null {
  const baseName = fileName.replace(/\.[^/.]+$/, ''); // strip extension
  const normalized = baseName.toLowerCase().replace(/[-_]/g, ' ').trim();

  // 1. Try numeric prefix match: "01-xxx" -> lesson index 0
  const numMatch = baseName.match(/^(\d+)/);
  if (numMatch) {
    const idx = parseInt(numMatch[1], 10) - 1; // 1-based to 0-based
    if (idx >= 0 && idx < lessons.length) {
      return { lessonId: lessons[idx].id, lessonTitle: lessons[idx].title };
    }
  }

  // 2. Fuzzy title match — check if filename contains lesson title words or vice versa
  for (const lesson of lessons) {
    const lessonNorm = lesson.title.toLowerCase().replace(/[-_]/g, ' ').trim();
    // Check if substantial overlap between filename and title
    if (normalized.includes(lessonNorm) || lessonNorm.includes(normalized)) {
      return { lessonId: lesson.id, lessonTitle: lesson.title };
    }
    // Check word overlap
    const fileWords = normalized.split(/\s+/).filter(w => w.length > 2);
    const titleWords = lessonNorm.split(/\s+/).filter(w => w.length > 2);
    const overlap = fileWords.filter(w => titleWords.includes(w));
    if (overlap.length >= 2 || (overlap.length >= 1 && titleWords.length <= 2)) {
      return { lessonId: lesson.id, lessonTitle: lesson.title };
    }
  }

  return null;
}

export function BulkVideoUpload({ courseId, lessons, onComplete }: BulkVideoUploadProps) {
  const { isMobile } = useResponsive();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  const handleFilesSelected = useCallback((selectedFiles: FileList | File[]) => {
    const newEntries: FileEntry[] = [];
    for (const file of Array.from(selectedFiles)) {
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_FILE_SIZE) continue;

      const match = matchFileToLesson(file.name, lessons);
      newEntries.push({
        file,
        lessonId: match?.lessonId || '',
        lessonTitle: match?.lessonTitle || '',
        status: 'pending',
        progress: 0,
        speed: '',
        error: null,
      });
    }
    setFiles(prev => [...prev, ...newEntries]);
  }, [lessons]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  }, [handleFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(e.target.files);
    }
    e.target.value = '';
  }, [handleFilesSelected]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateFileLesson = useCallback((index: number, lessonId: string) => {
    setFiles(prev => prev.map((f, i) => {
      if (i !== index) return f;
      const lesson = lessons.find(l => l.id === lessonId);
      return { ...f, lessonId, lessonTitle: lesson?.title || '' };
    }));
  }, [lessons]);

  const uploadSingleFile = useCallback(async (entry: FileEntry, index: number) => {
    if (!entry.lessonId) {
      setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'skipped', error: 'Tidak ada lesson yang dipilih' } : f));
      return;
    }

    setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'uploading', progress: 0, speed: '', error: null } : f));

    try {
      // 1. Initiate multipart upload
      const initRes = await fetch('/api/command-center/academy/video/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: entry.lessonId,
          fileName: entry.file.name,
          fileSize: entry.file.size,
          contentType: entry.file.type,
        }),
      });

      if (!initRes.ok) {
        const err = await initRes.json();
        throw new Error(err.error || 'Gagal memulai upload');
      }

      const { uploadId, storageKey, parts, chunkSize } = await initRes.json();

      // 2. Upload chunks
      const completedParts: { partNumber: number; etag: string }[] = [];
      let uploadedBytes = 0;
      const startTime = Date.now();

      const uploadChunk = async (part: { partNumber: number; url: string }) => {
        if (abortRef.current) return;

        const start = (part.partNumber - 1) * chunkSize;
        const end = Math.min(start + chunkSize, entry.file.size);
        const chunk = entry.file.slice(start, end);

        let retries = 0;
        while (retries < MAX_RETRIES) {
          try {
            const res = await fetch(part.url, { method: 'PUT', body: chunk });
            const etag = res.headers.get('ETag') || `"part-${part.partNumber}"`;
            completedParts.push({ partNumber: part.partNumber, etag });

            uploadedBytes += end - start;
            const elapsed = (Date.now() - startTime) / 1000;
            const speed = uploadedBytes / elapsed;
            const speedStr = speed > 1024 * 1024
              ? `${(speed / 1024 / 1024).toFixed(1)} MB/s`
              : `${(speed / 1024).toFixed(0)} KB/s`;

            setFiles(prev => prev.map((f, i) => i === index ? {
              ...f,
              progress: Math.round((uploadedBytes / entry.file.size) * 100),
              speed: speedStr,
            } : f));
            break;
          } catch {
            retries++;
            if (retries >= MAX_RETRIES) throw new Error(`Chunk ${part.partNumber} gagal setelah ${MAX_RETRIES}x`);
            await new Promise(r => setTimeout(r, 1000 * retries));
          }
        }
      };

      for (let i = 0; i < parts.length; i += CONCURRENT_CHUNK_UPLOADS) {
        if (abortRef.current) throw new Error('Upload dibatalkan');
        const batch = parts.slice(i, i + CONCURRENT_CHUNK_UPLOADS);
        await Promise.all(batch.map(uploadChunk));
      }

      if (abortRef.current) throw new Error('Upload dibatalkan');

      // 3. Complete upload
      setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'completing', progress: 100 } : f));

      const completeRes = await fetch('/api/command-center/academy/video/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: entry.lessonId,
          uploadId,
          storageKey,
          parts: completedParts.sort((a, b) => a.partNumber - b.partNumber),
        }),
      });

      if (!completeRes.ok) throw new Error('Gagal menyelesaikan upload');

      setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'done', progress: 100 } : f));
    } catch (err) {
      setFiles(prev => prev.map((f, i) => i === index ? {
        ...f,
        status: 'error',
        error: err instanceof Error ? err.message : 'Upload gagal',
      } : f));
    }
  }, []);

  const startBulkUpload = useCallback(async () => {
    abortRef.current = false;
    setUploading(true);

    // Check for duplicate lesson assignments
    const assignedLessons = files.filter(f => f.lessonId).map(f => f.lessonId);
    const duplicates = assignedLessons.filter((id, i) => assignedLessons.indexOf(id) !== i);
    if (duplicates.length > 0) {
      alert('Ada lesson yang dipilih lebih dari satu kali. Pastikan setiap file punya lesson yang berbeda.');
      setUploading(false);
      return;
    }

    // Upload sequentially
    for (let i = 0; i < files.length; i++) {
      if (abortRef.current) break;
      const entry = files[i];
      if (entry.status === 'done' || entry.status === 'skipped') continue;
      await uploadSingleFile(entry, i);
    }

    setUploading(false);
    onComplete();
  }, [files, uploadSingleFile, onComplete]);

  const handleAbort = useCallback(() => {
    abortRef.current = true;
  }, []);

  const handleClose = useCallback(() => {
    if (uploading) {
      if (!confirm('Upload sedang berlangsung. Yakin ingin menutup?')) return;
      abortRef.current = true;
    }
    setOpen(false);
    setFiles([]);
    setUploading(false);
  }, [uploading]);

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const doneCount = files.filter(f => f.status === 'done').length;
  const errorCount = files.filter(f => f.status === 'error' || f.status === 'skipped').length;
  const unmappedCount = files.filter(f => !f.lessonId && f.status === 'pending').length;

  // Trigger button
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '8px 14px', fontSize: 13, fontWeight: 500,
          background: cc.primaryLight, color: cc.primary,
          border: `1px solid ${cc.primary}33`, borderRadius: 8,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        <FolderUp size={14} /> Bulk Upload Video
      </button>
    );
  }

  // Modal overlay
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
      padding: isMobile ? 0 : 20,
    }}>
      <div style={{
        background: cc.cardBg,
        borderRadius: isMobile ? '16px 16px 0 0' : 16,
        width: isMobile ? '100%' : 680,
        maxHeight: isMobile ? '90vh' : '80vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '16px 16px 12px' : '20px 24px 16px',
          borderBottom: `1px solid ${cc.border}`,
        }}>
          <div>
            <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: cc.textPrimary, margin: 0 }}>
              Bulk Upload Video
            </h2>
            <p style={{ fontSize: 12, color: cc.textMuted, margin: '2px 0 0' }}>
              Upload video ke beberapa lesson sekaligus
            </p>
          </div>
          <button onClick={handleClose} style={{
            padding: 6, background: cc.pageBg, border: `1px solid ${cc.border}`,
            borderRadius: 8, cursor: 'pointer', flexShrink: 0,
          }}>
            <X size={16} color={cc.textMuted} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: isMobile ? 16 : 24,
        }}>
          {/* Drop zone */}
          {!uploading && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: isMobile ? 20 : 28,
                border: `2px dashed ${dragOver ? cc.primary : cc.border}`,
                borderRadius: 12,
                background: dragOver ? cc.primaryLight : cc.pageBg,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: files.length > 0 ? 16 : 0,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                multiple
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              <Upload size={28} color={dragOver ? cc.primary : cc.textMuted} style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 14, fontWeight: 500, color: cc.textPrimary, margin: '4px 0' }}>
                {dragOver ? 'Lepaskan file di sini' : 'Pilih beberapa video sekaligus'}
              </p>
              <p style={{ fontSize: 12, color: cc.textMuted }}>
                MP4, WebM, MOV &middot; Maks 500MB per file
              </p>
              <p style={{ fontSize: 11, color: cc.textMuted, marginTop: 4 }}>
                Tip: Beri nama file &quot;01-judul.mp4&quot;, &quot;02-judul.mp4&quot; untuk auto-match ke lesson
              </p>
            </div>
          )}

          {/* File list */}
          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {files.map((entry, index) => {
                const statusIcon = {
                  pending: null,
                  uploading: <Loader2 size={14} color={cc.primary} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />,
                  completing: <Loader2 size={14} color={cc.warning} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />,
                  processing: <Loader2 size={14} color={cc.warning} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />,
                  done: <CheckCircle size={14} color={cc.success} style={{ flexShrink: 0 }} />,
                  error: <AlertCircle size={14} color={cc.error} style={{ flexShrink: 0 }} />,
                  skipped: <AlertCircle size={14} color={cc.warning} style={{ flexShrink: 0 }} />,
                }[entry.status];

                const statusBg = {
                  pending: 'transparent',
                  uploading: cc.primaryLight,
                  completing: cc.warningLight,
                  processing: cc.warningLight,
                  done: cc.successLight,
                  error: cc.errorLight,
                  skipped: cc.warningLight,
                }[entry.status];

                return (
                  <div key={index} style={{
                    border: `1px solid ${cc.border}`,
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: statusBg,
                  }}>
                    <div style={{
                      display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
                      gap: 8, padding: '10px 12px',
                      flexDirection: isMobile ? 'column' : 'row',
                    }}>
                      {/* File info row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, width: '100%' }}>
                        {statusIcon || <Film size={14} color={cc.textMuted} style={{ flexShrink: 0 }} />}
                        <span style={{
                          fontSize: 13, fontWeight: 500, color: cc.textPrimary,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          flex: 1, minWidth: 0,
                        }}>
                          {entry.file.name}
                        </span>
                        <span style={{ fontSize: 11, color: cc.textMuted, flexShrink: 0 }}>
                          {(entry.file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                        {!uploading && entry.status === 'pending' && (
                          <button onClick={() => removeFile(index)} style={{
                            padding: 4, background: 'transparent', border: 'none',
                            cursor: 'pointer', flexShrink: 0,
                          }}>
                            <X size={14} color={cc.textMuted} />
                          </button>
                        )}
                      </div>

                      {/* Lesson selector */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        width: isMobile ? '100%' : 'auto',
                      }}>
                        <ArrowRight size={12} color={cc.textMuted} style={{ flexShrink: 0, display: isMobile ? 'none' : 'block' }} />
                        {entry.status === 'pending' && !uploading ? (
                          <select
                            value={entry.lessonId}
                            onChange={(e) => updateFileLesson(index, e.target.value)}
                            style={{
                              padding: '6px 8px', fontSize: 12,
                              border: `1px solid ${entry.lessonId ? cc.primary : cc.error}`,
                              borderRadius: 6, outline: 'none',
                              background: '#fff', color: cc.textPrimary,
                              width: isMobile ? '100%' : 200,
                              boxSizing: 'border-box',
                            }}
                          >
                            <option value="">-- Pilih Lesson --</option>
                            {lessons.map(l => (
                              <option key={l.id} value={l.id}>{l.title}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ fontSize: 12, color: cc.textSecondary, fontWeight: 500 }}>
                            {entry.lessonTitle || '-'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar for uploading files */}
                    {(entry.status === 'uploading' || entry.status === 'completing') && (
                      <div style={{ padding: '0 12px 10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: cc.textSecondary }}>
                            {entry.status === 'completing' ? 'Menyelesaikan...' : `${entry.progress}%`}
                          </span>
                          {entry.speed && (
                            <span style={{ fontSize: 11, color: cc.textMuted }}>{entry.speed}</span>
                          )}
                        </div>
                        <div style={{ width: '100%', height: 4, background: '#fff', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            width: `${entry.progress}%`, height: '100%',
                            background: `linear-gradient(90deg, ${cc.primary}, #60A5FA)`,
                            borderRadius: 2, transition: 'width 0.3s ease',
                          }} />
                        </div>
                      </div>
                    )}

                    {/* Error message */}
                    {entry.error && (
                      <div style={{ padding: '4px 12px 8px', fontSize: 11, color: cc.error }}>
                        {entry.error}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {files.length > 0 && (
          <div style={{
            padding: isMobile ? '12px 16px' : '14px 24px',
            borderTop: `1px solid ${cc.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 8,
            background: cc.pageBg,
            borderRadius: isMobile ? 0 : '0 0 16px 16px',
          }}>
            <div style={{ fontSize: 12, color: cc.textMuted }}>
              {files.length} file
              {doneCount > 0 && <span style={{ color: cc.success }}> &middot; {doneCount} selesai</span>}
              {errorCount > 0 && <span style={{ color: cc.error }}> &middot; {errorCount} gagal</span>}
              {unmappedCount > 0 && <span style={{ color: cc.warning }}> &middot; {unmappedCount} belum dipetakan</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {uploading ? (
                <button onClick={handleAbort} style={{
                  padding: '8px 16px', fontSize: 13, fontWeight: 500,
                  background: cc.error, color: '#fff', border: 'none',
                  borderRadius: 8, cursor: 'pointer',
                }}>
                  Batalkan
                </button>
              ) : (
                <>
                  <button onClick={handleClose} style={{
                    padding: '8px 16px', fontSize: 13,
                    background: 'transparent', border: `1px solid ${cc.border}`,
                    borderRadius: 8, cursor: 'pointer', color: cc.textMuted,
                  }}>
                    Tutup
                  </button>
                  <button
                    onClick={startBulkUpload}
                    disabled={pendingCount === 0}
                    style={{
                      padding: '8px 16px', fontSize: 13, fontWeight: 500,
                      background: cc.primary, color: '#fff', border: 'none',
                      borderRadius: 8, cursor: 'pointer',
                      opacity: pendingCount === 0 ? 0.5 : 1,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <Upload size={14} /> Upload {pendingCount > 0 ? `(${pendingCount})` : ''}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
