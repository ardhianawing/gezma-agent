'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, X, Sparkles } from 'lucide-react';

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
  const [ready, setReady] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Wait for page to fully render before showing tour
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const findTarget = useCallback((stepIndex: number): Element | null => {
    const step = steps[stepIndex];
    if (!step) return null;
    return (
      document.querySelector(`[data-tour="${step.target}"]`) ||
      document.getElementById(step.target)
    );
  }, [steps]);

  // Skip steps whose target doesn't exist
  const findNextValidStep = useCallback((from: number): number => {
    for (let i = from; i < steps.length; i++) {
      if (findTarget(i)) return i;
    }
    return -1; // no valid step found
  }, [steps, findTarget]);

  const updateTargetRect = useCallback(() => {
    const el = findTarget(currentStep);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      // Scroll element into view if needed
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep, findTarget]);

  useEffect(() => {
    if (!ready) return;
    updateTargetRect();
    // Small delay for scroll-triggered layout shifts
    const timer = setTimeout(updateTargetRect, 300);
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [updateTargetRect, ready]);

  // On mount or step change, skip to first valid step
  useEffect(() => {
    if (!ready) return;
    if (!findTarget(currentStep)) {
      const next = findNextValidStep(currentStep + 1);
      if (next === -1) {
        onComplete();
      } else {
        setCurrentStep(next);
      }
    }
  }, [currentStep, ready, findTarget, findNextValidStep, onComplete]);

  function handleNext() {
    const next = findNextValidStep(currentStep + 1);
    if (next === -1) {
      onComplete();
    } else {
      setCurrentStep(next);
    }
  }

  function handleSkip() {
    onComplete();
  }

  if (!ready) return null;

  const step = steps[currentStep];
  if (!step || !targetRect) return null;

  // Calculate tooltip position
  const padding = 8;
  const tooltipWidth = 340;
  const tooltipHeight = 200;
  const gap = 16;

  const isTallElement = targetRect.height > window.innerHeight * 0.5;
  const isWideElement = targetRect.width > window.innerWidth * 0.5;

  let tooltipTop: number;
  let tooltipLeft: number;

  if (isTallElement) {
    // For tall elements (sidebar, etc): show tooltip to the right, vertically centered
    tooltipTop = Math.max(16, Math.min(
      targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
      window.innerHeight - tooltipHeight - 16
    ));
    tooltipLeft = targetRect.right + padding + gap;
    // If no room on right, show on left
    if (tooltipLeft + tooltipWidth > window.innerWidth - 16) {
      tooltipLeft = targetRect.left - padding - gap - tooltipWidth;
    }
  } else if (isWideElement) {
    // For wide elements: show below, horizontally centered
    tooltipTop = targetRect.bottom + padding + gap;
    tooltipLeft = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
  } else {
    // Default: show below target
    tooltipTop = targetRect.bottom + padding + gap;
    tooltipLeft = Math.max(16, targetRect.left);

    // If tooltip would go off-screen bottom, show above target
    if (tooltipTop + tooltipHeight > window.innerHeight - 16) {
      tooltipTop = targetRect.top - padding - gap - tooltipHeight;
    }
  }

  // Clamp to viewport
  if (tooltipLeft + tooltipWidth > window.innerWidth - 16) {
    tooltipLeft = window.innerWidth - tooltipWidth - 16;
  }
  if (tooltipLeft < 16) tooltipLeft = 16;
  if (tooltipTop < 16) tooltipTop = 16;
  if (tooltipTop + tooltipHeight > window.innerHeight - 16) {
    tooltipTop = window.innerHeight - tooltipHeight - 16;
  }

  // Count valid steps for progress indicator
  const validStepIndices: number[] = [];
  for (let i = 0; i < steps.length; i++) {
    if (findTarget(i)) validStepIndices.push(i);
  }
  const currentValidIndex = validStepIndices.indexOf(currentStep);
  const totalValid = validStepIndices.length;

  return (
    <>
      {/* Backdrop - clickable to skip */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          cursor: 'pointer',
        }}
        onClick={handleSkip}
      />

      {/* Highlight box with cutout effect */}
      <div
        style={{
          position: 'fixed',
          top: targetRect.top - padding,
          left: targetRect.left - padding,
          width: targetRect.width + padding * 2,
          height: targetRect.height + padding * 2,
          borderRadius: '12px',
          border: '2px solid #3B82F6',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
          zIndex: 10001,
          pointerEvents: 'none',
          transition: 'all 0.3s ease',
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top: tooltipTop,
          left: tooltipLeft,
          zIndex: 10002,
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '24px',
          width: `${tooltipWidth}px`,
          maxWidth: 'calc(100vw - 32px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          animation: 'tourFadeIn 0.25s ease-out',
        }}
      >
        {/* Progress bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '16px',
        }}>
          <Sparkles style={{ width: '14px', height: '14px', color: '#3B82F6' }} />
          <span style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 600 }}>
            Panduan
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>
            {currentValidIndex + 1} / {totalValid}
          </span>
        </div>

        {/* Progress dots */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '16px',
        }}>
          {validStepIndices.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '3px',
                borderRadius: '2px',
                backgroundColor: i <= currentValidIndex ? '#3B82F6' : '#E5E7EB',
                transition: 'background-color 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <h3 style={{
          fontSize: '17px',
          fontWeight: 700,
          color: '#111827',
          margin: '0 0 8px 0',
          lineHeight: 1.3,
        }}>
          {step.title}
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#6B7280',
          lineHeight: 1.7,
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
              padding: '8px 14px',
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#FFFFFF',
              backgroundColor: '#3B82F6',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.35)',
            }}
          >
            {currentValidIndex < totalValid - 1 ? (
              <>Lanjut <ChevronRight style={{ width: '14px', height: '14px' }} /></>
            ) : (
              'Mulai Sekarang!'
            )}
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#9CA3AF',
            cursor: 'pointer',
          }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      {/* Inline animation keyframe */}
      <style>{`
        @keyframes tourFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
