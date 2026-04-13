'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, Users, Award, TrendingUp, CheckCircle, Edit2, Trash2, Eye, Globe, Archive, Plus, Loader2, Film } from 'lucide-react';

const cc = {
  primary: '#2563EB',
  cardBg: '#FFFFFF',
  pageBg: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
};

type FilterTab = 'semua' | 'published' | 'draft';

interface CourseLesson {
  id: string;
  videoStatus: string;
}

interface Course {
  id: string;
  title: string;
  category: string;
  instructorName: string;
  level: string;
  duration: string;
  isPublished: boolean;
  createdAt: string;
  lessons: CourseLesson[];
  _count: { progress: number; reviews: number };
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  operasional: { bg: '#FEF3C7', text: '#D97706' },
  manasik:     { bg: '#DBEAFE', text: '#1D4ED8' },
  bisnis:      { bg: '#F3E8FF', text: '#7C3AED' },
  tutorial:    { bg: '#DCFCE7', text: '#15803D' },
};

const VIDEO_STATUS_COLORS: Record<string, string> = {
  ready: '#16A34A',
  processing: '#D97706',
  uploading: '#2563EB',
  error: '#DC2626',
  none: '#94A3B8',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CCAcademyPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('semua');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [enrollmentModal, setEnrollmentModal] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/command-center/academy/courses');
      const data = await res.json();
      setCourses(data.courses || []);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const stats = {
    totalCourses: courses.length,
    totalEnrollments: courses.reduce((s, c) => s + c._count.progress, 0),
    totalVideos: courses.reduce((s, c) => s + c.lessons.filter(l => l.videoStatus === 'ready').length, 0),
    totalLessons: courses.reduce((s, c) => s + c.lessons.length, 0),
    published: courses.filter(c => c.isPublished).length,
  };

  const filtered = courses.filter(c => {
    if (activeTab === 'semua') return true;
    if (activeTab === 'published') return c.isPublished;
    return !c.isPublished;
  });

  const togglePublish = async (id: string) => {
    const course = courses.find(c => c.id === id);
    if (!course) return;
    await fetch(`/api/command-center/academy/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !course.isPublished }),
    });
    fetchCourses();
  };

  const deleteCourse = async (id: string) => {
    await fetch(`/api/command-center/academy/courses/${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    fetchCourses();
  };

  const statCards = [
    { label: 'Courses', value: stats.totalCourses, icon: BookOpen, color: '#2563EB' },
    { label: 'Enrollments', value: stats.totalEnrollments.toLocaleString('id-ID'), icon: Users, color: '#10B981' },
    { label: 'Video Siap', value: `${stats.totalVideos}/${stats.totalLessons}`, icon: Film, color: '#8B5CF6' },
    { label: 'Published', value: stats.published, icon: Globe, color: '#F59E0B' },
  ];

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Draft' },
  ];

  const enrollmentModalCourse = courses.find(c => c.id === enrollmentModal);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80 }}>
        <Loader2 size={32} color={cc.primary} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              backgroundColor: '#2563EB18', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <GraduationCap style={{ width: '20px', height: '20px', color: '#2563EB' }} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
              Academy
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px', marginBottom: 0 }}>
            Kelola kursus, lesson & video dalam ekosistem GEZMA Academy.
          </p>
        </div>
        <button
          onClick={() => router.push('/command-center/academy/courses/new')}
          style={{
            padding: '10px 18px', fontSize: 14, fontWeight: 600,
            background: cc.primary, color: '#fff', border: 'none',
            borderRadius: 10, cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: 6, marginTop: 4,
          }}
        >
          <Plus size={16} /> Buat Course
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{
              backgroundColor: cc.cardBg, borderRadius: '10px',
              border: `1px solid ${cc.border}`, padding: '14px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: `${card.color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon style={{ width: '18px', height: '18px', color: card.color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '11px', color: cc.textMuted, margin: 0, whiteSpace: 'nowrap' }}>{card.label}</p>
                <p style={{ fontSize: '18px', fontWeight: '700', color: cc.textPrimary, margin: '2px 0 0 0' }}>
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div style={{ backgroundColor: cc.cardBg, borderRadius: '12px', border: `1px solid ${cc.border}`, overflow: 'hidden' }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${cc.border}`, paddingLeft: '20px', overflowX: 'auto' }}>
          {filterTabs.map(tab => {
            const isActive = activeTab === tab.key;
            const count = tab.key === 'semua' ? courses.length
              : tab.key === 'published' ? courses.filter(c => c.isPublished).length
              : courses.filter(c => !c.isPublished).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '14px 20px', border: 'none',
                  borderBottom: isActive ? `2px solid ${cc.primary}` : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: isActive ? cc.primary : cc.textMuted,
                  fontSize: '14px', fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', marginBottom: '-1px',
                  display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  backgroundColor: isActive ? `${cc.primary}18` : cc.borderLight,
                  color: isActive ? cc.primary : cc.textMuted,
                  padding: '1px 7px', borderRadius: '10px',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: cc.borderLight }}>
                {['Judul Kursus', 'Kategori', 'Instruktur', 'Video', 'Status', 'Aksi'].map((h, i) => (
                  <th key={h} style={{
                    padding: '10px 12px',
                    textAlign: i >= 3 && i <= 4 ? 'center' : 'left',
                    fontSize: '11px', fontWeight: 600, color: cc.textMuted,
                    textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: cc.textMuted, fontSize: '14px' }}>
                    {courses.length === 0 ? 'Belum ada course. Klik "Buat Course" untuk mulai.' : 'Tidak ada kursus ditemukan.'}
                  </td>
                </tr>
              ) : filtered.map((course, i) => {
                const catColor = CATEGORY_COLORS[course.category] || { bg: '#F1F5F9', text: '#64748B' };
                const isPublished = course.isPublished;
                const readyVideos = course.lessons.filter(l => l.videoStatus === 'ready').length;
                const totalLessons = course.lessons.length;

                return (
                  <tr key={course.id} style={{
                    borderTop: `1px solid ${cc.borderLight}`,
                    backgroundColor: i % 2 === 0 ? '#fff' : cc.pageBg,
                  }}>
                    <td style={{ padding: '10px 12px', maxWidth: '200px' }}>
                      <p style={{
                        fontSize: '13px', fontWeight: 600, color: cc.textPrimary, margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {course.title}
                      </p>
                      <span style={{ fontSize: '11px', color: cc.textMuted }}>{totalLessons} lesson</span>
                    </td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, color: catColor.text,
                        backgroundColor: catColor.bg, padding: '3px 8px', borderRadius: '6px',
                      }}>
                        {course.category}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', color: cc.textSecondary, margin: 0, fontWeight: 500 }}>
                        {course.instructorName}
                      </p>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {totalLessons > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: readyVideos === totalLessons ? '#16A34A' : '#D97706' }}>
                            {readyVideos}/{totalLessons}
                          </span>
                          <div style={{ width: 40, height: 4, background: cc.borderLight, borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${(readyVideos / totalLessons) * 100}%`,
                              background: readyVideos === totalLessons ? '#16A34A' : '#D97706',
                              borderRadius: 2,
                            }} />
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: cc.textMuted }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 600,
                        color: isPublished ? '#15803D' : '#D97706',
                        backgroundColor: isPublished ? '#DCFCE7' : '#FEF3C7',
                        padding: '3px 8px', borderRadius: '6px',
                      }}>
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
                        <button
                          title={isPublished ? 'Unpublish' : 'Publish'}
                          onClick={() => togglePublish(course.id)}
                          style={{
                            width: '28px', height: '28px', borderRadius: '6px',
                            border: `1px solid ${isPublished ? '#BBF7D0' : cc.border}`,
                            backgroundColor: isPublished ? '#F0FDF4' : cc.cardBg,
                            color: isPublished ? '#15803D' : cc.textMuted,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', flexShrink: 0,
                          }}
                        >
                          <Globe style={{ width: '13px', height: '13px' }} />
                        </button>
                        <button
                          title="Edit Kursus"
                          onClick={() => router.push(`/command-center/academy/courses/${course.id}`)}
                          style={{
                            width: '28px', height: '28px', borderRadius: '6px',
                            border: `1px solid ${cc.border}`, backgroundColor: cc.cardBg,
                            color: cc.primary, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                          }}
                        >
                          <Edit2 style={{ width: '13px', height: '13px' }} />
                        </button>
                        {deleteConfirm === course.id ? (
                          <div style={{ display: 'flex', gap: '3px' }}>
                            <button onClick={() => deleteCourse(course.id)} style={{
                              padding: '3px 6px', borderRadius: '5px', border: 'none',
                              backgroundColor: '#DC2626', color: 'white', fontSize: '10px',
                              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                            }}>
                              Hapus
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} style={{
                              padding: '3px 6px', borderRadius: '5px', border: `1px solid ${cc.border}`,
                              backgroundColor: cc.cardBg, color: cc.textMuted, fontSize: '10px', cursor: 'pointer',
                            }}>
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            title="Hapus Kursus"
                            onClick={() => setDeleteConfirm(course.id)}
                            style={{
                              width: '28px', height: '28px', borderRadius: '6px',
                              border: `1px solid #FECACA`, backgroundColor: '#FEF2F2',
                              color: '#DC2626', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                            }}
                          >
                            <Trash2 style={{ width: '13px', height: '13px' }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 20px', borderTop: `1px solid ${cc.borderLight}` }}>
          <p style={{ fontSize: '13px', color: cc.textMuted, margin: 0 }}>
            Menampilkan {filtered.length} dari {courses.length} kursus
          </p>
        </div>
      </div>

      {/* Enrollment Modal */}
      {enrollmentModal && enrollmentModalCourse && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
          onClick={() => setEnrollmentModal(null)}
        >
          <div
            style={{
              backgroundColor: cc.cardBg, borderRadius: '16px',
              border: `1px solid ${cc.border}`, padding: '28px',
              maxWidth: '480px', width: '100%',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: cc.textPrimary, margin: 0 }}>
                Detail Enrollments
              </h2>
              <button
                onClick={() => setEnrollmentModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: cc.textMuted, lineHeight: 1 }}
              >
                x
              </button>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: cc.textPrimary, marginBottom: '16px' }}>
              {enrollmentModalCourse.title}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Total Enrollments', value: enrollmentModalCourse._count.progress.toLocaleString('id-ID') },
                { label: 'Total Reviews', value: enrollmentModalCourse._count.reviews.toLocaleString('id-ID') },
                { label: 'Total Lessons', value: enrollmentModalCourse.lessons.length },
                { label: 'Instruktur', value: enrollmentModalCourse.instructorName },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '14px 16px', backgroundColor: cc.pageBg,
                  borderRadius: '10px', border: `1px solid ${cc.borderLight}`,
                }}>
                  <p style={{ fontSize: '11px', color: cc.textMuted, margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: cc.textPrimary, margin: '4px 0 0 0' }}>{item.value}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setEnrollmentModal(null)}
              style={{
                marginTop: '20px', width: '100%', padding: '10px',
                borderRadius: '10px', border: `1px solid ${cc.border}`,
                backgroundColor: cc.pageBg, color: cc.textSecondary,
                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
