'use client';

import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Award, GraduationCap, Clock, Users } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import {
  courses,
  categories,
  levels,
  academyStats,
  type CourseCategory,
  type CourseLevel,
  type Course,
} from '@/data/mock-academy';

export default function AcademyPage() {
  const { c } = useTheme();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [activeCategory, setActiveCategory] = useState<CourseCategory>('all');
  const [activeLevel, setActiveLevel] = useState<CourseLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchCategory = activeCategory === 'all' || course.category === activeCategory;
      const matchLevel = activeLevel === 'all' || course.level === activeLevel;
      const matchSearch =
        searchQuery === '' ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchLevel && matchSearch;
    });
  }, [activeCategory, activeLevel, searchQuery]);

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

  const getCtaLabel = (progress: number | null) => {
    if (progress === null) return 'Daftar';
    if (progress > 0) return 'Lanjutkan';
    return 'Mulai Belajar';
  };

  const statItems = [
    { label: 'Total Kursus', value: academyStats.totalCourses, icon: BookOpen, color: c.primary },
    { label: 'Terdaftar', value: academyStats.enrolled, icon: Users, color: c.info },
    { label: 'Lulus', value: academyStats.completed, icon: GraduationCap, color: c.success },
    { label: 'Sertifikat', value: academyStats.certificates, icon: Award, color: c.warning },
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

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
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
          {filteredCourses.map((course) => {
            const isHovered = hoveredCard === course.id;
            const categoryColor = getCategoryColor(course.category);
            const levelMeta = getLevelMeta(course.level);

            return (
              <div
                key={course.id}
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
                  <span style={{ fontSize: '48px' }}>{course.emoji}</span>
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
                      {levelMeta?.label}
                    </span>
                    {course.isFree && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: '#05966915',
                          color: '#059669',
                        }}
                      >
                        Gratis
                      </span>
                    )}
                    {course.isNew && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: '#2563EB15',
                          color: '#2563EB',
                        }}
                      >
                        Baru
                      </span>
                    )}
                    {course.isPopular && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: '#D9770615',
                          color: '#D97706',
                        }}
                      >
                        Populer
                      </span>
                    )}
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
                    <span style={{ fontWeight: 600 }}>{course.instructor}</span>
                    <span style={{ color: c.textMuted }}> · {course.instructorRole}</span>
                  </div>

                  {/* Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '1px' }}>{renderStars(course.rating)}</div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: c.textPrimary }}>{course.rating}</span>
                    <span style={{ fontSize: '12px', color: c.textMuted }}>({course.reviewCount})</span>
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
                      {course.lessonCount} pelajaran
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      {course.duration}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {course.progress !== null && (
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
                        <span style={{ fontWeight: 600, color: c.success }}>{course.progress}%</span>
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
                            width: course.progress + '%',
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
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      border: course.progress !== null ? 'none' : '1px solid ' + c.primary,
                      backgroundColor: course.progress !== null ? c.primary : 'transparent',
                      color: course.progress !== null ? '#fff' : c.primary,
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
