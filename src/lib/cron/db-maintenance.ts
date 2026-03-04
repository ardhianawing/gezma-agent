import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * Database Maintenance Cron Jobs.
 * Intended to be called from a Next.js API route triggered by an external cron scheduler
 * (e.g., Vercel Cron, Railway cron, or system crontab).
 */

/**
 * Clean up old audit trail records (keep last 90 days).
 */
export async function cleanupAuditTrail(retentionDays = 90): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  try {
    const result = await prisma.auditTrail.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    logger.info(`Audit trail cleanup: deleted ${result.count} records older than ${retentionDays} days`);
    return result.count;
  } catch (error) {
    logger.error('Audit trail cleanup failed', { error: String(error) });
    throw error;
  }
}

/**
 * Clean up old webhook delivery logs (keep last 30 days).
 */
export async function cleanupWebhookDeliveries(retentionDays = 30): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  try {
    const result = await prisma.webhookDelivery.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    logger.info(`Webhook delivery cleanup: deleted ${result.count} records older than ${retentionDays} days`);
    return result.count;
  } catch (error) {
    logger.error('Webhook delivery cleanup failed', { error: String(error) });
    throw error;
  }
}

/**
 * Clean up old activity logs (keep last 60 days).
 */
export async function cleanupActivityLogs(retentionDays = 60): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  try {
    const result = await prisma.activity.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    logger.info(`Activity log cleanup: deleted ${result.count} records older than ${retentionDays} days`);
    return result.count;
  } catch (error) {
    logger.error('Activity log cleanup failed', { error: String(error) });
    throw error;
  }
}

/**
 * Permanently delete soft-deleted records older than 30 days.
 */
export async function purgeSoftDeletedRecords(retentionDays = 30): Promise<Record<string, number>> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  const results: Record<string, number> = {};

  try {
    const models = [
      { name: 'pilgrim', model: prisma.pilgrim },
      { name: 'user', model: prisma.user },
      { name: 'package', model: prisma.package },
      { name: 'trip', model: prisma.trip },
    ] as const;

    for (const { name, model } of models) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (model as any).deleteMany({
        where: {
          deletedAt: { not: null, lt: cutoff },
        },
      });
      results[name] = result.count;
    }

    logger.info('Soft delete purge completed', { results });
    return results;
  } catch (error) {
    logger.error('Soft delete purge failed', { error: String(error) });
    throw error;
  }
}

/**
 * Clean up expired login history (keep last 90 days).
 */
export async function cleanupLoginHistory(retentionDays = 90): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  try {
    const result = await prisma.loginHistory.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    logger.info(`Login history cleanup: deleted ${result.count} records older than ${retentionDays} days`);
    return result.count;
  } catch (error) {
    logger.error('Login history cleanup failed', { error: String(error) });
    throw error;
  }
}

/**
 * Run all maintenance tasks.
 */
export async function runAllMaintenance(): Promise<Record<string, unknown>> {
  const results: Record<string, unknown> = {};

  results.auditTrail = await cleanupAuditTrail().catch(e => ({ error: String(e) }));
  results.webhookDeliveries = await cleanupWebhookDeliveries().catch(e => ({ error: String(e) }));
  results.activityLogs = await cleanupActivityLogs().catch(e => ({ error: String(e) }));
  results.softDeletePurge = await purgeSoftDeletedRecords().catch(e => ({ error: String(e) }));
  results.loginHistory = await cleanupLoginHistory().catch(e => ({ error: String(e) }));

  return results;
}
