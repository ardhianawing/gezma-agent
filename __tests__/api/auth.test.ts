import { describe, it, expect, vi, beforeEach } from 'vitest';
import { _resetForTesting } from '@/lib/rate-limiter';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    agency: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    loginHistory: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/lib/mailer', () => ({
  sendVerificationEmail: vi.fn(),
  sendResetPasswordEmail: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

function createMockRequest(body: unknown, path: string): Request {
  return new Request(`http://localhost:3000${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify(body),
  });
}

describe('Auth Routes - Rate Limiting', () => {
  beforeEach(() => {
    _resetForTesting();
    vi.clearAllMocks();
  });

  it('register route is rate limited after 3 attempts', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const body = {
      agencyName: 'Test Agency',
      legalName: 'PT Test',
      agencyPhone: '08123456789',
      picName: 'Admin',
      picEmail: 'admin@test.com',
      password: 'password123',
    };

    // First 3 should go through (may fail for other reasons, but not 429)
    for (let i = 0; i < 3; i++) {
      const req = createMockRequest(body, '/api/auth/register') as any;
      const res = await POST(req);
      expect(res.status).not.toBe(429);
    }

    // 4th should be rate limited
    const req = createMockRequest(body, '/api/auth/register') as any;
    const res = await POST(req);
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toContain('Terlalu banyak');
  });

  it('forgot-password route is rate limited after 3 attempts', async () => {
    const { POST } = await import('@/app/api/auth/forgot-password/route');

    for (let i = 0; i < 3; i++) {
      const req = createMockRequest({ email: 'test@test.com' }, '/api/auth/forgot-password') as any;
      const res = await POST(req);
      expect(res.status).not.toBe(429);
    }

    const req = createMockRequest({ email: 'test@test.com' }, '/api/auth/forgot-password') as any;
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it('reset-password route is rate limited after 5 attempts', async () => {
    const { POST } = await import('@/app/api/auth/reset-password/route');

    for (let i = 0; i < 5; i++) {
      const req = createMockRequest({ code: 'abc', newPassword: 'password123' }, '/api/auth/reset-password') as any;
      const res = await POST(req);
      expect(res.status).not.toBe(429);
    }

    const req = createMockRequest({ code: 'abc', newPassword: 'password123' }, '/api/auth/reset-password') as any;
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it('reset-password rejects missing fields', async () => {
    const { POST } = await import('@/app/api/auth/reset-password/route');
    const req = createMockRequest({}, '/api/auth/reset-password') as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('reset-password rejects passwords shorter than 8 chars', async () => {
    const { POST } = await import('@/app/api/auth/reset-password/route');
    const req = createMockRequest({ code: 'abc123', newPassword: '1234567' }, '/api/auth/reset-password') as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('8 karakter');
  });

  it('register rejects missing required fields', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const req = createMockRequest({ agencyName: 'Test' }, '/api/auth/register') as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('register rejects invalid email', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const body = {
      agencyName: 'Test Agency',
      legalName: 'PT Test',
      agencyPhone: '08123456789',
      picName: 'Admin',
      picEmail: 'not-an-email',
      password: 'password123',
    };
    const req = createMockRequest(body, '/api/auth/register') as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('register rejects short password', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const body = {
      agencyName: 'Test Agency',
      legalName: 'PT Test',
      agencyPhone: '08123456789',
      picName: 'Admin',
      picEmail: 'admin@test.com',
      password: '1234567',
    };
    const req = createMockRequest(body, '/api/auth/register') as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe('Auth Routes - Validation', () => {
  beforeEach(() => {
    _resetForTesting();
    vi.clearAllMocks();
  });

  it('forgot-password returns success even for non-existent email', async () => {
    const { prisma } = await import('@/lib/prisma');
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const { POST } = await import('@/app/api/auth/forgot-password/route');
    const req = createMockRequest({ email: 'nobody@test.com' }, '/api/auth/forgot-password') as any;
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBeDefined();
  });

  it('forgot-password rejects empty email', async () => {
    const { POST } = await import('@/app/api/auth/forgot-password/route');
    const req = createMockRequest({ email: '' }, '/api/auth/forgot-password') as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
