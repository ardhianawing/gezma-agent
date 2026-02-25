'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, XCircle, Award, Send, Loader2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

interface Question {
  id: string;
  question: string;
  options: string[];
  order: number;
}

interface QuizData {
  id: string;
  courseId: string;
  title: string;
  passScore: number;
  questions: Question[];
  totalQuestions: number;
  bestAttempt: { score: number; passed: boolean; attemptedAt: string } | null;
}

interface QuizResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  passScore: number;
}

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const router = useRouter();

  const [courseId, setCourseId] = useState('');
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    params.then(p => setCourseId(p.id));
  }, [params]);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    fetch(`/api/academy/${courseId}/quiz`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setQuiz(null);
        } else {
          setQuiz(data);
          setAnswers(new Array(data.totalQuestions).fill(null));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  const selectAnswer = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/academy/${courseId}/quiz/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center', color: c.textMuted }}>
        Memuat quiz...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: c.textPrimary, margin: '0 0 8px 0' }}>
          Quiz tidak ditemukan
        </h3>
        <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 16px 0' }}>
          Kursus ini belum memiliki quiz.
        </p>
        <button
          onClick={() => router.push(`/academy/${courseId}`)}
          style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            backgroundColor: c.primary, color: '#fff', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          Kembali ke Kursus
        </button>
      </div>
    );
  }

  // Result screen
  if (result) {
    return (
      <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: c.cardBg, borderRadius: '16px',
          border: `1px solid ${c.border}`, padding: isMobile ? '24px' : '32px',
          textAlign: 'center',
        }}>
          {result.passed ? (
            <CheckCircle style={{ width: '64px', height: '64px', color: '#059669', margin: '0 auto 16px' }} />
          ) : (
            <XCircle style={{ width: '64px', height: '64px', color: '#EF4444', margin: '0 auto 16px' }} />
          )}

          <h2 style={{
            fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0',
            color: result.passed ? '#059669' : '#EF4444',
          }}>
            {result.passed ? 'Selamat! Anda Lulus!' : 'Belum Lulus'}
          </h2>

          <p style={{ fontSize: '14px', color: c.textMuted, margin: '0 0 24px 0' }}>
            {result.passed
              ? 'Anda telah menyelesaikan quiz dengan baik.'
              : `Skor minimum untuk lulus adalah ${result.passScore}%. Silakan coba lagi.`}
          </p>

          {/* Score Display */}
          <div style={{
            display: 'inline-block', padding: '24px 40px',
            borderRadius: '16px', backgroundColor: result.passed ? '#ECFDF5' : '#FEF2F2',
            marginBottom: '24px',
          }}>
            <p style={{ fontSize: '48px', fontWeight: 800, margin: 0, color: result.passed ? '#059669' : '#EF4444' }}>
              {result.score}%
            </p>
            <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0 0' }}>
              {result.correctAnswers}/{result.totalQuestions} jawaban benar
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {result.passed && (
              <button
                onClick={() => {
                  window.open(`/api/academy/${courseId}/certificate`, '_blank');
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '12px 24px', borderRadius: '10px', border: 'none',
                  backgroundColor: '#059669', color: '#fff', fontSize: '14px',
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Award style={{ width: '16px', height: '16px' }} />
                Unduh Sertifikat
              </button>
            )}
            <button
              onClick={() => {
                setResult(null);
                setCurrentIdx(0);
                setAnswers(new Array(quiz.totalQuestions).fill(null));
              }}
              style={{
                padding: '12px 24px', borderRadius: '10px',
                border: `1px solid ${c.border}`, backgroundColor: c.cardBg,
                color: c.textSecondary, fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Coba Lagi
            </button>
            <button
              onClick={() => router.push(`/academy/${courseId}`)}
              style={{
                padding: '12px 24px', borderRadius: '10px',
                border: `1px solid ${c.border}`, backgroundColor: 'transparent',
                color: c.textSecondary, fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Kembali ke Kursus
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];
  const isLast = currentIdx === quiz.totalQuestions - 1;
  const answeredCount = answers.filter(a => a !== null).length;

  return (
    <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Back Button */}
      <button
        onClick={() => router.push(`/academy/${courseId}`)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', borderRadius: '10px',
          border: '1px solid ' + c.border, backgroundColor: c.cardBg,
          color: c.textSecondary, fontSize: '14px', fontWeight: 500,
          cursor: 'pointer', marginBottom: '24px',
        }}
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      {/* Quiz Header */}
      <div style={{
        backgroundColor: c.cardBg, borderRadius: '16px',
        border: `1px solid ${c.borderLight}`, padding: isMobile ? '20px' : '28px',
        marginBottom: '16px',
      }}>
        <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 700, color: c.textPrimary, margin: '0 0 8px 0' }}>
          {quiz.title}
        </h1>
        <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>
          Skor minimum: {quiz.passScore}% | {quiz.totalQuestions} pertanyaan | Dijawab: {answeredCount}/{quiz.totalQuestions}
        </p>

        {/* Question indicators */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '16px' }}>
          {quiz.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              style={{
                width: '32px', height: '32px', borderRadius: '8px',
                border: idx === currentIdx ? `2px solid ${c.primary}` : `1px solid ${c.border}`,
                backgroundColor: answers[idx] !== null ? (idx === currentIdx ? c.primary : c.primaryLight) : (idx === currentIdx ? c.cardBgHover : 'transparent'),
                color: answers[idx] !== null && idx === currentIdx ? '#fff' : c.textPrimary,
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div style={{
          backgroundColor: c.cardBg, borderRadius: '16px',
          border: `1px solid ${c.borderLight}`, padding: isMobile ? '20px' : '28px',
          marginBottom: '16px',
        }}>
          <p style={{ fontSize: '13px', color: c.textMuted, margin: '0 0 8px 0' }}>
            Pertanyaan {currentIdx + 1} dari {quiz.totalQuestions}
          </p>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 20px 0', lineHeight: 1.5 }}>
            {currentQuestion.question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentQuestion.options.map((option, optIdx) => {
              const isSelected = answers[currentIdx] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => selectAnswer(optIdx)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '14px 16px', borderRadius: '10px',
                    border: isSelected ? `2px solid ${c.primary}` : `1px solid ${c.border}`,
                    backgroundColor: isSelected ? c.primaryLight : 'transparent',
                    color: c.textPrimary, fontSize: '14px',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}
                >
                  <span style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    border: isSelected ? `2px solid ${c.primary}` : `2px solid ${c.border}`,
                    backgroundColor: isSelected ? c.primary : 'transparent',
                    color: isSelected ? '#fff' : c.textMuted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 600, flexShrink: 0,
                  }}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '10px',
            border: `1px solid ${c.border}`, backgroundColor: c.cardBg,
            color: c.textSecondary, fontSize: '14px', fontWeight: 500,
            cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
            opacity: currentIdx === 0 ? 0.5 : 1,
          }}
        >
          <ChevronLeft style={{ width: '16px', height: '16px' }} />
          Sebelumnya
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || answeredCount < quiz.totalQuestions}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 24px', borderRadius: '10px', border: 'none',
              backgroundColor: answeredCount < quiz.totalQuestions ? c.textMuted : c.primary,
              color: '#fff', fontSize: '14px', fontWeight: 600,
              cursor: submitting || answeredCount < quiz.totalQuestions ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Send style={{ width: '16px', height: '16px' }} />
            )}
            {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIdx(Math.min(quiz.totalQuestions - 1, currentIdx + 1))}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              backgroundColor: c.primary, color: '#fff', fontSize: '14px',
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            Selanjutnya
            <ChevronRight style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>
    </div>
  );
}
