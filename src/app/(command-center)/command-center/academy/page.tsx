'use client';

import { useState } from 'react';
import { GraduationCap, BookOpen, Users, Award, TrendingUp, CheckCircle, Edit2, Trash2, Eye, Globe, Archive } from 'lucide-react';

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

type CourseStatus = 'published' | 'draft' | 'archived';
type FilterTab = 'semua' | 'published' | 'draft' | 'archived';

interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  enrollments: number;
  completionRate: number;
  status: CourseStatus;
  createdDate: string;
  certificates: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Regulasi:    { bg: '#DBEAFE', text: '#1D4ED8' },
  Operasional: { bg: '#FEF3C7', text: '#D97706' },
  Marketing:   { bg: '#F3E8FF', text: '#7C3AED' },
  Keuangan:    { bg: '#DCFCE7', text: '#15803D' },
  Teknologi:   { bg: '#FEE2E2', text: '#DC2626' },
};

const STATUS_COLORS: Record<CourseStatus, { bg: string; text: string; label: string }> = {
  published: { bg: '#DCFCE7', text: '#15803D', label: 'Published' },
  draft:     { bg: '#FEF3C7', text: '#D97706', label: 'Draft' },
  archived:  { bg: '#F1F5F9', text: '#64748B', label: 'Archived' },
};

const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Panduan Regulasi PPIU & PIHK 2026',
    category: 'Regulasi',
    instructor: 'Dr. Ahmad Fauzi',
    enrollments: 342,
    completionRate: 78,
    status: 'published',
    createdDate: '2026-01-15',
    certificates: 267,
  },
  {
    id: '2',
    title: 'Manajemen Operasional Umrah Modern',
    category: 'Operasional',
    instructor: 'Ir. Siti Rahmawati',
    enrollments: 215,
    completionRate: 65,
    status: 'published',
    createdDate: '2026-01-28',
    certificates: 140,
  },
  {
    id: '3',
    title: 'Strategi Marketing Digital untuk Agensi Haji',
    category: 'Marketing',
    instructor: 'Budi Santoso, MBA',
    enrollments: 189,
    completionRate: 82,
    status: 'published',
    createdDate: '2026-02-05',
    certificates: 155,
  },
  {
    id: '4',
    title: 'Akuntansi & Keuangan Agensi Perjalanan Umrah',
    category: 'Keuangan',
    instructor: 'CPA Nurul Hidayah',
    enrollments: 97,
    completionRate: 54,
    status: 'published',
    createdDate: '2026-02-20',
    certificates: 52,
  },
  {
    id: '5',
    title: 'Pemanfaatan Platform GEZMA untuk Agensi',
    category: 'Teknologi',
    instructor: 'Tim Produk GEZMA',
    enrollments: 410,
    completionRate: 91,
    status: 'published',
    createdDate: '2026-03-01',
    certificates: 373,
  },
  {
    id: '6',
    title: 'Dasar-Dasar Layanan Pelanggan Jemaah',
    category: 'Operasional',
    instructor: 'Hj. Fatimah Zahra',
    enrollments: 0,
    completionRate: 0,
    status: 'draft',
    createdDate: '2026-03-15',
    certificates: 0,
  },
  {
    id: '7',
    title: 'Kepatuhan Syariah dalam Produk Paket Umrah',
    category: 'Regulasi',
    instructor: 'Ust. M. Arief Hakim',
    enrollments: 0,
    completionRate: 0,
    status: 'draft',
    createdDate: '2026-04-01',
    certificates: 0,
  },
  {
    id: '8',
    title: 'Pengelolaan Media Sosial Agensi (2024)',
    category: 'Marketing',
    instructor: 'Reza Pratama',
    enrollments: 134,
    completionRate: 100,
    status: 'archived',
    createdDate: '2024-06-10',
    certificates: 134,
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CCAcademyPage() {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [activeTab, setActiveTab] = useState<FilterTab>('semua');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [enrollmentModal, setEnrollmentModal] = useState<string | null>(null);

  const stats = {
    totalCourses: courses.length,
    totalEnrollments: courses.reduce((s, c) => s + c.enrollments, 0),
    avgCompletion: Math.round(
      courses.filter(c => c.enrollments > 0).reduce((s, c) => s + c.completionRate, 0) /
      (courses.filter(c => c.enrollments > 0).length || 1)
    ),
    certificates: courses.reduce((s, c) => s + c.certificates, 0),
    activeStudents: courses.filter(c => c.status === 'published').reduce((s, c) => s + c.enrollments, 0),
  };

  const filtered = courses.filter(c => {
    if (activeTab === 'semua') return true;
    return c.status === activeTab;
  });

  const togglePublish = (id: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, status: c.status === 'published' ? 'draft' : 'published' };
    }));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  const statCards = [
    { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: '#2563EB' },
    { label: 'Total Enrollments', value: stats.totalEnrollments.toLocaleString('id-ID'), icon: Users, color: '#10B981' },
    { label: 'Completion Rate', value: `${stats.avgCompletion}%`, icon: TrendingUp, color: '#8B5CF6' },
    { label: 'Certificates Issued', value: stats.certificates.toLocaleString('id-ID'), icon: Award, color: '#F59E0B' },
    { label: 'Active Students', value: stats.activeStudents.toLocaleString('id-ID'), icon: CheckCircle, color: '#EF4444' },
  ];

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Draft' },
    { key: 'archived', label: 'Archived' },
  ];

  const enrollmentModalCourse = courses.find(c => c.id === enrollmentModal);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#2563EB18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <GraduationCap style={{ width: '20px', height: '20px', color: '#2563EB' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
            Academy Administration
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px', marginBottom: 0 }}>
          Kelola kursus, pendaftaran, dan sertifikat dalam ekosistem GEZMA Academy.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                backgroundColor: cc.cardBg,
                borderRadius: '12px',
                border: `1px solid ${cc.border}`,
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: `${card.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon style={{ width: '22px', height: '22px', color: card.color }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: cc.textMuted, margin: 0 }}>{card.label}</p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: cc.textPrimary, margin: '4px 0 0 0' }}>
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
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${cc.border}`,
          paddingLeft: '20px',
        }}>
          {filterTabs.map(tab => {
            const isActive = activeTab === tab.key;
            const count = tab.key === 'semua' ? courses.length : courses.filter(c => c.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '14px 20px',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${cc.primary}` : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: isActive ? cc.primary : cc.textMuted,
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  marginBottom: '-1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {tab.label}
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: isActive ? `${cc.primary}18` : cc.borderLight,
                  color: isActive ? cc.primary : cc.textMuted,
                  padding: '1px 7px',
                  borderRadius: '10px',
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
                {['Judul Kursus', 'Kategori', 'Instruktur', 'Enrollments', 'Completion Rate', 'Status', 'Dibuat', 'Aksi'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      textAlign: i >= 3 && i <= 5 ? 'center' : 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: cc.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: cc.textMuted, fontSize: '14px' }}>
                    Tidak ada kursus ditemukan.
                  </td>
                </tr>
              ) : filtered.map((course, i) => {
                const catColor = CATEGORY_COLORS[course.category] || { bg: '#F1F5F9', text: '#64748B' };
                const statusCfg = STATUS_COLORS[course.status];
                const isPublished = course.status === 'published';

                return (
                  <tr
                    key={course.id}
                    style={{
                      borderTop: `1px solid ${cc.borderLight}`,
                      backgroundColor: i % 2 === 0 ? '#fff' : cc.pageBg,
                    }}
                  >
                    {/* Title */}
                    <td style={{ padding: '14px 16px', maxWidth: '280px' }}>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: cc.textPrimary,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {course.title}
                      </p>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: catColor.text,
                        backgroundColor: catColor.bg,
                        padding: '3px 10px',
                        borderRadius: '6px',
                      }}>
                        {course.category}
                      </span>
                    </td>

                    {/* Instructor */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', color: cc.textSecondary, margin: 0, fontWeight: 500 }}>
                        {course.instructor}
                      </p>
                    </td>

                    {/* Enrollments */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: cc.textPrimary }}>
                      {course.enrollments.toLocaleString('id-ID')}
                    </td>

                    {/* Completion Rate */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {course.enrollments > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: course.completionRate >= 75 ? '#15803D' : course.completionRate >= 50 ? '#D97706' : '#DC2626' }}>
                            {course.completionRate}%
                          </span>
                          <div style={{ width: '64px', height: '4px', backgroundColor: cc.borderLight, borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${course.completionRate}%`,
                              backgroundColor: course.completionRate >= 75 ? '#10B981' : course.completionRate >= 50 ? '#F59E0B' : '#EF4444',
                              borderRadius: '2px',
                            }} />
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: cc.textMuted }}>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: statusCfg.text,
                        backgroundColor: statusCfg.bg,
                        padding: '3px 10px',
                        borderRadius: '6px',
                      }}>
                        {statusCfg.label}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: cc.textMuted, whiteSpace: 'nowrap' }}>
                      {formatDate(course.createdDate)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        {/* Publish/Unpublish */}
                        {course.status !== 'archived' && (
                          <button
                            title={isPublished ? 'Unpublish' : 'Publish'}
                            onClick={() => togglePublish(course.id)}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              border: `1px solid ${isPublished ? '#BBF7D0' : cc.border}`,
                              backgroundColor: isPublished ? '#F0FDF4' : cc.cardBg,
                              color: isPublished ? '#15803D' : cc.textMuted,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <Globe style={{ width: '14px', height: '14px' }} />
                          </button>
                        )}
                        {course.status === 'archived' && (
                          <button
                            title="Archived"
                            disabled
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              border: `1px solid ${cc.border}`,
                              backgroundColor: cc.borderLight,
                              color: cc.textMuted,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'not-allowed',
                              flexShrink: 0,
                            }}
                          >
                            <Archive style={{ width: '14px', height: '14px' }} />
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          title="Edit Kursus"
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            border: `1px solid ${cc.border}`,
                            backgroundColor: cc.cardBg,
                            color: cc.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          <Edit2 style={{ width: '14px', height: '14px' }} />
                        </button>

                        {/* View Enrollments */}
                        <button
                          title="Lihat Enrollments"
                          onClick={() => setEnrollmentModal(course.id)}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            border: `1px solid #BFDBFE`,
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          <Eye style={{ width: '14px', height: '14px' }} />
                        </button>

                        {/* Delete */}
                        {deleteConfirm === course.id ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => deleteCourse(course.id)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#DC2626',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Ya, Hapus
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: `1px solid ${cc.border}`,
                                backgroundColor: cc.cardBg,
                                color: cc.textMuted,
                                fontSize: '11px',
                                cursor: 'pointer',
                              }}
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            title="Hapus Kursus"
                            onClick={() => setDeleteConfirm(course.id)}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              border: `1px solid #FECACA`,
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
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

        {/* Footer count */}
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
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setEnrollmentModal(null)}
        >
          <div
            style={{
              backgroundColor: cc.cardBg,
              borderRadius: '16px',
              border: `1px solid ${cc.border}`,
              padding: '28px',
              maxWidth: '480px',
              width: '100%',
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
                ×
              </button>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: cc.textPrimary, marginBottom: '16px' }}>
              {enrollmentModalCourse.title}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Total Enrollments', value: enrollmentModalCourse.enrollments.toLocaleString('id-ID') },
                { label: 'Completion Rate', value: `${enrollmentModalCourse.completionRate}%` },
                { label: 'Certificates Issued', value: enrollmentModalCourse.certificates.toLocaleString('id-ID') },
                { label: 'Instruktur', value: enrollmentModalCourse.instructor },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    padding: '14px 16px',
                    backgroundColor: cc.pageBg,
                    borderRadius: '10px',
                    border: `1px solid ${cc.borderLight}`,
                  }}
                >
                  <p style={{ fontSize: '11px', color: cc.textMuted, margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: cc.textPrimary, margin: '4px 0 0 0' }}>{item.value}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setEnrollmentModal(null)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: `1px solid ${cc.border}`,
                backgroundColor: cc.pageBg,
                color: cc.textSecondary,
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
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
