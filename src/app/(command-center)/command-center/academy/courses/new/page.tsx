'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';

const cc = {
  primary: '#2563EB',
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

export default function CourseCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('operasional');
  const [level, setLevel] = useState('pemula');
  const [instructorName, setInstructorName] = useState('');
  const [duration, setDuration] = useState('');

  const handleCreate = useCallback(async () => {
    if (!title.trim() || !description.trim() || !instructorName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/command-center/academy/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, level, instructorName, duration: duration || '0 jam' }),
      });
      const data = await res.json();
      if (data.course?.id) {
        router.push(`/command-center/academy/courses/${data.course.id}`);
      }
    } finally {
      setSaving(false);
    }
  }, [title, description, category, level, instructorName, duration, router]);

  return (
    <div style={{ padding: '24px 20px', maxWidth: 700, margin: '0 auto' }}>
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
        <h1 style={{ fontSize: 20, fontWeight: 700, color: cc.textPrimary, margin: 0 }}>
          Buat Course Baru
        </h1>
      </div>

      {/* Form */}
      <div style={{
        background: cc.cardBg, borderRadius: 12, border: `1px solid ${cc.border}`, padding: 20,
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
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Deskripsi *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Deskripsi course..."
          />
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleCreate}
            disabled={saving || !title.trim() || !description.trim() || !instructorName.trim()}
            style={{
              padding: '12px 24px', fontSize: 14, fontWeight: 600,
              background: cc.primary, color: '#fff', border: 'none',
              borderRadius: 8, cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 6,
              opacity: saving || !title.trim() || !description.trim() || !instructorName.trim() ? 0.5 : 1,
            }}
          >
            {saving ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Membuat...
              </>
            ) : (
              <>
                <Plus size={16} /> Buat Course
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
