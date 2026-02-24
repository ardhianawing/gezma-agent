'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, CheckCircle, Circle, ChevronDown, ChevronUp, User } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { levels, categories } from '@/data/mock-academy';

interface Lesson {
  id: string;
  title: string;
  order: number;
  duration: string | null;
  videoUrl: string | null;
  content?: string;
}

interface CourseProgress {
  completedLessons: number;
  completedLessonIds: string[];
  totalLessons: number;
  status: string;
  percent: number;
  startedAt: string | null;
  completedAt: string | null;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  instructorName: string;
  totalLessons: number;
  lessons: Lesson[];
  progress: CourseProgress | null;
}

function renderMarkdown(md: string): string {
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Unordered list items
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Paragraphs: double newline
    .replace(/\n\n/g, '</p><p>')
    // Single newlines
    .replace(/\n/g, '<br/>');

  // Wrap li items in ul
  html = html.replace(/(<li>.*?<\/li>(?:<br\/>)?)+/g, (match) => {
    return '<ul>' + match.replace(/<br\/>/g, '') + '</ul>';
  });

  return '<p>' + html + '</p>';
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const router = useRouter();

  const [courseId, setCourseId] = useState<string>('');
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [lessonContents, setLessonContents] = useState<Record<string, string>>({});
  const [loadingLesson, setLoadingLesson] = useState<string | null>(null);
  const [markingComplete, setMarkingComplete] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setCourseId(p.id));
  }, [params]);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/academy/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
      }
    } catch (err) {
      console.error('Failed to fetch course:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const fetchLessonContent = async (lessonId: string) => {
    if (lessonContents[lessonId]) return;
    setLoadingLesson(lessonId);
    try {
      const res = await fetch(`/api/academy/courses/${courseId}/lessons/${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        setLessonContents((prev) => ({ ...prev, [lessonId]: data.content }));
      }
    } catch (err) {
      console.error('Failed to fetch lesson:', err);
    } finally {
      setLoadingLesson(null);
    }
  };

  const toggleLesson = (lessonId: string) => {
    if (expandedLesson === lessonId) {
      setExpandedLesson(null);
    } else {
      setExpandedLesson(lessonId);
      fetchLessonContent(lessonId);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    setMarkingComplete(lessonId);
    try {
      const res = await fetch(`/api/academy/progress/${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCourse((prev) => {
          if (!prev) return prev;
          return { ...prev, progress: data.progress };
        });
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    } finally {
      setMarkingComplete(null);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return course?.progress?.completedLessonIds?.includes(lessonId) || false;
  };

  const levelMeta = course ? levels.find((l) => l.key === course.level) : null;
  const categoryMeta = course ? categories.find((ct) => ct.key === course.category) : null;
  const progressPercent = course?.progress?.percent ?? 0;

  if (loading) {
    return (
      <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: c.textMuted }}>
          Memuat kursus...
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>404</div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: c.textPrimary, margin: '0 0 8px 0' }}>
            Kursus tidak ditemukan
          </h3>
          <button
            onClick={() => router.push('/academy')}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: c.primary,
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Kembali ke Academy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Back Button */}
      <button
        onClick={() => router.push('/academy')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '10px',
          border: '1px solid ' + c.border,
          backgroundColor: c.cardBg,
          color: c.textSecondary,
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          marginBottom: '24px',
          transition: 'all 0.2s ease',
        }}
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      {/* Course Header */}
      <div
        style={{
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.borderLight,
          borderRadius: '16px',
          padding: isMobile ? '20px' : '28px',
          marginBottom: '24px',
        }}
      >
        {/* Category & Level Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {categoryMeta && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: (categoryMeta.color || '#6B7280') + '15',
                color: categoryMeta.color || '#6B7280',
              }}
            >
              {categoryMeta.emoji} {categoryMeta.label}
            </span>
          )}
          {levelMeta && (
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: (levelMeta.color || '#6B7280') + '15',
                color: levelMeta.color || '#6B7280',
              }}
            >
              {levelMeta.label}
            </span>
          )}
        </div>

        <h1
          style={{
            fontSize: isMobile ? '22px' : '28px',
            fontWeight: 700,
            color: c.textPrimary,
            margin: '0 0 8px 0',
            lineHeight: 1.3,
          }}
        >
          {course.title}
        </h1>

        <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 16px 0', lineHeight: 1.6 }}>
          {course.description}
        </p>

        {/* Instructor & Meta */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '13px',
            color: c.textSecondary,
            marginBottom: '20px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={14} />
            {course.instructorName}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={14} />
            {course.totalLessons} pelajaran
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} />
            {course.duration}
          </span>
        </div>

        {/* Progress Bar */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: c.textMuted,
              marginBottom: '6px',
            }}
          >
            <span>Progress Belajar</span>
            <span style={{ fontWeight: 600, color: progressPercent >= 100 ? c.success : c.primary }}>
              {progressPercent}%
              {course.progress && ` (${course.progress.completedLessons}/${course.progress.totalLessons})`}
            </span>
          </div>
          <div
            style={{
              height: '8px',
              borderRadius: '4px',
              backgroundColor: c.border,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: progressPercent + '%',
                backgroundColor: progressPercent >= 100 ? '#059669' : c.primary,
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          {course.progress?.status === 'completed' && (
            <div
              style={{
                marginTop: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckCircle size={14} />
              Kursus selesai!
            </div>
          )}
        </div>
      </div>

      {/* Lesson List */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: c.textPrimary,
            margin: '0 0 16px 0',
          }}
        >
          Daftar Pelajaran
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {course.lessons.map((lesson, index) => {
            const completed = isLessonCompleted(lesson.id);
            const isExpanded = expandedLesson === lesson.id;
            const isLoadingContent = loadingLesson === lesson.id;
            const content = lessonContents[lesson.id];
            const isMarking = markingComplete === lesson.id;

            return (
              <div
                key={lesson.id}
                style={{
                  backgroundColor: c.cardBg,
                  border: '1px solid ' + (completed ? '#05966940' : c.borderLight),
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Lesson Header */}
                <button
                  onClick={() => toggleLesson(lesson.id)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {/* Completion indicator */}
                  {completed ? (
                    <CheckCircle size={20} color="#059669" style={{ flexShrink: 0 }} />
                  ) : (
                    <Circle size={20} color={c.textMuted} style={{ flexShrink: 0 }} />
                  )}

                  {/* Number */}
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: completed ? '#05966915' : c.primary + '15',
                      color: completed ? '#059669' : c.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>

                  {/* Title */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: completed ? '#059669' : c.textPrimary,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {lesson.title}
                    </div>
                    {lesson.duration && (
                      <div style={{ fontSize: '12px', color: c.textMuted, marginTop: '2px' }}>
                        {lesson.duration}
                      </div>
                    )}
                  </div>

                  {/* Expand icon */}
                  {isExpanded ? (
                    <ChevronUp size={18} color={c.textMuted} style={{ flexShrink: 0 }} />
                  ) : (
                    <ChevronDown size={18} color={c.textMuted} style={{ flexShrink: 0 }} />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div
                    style={{
                      padding: '0 16px 16px 16px',
                      borderTop: '1px solid ' + c.borderLight,
                    }}
                  >
                    {isLoadingContent ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: c.textMuted, fontSize: '13px' }}>
                        Memuat materi...
                      </div>
                    ) : content ? (
                      <>
                        <div
                          style={{
                            padding: '16px 0',
                            fontSize: '14px',
                            lineHeight: 1.7,
                            color: c.textPrimary,
                          }}
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                        />

                        {/* Mark Complete Button */}
                        {!completed && (
                          <button
                            onClick={() => markLessonComplete(lesson.id)}
                            disabled={isMarking}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '10px 20px',
                              borderRadius: '10px',
                              border: 'none',
                              backgroundColor: '#059669',
                              color: '#fff',
                              fontSize: '14px',
                              fontWeight: 600,
                              cursor: isMarking ? 'wait' : 'pointer',
                              opacity: isMarking ? 0.7 : 1,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <CheckCircle size={16} />
                            {isMarking ? 'Menyimpan...' : 'Selesai'}
                          </button>
                        )}

                        {completed && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '10px 20px',
                              borderRadius: '10px',
                              backgroundColor: '#05966915',
                              color: '#059669',
                              fontSize: '14px',
                              fontWeight: 600,
                            }}
                          >
                            <CheckCircle size={16} />
                            Sudah diselesaikan
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: c.textMuted, fontSize: '13px' }}>
                        Gagal memuat materi
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
