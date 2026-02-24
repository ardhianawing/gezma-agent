import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pilgrim: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    pilgrimNote: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    paymentRecord: {
      findMany: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
    },
    user: { findUnique: vi.fn() },
    activityLog: { create: vi.fn().mockResolvedValue({}) },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/lib/auth-server', () => ({
  getAuthPayload: vi.fn(),
  unauthorizedResponse: vi.fn(() =>
    new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  ),
}));

vi.mock('@/lib/auth-permissions', () => ({
  checkPermission: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/activity-logger', () => ({
  logActivity: vi.fn(),
}));

vi.mock('@/lib/services/gamification.service', () => ({
  awardPoints: vi.fn().mockResolvedValue(undefined),
}));

const AUTH_PAYLOAD = { userId: 'user-1', email: 'admin@test.com', role: 'owner', agencyId: 'agency-1' };

function createReq(body: unknown, path: string): any {
  return new Request(`http://localhost:3000${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/pilgrims/[id]/notes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { POST } = await import('@/app/api/pilgrims/[id]/notes/route');
    const req = createReq({ content: 'test' }, '/api/pilgrims/p1/notes');
    const res = await POST(req, { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(401);
  });

  it('returns 400 for empty content (Zod)', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { POST } = await import('@/app/api/pilgrims/[id]/notes/route');
    const req = createReq({ content: '' }, '/api/pilgrims/p1/notes');
    const res = await POST(req, { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(400);
  });

  it('returns 404 when pilgrim not found', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.pilgrim.findFirst as any).mockResolvedValue(null);

    const { POST } = await import('@/app/api/pilgrims/[id]/notes/route');
    const req = createReq({ content: 'some note' }, '/api/pilgrims/p999/notes');
    const res = await POST(req, { params: Promise.resolve({ id: 'p999' }) });
    expect(res.status).toBe(404);
  });

  it('creates note and calls logActivity', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { logActivity } = await import('@/lib/activity-logger');
    const { prisma } = await import('@/lib/prisma');
    (prisma.pilgrim.findFirst as any).mockResolvedValue({ id: 'p1' });
    (prisma.user.findUnique as any).mockResolvedValue({ name: 'Admin' });
    (prisma.pilgrimNote.create as any).mockResolvedValue({ id: 'note-1', content: 'test' });

    const { POST } = await import('@/app/api/pilgrims/[id]/notes/route');
    const req = createReq({ content: 'test note' }, '/api/pilgrims/p1/notes');
    const res = await POST(req, { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(201);
    expect(logActivity).toHaveBeenCalled();
  });
});

describe('POST /api/pilgrims/[id]/payments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for invalid payment data (Zod)', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.pilgrim.findFirst as any).mockResolvedValue({ id: 'p1', name: 'Ahmad' });

    const { POST } = await import('@/app/api/pilgrims/[id]/payments/route');
    const req = createReq({ amount: -100, type: 'invalid', method: 'cash', date: '2024-01-01' }, '/api/pilgrims/p1/payments');
    const res = await POST(req, { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(400);
  });

  it('returns 404 when pilgrim not found', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.pilgrim.findFirst as any).mockResolvedValue(null);

    const { POST } = await import('@/app/api/pilgrims/[id]/payments/route');
    const req = createReq({
      amount: 5000000, type: 'dp', method: 'transfer', date: '2024-01-01',
    }, '/api/pilgrims/p999/payments');
    const res = await POST(req, { params: Promise.resolve({ id: 'p999' }) });
    expect(res.status).toBe(404);
  });

  it('validates payment type enum', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.pilgrim.findFirst as any).mockResolvedValue({ id: 'p1', name: 'Ahmad' });

    const { POST } = await import('@/app/api/pilgrims/[id]/payments/route');
    const req = createReq({
      amount: 5000000, type: 'invalid_type', method: 'transfer', date: '2024-01-01',
    }, '/api/pilgrims/p1/payments');
    const res = await POST(req, { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(400);
  });

  it('validates payment method enum', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.pilgrim.findFirst as any).mockResolvedValue({ id: 'p1', name: 'Ahmad' });

    const { POST } = await import('@/app/api/pilgrims/[id]/payments/route');
    const req = createReq({
      amount: 5000000, type: 'dp', method: 'crypto', date: '2024-01-01',
    }, '/api/pilgrims/p1/payments');
    const res = await POST(req, { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/pilgrims/[id]/invoice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { GET } = await import('@/app/api/pilgrims/[id]/invoice/route');
    const req = new Request('http://localhost:3000/api/pilgrims/p1/invoice') as any;
    const res = await GET(req, { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(401);
  });

  it('returns 404 when pilgrim not found', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.pilgrim.findFirst as any).mockResolvedValue(null);

    const { GET } = await import('@/app/api/pilgrims/[id]/invoice/route');
    const req = new Request('http://localhost:3000/api/pilgrims/p999/invoice') as any;
    const res = await GET(req, { params: Promise.resolve({ id: 'p999' }) });
    expect(res.status).toBe(404);
  });
});
