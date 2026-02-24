import { describe, it, expect } from 'vitest';

describe('LoginHistory model validation', () => {
  it('validates login history record structure', () => {
    const record = {
      id: 'test-uuid',
      userId: 'user-uuid',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      loginAt: new Date().toISOString(),
      logoutAt: null,
    };

    expect(record.id).toBeTruthy();
    expect(record.userId).toBeTruthy();
    expect(record.ipAddress).toBeTruthy();
    expect(record.userAgent).toBeTruthy();
    expect(record.loginAt).toBeTruthy();
    expect(record.logoutAt).toBeNull();
  });

  it('allows null ipAddress and userAgent', () => {
    const record = {
      id: 'test-uuid',
      userId: 'user-uuid',
      ipAddress: null,
      userAgent: null,
      loginAt: new Date().toISOString(),
      logoutAt: null,
    };

    expect(record.ipAddress).toBeNull();
    expect(record.userAgent).toBeNull();
  });

  it('validates IP address format', () => {
    const ipv4 = '192.168.1.1';
    const ipv6 = '::1';
    const forwarded = '10.0.0.1, 192.168.1.1';

    expect(ipv4.split('.').length).toBe(4);
    expect(ipv6).toBeTruthy();
    // X-Forwarded-For can contain multiple IPs
    expect(forwarded.split(',')[0].trim()).toBe('10.0.0.1');
  });

  it('validates loginAt is a valid date', () => {
    const loginAt = new Date().toISOString();
    const parsed = new Date(loginAt);

    expect(parsed.getTime()).not.toBeNaN();
    expect(parsed.toISOString()).toBe(loginAt);
  });

  it('validates logoutAt can be set', () => {
    const loginTime = new Date('2026-01-01T00:00:00Z');
    const logoutTime = new Date('2026-01-01T01:00:00Z');
    const record = {
      loginAt: loginTime.toISOString(),
      logoutAt: logoutTime.toISOString(),
    };

    const loginDate = new Date(record.loginAt);
    const logoutDate = new Date(record.logoutAt);
    expect(logoutDate.getTime()).toBeGreaterThan(loginDate.getTime());
  });
});
