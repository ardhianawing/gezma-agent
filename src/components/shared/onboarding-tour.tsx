'use client';

import { useState, useEffect, useCallback } from 'react';

interface TourStep {
  target: string;
  title: string;
  description: string;
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
}

export function OnboardingTour({ steps, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updateTargetRect = useCallback(() => {
    const step = steps[currentStep];
    if (!step) return;

    // Try data-tour attribute first, then id
    const el =
      document.querySelector(`[data-tour="${step.target}"]`) ||
      document.getElementById(step.target);

    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [updateTargetRect]);

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  }

  function handleSkip() {
    onComplete();
  }

  const step = steps[currentStep];
  if (!step) return null;

  // Highlight box position
  const padding = 8;
  const highlightStyle: React.CSSProperties = targetRect
    ? {
        position: 'fixed',
        top: targetRect.top - padding,
        left: targetRect.left - padding,
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
        borderRadius: '12px',
        border: '2px solid #3B82F6',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        zIndex: 10001,
        pointerEvents: 'none' as const,
        transition: 'all 0.3s ease',
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: '200px',
        height: '200px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '12px',
        border: '2px solid #3B82F6',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        zIndex: 10001,
        pointerEvents: 'none' as const,
      };

  // Tooltip position: below the highlight
  const tooltipTop = targetRect
    ? targetRect.bottom + padding + 16
    : undefined;
  const tooltipLeft = targetRect
    ? Math.max(16, Math.min(targetRect.left, window.innerWidth - 340))
    : undefined;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
        }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Highlight box */}
      <div style={highlightStyle} />

      {/* Tooltip */}
      <div
        style={{
          position: 'fixed',
          top: tooltipTop ?? '60%',
          left: tooltipLeft ?? '50%',
          transform: tooltipTop ? undefined : 'translateX(-50%)',
          zIndex: 10002,
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '20px',
          width: '320px',
          maxWidth: 'calc(100vw - 32px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Step indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '12px',
        }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStep ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: i === currentStep ? '#3B82F6' : '#E5E7EB',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
          <span style={{
            marginLeft: 'auto',
            fontSize: '12px',
            color: '#9CA3AF',
            fontWeight: 500,
          }}>
            {currentStep + 1} dari {steps.length}
          </span>
        </div>

        {/* Content */}
        <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#111827',
          margin: '0 0 8px 0',
        }}>
          {step.title}
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#6B7280',
          lineHeight: 1.6,
          margin: '0 0 20px 0',
        }}>
          {step.description}
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={handleSkip}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#9CA3AF',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '8px',
            }}
          >
            Lewati
          </button>
          <button
            onClick={handleNext}
            style={{
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#FFFFFF',
              backgroundColor: '#3B82F6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {currentStep < steps.length - 1 ? 'Lanjut' : 'Selesai'}
          </button>
        </div>
      </div>
    </>
  );
}
