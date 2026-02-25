import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
const schema = readFileSync(schemaPath, 'utf-8');

describe('Prisma schema indexes', () => {
  const criticalIndexes = [
    // Multi-tenant foreign keys
    { model: 'User', index: '@@index([agencyId])' },
    { model: 'Pilgrim', index: '@@index([agencyId])' },
    { model: 'Package', index: '@@index([agencyId])' },
    { model: 'Trip', index: '@@index([agencyId])' },
    { model: 'ActivityLog', index: '@@index([agencyId])' },
    { model: 'ActivityLog', index: '@@index([userId])' },

    // Pilgrim relation lookups
    { model: 'PilgrimDocument', index: '@@index([pilgrimId])' },
    { model: 'PaymentRecord', index: '@@index([pilgrimId])' },
    { model: 'PilgrimPointEvent', index: '@@index([pilgrimId])' },

    // Notification + login
    { model: 'Notification', index: '@@index([userId, isRead])' },
    { model: 'LoginHistory', index: '@@index([userId])' },

    // Cron jobs
    { model: 'Agency', index: '@@index([ppiuStatus, ppiuExpiryDate])' },
    { model: 'ScheduledReport', index: '@@index([isActive, agencyId])' },
  ];

  for (const { model, index } of criticalIndexes) {
    it(`${model} has ${index}`, () => {
      expect(schema).toContain(index);
    });
  }

  it('has at least 25 @@index directives total', () => {
    const indexCount = (schema.match(/@@index\(/g) || []).length;
    expect(indexCount).toBeGreaterThanOrEqual(25);
  });
});
