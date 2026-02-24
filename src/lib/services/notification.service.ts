import { prisma } from '@/lib/prisma';

interface CreateNotificationParams {
  title: string;
  body: string;
  type: 'task' | 'payment' | 'pilgrim' | 'trip' | 'system';
  userId: string;
  agencyId: string;
  metadata?: Record<string, string | number | boolean | null>;
}

/**
 * Fire-and-forget helper to create a notification record.
 */
export async function createNotification({
  title,
  body,
  type,
  userId,
  agencyId,
  metadata,
}: CreateNotificationParams): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        title,
        body,
        type,
        userId,
        agencyId,
        metadata: metadata ?? undefined,
      },
    });
  } catch (error) {
    console.error('createNotification error:', error);
  }
}
