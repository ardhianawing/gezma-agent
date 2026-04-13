'use client';

import { useState, useCallback, useRef } from 'react';
import { GripVertical, Plus, Trash2, Edit2, Check, X, ChevronUp, ChevronDown, Play, Image as ImageIcon, Clock, Film } from 'lucide-react';
import { VideoUpload } from './video-upload';

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

interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  duration: string | null;
  videoUrl: string | null;
  videoStorageKey: string | null;
  videoStatus: string;
  videoError: string | null;
  videoDuration: number | null;
  videoSize: bigint | null;
  thumbnailKey: string | null;
}

interface LessonManagerProps {
  courseId: string;
  lessons: Lesson[];
  onUpdate: () => void;
}

const VIDEO_STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  none: { bg: '#F1F5F9', text: '#64748B', label: 'Belum ada' },
  uploading: { bg: '#DBEAFE', text: '#2563EB', label: 'Uploading' },
  processing: { bg: '#FEF3C7', text: '#D97706', label: 'Processing' },
  ready: { bg: '#DCFCE7', text: '#15803D', label: 'Siap' },
  error: { bg: '#FEE2E2', text: '#DC2626', label: 'Error' },
};

export function LessonManager({ courseId, lessons, onUpdate }: LessonManagerProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const dragOverRef = useRef<number | null>(null);

  const addLesson = useCallback(async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/command-center/academy/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim(), duration: newDuration.trim() || null }),
      });
      setNewTitle('');
      setNewContent('');
      setNewDuration('');
      setAdding(false);
      onUpdate();
    } finally {
      setSaving(false);
    }
  }, [courseId, newTitle, newContent, newDuration, onUpdate]);

  const saveEdit = useCallback(async (lessonId: string) => {
    setSaving(true);
    try {
      await fetch(`/api/command-center/academy/courses/${courseId}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim(), duration: editDuration.trim() || null }),
      });
      setEditingId(null);
      onUpdate();
    } finally {
      setSaving(false);
    }
  }, [courseId, editTitle, editContent, editDuration, onUpdate]);

  const deleteLesson = useCallback(async (lessonId: string) => {
    await fetch(`/api/command-center/academy/courses/${courseId}/lessons/${lessonId}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    onUpdate();
  }, [courseId, onUpdate]);

  const moveLesson = useCallback(async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= lessons.length) return;
    const newOrder = [...lessons];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    const lessonIds = newOrder.map((l) => l.id);

    await fetch(`/api/command-center/academy/courses/${courseId}/lessons/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonIds }),
    });
    onUpdate();
  }, [courseId, lessons, onUpdate]);

  // Drag handlers for desktop
  const handleDragStart = (index: number) => setDragging(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverRef.current = index;
  };
  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragging !== null && dragging !== index) {
      await moveLesson(dragging, index);
    }
    setDragging(null);
    dragOverRef.current = null;
  };

  const startEdit = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setEditTitle(lesson.title);
    setEditContent(lesson.content);
    setEditDuration(lesson.duration || '');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: cc.textPrimary, margin: 0 }}>
          Lesson / Kurikulum ({lessons.length})
        </h3>
        <button
          onClick={() => setAdding(true)}
          style={{
            padding: '8px 14px', fontSize: 13, fontWeight: 500,
            background: cc.primary, color: '#fff', border: 'none',
            borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Plus size={14} /> Tambah Lesson
        </button>
      </div>

      {/* Add Lesson Form */}
      {adding && (
        <div style={{ padding: 16, background: cc.primaryLight, borderRadius: 10, marginBottom: 12, border: `1px solid ${cc.primary}33` }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Judul lesson..."
            autoFocus
            style={{
              width: '100%', padding: '10px 12px', fontSize: 14,
              border: `1px solid ${cc.border}`, borderRadius: 8, marginBottom: 8,
              outline: 'none', boxSizing: 'border-box',
              color: cc.textPrimary, backgroundColor: '#FFFFFF',
            }}
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Konten / deskripsi lesson (opsional)..."
            rows={3}
            style={{
              width: '100%', padding: '10px 12px', fontSize: 13,
              border: `1px solid ${cc.border}`, borderRadius: 8, marginBottom: 8,
              outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
              color: cc.textPrimary, backgroundColor: '#FFFFFF',
            }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              placeholder="Durasi (cth: 30 menit)"
              style={{
                flex: 1, padding: '8px 12px', fontSize: 13,
                border: `1px solid ${cc.border}`, borderRadius: 8, outline: 'none',
                color: cc.textPrimary, backgroundColor: '#FFFFFF',
              }}
            />
            <button
              onClick={addLesson}
              disabled={saving || !newTitle.trim()}
              style={{
                padding: '8px 16px', fontSize: 13, fontWeight: 500,
                background: cc.primary, color: '#fff', border: 'none',
                borderRadius: 8, cursor: 'pointer', opacity: saving || !newTitle.trim() ? 0.5 : 1,
              }}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              onClick={() => { setAdding(false); setNewTitle(''); setNewContent(''); setNewDuration(''); }}
              style={{
                padding: '8px 12px', fontSize: 13, background: 'transparent',
                border: `1px solid ${cc.border}`, borderRadius: 8, cursor: 'pointer', color: cc.textMuted,
              }}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Lesson List */}
      {lessons.length === 0 && !adding && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: cc.textMuted, fontSize: 14 }}>
          <Film size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
          <p>Belum ada lesson. Klik &quot;Tambah Lesson&quot; untuk mulai.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lessons.map((lesson, index) => {
          const statusBadge = VIDEO_STATUS_BADGE[lesson.videoStatus] || VIDEO_STATUS_BADGE.none;
          const isEditing = editingId === lesson.id;
          const isDeleting = deleteConfirm === lesson.id;

          return (
            <div
              key={lesson.id}
              draggable={!isEditing}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                background: cc.cardBg,
                border: `1px solid ${dragging === index ? cc.primary : cc.border}`,
                borderRadius: 10,
                overflow: 'hidden',
                opacity: dragging === index ? 0.5 : 1,
                transition: 'border-color 0.2s, opacity 0.2s',
              }}
            >
              {/* Lesson Row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
                flexWrap: 'wrap',
              }}>
                {/* Drag handle + order */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'grab', flexShrink: 0 }}>
                  <GripVertical size={16} color={cc.textMuted} />
                  <span style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: cc.primaryLight, color: cc.primary,
                    fontSize: 12, fontWeight: 600, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {index + 1}
                  </span>
                </div>

                {/* Title + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%', padding: '6px 10px', fontSize: 14,
                          border: `1px solid ${cc.primary}`, borderRadius: 6, outline: 'none',
                          boxSizing: 'border-box', color: cc.textPrimary, backgroundColor: '#FFFFFF',
                        }}
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        style={{
                          width: '100%', padding: '6px 10px', fontSize: 13,
                          border: `1px solid ${cc.border}`, borderRadius: 6, outline: 'none',
                          resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
                          color: cc.textPrimary, backgroundColor: '#FFFFFF',
                        }}
                      />
                      <input
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        placeholder="Durasi"
                        style={{
                          width: 150, padding: '6px 10px', fontSize: 13,
                          border: `1px solid ${cc.border}`, borderRadius: 6, outline: 'none',
                          color: cc.textPrimary, backgroundColor: '#FFFFFF',
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: 14, fontWeight: 500, color: cc.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lesson.title}
                      </p>
                      {lesson.duration && (
                        <span style={{ fontSize: 12, color: cc.textMuted, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Clock size={11} /> {lesson.duration}
                          {lesson.videoDuration && ` (${Math.floor(lesson.videoDuration / 60)}:${String(lesson.videoDuration % 60).padStart(2, '0')})`}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Video status badge */}
                <span style={{
                  padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                  background: statusBadge.bg, color: statusBadge.text, flexShrink: 0,
                }}>
                  {statusBadge.label}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(lesson.id)} disabled={saving} style={{
                        padding: 6, background: cc.success, border: 'none', borderRadius: 6, cursor: 'pointer', color: '#fff',
                      }}>
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingId(null)} style={{
                        padding: 6, background: cc.pageBg, border: `1px solid ${cc.border}`, borderRadius: 6, cursor: 'pointer',
                      }}>
                        <X size={14} color={cc.textMuted} />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Mobile reorder buttons */}
                      <button onClick={() => moveLesson(index, index - 1)} disabled={index === 0} style={{
                        padding: 6, background: cc.pageBg, border: `1px solid ${cc.border}`, borderRadius: 6,
                        cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.3 : 1,
                        display: 'none', // hidden on desktop, shown via media query below
                      }} className="mobile-reorder">
                        <ChevronUp size={14} color={cc.textMuted} />
                      </button>
                      <button onClick={() => moveLesson(index, index + 1)} disabled={index === lessons.length - 1} style={{
                        padding: 6, background: cc.pageBg, border: `1px solid ${cc.border}`, borderRadius: 6,
                        cursor: index === lessons.length - 1 ? 'default' : 'pointer', opacity: index === lessons.length - 1 ? 0.3 : 1,
                        display: 'none',
                      }} className="mobile-reorder">
                        <ChevronDown size={14} color={cc.textMuted} />
                      </button>
                      <button onClick={() => setExpandedVideo(expandedVideo === lesson.id ? null : lesson.id)} style={{
                        padding: 6, background: cc.pageBg, border: `1px solid ${cc.border}`, borderRadius: 6, cursor: 'pointer',
                      }}>
                        <Film size={14} color={cc.primary} />
                      </button>
                      <button onClick={() => startEdit(lesson)} style={{
                        padding: 6, background: cc.pageBg, border: `1px solid ${cc.border}`, borderRadius: 6, cursor: 'pointer',
                      }}>
                        <Edit2 size={14} color={cc.textMuted} />
                      </button>
                      <button onClick={() => setDeleteConfirm(lesson.id)} style={{
                        padding: 6, background: cc.pageBg, border: `1px solid ${cc.border}`, borderRadius: 6, cursor: 'pointer',
                      }}>
                        <Trash2 size={14} color={cc.error} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Delete Confirm */}
              {isDeleting && (
                <div style={{
                  padding: '10px 14px', background: cc.errorLight,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderTop: `1px solid ${cc.error}33`, flexWrap: 'wrap', gap: 8,
                }}>
                  <span style={{ fontSize: 13, color: cc.error }}>Hapus lesson ini?</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => deleteLesson(lesson.id)} style={{
                      padding: '5px 12px', fontSize: 12, background: cc.error,
                      border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer',
                    }}>
                      Ya, Hapus
                    </button>
                    <button onClick={() => setDeleteConfirm(null)} style={{
                      padding: '5px 12px', fontSize: 12, background: '#fff',
                      border: `1px solid ${cc.border}`, borderRadius: 6, cursor: 'pointer',
                    }}>
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Video Upload Panel */}
              {expandedVideo === lesson.id && (
                <div style={{ padding: '12px 14px', borderTop: `1px solid ${cc.borderLight}`, background: cc.pageBg }}>
                  <VideoUpload
                    lessonId={lesson.id}
                    currentStatus={lesson.videoStatus}
                    onComplete={onUpdate}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile styles */}
      <style>{`
        @media (max-width: 640px) {
          .mobile-reorder { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
