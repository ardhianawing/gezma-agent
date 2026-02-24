import { describe, it, expect, vi, beforeEach } from 'vitest';
import { _resetForTesting } from '@/lib/rate-limiter';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    emailTemplate: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    scheduledReport: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: { findUnique: vi.fn(), update: vi.fn() },
    activityLog: { create: vi.fn().mockResolvedValue({}) },
  },
}));

vi.mock('@/lib/auth-server', () => ({
  getAuthPayload: vi.fn(),
  unauthorizedResponse: vi.fn(() =>
    new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  ),
}));

vi.mock('@/lib/activity-logger', () => ({
  logActivity: vi.fn(),
}));

vi.mock('@/lib/services/gamification.service', () => ({
  awardPoints: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

const AUTH_PAYLOAD = { userId: 'user-1', email: 'admin@test.com', role: 'owner', agencyId: 'agency-1' };

function createReq(body: unknown, path: string, method = 'POST'): any {
  return new Request(`http://localhost:3000${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/settings/email-templates', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 401 when unauthenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { POST } = await import('@/app/api/settings/email-templates/route');
    const req = createReq({}, '/api/settings/email-templates');
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid template data', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { POST } = await import('@/app/api/settings/email-templates/route');
    const req = createReq({ event: 'invalid_event', subject: 'Hi', bodyHtml: 'x' }, '/api/settings/email-templates');
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('creates template and calls logActivity', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { logActivity } = await import('@/lib/activity-logger');
    const { prisma } = await import('@/lib/prisma');
    (prisma.emailTemplate.upsert as any).mockResolvedValue({ id: 'tmpl-1', event: 'welcome' });

    const { POST } = await import('@/app/api/settings/email-templates/route');
    const req = createReq({
      event: 'welcome',
      subject: 'Welcome email',
      bodyHtml: '<h1>Welcome to Gezma!</h1>',
      isActive: true,
    }, '/api/settings/email-templates');
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({ type: 'settings', action: 'created' }));
  });
});

describe('PATCH /api/settings/email-templates/[event]', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 404 for non-existent template', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.emailTemplate.findUnique as any).mockResolvedValue(null);

    const { PATCH } = await import('@/app/api/settings/email-templates/[event]/route');
    const req = createReq({ subject: 'Updated' }, '/api/settings/email-templates/welcome', 'PATCH');
    const res = await PATCH(req, { params: Promise.resolve({ event: 'welcome' }) });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/settings/scheduled-reports', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 400 for invalid report data (Zod)', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { POST } = await import('@/app/api/settings/scheduled-reports/route');
    const req = createReq({
      frequency: 'yearly',
      reportType: 'financial',
      emailTo: 'admin@test.com',
    }, '/api/settings/scheduled-reports');
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('creates report with valid data and calls logActivity', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { logActivity } = await import('@/lib/activity-logger');
    const { prisma } = await import('@/lib/prisma');
    (prisma.scheduledReport.create as any).mockResolvedValue({ id: 'rep-1' });

    const { POST } = await import('@/app/api/settings/scheduled-reports/route');
    const req = createReq({
      frequency: 'weekly',
      reportType: 'financial',
      emailTo: 'admin@test.com',
    }, '/api/settings/scheduled-reports');
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({ type: 'settings', action: 'created' }));
  });
});

describe('DELETE /api/settings/scheduled-reports/[id]', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 404 for non-existent report', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.scheduledReport.findFirst as any).mockResolvedValue(null);

    const { DELETE } = await import('@/app/api/settings/scheduled-reports/[id]/route');
    const req = new Request('http://localhost:3000/api/settings/scheduled-reports/x', { method: 'DELETE' }) as any;
    const res = await DELETE(req, { params: Promise.resolve({ id: 'non-existent' }) });
    expect(res.status).toBe(404);
  });

  it('deletes report and calls logActivity', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { logActivity } = await import('@/lib/activity-logger');
    const { prisma } = await import('@/lib/prisma');
    (prisma.scheduledReport.findFirst as any).mockResolvedValue({ id: 'rep-1', reportType: 'financial' });
    (prisma.scheduledReport.delete as any).mockResolvedValue({});

    const { DELETE } = await import('@/app/api/settings/scheduled-reports/[id]/route');
    const req = new Request('http://localhost:3000/api/settings/scheduled-reports/rep-1', { method: 'DELETE' }) as any;
    const res = await DELETE(req, { params: Promise.resolve({ id: 'rep-1' }) });
    expect(res.status).toBe(200);
    expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({ type: 'settings', action: 'deleted' }));
  });
});

describe('POST /api/settings/security/change-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetForTesting();
  });

  it('returns 400 for invalid data (Zod)', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { POST } = await import('@/app/api/settings/security/change-password/route');
    const req = createReq({
      currentPassword: '',
      newPassword: '123',
      confirmPassword: '456',
    }, '/api/settings/security/change-password');
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('is rate limited after 3 attempts', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { POST } = await import('@/app/api/settings/security/change-password/route');
    const body = {
      currentPassword: 'old123456',
      newPassword: 'new123456',
      confirmPassword: 'new123456',
    };

    for (let i = 0; i < 3; i++) {
      const req = createReq(body, '/api/settings/security/change-password');
      const res = await POST(req);
      expect(res.status).not.toBe(429);
    }

    const req = createReq(body, '/api/settings/security/change-password');
    const res = await POST(req);
    expect(res.status).toBe(429);
  });
});
