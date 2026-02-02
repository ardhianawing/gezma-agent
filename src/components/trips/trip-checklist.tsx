'use client';

import * as React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TripChecklist as TripChecklistType } from '@/types/trip';

interface TripChecklistProps {
  checklist: TripChecklistType;
  onUpdate?: (field: keyof TripChecklistType, value: boolean) => void;
  isEditable?: boolean;
}

interface ChecklistItem {
  key: keyof TripChecklistType;
  label: string;
  description?: string;
  critical?: boolean;
}

const checklistItems: ChecklistItem[] = [
  {
    key: 'allPilgrimsConfirmed',
    label: 'All Pilgrims Confirmed',
    description: 'All registered pilgrims have confirmed their participation',
    critical: true,
  },
  {
    key: 'manifestComplete',
    label: 'Manifest Complete',
    description: 'All pilgrim data and documents are complete',
    critical: true,
  },
  {
    key: 'roomingListFinalized',
    label: 'Rooming List Finalized',
    description: 'Room assignments for all pilgrims are set',
  },
  {
    key: 'flightTicketsIssued',
    label: 'Flight Tickets Issued',
    description: 'All flight tickets have been issued',
    critical: true,
  },
  {
    key: 'hotelConfirmed',
    label: 'Hotel Confirmed',
    description: 'Hotel bookings are confirmed',
    critical: true,
  },
  {
    key: 'guideAssigned',
    label: 'Guide/Muthawwif Assigned',
    description: 'Tour guide has been assigned for the trip',
  },
  {
    key: 'insuranceProcessed',
    label: 'Insurance Processed',
    description: 'Travel insurance for all pilgrims is active',
  },
  {
    key: 'departureBriefingDone',
    label: 'Departure Briefing Done',
    description: 'Pre-departure briefing has been conducted',
  },
];

export function TripChecklist({ checklist, onUpdate, isEditable = false }: TripChecklistProps) {
  const completedCount = checklistItems.filter((item) => checklist[item.key] === true).length;
  const totalCount = checklistItems.length;
  const progress = (completedCount / totalCount) * 100;

  const getStatusIcon = (checked: boolean, critical?: boolean) => {
    if (checked) {
      return <Check className="h-4 w-4 text-white" />;
    }
    if (critical) {
      return <AlertCircle className="h-4 w-4 text-white" />;
    }
    return <Clock className="h-4 w-4 text-white" />;
  };

  const getStatusColor = (checked: boolean, critical?: boolean) => {
    if (checked) return 'bg-[var(--success)]';
    if (critical) return 'bg-[var(--error)]';
    return 'bg-[var(--warning)]';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Trip Checklist</CardTitle>
          <div className="flex items-center gap-3">
            <div className="h-2 w-24 rounded-full bg-[var(--gray-200)]">
              <div
                className="h-2 rounded-full bg-[var(--success)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-[var(--charcoal)]">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checklistItems.map((item) => {
            const isChecked = checklist[item.key] === true;

            return (
              <div
                key={item.key}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-[12px] transition-colors',
                  isEditable && 'cursor-pointer hover:bg-[var(--gray-100)]',
                  isChecked && 'bg-[var(--success-light)]'
                )}
                onClick={() => isEditable && onUpdate?.(item.key, !isChecked)}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors',
                    getStatusColor(isChecked, item.critical)
                  )}
                >
                  {getStatusIcon(isChecked, item.critical)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        'font-medium text-sm',
                        isChecked ? 'text-[var(--charcoal)]' : 'text-[var(--gray-600)]'
                      )}
                    >
                      {item.label}
                    </p>
                    {item.critical && !isChecked && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--error-light)] text-[var(--error)]">
                        Required
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-[var(--gray-600)] mt-0.5">{item.description}</p>
                  )}
                </div>
                {isEditable && (
                  <div
                    className={cn(
                      'h-5 w-5 rounded border-2 flex items-center justify-center',
                      isChecked
                        ? 'bg-[var(--success)] border-[var(--success)]'
                        : 'border-[var(--gray-border)]'
                    )}
                  >
                    {isChecked && <Check className="h-3 w-3 text-white" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Guide Info */}
        {checklist.guideAssigned && checklist.guideName && (
          <div className="mt-4 pt-4 border-t border-[var(--gray-border)]">
            <p className="text-sm font-medium text-[var(--charcoal)] mb-2">Guide Information</p>
            <div className="grid gap-2 md:grid-cols-2 text-sm">
              <div>
                <span className="text-[var(--gray-600)]">Name: </span>
                <span className="text-[var(--charcoal)]">{checklist.guideName}</span>
              </div>
              {checklist.guidePhone && (
                <div>
                  <span className="text-[var(--gray-600)]">Phone: </span>
                  <span className="text-[var(--charcoal)]">{checklist.guidePhone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Briefing Date */}
        {checklist.departureBriefingDone && checklist.departureBriefingDate && (
          <div className="mt-4 pt-4 border-t border-[var(--gray-border)]">
            <p className="text-sm text-[var(--gray-600)]">
              Briefing conducted on:{' '}
              <span className="text-[var(--charcoal)] font-medium">
                {new Date(checklist.departureBriefingDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
