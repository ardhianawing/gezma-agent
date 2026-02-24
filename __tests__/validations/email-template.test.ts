import { describe, it, expect } from 'vitest';
import { emailTemplateSchema } from '@/lib/validations/email-template';

describe('emailTemplateSchema', () => {
  it('validates correct template data', () => {
    const result = emailTemplateSchema.safeParse({
      event: 'welcome',
      subject: 'Selamat Datang di {{agency}}',
      bodyHtml: '<h1>Halo {{name}}</h1><p>Selamat datang di {{agency}}</p>',
      isActive: true,
    });
    expect(result.success).toBe(true);
  });

  it('validates all event types', () => {
    for (const event of ['welcome', 'payment_reminder', 'departure_reminder']) {
      const result = emailTemplateSchema.safeParse({
        event,
        subject: 'Test Subject',
        bodyHtml: '<p>Test body content here</p>',
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid event type', () => {
    const result = emailTemplateSchema.safeParse({
      event: 'invalid_event',
      subject: 'Test',
      bodyHtml: '<p>Test</p>',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short subject', () => {
    const result = emailTemplateSchema.safeParse({
      event: 'welcome',
      subject: 'ab',
      bodyHtml: '<p>Valid body content</p>',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short bodyHtml', () => {
    const result = emailTemplateSchema.safeParse({
      event: 'welcome',
      subject: 'Valid Subject',
      bodyHtml: '<p>Hi</p>',
    });
    expect(result.success).toBe(false);
  });

  it('defaults isActive to true', () => {
    const result = emailTemplateSchema.safeParse({
      event: 'welcome',
      subject: 'Test Subject',
      bodyHtml: '<p>Test body content</p>',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
    }
  });

  it('accepts isActive false', () => {
    const result = emailTemplateSchema.safeParse({
      event: 'payment_reminder',
      subject: 'Reminder Pembayaran',
      bodyHtml: '<p>Yth {{name}}, mohon segera selesaikan pembayaran</p>',
      isActive: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(false);
    }
  });

  it('rejects missing required fields', () => {
    const result = emailTemplateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects missing event', () => {
    const result = emailTemplateSchema.safeParse({
      subject: 'Valid Subject',
      bodyHtml: '<p>Valid body content</p>',
    });
    expect(result.success).toBe(false);
  });
});
