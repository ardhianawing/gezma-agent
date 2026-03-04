import { describe, it, expect, vi } from 'vitest';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditTrail: { deleteMany: vi.fn().mockResolvedValue({ count: 5 }) },
    webhookDelivery: { deleteMany: vi.fn().mockResolvedValue({ count: 3 }) },
    activity: { deleteMany: vi.fn().mockResolvedValue({ count: 10 }) },
    pilgrim: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
    user: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    package: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
    trip: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    loginHistory: { deleteMany: vi.fn().mockResolvedValue({ count: 8 }) },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

import {
  cleanupAuditTrail,
  cleanupWebhookDeliveries,
  cleanupActivityLogs,
  purgeSoftDeletedRecords,
  cleanupLoginHistory,
  runAllMaintenance,
} from '@/lib/cron/db-maintenance';
import { prisma } from '@/lib/prisma';

describe('DB Maintenance', () => {
  it('cleanupAuditTrail deletes old records', async () => {
    const count = await cleanupAuditTrail(90);
    expect(count).toBe(5);
    expect(prisma.auditTrail.deleteMany).toHaveBeenCalledWith({
      where: { createdAt: { lt: expect.any(Date) } },
    });
  });

  it('cleanupWebhookDeliveries deletes old records', async () => {
    const count = await cleanupWebhookDeliveries(30);
    expect(count).toBe(3);
  });

  it('cleanupActivityLogs deletes old records', async () => {
    const count = await cleanupActivityLogs(60);
    expect(count).toBe(10);
  });

  it('cleanupLoginHistory deletes old records', async () => {
    const count = await cleanupLoginHistory(90);
    expect(count).toBe(8);
  });

  it('purgeSoftDeletedRecords deletes across models', async () => {
    const results = await purgeSoftDeletedRecords(30);

    expect(results.pilgrim).toBe(2);
    expect(results.user).toBe(0);
    expect(results.package).toBe(1);
    expect(results.trip).toBe(0);
  });

  it('runAllMaintenance runs all tasks', async () => {
    const results = await runAllMaintenance();

    expect(results.auditTrail).toBe(5);
    expect(results.webhookDeliveries).toBe(3);
    expect(results.activityLogs).toBe(10);
    expect(results.loginHistory).toBe(8);
    expect(results.softDeletePurge).toEqual({
      pilgrim: 2, user: 0, package: 1, trip: 0,
    });
  });

  it('uses custom retention days', async () => {
    await cleanupAuditTrail(30);

    const call = vi.mocked(prisma.auditTrail.deleteMany).mock.calls[0][0];
    const cutoffDate = (call as any).where.createdAt.lt as Date;
    const daysAgo = Math.round((Date.now() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysAgo).toBe(30);
  });
});
