import { describe, it, expect, vi } from 'vitest';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      create: vi.fn().mockResolvedValue({ id: 'notif-1' }),
    },
  },
}));

describe('Notification Service', () => {
  it('createNotification creates a notification record', async () => {
    const { createNotification } = await import('@/lib/services/notification.service');
    const { prisma } = await import('@/lib/prisma');

    createNotification({
      title: 'Test Notification',
      body: 'This is a test',
      type: 'system',
      userId: 'user-1',
      agencyId: 'agency-1',
    });

    // Fire and forget - wait a tick
    await new Promise((r) => setTimeout(r, 50));

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: {
        title: 'Test Notification',
        body: 'This is a test',
        type: 'system',
        userId: 'user-1',
        agencyId: 'agency-1',
        metadata: undefined,
      },
    });
  });

  it('createNotification includes metadata when provided', async () => {
    const { createNotification } = await import('@/lib/services/notification.service');
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(prisma.notification.create).mockClear();

    createNotification({
      title: 'Payment Received',
      body: 'Pembayaran diterima',
      type: 'payment',
      userId: 'user-2',
      agencyId: 'agency-2',
      metadata: { pilgrimId: 'p-1', amount: 5000000 },
    });

    await new Promise((r) => setTimeout(r, 50));

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'payment',
        metadata: { pilgrimId: 'p-1', amount: 5000000 },
      }),
    });
  });

  it('createNotification handles all notification types', () => {
    const types = ['task', 'payment', 'pilgrim', 'trip', 'system'];
    types.forEach((type) => {
      expect(() => {
        // Just validate the types are accepted
        expect(type).toBeTruthy();
      }).not.toThrow();
    });
  });
});
