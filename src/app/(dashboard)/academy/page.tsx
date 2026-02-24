'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, BookOpen, Award, GraduationCap, Clock, Users } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import {
  categories,
  levels,
  type CourseCategory,
  type CourseLevel,
} from '@/data/mock-academy';

interface CourseProgress {
  completedLessons: number;
  completedLessonIds: string[];
  totalLessons: number;
  status: string;
  percent: number;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnailUrl: string | null;
  duration: string;
  instructorName: string;
  totalLessons: number;
  lessonCount: number;
  progress: CourseProgress | null;
}

interface ProgressItem {
  courseId: string;
  status: string;
  completedAt: string | null;
}

export default function AcademyPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState<CourseCategory>('all');
  const [activeLevel, setActiveLevel] = useState<CourseLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const [coursesData, setCoursesData] = useState<CourseData[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (activeLevel !== 'all') params.set('level', activeLevel);
      if (searchQuery) params.set('search', searchQuery);
      params.set('limit', '100');

      const res = await fetch(`/api/academy/courses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCoursesData(data.courses || []);
        setTotalCourses(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeLevel, searchQuery]);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch('/api/academy/progress');
      if (res.ok) {
        const data = await res.json();
        setProgressList(data.progress || []);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const enrolledCount = useMemo(() => {
    return progressList.filter((p) => p.status === 'in_progress' || p.status === 'completed').length;
  }, [progressList]);

  const completedCount = useMemo(() => {
    return progressList.filter((p) => p.status === 'completed').length;
  }, [progressList]);

  const getCategoryColor = (category: string) => {
    const cat = categories.find((ct) => ct.key === category);
    return cat?.color || '#6B7280';
  };

  const getLevelMeta = (key: string) => levels.find((l) => l.key === key);

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} style={{ color: i < full ? '#F59E0B' : '#D1D5DB', fontSize: '14px' }}>
          {i < full ? '\u2605' : '\u2606'}
        </span>
      );
    }
    return stars;
  };

  const getCtaLabel = (progress: CourseProgress | null) => {
    if (!progress) return 'Daftar';
    if (progress.percent > 0 && progress.status !== 'completed') return 'Lanjutkan';
    if (progress.status === 'completed') return 'Lihat Ulang';
    return 'Mulai Belajar';
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/academy/${courseId}`);
  };

  const statItems = [
    { label: 'Total Kursus', value: totalCourses, icon: BookOpen, color: c.primary },
    { label: 'Terdaftar', value: enrolledCount, icon: Users, color: c.info },
    { label: 'Lulus', value: completedCount, icon: GraduationCap, color: c.success },
    { label: 'Sertifikat', value: completedCount, icon: Award, color: c.warning },
  ];

  return (
    <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 700, color: c.textPrimary, margin: 0 }}>
          GEZMA Academy
        </h1>
        <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0 0' }}>
          Tingkatkan kompetensi Anda dengan kursus berkualitas seputar haji, umrah, dan bisnis travel
        </p>
      </div>

      {/* Stats Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {statItems.map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.borderLight,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: stat.color + '15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <stat.icon size={20} color={stat.color} />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: c.textPrimary }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: c.textMuted }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '20px',
                border: isActive ? '1px solid ' + cat.color : '1px solid ' + c.border,
                backgroundColor: isActive ? cat.color + '15' : c.cardBg,
                color: isActive ? cat.color : c.textSecondary,
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Level Filter + Search */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {levels.map((lvl) => {
            const isActive = activeLevel === lvl.key;
            return (
              <button
                key={lvl.key}
                onClick={() => setActiveLevel(lvl.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  border: isActive ? '1px solid ' + lvl.color : '1px solid ' + c.border,
                  backgroundColor: isActive ? lvl.color + '15' : 'transparent',
                  color: isActive ? lvl.color : c.textMuted,
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {lvl.label}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={16}
            color={c.textMuted}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Cari kursus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: '10px',
              border: '1px solid ' + c.border,
              backgroundColor: c.cardBg,
              color: c.textPrimary,
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: c.cardBg,
            borderRadius: '16px',
            border: '1px solid ' + c.borderLight,
          }}
        >
          <div style={{ fontSize: '14px', color: c.textMuted }}>Memuat kursus...</div>
        </div>
      ) : coursesData.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: c.cardBg,
            borderRadius: '16px',
            border: '1px solid ' + c.borderLight,
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: c.textPrimary, margin: '0 0 8px 0' }}>
            Kursus tidak ditemukan
          </h3>
          <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>
            Coba ubah filter atau kata kunci pencarian Anda
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: '20px',
          }}
        >
          {coursesData.map((course) => {
            const isHovered = hoveredCard === course.id;
            const categoryColor = getCategoryColor(course.category);
            const levelMeta = getLevelMeta(course.level);
            const progressPercent = course.progress?.percent ?? null;

            return (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course.id)}
                onMouseEnter={() => setHoveredCard(course.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  backgroundColor: c.cardBg,
                  border: '1px solid ' + c.border,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {/* Emoji Header */}
                <div
                  style={{
                    height: '100px',
                    backgroundColor: categoryColor + '10',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '48px' }}>
                    {categories.find((ct) => ct.key === course.category)?.emoji || '📚'}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '16px' }}>
                  {/* Badge Row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: (levelMeta?.color || '#6B7280') + '15',
                        color: levelMeta?.color || '#6B7280',
                      }}
                    >
                      {levelMeta?.label || course.level}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: c.textPrimary,
                      margin: '0 0 6px 0',
                      lineHeight: 1.3,
                    }}
                  >
                    {course.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: c.textMuted,
                      margin: '0 0 12px 0',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.description}
                  </p>

                  {/* Instructor */}
                  <div style={{ fontSize: '12px', color: c.textSecondary, marginBottom: '10px' }}>
                    <span style={{ fontWeight: 600 }}>{course.instructorName}</span>
                  </div>

                  {/* Rating placeholder */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '1px' }}>{renderStars(4.5)}</div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: c.textPrimary }}>4.5</span>
                  </div>

                  {/* Lesson & Duration */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '12px',
                      color: c.textMuted,
                      marginBottom: '12px',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen size={13} />
                      {course.totalLessons} pelajaran
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      {course.duration}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {progressPercent !== null && (
                    <div style={{ marginBottom: '12px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          color: c.textMuted,
                          marginBottom: '4px',
                        }}
                      >
                        <span>Progress</span>
                        <span style={{ fontWeight: 600, color: c.success }}>{progressPercent}%</span>
                      </div>
                      <div
                        style={{
                          height: '6px',
                          borderRadius: '3px',
                          backgroundColor: c.border,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: progressPercent + '%',
                            backgroundColor: '#059669',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(course.id);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      border: course.progress ? 'none' : '1px solid ' + c.primary,
                      backgroundColor: course.progress ? c.primary : 'transparent',
                      color: course.progress ? '#fff' : c.primary,
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {getCtaLabel(course.progress)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
