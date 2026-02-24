import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    activityLog: { create: vi.fn().mockResolvedValue({}) },
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

vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('hashed_password') },
}));

const AUTH_PAYLOAD = { userId: 'user-1', email: 'admin@test.com', role: 'owner', agencyId: 'agency-1' };

function createReq(body: unknown, path: string, method = 'POST'): any {
  return new Request(`http://localhost:3000${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { POST } = await import('@/app/api/users/route');
    const req = createReq({}, '/api/users');
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid data (Zod validation)', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { POST } = await import('@/app/api/users/route');
    const req = createReq({ name: '', email: 'bad', password: '123' }, '/api/users');
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.errors).toBeDefined();
  });

  it('creates user with valid data', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({
      id: 'new-user', name: 'Test User', email: 'test@test.com',
      role: 'staff', position: null, phone: null, isActive: true,
    });

    const { POST } = await import('@/app/api/users/route');
    const req = createReq({
      name: 'Test User', email: 'test@test.com', password: 'password123',
    }, '/api/users');
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it('rejects duplicate email', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing' });

    const { POST } = await import('@/app/api/users/route');
    const req = createReq({
      name: 'Test', email: 'existing@test.com', password: 'password123',
    }, '/api/users');
    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it('calls logActivity after creating user', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { logActivity } = await import('@/lib/activity-logger');

    const { prisma } = await import('@/lib/prisma');
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({
      id: 'new-user', name: 'Test', email: 'test@test.com',
      role: 'staff', position: null, phone: null, isActive: true,
    });

    const { POST } = await import('@/app/api/users/route');
    const req = createReq({
      name: 'Test', email: 'test@test.com', password: 'password123',
    }, '/api/users');
    await POST(req);
    expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({ type: 'user', action: 'created' }));
  });
});

describe('PUT /api/users/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for invalid update data', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { PUT } = await import('@/app/api/users/[id]/route');
    const req = createReq({ role: 'invalid_role' }, '/api/users/user-1', 'PUT');
    const res = await PUT(req, { params: Promise.resolve({ id: 'user-1' }) });
    expect(res.status).toBe(400);
  });

  it('returns 404 when user not found', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.user.findFirst as any).mockResolvedValue(null);

    const { PUT } = await import('@/app/api/users/[id]/route');
    const req = createReq({ name: 'Updated' }, '/api/users/user-999', 'PUT');
    const res = await PUT(req, { params: Promise.resolve({ id: 'user-999' }) });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/users/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prevents self-deletion', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { DELETE } = await import('@/app/api/users/[id]/route');
    const req = createReq({}, '/api/users/user-1', 'DELETE');
    const res = await DELETE(req, { params: Promise.resolve({ id: 'user-1' }) });
    expect(res.status).toBe(400);
  });

  it('calls logActivity after deleting user', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { logActivity } = await import('@/lib/activity-logger');

    const { prisma } = await import('@/lib/prisma');
    (prisma.user.findFirst as any).mockResolvedValue({ id: 'user-2', name: 'Bob', email: 'bob@test.com' });
    (prisma.user.delete as any).mockResolvedValue({});

    const { DELETE } = await import('@/app/api/users/[id]/route');
    const req = createReq({}, '/api/users/user-2', 'DELETE');
    await DELETE(req, { params: Promise.resolve({ id: 'user-2' }) });
    expect(logActivity).toHaveBeenCalledWith(expect.objectContaining({ type: 'user', action: 'deleted' }));
  });
});
