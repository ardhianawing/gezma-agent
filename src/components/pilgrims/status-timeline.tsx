'use client';

import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { PILGRIM_STATUS_CONFIG } from '@/types';
import type { PilgrimStatus } from '@/types';
import { Check } from 'lucide-react';

const STATUS_ORDER: PilgrimStatus[] = ['lead', 'dp', 'lunas', 'dokumen', 'visa', 'ready', 'departed', 'completed'];

interface StatusTimelineProps {
  currentStatus: string;
  history: Array<{
    id: string;
    action: string;
    details: Record<string, unknown>;
    createdAt: string;
  }>;
}

export function StatusTimeline({ currentStatus, history }: StatusTimelineProps) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const currentIndex = STATUS_ORDER.indexOf(currentStatus as PilgrimStatus);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Horizontal Progress Bar */}
      <StatusProgressBar currentStatus={currentStatus} currentIndex={currentIndex} isMobile={isMobile} c={c} />

      {/* Vertical Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {history.map((item, index) => {
          const isLast = index === history.length - 1;
          const newStatus = (item.details.newStatus as string) || 'lead';
          const oldStatus = item.details.oldStatus as string | null;
          const statusConfig = PILGRIM_STATUS_CONFIG[newStatus as PilgrimStatus] || PILGRIM_STATUS_CONFIG.lead;
          const date = new Date(item.createdAt);

          return (
            <div key={item.id} style={{ display: 'flex', gap: isMobile ? '12px' : '20px', minHeight: isLast ? 'auto' : '80px' }}>
              {/* Left: Timestamp */}
              <div
                style={{
                  width: isMobile ? '70px' : '120px',
                  flexShrink: 0,
                  textAlign: 'right',
                  paddingTop: '2px',
                }}
              >
                <p style={{ fontSize: '13px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                  {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0' }}>
                  {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Center: Circle + Line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                {/* Circle */}
                <div
                  style={{
                    width: isLast ? '20px' : '14px',
                    height: isLast ? '20px' : '14px',
                    borderRadius: '50%',
                    backgroundColor: isLast ? statusConfig.color : 'transparent',
                    border: isLast ? `3px solid ${statusConfig.color}` : `2px solid ${statusConfig.color}`,
                    boxShadow: isLast ? `0 0 0 4px ${statusConfig.bgColor}` : 'none',
                    flexShrink: 0,
                    marginTop: isLast ? '0' : '3px',
                  }}
                />
                {/* Connecting Line */}
                {!isLast && (
                  <div
                    style={{
                      width: '2px',
                      flex: 1,
                      backgroundColor: c.border,
                      marginTop: '4px',
                    }}
                  />
                )}
              </div>

              {/* Right: Status Info */}
              <div style={{ flex: 1, paddingBottom: isLast ? '0' : '20px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    backgroundColor: statusConfig.bgColor,
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '600', color: statusConfig.color }}>
                    {statusConfig.label}
                  </span>
                </div>

                {item.action === 'created' ? (
                  <p style={{ fontSize: '13px', color: c.textMuted, margin: '6px 0 0' }}>
                    Jemaah didaftarkan
                  </p>
                ) : (
                  oldStatus && (
                    <p style={{ fontSize: '13px', color: c.textMuted, margin: '6px 0 0' }}>
                      Dari{' '}
                      <span style={{ fontWeight: '500', color: c.textSecondary }}>
                        {PILGRIM_STATUS_CONFIG[oldStatus as PilgrimStatus]?.label || oldStatus}
                      </span>
                      {' '}ke{' '}
                      <span style={{ fontWeight: '500', color: statusConfig.color }}>
                        {statusConfig.label}
                      </span>
                    </p>
                  )
                )}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {history.length === 0 && (
          <p style={{ fontSize: '14px', color: c.textMuted, textAlign: 'center', padding: '24px 0', margin: 0 }}>
            Belum ada riwayat status
          </p>
        )}
      </div>
    </div>
  );
}

/** Horizontal progress bar showing all 8 statuses */
function StatusProgressBar({
  currentStatus,
  currentIndex,
  isMobile,
  c,
}: {
  currentStatus: string;
  currentIndex: number;
  isMobile: boolean;
  c: Record<string, string>;
}) {
  return (
    <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          minWidth: isMobile ? '600px' : undefined,
          gap: '0',
        }}
      >
        {STATUS_ORDER.map((status, index) => {
          const config = PILGRIM_STATUS_CONFIG[status];
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={status} style={{ display: 'flex', alignItems: 'center', flex: index < STATUS_ORDER.length - 1 ? 1 : undefined }}>
              {/* Status Node */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: isCurrent ? '32px' : '24px',
                    height: isCurrent ? '32px' : '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCompleted ? '#15803D' : isCurrent ? config.color : 'transparent',
                    border: isFuture ? `2px dashed ${c.border}` : isCurrent ? `3px solid ${config.color}` : `2px solid #15803D`,
                    boxShadow: isCurrent ? `0 0 0 4px ${config.bgColor}` : 'none',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                  }}
                >
                  {isCompleted && (
                    <Check style={{ width: '14px', height: '14px', color: 'white', strokeWidth: 3 }} />
                  )}
                  {isCurrent && (
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: isCurrent ? '700' : '500',
                    color: isFuture ? c.textMuted : isCurrent ? config.color : '#15803D',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                  }}
                >
                  {config.label}
                </span>
              </div>

              {/* Connecting Line */}
              {index < STATUS_ORDER.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    marginLeft: '4px',
                    marginRight: '4px',
                    marginBottom: '22px',
                    backgroundColor: isCompleted ? '#15803D' : 'transparent',
                    borderBottom: isCompleted ? undefined : `2px dashed ${c.border}`,
                    transition: 'all 0.3s ease',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
