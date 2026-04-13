'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Film, RotateCcw } from 'lucide-react';

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
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
};

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_RETRIES = 3;
const CONCURRENT_UPLOADS = 3;

interface VideoUploadProps {
  lessonId: string;
  currentStatus: string;
  onComplete: () => void;
}

interface UploadState {
  phase: 'idle' | 'uploading' | 'completing' | 'processing' | 'ready' | 'error';
  progress: number;
  speed: string;
  error: string | null;
  fileName: string | null;
}

export function VideoUpload({ lessonId, currentStatus, onComplete }: VideoUploadProps) {
  const [state, setState] = useState<UploadState>({
    phase: currentStatus === 'ready' ? 'ready' : currentStatus === 'processing' ? 'processing' : currentStatus === 'error' ? 'error' : 'idle',
    progress: 0,
    speed: '',
    error: null,
    fileName: null,
  });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);
  const uploadStateRef = useRef<{ uploadId: string; storageKey: string; parts: { partNumber: number; url: string }[] } | null>(null);

  // Poll status while processing
  useEffect(() => {
    if (state.phase !== 'processing') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/command-center/academy/video/status/${lessonId}`);
        const data = await res.json();
        if (data.videoStatus === 'ready') {
          setState((s) => ({ ...s, phase: 'ready' }));
          onComplete();
          clearInterval(interval);
        } else if (data.videoStatus === 'error') {
          setState((s) => ({ ...s, phase: 'error', error: data.videoError || 'Processing gagal' }));
          clearInterval(interval);
        }
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, [state.phase, lessonId, onComplete]);

  const uploadFile = useCallback(async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setState((s) => ({ ...s, phase: 'error', error: 'Tipe file tidak valid. Gunakan MP4, WebM, atau MOV' }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setState((s) => ({ ...s, phase: 'error', error: 'File terlalu besar. Maksimal 500MB' }));
      return;
    }

    abortRef.current = false;
    setState({ phase: 'uploading', progress: 0, speed: '', error: null, fileName: file.name });

    try {
      // 1. Initiate multipart upload
      const initRes = await fetch('/api/command-center/academy/video/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
        }),
      });

      if (!initRes.ok) {
        const err = await initRes.json();
        throw new Error(err.error || 'Gagal memulai upload');
      }

      const { uploadId, storageKey, parts, chunkSize } = await initRes.json();
      uploadStateRef.current = { uploadId, storageKey, parts };

      // 2. Upload chunks with concurrency
      const completedParts: { partNumber: number; etag: string }[] = [];
      let uploadedBytes = 0;
      const startTime = Date.now();

      // Save to sessionStorage for resume
      const resumeKey = `upload-${lessonId}`;
      const savedParts = JSON.parse(sessionStorage.getItem(resumeKey) || '[]');

      const uploadChunk = async (part: { partNumber: number; url: string }) => {
        if (abortRef.current) return;

        // Skip already uploaded parts
        const saved = savedParts.find((p: { partNumber: number }) => p.partNumber === part.partNumber);
        if (saved) {
          completedParts.push(saved);
          uploadedBytes += chunkSize;
          setState((s) => ({ ...s, progress: Math.round((uploadedBytes / file.size) * 100) }));
          return;
        }

        const start = (part.partNumber - 1) * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        let retries = 0;
        while (retries < MAX_RETRIES) {
          try {
            const res = await fetch(part.url, { method: 'PUT', body: chunk });
            const etag = res.headers.get('ETag') || `"part-${part.partNumber}"`;
            const partResult = { partNumber: part.partNumber, etag };
            completedParts.push(partResult);

            // Save progress for resume
            savedParts.push(partResult);
            sessionStorage.setItem(resumeKey, JSON.stringify(savedParts));

            uploadedBytes += end - start;
            const elapsed = (Date.now() - startTime) / 1000;
            const speed = uploadedBytes / elapsed;
            const speedStr = speed > 1024 * 1024
              ? `${(speed / 1024 / 1024).toFixed(1)} MB/s`
              : `${(speed / 1024).toFixed(0)} KB/s`;

            setState((s) => ({
              ...s,
              progress: Math.round((uploadedBytes / file.size) * 100),
              speed: speedStr,
            }));
            break;
          } catch {
            retries++;
            if (retries >= MAX_RETRIES) throw new Error(`Chunk ${part.partNumber} gagal setelah ${MAX_RETRIES} percobaan`);
            await new Promise((r) => setTimeout(r, 1000 * retries));
          }
        }
      };

      // Upload in batches of CONCURRENT_UPLOADS
      for (let i = 0; i < parts.length; i += CONCURRENT_UPLOADS) {
        if (abortRef.current) break;
        const batch = parts.slice(i, i + CONCURRENT_UPLOADS);
        await Promise.all(batch.map(uploadChunk));
      }

      if (abortRef.current) return;

      // 3. Complete upload
      setState((s) => ({ ...s, phase: 'completing', progress: 100 }));

      const completeRes = await fetch('/api/command-center/academy/video/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          uploadId,
          storageKey,
          parts: completedParts.sort((a, b) => a.partNumber - b.partNumber),
        }),
      });

      if (!completeRes.ok) throw new Error('Gagal menyelesaikan upload');

      sessionStorage.removeItem(resumeKey);
      setState((s) => ({ ...s, phase: 'processing' }));
    } catch (err) {
      if (!abortRef.current) {
        setState((s) => ({ ...s, phase: 'error', error: err instanceof Error ? err.message : 'Upload gagal' }));
      }
    }
  }, [lessonId]);

  const handleAbort = useCallback(async () => {
    abortRef.current = true;
    const ref = uploadStateRef.current;
    if (ref) {
      await fetch('/api/command-center/academy/video/abort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, uploadId: ref.uploadId, storageKey: ref.storageKey }),
      }).catch(() => {});
    }
    sessionStorage.removeItem(`upload-${lessonId}`);
    setState({ phase: 'idle', progress: 0, speed: '', error: null, fileName: null });
  }, [lessonId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  }, [uploadFile]);

  // Ready state
  if (state.phase === 'ready') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', background: cc.successLight, borderRadius: 8,
        fontSize: 13, color: cc.success, fontWeight: 500,
      }}>
        <CheckCircle size={16} />
        <span>Video siap</span>
        <button
          onClick={() => setState({ phase: 'idle', progress: 0, speed: '', error: null, fileName: null })}
          style={{
            marginLeft: 'auto', padding: '4px 10px', fontSize: 12,
            background: 'transparent', border: `1px solid ${cc.success}`,
            borderRadius: 6, color: cc.success, cursor: 'pointer',
          }}
        >
          Ganti Video
        </button>
      </div>
    );
  }

  // Processing state
  if (state.phase === 'processing' || state.phase === 'completing') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', background: cc.warningLight, borderRadius: 8,
        fontSize: 13, color: cc.warning, fontWeight: 500,
      }}>
        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
        <span>{state.phase === 'completing' ? 'Menyelesaikan upload...' : 'Memproses thumbnail...'}</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Uploading state
  if (state.phase === 'uploading') {
    return (
      <div style={{
        padding: 16, background: cc.primaryLight, borderRadius: 10,
        border: `1px solid ${cc.primary}33`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Film size={16} color={cc.primary} />
            <span style={{ fontSize: 13, fontWeight: 500, color: cc.textPrimary, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {state.fileName}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: cc.textSecondary }}>{state.speed}</span>
            <button onClick={handleAbort} style={{
              padding: '4px 8px', fontSize: 12, background: 'transparent',
              border: `1px solid ${cc.error}`, borderRadius: 6, color: cc.error, cursor: 'pointer',
            }}>
              <X size={12} />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ width: '100%', height: 6, background: '#fff', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${state.progress}%`, height: '100%',
            background: `linear-gradient(90deg, ${cc.primary}, #60A5FA)`,
            borderRadius: 3, transition: 'width 0.3s ease',
          }} />
        </div>
        <p style={{ fontSize: 12, color: cc.textSecondary, marginTop: 6, textAlign: 'right' }}>
          {state.progress}%
        </p>
      </div>
    );
  }

  // Error state
  if (state.phase === 'error') {
    return (
      <div style={{
        padding: 12, background: cc.errorLight, borderRadius: 10,
        border: `1px solid ${cc.error}33`, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <AlertCircle size={16} color={cc.error} />
        <span style={{ fontSize: 13, color: cc.error, flex: 1 }}>{state.error}</span>
        <button onClick={() => setState({ phase: 'idle', progress: 0, speed: '', error: null, fileName: null })} style={{
          padding: '4px 10px', fontSize: 12, background: cc.error,
          border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <RotateCcw size={12} /> Coba Lagi
        </button>
      </div>
    );
  }

  // Idle — Drop Zone
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{
        padding: 20,
        border: `2px dashed ${dragOver ? cc.primary : cc.border}`,
        borderRadius: 10,
        background: dragOver ? cc.primaryLight : 'transparent',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <Upload size={28} color={dragOver ? cc.primary : cc.textSecondary} style={{ marginBottom: 8 }} />
      <p style={{ fontSize: 14, fontWeight: 500, color: cc.textPrimary, margin: '4px 0' }}>
        {dragOver ? 'Lepaskan file di sini' : 'Drag & drop video'}
      </p>
      <p style={{ fontSize: 12, color: cc.textSecondary }}>
        atau klik untuk pilih file &middot; MP4, WebM, MOV &middot; Maks 500MB
      </p>
    </div>
  );
}
