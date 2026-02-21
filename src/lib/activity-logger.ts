import { prisma } from '@/lib/prisma';
import type { Prisma } from '../generated/prisma/client';

export function logActivity(params: {
  type: 'pilgrim' | 'package' | 'trip' | 'payment' | 'document';
  action: 'created' | 'updated' | 'deleted' | 'uploaded' | 'paid';
  title: string;
  description: string;
  userId: string;
  agencyId: string;
  metadata?: Prisma.InputJsonValue;
}) {
  prisma.activityLog.create({ data: params }).catch(console.error);
}
