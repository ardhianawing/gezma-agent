'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Loader2, AlertCircle, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface SecureVideoPlayerProps {
  lessonId: string;
}

export function SecureVideoPlayer({ lessonId }: SecureVideoPlayerProps) {
  const { c } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [lastPosition, setLastPosition] = useState(0);
  const [resumePrompt, setResumePrompt] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    fetch(`/api/academy/video/${lessonId}/progress`)
      .then((r) => r.json())
      .then((data) => {
        if (data.lastPosition > 5) {
          setLastPosition(data.lastPosition);
          setResumePrompt(true);
        }
      })
      .catch(() => {});
  }, [lessonId]);

  // Save progress every 10 seconds while playing
  useEffect(() => {
    if (playing) {
      progressTimerRef.current = setInterval(() => {
        const video = videoRef.current;
        if (!video || video.paused) return;

        const pos = Math.floor(video.currentTime);
        const completed = video.duration > 0 && video.currentTime / video.duration > 0.9;

        fetch(`/api/academy/video/${lessonId}/progress`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lastPosition: pos, completed }),
        }).catch(() => {});
      }, 10000);
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [playing, lessonId]);

  const handlePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = `/api/academy/video/${lessonId}/stream`;
    video.load();

    if (resumePrompt && lastPosition > 5) {
      video.currentTime = lastPosition;
      setResumePrompt(false);
    }

    video
      .play()
      .then(() => {
        setPlaying(true);
        setShowOverlay(false);
        setLoading(false);
      })
      .catch((err) => {
        setError('Gagal memutar video: ' + err.message);
        setLoading(false);
      });
  }, [lessonId, resumePrompt, lastPosition]);

  const handleResumeFromStart = useCallback(() => {
    setLastPosition(0);
    setResumePrompt(false);
    const video = videoRef.current;
    if (!video) return;

    video.src = `/api/academy/video/${lessonId}/stream`;
    video.load();
    video.currentTime = 0;
    video.play().then(() => {
      setPlaying(true);
      setShowOverlay(false);
      setLoading(false);
    }).catch(() => {});
  }, [lessonId]);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    handlePlay();
  }, [handlePlay]);

  const handleVideoEnd = useCallback(() => {
    fetch(`/api/academy/video/${lessonId}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastPosition: 0, completed: true }),
    }).catch(() => {});
    setPlaying(false);
    setShowOverlay(true);
  }, [lessonId]);

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#000',
        userSelect: 'none',
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        playsInline
        controls={playing}
        onEnded={handleVideoEnd}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedData={() => setLoading(false)}
        onError={() => setError('Video gagal dimuat')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />

      {/* Play Overlay */}
      {showOverlay && !error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)',
            cursor: 'pointer',
            transition: 'opacity 0.3s',
          }}
          onClick={resumePrompt ? undefined : handlePlay}
        >
          {resumePrompt ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <p style={{ color: '#fff', fontSize: 14, opacity: 0.9 }}>
                Lanjutkan dari {formatTime(lastPosition)}?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handlePlay}
                  style={{
                    padding: '10px 20px',
                    background: c.primary,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Play size={16} /> Lanjut
                </button>
                <button
                  onClick={handleResumeFromStart}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 8,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Mulai Ulang
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: c.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 20px ${c.primary}66`,
                  transition: 'transform 0.2s',
                }}
              >
                <Play size={28} color="#fff" style={{ marginLeft: 3 }} />
              </div>
              <p style={{ color: '#fff', fontSize: 14, opacity: 0.8 }}>Klik untuk memutar</p>
            </>
          )}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && playing && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)',
          }}
        >
          <Loader2 size={40} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            background: 'rgba(0,0,0,0.8)',
          }}
        >
          <AlertCircle size={40} color="#EF4444" />
          <p style={{ color: '#fff', fontSize: 14 }}>{error}</p>
          <button
            onClick={handleRetry}
            style={{
              padding: '8px 16px',
              background: c.primary,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <RotateCcw size={14} /> Coba Lagi
          </button>
        </div>
      )}

      {/* Anti-download CSS */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        video::-webkit-media-controls-enclosure {
          overflow: hidden;
        }
        video::-webkit-media-controls-panel {
          width: calc(100% + 30px);
        }
        video::-internal-media-controls-download-button {
          display: none !important;
        }
        video::-webkit-media-controls-download-button {
          display: none !important;
        }
      `}</style>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
