'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  X,
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import {
  courses,
  courseCategories,
  learningPaths,
  academyStats,
  type CourseCategory,
} from '@/data/mock-academy';
import { useResponsive } from '@/lib/hooks/use-responsive';

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatPrice(price: number): string {
  return 'Rp ' + price.toLocaleString('id-ID');
}

export default function AcademyPage() {
  const { isMobile, isTablet } = useResponsive();
  const [activeCategory, setActiveCategory] = useState<CourseCategory>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (activeCategory !== 'semua') {
      result = result.filter((c) => c.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          c.instructor.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeCategory, searchQuery]);

  const getCatColor = (catId: string) =>
    courseCategories.find((c) => c.id === catId)?.color || '#6B7280';

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'pemula': return { bg: '#D1FAE5', color: '#059669' };
      case 'menengah': return { bg: '#FEF3C7', color: '#D97706' };
      case 'lanjutan': return { bg: '#FEE2E2', color: '#DC2626' };
      default: return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>

      {/* HEADER */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>Akademi</h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
          Pusat pembelajaran untuk travel agent umrah profesional
        </p>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { icon: BookOpen, label: 'Total Kursus', value: academyStats.totalCourses, color: '#2563EB', bg: '#DBEAFE' },
          { icon: Users, label: 'Total Peserta', value: formatNumber(academyStats.totalStudents), color: '#059669', bg: '#D1FAE5' },
          { icon: Clock, label: 'Jam Pembelajaran', value: academyStats.totalHours + '+', color: '#D97706', bg: '#FEF3C7' },
          { icon: Award, label: 'Tingkat Kelulusan', value: academyStats.completionRate + '%', color: '#7C3AED', bg: '#EDE9FE' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '16px 20px', backgroundColor: 'white',
                borderRadius: '12px', border: '1px solid #E5E7EB',
              }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px', backgroundColor: stat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon style={{ width: '22px', height: '22px', color: stat.color }} />
              </div>
              <div>
                <p style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* LEARNING PATHS */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Learning Path
          </h2>
          <button style={{
            fontSize: '13px', fontWeight: '500', color: '#DC2626', background: 'none',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            Lihat Semua <ChevronRight style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px' }}>
          {learningPaths.map((path) => (
            <div
              key={path.id}
              style={{
                backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB',
                padding: '20px', cursor: 'pointer', transition: 'all 0.15s',
                borderTop: `3px solid ${path.color}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = path.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{path.icon}</div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 6px 0' }}>
                {path.title}
              </h3>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                {path.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <BookOpen style={{ width: '12px', height: '12px' }} /> {path.courses} kursus
                </span>
                <span style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock style={{ width: '12px', height: '12px' }} /> {path.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY + SEARCH */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Semua Kursus
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
            {courseCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as CourseCategory)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '20px',
                    border: isActive ? `2px solid ${cat.color || '#374151'}` : '1px solid #E5E7EB',
                    backgroundColor: isActive ? (cat.color || '#374151') + '12' : 'white',
                    color: isActive ? (cat.color || '#374151') : '#4B5563',
                    fontSize: '13px', fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div style={{ position: 'relative', width: '280px', flexShrink: 0 }}>
            <div style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              color: '#9CA3AF', pointerEvents: 'none', display: 'flex', alignItems: 'center',
            }}>
              <Search style={{ width: '16px', height: '16px' }} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kursus..."
              style={{
                width: '100%', height: '38px', paddingLeft: '40px',
                paddingRight: searchQuery ? '32px' : '12px',
                fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '8px',
                outline: 'none', backgroundColor: 'white', boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
                display: 'flex', alignItems: 'center',
              }}>
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* COURSES GRID */}
      {filteredCourses.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Tidak ada kursus ditemukan</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '20px' }}>
          {filteredCourses.map((course) => {
            const levelStyle = getLevelColor(course.level);
            const catColor = getCatColor(course.category);

            return (
              <div
                key={course.id}
                style={{
                  backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB',
                  overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  height: '140px', backgroundColor: '#F3F4F6', position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '56px', opacity: 0.8 }}>{course.thumbnail}</span>

                  {/* Play button overlay */}
                  <div style={{
                    position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
                  >
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Play style={{ width: '20px', height: '20px', color: '#DC2626', marginLeft: '2px' }} fill="#DC2626" />
                    </div>
                  </div>

                  {/* Badges */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '4px' }}>
                    {course.isFree && (
                      <span style={{
                        fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px',
                        backgroundColor: '#059669', color: 'white', textTransform: 'uppercase',
                      }}>
                        Gratis
                      </span>
                    )}
                    {course.isNew && (
                      <span style={{
                        fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px',
                        backgroundColor: '#2563EB', color: 'white', textTransform: 'uppercase',
                      }}>
                        Baru
                      </span>
                    )}
                    {course.isBestSeller && (
                      <span style={{
                        fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px',
                        backgroundColor: '#D97706', color: 'white', textTransform: 'uppercase',
                      }}>
                        Best Seller
                      </span>
                    )}
                  </div>

                  {/* Level badge */}
                  <span style={{
                    position: 'absolute', top: '10px', right: '10px',
                    fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px',
                    backgroundColor: levelStyle.bg, color: levelStyle.color, textTransform: 'capitalize',
                  }}>
                    {course.level}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Category */}
                  <span style={{
                    fontSize: '11px', fontWeight: '600', color: catColor, marginBottom: '8px',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {courseCategories.find((c) => c.id === course.category)?.label}
                  </span>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0',
                    lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {course.title}
                  </h3>

                  {/* Instructor */}
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px 0' }}>
                    {course.instructor}
                    {course.instructorRole === 'Official' && (
                      <span style={{
                        fontSize: '9px', fontWeight: '700', padding: '1px 5px', borderRadius: '3px',
                        backgroundColor: '#DC2626', color: 'white', marginLeft: '6px', textTransform: 'uppercase',
                      }}>
                        Official
                      </span>
                    )}
                  </p>

                  {/* Stats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B7280' }}>
                      <Clock style={{ width: '12px', height: '12px' }} /> {course.duration}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B7280' }}>
                      <BookOpen style={{ width: '12px', height: '12px' }} /> {course.lessons} materi
                    </span>
                  </div>

                  {/* Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          style={{
                            width: '12px', height: '12px',
                            color: star <= Math.round(course.rating) ? '#F59E0B' : '#E5E7EB',
                          }}
                          fill={star <= Math.round(course.rating) ? '#F59E0B' : '#E5E7EB'}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{course.rating}</span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>({course.reviewCount})</span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>• {formatNumber(course.students)} peserta</span>
                  </div>

                  {/* Spacer */}
                  <div style={{ flex: 1 }} />

                  {/* Price */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: '12px', borderTop: '1px solid #F3F4F6',
                  }}>
                    {course.isFree ? (
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>Gratis</span>
                    ) : (
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                        {formatPrice(course.price || 0)}
                      </span>
                    )}
                    <button style={{
                      padding: '8px 16px', backgroundColor: '#DC2626', color: 'white',
                      fontSize: '12px', fontWeight: '600', borderRadius: '8px',
                      border: 'none', cursor: 'pointer',
                    }}>
                      {course.isFree ? 'Mulai Belajar' : 'Daftar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
