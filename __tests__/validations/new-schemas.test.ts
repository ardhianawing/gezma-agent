import { describe, it, expect } from 'vitest';
import { createNoteSchema } from '@/lib/validations/note';
import { createWaitingListSchema } from '@/lib/validations/waiting-list';
import { createScheduledReportSchema, updateScheduledReportSchema } from '@/lib/validations/scheduled-report';
import { createReviewSchema } from '@/lib/validations/academy-review';
import { createNotificationSchema } from '@/lib/validations/notification';
import { changePasswordSchema } from '@/lib/validations/security';

describe('createNoteSchema', () => {
  it('accepts valid note', () => {
    const result = createNoteSchema.safeParse({ content: 'Some note content' });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    expect(createNoteSchema.safeParse({ content: '' }).success).toBe(false);
  });

  it('rejects content exceeding 2000 chars', () => {
    expect(createNoteSchema.safeParse({ content: 'a'.repeat(2001) }).success).toBe(false);
  });

  it('accepts content at max length', () => {
    expect(createNoteSchema.safeParse({ content: 'a'.repeat(2000) }).success).toBe(true);
  });

  it('rejects missing content', () => {
    expect(createNoteSchema.safeParse({}).success).toBe(false);
  });
});

describe('createWaitingListSchema', () => {
  it('accepts valid data', () => {
    const result = createWaitingListSchema.safeParse({
      pilgrimName: 'Ahmad',
      phone: '08123456789',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional fields', () => {
    const result = createWaitingListSchema.safeParse({
      pilgrimName: 'Ahmad',
      phone: '08123456789',
      email: 'ahmad@example.com',
      notes: 'Some notes',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty pilgrimName', () => {
    expect(createWaitingListSchema.safeParse({
      pilgrimName: '',
      phone: '08123456789',
    }).success).toBe(false);
  });

  it('rejects empty phone', () => {
    expect(createWaitingListSchema.safeParse({
      pilgrimName: 'Ahmad',
      phone: '',
    }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(createWaitingListSchema.safeParse({
      pilgrimName: 'Ahmad',
      phone: '08123456789',
      email: 'not-an-email',
    }).success).toBe(false);
  });

  it('accepts empty string for email', () => {
    expect(createWaitingListSchema.safeParse({
      pilgrimName: 'Ahmad',
      phone: '08123456789',
      email: '',
    }).success).toBe(true);
  });
});

describe('createScheduledReportSchema', () => {
  it('accepts valid weekly report', () => {
    const result = createScheduledReportSchema.safeParse({
      frequency: 'weekly',
      reportType: 'financial',
      dayOfWeek: 1,
      emailTo: 'admin@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid monthly report', () => {
    const result = createScheduledReportSchema.safeParse({
      frequency: 'monthly',
      reportType: 'pilgrim',
      dayOfMonth: 15,
      emailTo: 'admin@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('accepts daily frequency', () => {
    const result = createScheduledReportSchema.safeParse({
      frequency: 'daily',
      reportType: 'trip',
      emailTo: 'admin@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid frequency', () => {
    expect(createScheduledReportSchema.safeParse({
      frequency: 'yearly',
      reportType: 'financial',
      emailTo: 'admin@example.com',
    }).success).toBe(false);
  });

  it('rejects invalid reportType', () => {
    expect(createScheduledReportSchema.safeParse({
      frequency: 'weekly',
      reportType: 'custom',
      emailTo: 'admin@example.com',
    }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(createScheduledReportSchema.safeParse({
      frequency: 'weekly',
      reportType: 'financial',
      emailTo: 'not-email',
    }).success).toBe(false);
  });

  it('rejects dayOfWeek out of range', () => {
    expect(createScheduledReportSchema.safeParse({
      frequency: 'weekly',
      reportType: 'financial',
      dayOfWeek: 7,
      emailTo: 'admin@example.com',
    }).success).toBe(false);
  });

  it('rejects dayOfMonth out of range', () => {
    expect(createScheduledReportSchema.safeParse({
      frequency: 'monthly',
      reportType: 'financial',
      dayOfMonth: 32,
      emailTo: 'admin@example.com',
    }).success).toBe(false);
  });
});

describe('updateScheduledReportSchema', () => {
  it('accepts partial update', () => {
    expect(updateScheduledReportSchema.safeParse({ emailTo: 'new@example.com' }).success).toBe(true);
  });

  it('accepts empty object', () => {
    expect(updateScheduledReportSchema.safeParse({}).success).toBe(true);
  });
});

describe('createReviewSchema', () => {
  it('accepts valid review', () => {
    const result = createReviewSchema.safeParse({ rating: 5, comment: 'Great course!' });
    expect(result.success).toBe(true);
  });

  it('accepts review without comment', () => {
    expect(createReviewSchema.safeParse({ rating: 3 }).success).toBe(true);
  });

  it('rejects rating below 1', () => {
    expect(createReviewSchema.safeParse({ rating: 0 }).success).toBe(false);
  });

  it('rejects rating above 5', () => {
    expect(createReviewSchema.safeParse({ rating: 6 }).success).toBe(false);
  });

  it('rejects non-integer rating', () => {
    expect(createReviewSchema.safeParse({ rating: 3.5 }).success).toBe(false);
  });

  it('rejects missing rating', () => {
    expect(createReviewSchema.safeParse({}).success).toBe(false);
  });
});

describe('createNotificationSchema', () => {
  it('accepts valid notification', () => {
    const result = createNotificationSchema.safeParse({
      title: 'Test notification',
      body: 'This is a test',
      type: 'info',
      userId: 'user-123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    expect(createNotificationSchema.safeParse({
      title: '',
      body: 'Body',
      type: 'info',
      userId: 'user-123',
    }).success).toBe(false);
  });

  it('rejects invalid type', () => {
    expect(createNotificationSchema.safeParse({
      title: 'Title',
      body: 'Body',
      type: 'critical',
      userId: 'user-123',
    }).success).toBe(false);
  });

  it('accepts all valid types', () => {
    for (const type of ['info', 'warning', 'success', 'error']) {
      expect(createNotificationSchema.safeParse({
        title: 'Title',
        body: 'Body',
        type,
        userId: 'user-123',
      }).success).toBe(true);
    }
  });

  it('rejects missing userId', () => {
    expect(createNotificationSchema.safeParse({
      title: 'Title',
      body: 'Body',
      type: 'info',
    }).success).toBe(false);
  });
});

describe('changePasswordSchema (updated min 8)', () => {
  it('rejects passwords shorter than 8 chars', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: '1234567',
      confirmPassword: '1234567',
    });
    expect(result.success).toBe(false);
  });

  it('accepts passwords with 8+ chars', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: '12345678',
      confirmPassword: '12345678',
    });
    expect(result.success).toBe(true);
  });
});
