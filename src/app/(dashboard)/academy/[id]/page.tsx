'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, CheckCircle, Circle, ChevronDown, ChevronUp, User, Award, FileQuestion, Star, Trash2, Send, Loader2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
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

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  userName: string;
  userId: string;
  createdAt: string;
}

function renderMarkdown(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  html = html.replace(/(<li>.*?<\/li>(?:<br\/>)?)+/g, (match) => {
    return '<ul>' + match.replace(/<br\/>/g, '') + '</ul>';
  });

  return '<p>' + html + '</p>';
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const router = useRouter();

  const [courseId, setCourseId] = useState<string>('');
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [lessonContents, setLessonContents] = useState<Record<string, string>>({});
  const [loadingLesson, setLoadingLesson] = useState<string | null>(null);
  const [markingComplete, setMarkingComplete] = useState<string | null>(null);

  // Quiz state
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizBestScore, setQuizBestScore] = useState<number | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { addToast } = useToast();
  const [deleteReviewTarget, setDeleteReviewTarget] = useState<string | null>(null);

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

  const fetchQuizStatus = useCallback(async () => {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/academy/${courseId}/quiz`);
      if (res.ok) {
        const data = await res.json();
        if (data.bestAttempt) {
          setQuizPassed(data.bestAttempt.passed);
          setQuizBestScore(data.bestAttempt.score);
        }
      }
    } catch { /* ignore */ }
  }, [courseId]);

  const fetchReviews = useCallback(async () => {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/academy/${courseId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
        setTotalReviews(data.totalReviews || 0);
      }
    } catch { /* ignore */ }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
    fetchQuizStatus();
    fetchReviews();
  }, [fetchCourse, fetchQuizStatus, fetchReviews]);

  // Fetch current user id
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.id) setCurrentUserId(d.id); })
      .catch(() => {});
  }, []);

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

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    setReviewMessage(null);
    try {
      const res = await fetch(`/api/academy/${courseId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewMessage({ type: 'success', text: t.common.success });
        setReviewComment('');
        fetchReviews();
      } else {
        setReviewMessage({ type: 'error', text: data.error || t.common.errorGeneric });
      }
    } catch {
      setReviewMessage({ type: 'error', text: t.common.errorGeneric });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteReviewTarget) return;
    try {
      const res = await fetch(`/api/academy/${courseId}/reviews/${deleteReviewTarget}`, { method: 'DELETE' });
      if (res.ok) {
        addToast({ type: 'success', title: t.common.success });
        fetchReviews();
      } else {
        addToast({ type: 'error', title: t.common.errorGeneric });
      }
    } catch {
      addToast({ type: 'error', title: t.common.errorGeneric });
    }
    setDeleteReviewTarget(null);
  };

  const isLessonCompleted = (lessonId: string) => {
    return course?.progress?.completedLessonIds?.includes(lessonId) || false;
  };

  const levelMeta = course ? levels.find((l) => l.key === course.level) : null;
  const categoryMeta = course ? categories.find((ct) => ct.key === course.category) : null;
  const progressPercent = course?.progress?.percent ?? 0;
  const allLessonsCompleted = progressPercent >= 100;

  const renderStars = (rating: number, interactive?: boolean, onChange?: (r: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={interactive && onChange ? () => onChange(i) : undefined}
          style={{
            color: i <= rating ? '#F59E0B' : '#D1D5DB',
            fontSize: interactive ? '24px' : '16px',
            cursor: interactive ? 'pointer' : 'default',
          }}
        >
          {i <= rating ? '\u2605' : '\u2606'}
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: c.textMuted }}>
          {t.common.loading}
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
            {t.academy.emptyTitle}
          </h3>
          <button
            onClick={() => router.push('/academy')}
            style={{
              marginTop: '16px', padding: '10px 20px', borderRadius: '10px',
              border: 'none', backgroundColor: c.primary, color: '#fff',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {t.common.back} {t.academy.title}
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
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', borderRadius: '10px',
          border: '1px solid ' + c.border, backgroundColor: c.cardBg,
          color: c.textSecondary, fontSize: '14px', fontWeight: 500,
          cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s ease',
        }}
      >
        <ArrowLeft size={16} />
        {t.common.back}
      </button>

      {/* Course Header */}
      <div
        style={{
          backgroundColor: c.cardBg, border: '1px solid ' + c.borderLight,
          borderRadius: '16px', padding: isMobile ? '20px' : '28px', marginBottom: '24px',
        }}
      >
        {/* Category & Level Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {categoryMeta && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
              backgroundColor: (categoryMeta.color || '#6B7280') + '15',
              color: categoryMeta.color || '#6B7280',
            }}>
              {categoryMeta.emoji} {categoryMeta.label}
            </span>
          )}
          {levelMeta && (
            <span style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '12px',
              fontSize: '12px', fontWeight: 600,
              backgroundColor: (levelMeta.color || '#6B7280') + '15',
              color: levelMeta.color || '#6B7280',
            }}>
              {levelMeta.label}
            </span>
          )}
        </div>

        <h1 style={{
          fontSize: isMobile ? '22px' : '28px', fontWeight: 700,
          color: c.textPrimary, margin: '0 0 8px 0', lineHeight: 1.3,
        }}>
          {course.title}
        </h1>

        <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 16px 0', lineHeight: 1.6 }}>
          {course.description}
        </p>

        {/* Instructor & Meta */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px',
          color: c.textSecondary, marginBottom: '20px',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={14} />
            {course.instructorName}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={14} />
            {course.totalLessons} {t.academy.lessons}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} />
            {course.duration}
          </span>
          {avgRating > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} color="#F59E0B" />
              {avgRating} ({totalReviews} reviews)
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', fontSize: '12px',
            color: c.textMuted, marginBottom: '6px',
          }}>
            <span>{t.academy.progress}</span>
            <span style={{ fontWeight: 600, color: progressPercent >= 100 ? c.success : c.primary }}>
              {progressPercent}%
              {course.progress && ` (${course.progress.completedLessons}/${course.progress.totalLessons})`}
            </span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', backgroundColor: c.border, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: progressPercent + '%',
              backgroundColor: progressPercent >= 100 ? '#059669' : c.primary,
              borderRadius: '4px', transition: 'width 0.3s ease',
            }} />
          </div>
          {course.progress?.status === 'completed' && (
            <div style={{
              marginTop: '8px', fontSize: '13px', fontWeight: 600, color: '#059669',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <CheckCircle size={14} />
              Course completed!
            </div>
          )}
        </div>

        {/* Quiz & Certificate Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          {allLessonsCompleted && (
            <button
              onClick={() => router.push(`/academy/${courseId}/quiz`)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                backgroundColor: c.primary, color: '#fff', fontSize: '14px',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              <FileQuestion size={16} />
              {quizPassed ? `${t.common.view} Quiz` : `${t.academy.startLearning} Quiz`}
              {quizBestScore !== null && (
                <span style={{ fontSize: '12px', opacity: 0.8 }}>(Skor terbaik: {quizBestScore}%)</span>
              )}
            </button>
          )}
          {allLessonsCompleted && quizPassed && (
            <button
              onClick={() => {
                window.open(`/api/academy/${courseId}/certificate`, '_blank');
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                backgroundColor: '#059669', color: '#fff', fontSize: '14px',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Award size={16} />
              {t.common.download} Certificate
            </button>
          )}
        </div>
      </div>

      {/* Lesson List */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: c.textPrimary, margin: '0 0 16px 0' }}>
          Lessons
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
                  borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s ease',
                }}
              >
                <button
                  onClick={() => toggleLesson(lesson.id)}
                  style={{
                    width: '100%', padding: '14px 16px', display: 'flex',
                    alignItems: 'center', gap: '12px', border: 'none',
                    backgroundColor: 'transparent', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {completed ? (
                    <CheckCircle size={20} color="#059669" style={{ flexShrink: 0 }} />
                  ) : (
                    <Circle size={20} color={c.textMuted} style={{ flexShrink: 0 }} />
                  )}
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    backgroundColor: completed ? '#05966915' : c.primary + '15',
                    color: completed ? '#059669' : c.primary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, flexShrink: 0,
                  }}>
                    {index + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px', fontWeight: 600,
                      color: completed ? '#059669' : c.textPrimary,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {lesson.title}
                    </div>
                    {lesson.duration && (
                      <div style={{ fontSize: '12px', color: c.textMuted, marginTop: '2px' }}>
                        {lesson.duration}
                      </div>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} color={c.textMuted} style={{ flexShrink: 0 }} />
                  ) : (
                    <ChevronDown size={18} color={c.textMuted} style={{ flexShrink: 0 }} />
                  )}
                </button>

                {isExpanded && (
                  <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid ' + c.borderLight }}>
                    {isLoadingContent ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: c.textMuted, fontSize: '13px' }}>
                        {t.common.loading}
                      </div>
                    ) : content ? (
                      <>
                        {lesson.videoUrl && (
                          <div style={{
                            borderRadius: '12px', overflow: 'hidden',
                            marginTop: '16px', aspectRatio: '16/9',
                          }}>
                            <iframe
                              width="100%"
                              height="100%"
                              src={lesson.videoUrl.replace('watch?v=', 'embed/')}
                              title={lesson.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{ border: 'none', borderRadius: '12px' }}
                            />
                          </div>
                        )}
                        <div
                          style={{ padding: '16px 0', fontSize: '14px', lineHeight: 1.7, color: c.textPrimary }}
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                        />
                        {!completed && (
                          <button
                            onClick={() => markLessonComplete(lesson.id)}
                            disabled={isMarking}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '10px 20px', borderRadius: '10px', border: 'none',
                              backgroundColor: '#059669', color: '#fff', fontSize: '14px',
                              fontWeight: 600, cursor: isMarking ? 'wait' : 'pointer',
                              opacity: isMarking ? 0.7 : 1, transition: 'all 0.2s ease',
                            }}
                          >
                            <CheckCircle size={16} />
                            {isMarking ? t.common.saving : t.status.completed}
                          </button>
                        )}
                        {completed && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '10px 20px', borderRadius: '10px',
                            backgroundColor: '#05966915', color: '#059669',
                            fontSize: '14px', fontWeight: 600,
                          }}>
                            <CheckCircle size={16} />
                            {t.status.completed}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: c.textMuted, fontSize: '13px' }}>
                        {t.common.errorGeneric}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: c.textPrimary, margin: '0 0 16px 0' }}>
          {t.academy.review} ({totalReviews})
        </h2>

        {/* Average Rating */}
        {totalReviews > 0 && (
          <div style={{
            backgroundColor: c.cardBg, border: '1px solid ' + c.borderLight,
            borderRadius: '12px', padding: '16px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: c.textPrimary }}>{avgRating}</div>
              <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                {renderStars(Math.round(avgRating))}
              </div>
              <div style={{ fontSize: '12px', color: c.textMuted, marginTop: '2px' }}>{totalReviews} reviews</div>
            </div>
          </div>
        )}

        {/* Write Review Form */}
        <div style={{
          backgroundColor: c.cardBg, border: '1px solid ' + c.borderLight,
          borderRadius: '12px', padding: '16px', marginBottom: '16px',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary, margin: '0 0 12px 0' }}>
            Write {t.academy.review}
          </h3>
          <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
            {renderStars(reviewRating, true, setReviewRating)}
          </div>
          <textarea
            value={reviewComment}
            onChange={e => setReviewComment(e.target.value)}
            placeholder="Write your comment (optional)..."
            style={{
              width: '100%', minHeight: '80px', padding: '10px 12px',
              fontSize: '14px', border: `1px solid ${c.border}`, borderRadius: '8px',
              backgroundColor: c.inputBg, color: c.textPrimary,
              outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              marginBottom: '12px',
            }}
          />
          {reviewMessage && (
            <p style={{
              fontSize: '13px', margin: '0 0 8px 0',
              color: reviewMessage.type === 'success' ? c.success : c.error,
            }}>
              {reviewMessage.text}
            </p>
          )}
          <button
            onClick={handleSubmitReview}
            disabled={submittingReview}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              backgroundColor: c.primary, color: '#fff', fontSize: '14px',
              fontWeight: 600, cursor: submittingReview ? 'not-allowed' : 'pointer',
              opacity: submittingReview ? 0.7 : 1,
            }}
          >
            {submittingReview ? (
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Send size={14} />
            )}
            {submittingReview ? t.common.sending : `${t.common.submit} ${t.academy.review}`}
          </button>
        </div>

        {/* Review List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {reviews.length === 0 ? (
            <div style={{
              backgroundColor: c.cardBg, border: '1px solid ' + c.borderLight,
              borderRadius: '12px', padding: '24px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>{t.common.noData}</p>
            </div>
          ) : reviews.map(review => (
            <div key={review.id} style={{
              backgroundColor: c.cardBg, border: '1px solid ' + c.borderLight,
              borderRadius: '12px', padding: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary }}>{review.userName}</span>
                    <div style={{ display: 'flex', gap: '1px' }}>{renderStars(review.rating)}</div>
                  </div>
                  <p style={{ fontSize: '12px', color: c.textLight, margin: '0 0 6px 0' }}>
                    {new Date(review.createdAt).toLocaleDateString('id-ID')}
                  </p>
                  {review.comment && (
                    <p style={{ fontSize: '14px', color: c.textSecondary, margin: 0, lineHeight: 1.5 }}>
                      {review.comment}
                    </p>
                  )}
                </div>
                {review.userId === currentUserId && (
                  <button
                    onClick={() => setDeleteReviewTarget(review.id)}
                    style={{
                      display: 'inline-flex', padding: '4px', border: 'none',
                      backgroundColor: 'transparent', cursor: 'pointer', color: c.error,
                    }}
                    title={t.common.delete}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <ConfirmDialog
        open={!!deleteReviewTarget}
        onClose={() => setDeleteReviewTarget(null)}
        onConfirm={handleDeleteReview}
        title={`${t.common.delete} review?`}
        description="This review will be permanently deleted."
        confirmLabel={t.common.delete}
        variant="destructive"
      />
    </div>
  );
}
