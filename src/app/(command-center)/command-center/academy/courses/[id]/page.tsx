'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { LessonManager } from '@/components/command-center/academy/lesson-manager';

const cc = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  success: '#16A34A',
  successLight: '#DCFCE7',
  cardBg: '#FFFFFF',
  pageBg: '#F8FAFC',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
};

const CATEGORIES = [
  { value: 'operasional', label: 'Operasional' },
  { value: 'manasik', label: 'Manasik' },
  { value: 'bisnis', label: 'Bisnis' },
  { value: 'tutorial', label: 'Tutorial' },
];

const LEVELS = [
  { value: 'pemula', label: 'Pemula' },
  { value: 'menengah', label: 'Menengah' },
  { value: 'lanjutan', label: 'Lanjutan' },
];

interface CourseData {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  instructorName: string;
  duration: string;
  isPublished: boolean;
  lessons: Array<{
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
  }>;
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 14,
  border: `1px solid ${cc.border}`,
  borderRadius: 8,
  outline: 'none',
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
  color: cc.textPrimary,
  backgroundColor: '#FFFFFF',
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500 as const,
  color: cc.textSecondary,
  marginBottom: 4,
};

export default function CourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>('');
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('operasional');
  const [level, setLevel] = useState('pemula');
  const [instructorName, setInstructorName] = useState('');
  const [duration, setDuration] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const fetchCourse = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/command-center/academy/courses/${id}`);
      const data = await res.json();
      const c = data.course;
      setCourse(c);
      setTitle(c.title);
      setDescription(c.description);
      setCategory(c.category);
      setLevel(c.level);
      setInstructorName(c.instructorName);
      setDuration(c.duration);
      setIsPublished(c.isPublished);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    params.then(({ id }) => {
      setCourseId(id);
      fetchCourse(id);
    });
  }, [params, fetchCourse]);

  const handleSave = useCallback(async () => {
    if (!title.trim() || !instructorName.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/command-center/academy/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, level, instructorName, duration, isPublished }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [courseId, title, description, category, level, instructorName, duration, isPublished]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Loader2 size={32} color={cc.primary} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: cc.textMuted }}>
        Course tidak ditemukan
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => router.push('/command-center/academy')}
          style={{
            padding: '8px 12px', background: cc.pageBg, border: `1px solid ${cc.border}`,
            borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: cc.textSecondary,
          }}
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: cc.textPrimary, margin: 0, flex: 1 }}>
          Edit Course
        </h1>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          style={{
            padding: '10px 20px', fontSize: 14, fontWeight: 500,
            background: saved ? cc.success : cc.primary,
            color: '#fff', border: 'none', borderRadius: 8,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            opacity: saving || !title.trim() ? 0.5 : 1,
            transition: 'background 0.3s',
          }}
        >
          {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
          {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan'}
        </button>
      </div>

      {/* Course Form */}
      <div style={{
        background: cc.cardBg, borderRadius: 12, border: `1px solid ${cc.border}`,
        padding: 20, marginBottom: 24,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div>
            <label style={labelStyle}>Judul Course *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="Judul course..." />
          </div>
          <div>
            <label style={labelStyle}>Instruktur *</label>
            <input value={instructorName} onChange={(e) => setInstructorName(e.target.value)} style={inputStyle} placeholder="Nama instruktur..." />
          </div>
          <div>
            <label style={labelStyle}>Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} style={inputStyle}>
              {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Durasi</label>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle} placeholder="cth: 6 jam" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}>
            <button
              onClick={() => setIsPublished(!isPublished)}
              style={{
                padding: '8px 14px', fontSize: 13, fontWeight: 500,
                background: isPublished ? cc.successLight : cc.pageBg,
                border: `1px solid ${isPublished ? cc.success : cc.border}`,
                borderRadius: 8, cursor: 'pointer',
                color: isPublished ? cc.success : cc.textMuted,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
              {isPublished ? 'Published' : 'Draft'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Deskripsi course..."
          />
        </div>
      </div>

      {/* Lesson Manager */}
      <div style={{
        background: cc.cardBg, borderRadius: 12, border: `1px solid ${cc.border}`,
        padding: 20,
      }}>
        <LessonManager
          courseId={courseId}
          lessons={course.lessons}
          onUpdate={() => fetchCourse(courseId)}
        />
      </div>
    </div>
  );
}
