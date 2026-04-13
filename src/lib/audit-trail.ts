import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * Audit Trail — Field-level change tracking.
 * Records who changed what, when, and the before/after values.
 */

export type AuditAction = 'created' | 'updated' | 'deleted' | 'restored';

const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'apiKey', 'serverKey', 'creditCard', 'nik'];

function sanitizeForAudit(data: Record<string, unknown>): Record<string, unknown> {
  if (!data || typeof data !== 'object') return data;
  const sanitized = { ...data };
  for (const field of SENSITIVE_FIELDS) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  return sanitized;
}

export interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

interface AuditEntry {
  entityType: string;
  entityId: string;
  action: AuditAction;
  changes: FieldChange[];
  performedBy: string;
  performerName: string;
  ipAddress?: string;
  agencyId?: string;
}

/**
 * Record an audit trail entry.
 * Fire-and-forget — errors are logged but won't break the caller.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditTrail.create({
      data: {
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        changes: entry.changes,
        performedBy: entry.performedBy,
        performerName: entry.performerName,
        ipAddress: entry.ipAddress,
        agencyId: entry.agencyId,
      },
    });
  } catch (error) {
    logger.error('Failed to record audit trail', {
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      error: String(error),
    });
  }
}

/**
 * Compare two objects and return field-level changes.
 * Only includes fields that actually changed.
 */
export function diffChanges(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  fieldsToTrack?: string[]
): FieldChange[] {
  const changes: FieldChange[] = [];
  const fields = fieldsToTrack || Object.keys(newData);

  for (const field of fields) {
    if (!(field in newData)) continue;

    const oldVal = oldData[field];
    const newVal = newData[field];

    // Skip if values are the same (deep compare for objects)
    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) continue;

    // Mask sensitive fields
    const sensitiveFields = ['password', 'hashedPassword', 'secret', 'token', 'nik', 'encryptedNik'];
    const isSensitive = sensitiveFields.some(s => field.toLowerCase().includes(s));

    changes.push({
      field,
      oldValue: isSensitive ? '***' : oldVal ?? null,
      newValue: isSensitive ? '***' : newVal ?? null,
    });
  }

  return changes;
}

/**
 * Record a "created" audit entry.
 */
export async function auditCreate(
  entityType: string,
  entityId: string,
  data: Record<string, unknown>,
  performer: { id: string; name: string },
  opts?: { ipAddress?: string; agencyId?: string }
): Promise<void> {
  const sanitized = sanitizeForAudit(data);
  const changes: FieldChange[] = Object.keys(sanitized).map(field => ({
    field,
    oldValue: null,
    newValue: sanitized[field],
  }));

  await recordAudit({
    entityType,
    entityId,
    action: 'created',
    changes,
    performedBy: performer.id,
    performerName: performer.name,
    ipAddress: opts?.ipAddress,
    agencyId: opts?.agencyId,
  });
}

/**
 * Record an "updated" audit entry with automatic diff.
 */
export async function auditUpdate(
  entityType: string,
  entityId: string,
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
  performer: { id: string; name: string },
  opts?: { ipAddress?: string; agencyId?: string; fieldsToTrack?: string[] }
): Promise<void> {
  const changes = diffChanges(oldData, newData, opts?.fieldsToTrack);

  if (changes.length === 0) return; // No actual changes

  await recordAudit({
    entityType,
    entityId,
    action: 'updated',
    changes,
    performedBy: performer.id,
    performerName: performer.name,
    ipAddress: opts?.ipAddress,
    agencyId: opts?.agencyId,
  });
}

/**
 * Record a "deleted" audit entry.
 */
export async function auditDelete(
  entityType: string,
  entityId: string,
  performer: { id: string; name: string },
  opts?: { ipAddress?: string; agencyId?: string }
): Promise<void> {
  await recordAudit({
    entityType,
    entityId,
    action: 'deleted',
    changes: [{ field: 'deletedAt', oldValue: null, newValue: new Date().toISOString() }],
    performedBy: performer.id,
    performerName: performer.name,
    ipAddress: opts?.ipAddress,
    agencyId: opts?.agencyId,
  });
}

/**
 * Record a "restored" audit entry.
 */
export async function auditRestore(
  entityType: string,
  entityId: string,
  performer: { id: string; name: string },
  opts?: { ipAddress?: string; agencyId?: string }
): Promise<void> {
  await recordAudit({
    entityType,
    entityId,
    action: 'restored',
    changes: [{ field: 'deletedAt', oldValue: 'was deleted', newValue: null }],
    performedBy: performer.id,
    performerName: performer.name,
    ipAddress: opts?.ipAddress,
    agencyId: opts?.agencyId,
  });
}
