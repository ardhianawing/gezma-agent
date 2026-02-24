import { prisma } from '@/lib/prisma';
import type { Prisma } from '../generated/prisma/client';
import { awardPoints } from '@/lib/services/gamification.service';

export function logActivity(params: {
  type: 'pilgrim' | 'package' | 'trip' | 'payment' | 'document' | 'user' | 'agency' | 'settings' | 'system';
  action: 'created' | 'updated' | 'deleted' | 'uploaded' | 'paid' | 'completed' | 'departed' | 'lunas' | 'revoked' | 'sent';
  title: string;
  description: string;
  userId: string;
  agencyId: string;
  metadata?: Prisma.InputJsonValue;
}) {
  prisma.activityLog.create({ data: params }).catch(console.error);

  // Award gamification points (fire-and-forget)
  awardPoints(params.userId, params.agencyId, params.type, params.action, params.title).catch(() => {});
}
