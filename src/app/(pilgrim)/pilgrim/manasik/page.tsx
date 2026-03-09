'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { manasikCategories, ManasikCategory } from '@/data/mock-manasik';
import type { ManasikLesson } from '@/data/mock-manasik';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_DARK = '#047857';

export default function ManasikPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const [activeCategory, setActiveCategory] = useState<ManasikCategory>('all');
  const [selectedLesson, setSelectedLesson] = useState<ManasikLesson | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [lessons, setLessons] = useState<ManasikLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pilgrim-portal/manasik', { credentials: 'same-origin' })
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json) {
          setLessons(json.lessons);
          setCompletedIds(new Set(json.completedIds));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filteredLessons = useMemo(() => {
    const list = activeCategory === 'all'
      ? lessons
      : lessons.filter(l => l.category === activeCategory);
    return list.sort((a, b) => a.order - b.order);
  }, [activeCategory, lessons]);

  const completedCount = completedIds.size;
  const totalCount = lessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleComplete = useCallback((id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      const willComplete = !next.has(id);
      if (willComplete) next.add(id);
      else next.delete(id);

      fetch('/api/pilgrim-portal/manasik/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ lessonId: id, completed: willComplete }),
      }).catch(() => {});

      return next;
    });
  }, []);

  const goToNext = () => {
    if (!selectedLesson) return;
    const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
    if (currentIndex < lessons.length - 1) {
      setSelectedLesson(lessons[currentIndex + 1]);
    }
  };

  const goToPrev = () => {
    if (!selectedLesson) return;
    const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
    if (currentIndex > 0) {
      setSelectedLesson(lessons[currentIndex - 1]);
    }
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    border: '1px solid ' + c.border,
    borderRadius: '16px',
    padding: '20px',
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        color: c.textMuted,
        fontSize: '15px',
      }}>
        Memuat materi manasik...
      </div>
    );
  }

  // Lesson detail view
  if (selectedLesson) {
    const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < lessons.length - 1;
    const isCompleted = completedIds.has(selectedLesson.id);
    const catInfo = manasikCategories.find(cat => cat.id === selectedLesson.category);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px' }}>
        {/* Back button */}
        <button
          onClick={() => setSelectedLesson(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid ' + c.border,
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            color: c.textSecondary,
            alignSelf: 'flex-start',
          }}
        >
          ← Kembali ke Daftar
        </button>

        {/* Lesson content card */}
        <div style={cardStyle}>
          {/* Category badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: (catInfo?.color || GREEN) + '15',
              color: catInfo?.color || GREEN,
            }}>
              {catInfo?.icon} {catInfo?.label}
            </span>
            <span style={{ fontSize: '12px', color: c.textMuted }}>
              ⏱️ {selectedLesson.duration} menit
            </span>
          </div>

          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '36px' }}>{selectedLesson.emoji}</span>
            <h1 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 700,
              color: c.textPrimary,
              margin: 0,
              lineHeight: 1.3,
            }}>
              {selectedLesson.title}
            </h1>
          </div>

          {/* Video embed */}
          {selectedLesson.videoUrl && (
            <div style={{
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '20px',
              aspectRatio: '16/9',
            }}>
              <iframe
                width="100%"
                height="100%"
                src={selectedLesson.videoUrl.replace('watch?v=', 'embed/')}
                title={selectedLesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 'none', borderRadius: '12px' }}
              />
            </div>
          )}

          {/* Content */}
          <div style={{
            fontSize: '14px',
            lineHeight: 1.8,
            color: c.textSecondary,
          }}>
            {selectedLesson.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return (
                  <h2 key={i} style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: c.textPrimary,
                    margin: '24px 0 12px 0',
                  }}>
                    {line.replace('## ', '')}
                  </h2>
                );
              }
              if (line.startsWith('> ')) {
                return (
                  <blockquote key={i} style={{
                    margin: '12px 0',
                    padding: '16px',
                    backgroundColor: GREEN_LIGHT,
                    borderLeft: '4px solid ' + GREEN,
                    borderRadius: '0 10px 10px 0',
                    fontSize: '16px',
                    direction: line.match(/[\u0600-\u06FF]/) ? 'rtl' : 'ltr',
                    lineHeight: 2,
                    fontFamily: line.match(/[\u0600-\u06FF]/) ? '"Amiri", "Traditional Arabic", serif' : 'inherit',
                  }}>
                    {line.replace('> ', '')}
                  </blockquote>
                );
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <p key={i} style={{ fontWeight: 600, color: c.textPrimary, margin: '8px 0' }}>
                    {line.replace(/\*\*/g, '')}
                  </p>
                );
              }
              if (line.startsWith('- ')) {
                return (
                  <div key={i} style={{ display: 'flex', gap: '8px', margin: '4px 0', paddingLeft: '8px' }}>
                    <span style={{ color: GREEN }}>•</span>
                    <span>{line.replace('- ', '')}</span>
                  </div>
                );
              }
              if (line.match(/^\d+\./)) {
                return (
                  <div key={i} style={{ display: 'flex', gap: '8px', margin: '4px 0', paddingLeft: '8px' }}>
                    <span style={{ color: GREEN, fontWeight: 600, minWidth: '20px' }}>
                      {line.match(/^\d+/)![0]}.
                    </span>
                    <span>{line.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                );
              }
              if (line.startsWith('*') && line.endsWith('*')) {
                return (
                  <p key={i} style={{ fontStyle: 'italic', color: c.textMuted, margin: '8px 0' }}>
                    {line.replace(/\*/g, '')}
                  </p>
                );
              }
              if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />;
              return <p key={i} style={{ margin: '8px 0' }}>{line}</p>;
            })}
          </div>

          {/* Tips section */}
          {selectedLesson.tips.length > 0 && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: GREEN_LIGHT,
              borderRadius: '12px',
              border: '1px solid ' + GREEN + '30',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: GREEN_DARK, margin: '0 0 10px 0' }}>
                💡 Tips Penting
              </h3>
              {selectedLesson.tips.map((tip, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '8px',
                  margin: '6px 0',
                  fontSize: '13px',
                  color: GREEN_DARK,
                }}>
                  <span>✅</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mark complete button */}
        <button
          onClick={() => toggleComplete(selectedLesson.id)}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '15px',
            fontWeight: 600,
            color: isCompleted ? GREEN : '#FFFFFF',
            backgroundColor: isCompleted ? GREEN_LIGHT : GREEN,
            border: isCompleted ? '2px solid ' + GREEN : 'none',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          {isCompleted ? '✅ Sudah Selesai — Batal Tandai' : '☐ Tandai Selesai'}
        </button>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={goToPrev}
            disabled={!hasPrev}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '13px',
              fontWeight: 600,
              color: hasPrev ? c.textSecondary : c.textLight,
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '10px',
              cursor: hasPrev ? 'pointer' : 'not-allowed',
            }}
          >
            ← Sebelumnya
          </button>
          <button
            onClick={goToNext}
            disabled={!hasNext}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '13px',
              fontWeight: 600,
              color: hasNext ? c.textSecondary : c.textLight,
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '10px',
              cursor: hasNext ? 'pointer' : 'not-allowed',
            }}
          >
            Selanjutnya →
          </button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px' }}>
      {/* Header */}
      <div>
        <h1 style={{
          fontSize: isMobile ? '22px' : '26px',
          fontWeight: 700,
          color: c.textPrimary,
          margin: '0 0 4px 0',
        }}>
          📖 Manasik Digital
        </h1>
        <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>
          Panduan lengkap ibadah umrah
        </p>
      </div>

      {/* Manasik AR Banner */}
      <a
        href="/pilgrim/manasik-ar"
        style={{
          display: 'block',
          textDecoration: 'none',
          background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
          borderRadius: '16px',
          padding: '20px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-15px',
          right: '-10px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.1)',
        }} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <span style={{ fontSize: '36px', flexShrink: 0 }}>{'\u{1F97D}'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '16px',
              fontWeight: 700,
              margin: '0 0 4px 0',
              lineHeight: 1.3,
            }}>
              Baru! Manasik AR
            </p>
            <p style={{
              fontSize: '13px',
              margin: '0 0 8px 0',
              opacity: 0.9,
            }}>
              Belajar manasik dengan Augmented Reality
            </p>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              opacity: 0.95,
            }}>
              {'Coba Sekarang \u2192'}
            </span>
          </div>
        </div>
      </a>

      {/* Progress card */}
      <div style={{
        ...cardStyle,
        background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
        border: 'none',
        color: 'white',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Progress Belajar</span>
          <span style={{ fontSize: '14px', fontWeight: 700 }}>{completedCount}/{totalCount}</span>
        </div>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.3)',
          borderRadius: '6px',
          height: '8px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: progressPercent + '%',
            height: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '6px',
            transition: 'width 0.3s ease',
          }} />
        </div>
        <p style={{ fontSize: '12px', opacity: 0.8, margin: '6px 0 0 0' }}>
          {completedCount === 0 ? 'Mulai belajar sekarang!' : `${progressPercent}% materi selesai`}
        </p>
      </div>

      {/* Category pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none',
      }}>
        {manasikCategories.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '20px',
                border: isActive ? 'none' : '1px solid ' + c.border,
                backgroundColor: isActive ? cat.color : c.cardBg,
                color: isActive ? '#FFFFFF' : c.textSecondary,
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Lessons grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '12px',
      }}>
        {filteredLessons.map(lesson => {
          const isComplete = completedIds.has(lesson.id);
          const catInfo = manasikCategories.find(cat => cat.id === lesson.category);
          return (
            <div
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              style={{
                ...cardStyle,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: isComplete ? 0.8 : 1,
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{
                  fontSize: '32px',
                  lineHeight: 1,
                  flexShrink: 0,
                }}>
                  {lesson.emoji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: (catInfo?.color || GREEN) + '15',
                      color: catInfo?.color || GREEN,
                    }}>
                      {catInfo?.label}
                    </span>
                    {lesson.isImportant && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                      }}>
                        Wajib
                      </span>
                    )}
                  </div>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: c.textPrimary,
                    margin: '0 0 4px 0',
                    lineHeight: 1.4,
                  }}>
                    {lesson.title}
                  </h3>
                  <p style={{
                    fontSize: '12px',
                    color: c.textMuted,
                    margin: '0 0 8px 0',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {lesson.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', color: c.textLight }}>
                      ⏱️ {lesson.duration} menit
                    </span>
                    {lesson.videoUrl && (
                      <span style={{ fontSize: '11px', color: c.textLight }}>🎬 Video</span>
                    )}
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isComplete ? GREEN : c.textLight,
                    }}>
                      {isComplete ? '✅ Selesai' : '○ Belum'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: c.textMuted,
        }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📚</span>
          <p style={{ fontSize: '14px', margin: 0 }}>Tidak ada materi di kategori ini</p>
        </div>
      )}
    </div>
  );
}
