import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    forumThread: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    forumReply: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
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

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

const AUTH_PAYLOAD = { userId: 'user-1', email: 'admin@test.com', role: 'owner', agencyId: 'agency-1' };

function createReq(path: string, method = 'GET', body?: unknown): any {
  const opts: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  return new Request(`http://localhost:3000${path}`, opts);
}

describe('GET /api/forum', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 401 when not authenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { GET } = await import('@/app/api/forum/route');
    const res = await GET(createReq('/api/forum'));
    expect(res.status).toBe(401);
  });

  it('returns forum threads', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.forumThread.findMany as any).mockResolvedValue([
      { id: '1', title: 'Thread 1', category: 'sharing' },
    ]);
    (prisma.forumThread.count as any).mockResolvedValue(1);
    (prisma.forumThread.groupBy as any).mockResolvedValue([{ category: 'sharing', _count: 1 }]);

    const { GET } = await import('@/app/api/forum/route');
    const res = await GET(createReq('/api/forum'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
  });
});

describe('POST /api/forum', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 401 when not authenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { POST } = await import('@/app/api/forum/route');
    const res = await POST(createReq('/api/forum', 'POST', {}));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid thread data', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { POST } = await import('@/app/api/forum/route');
    const res = await POST(createReq('/api/forum', 'POST', { title: 'Hi', content: 'Short', category: 'invalid' }));
    expect(res.status).toBe(400);
  });

  it('creates thread with valid data', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.user.findUnique as any).mockResolvedValue({ name: 'Admin', avatarUrl: null, agency: { name: 'Test Agency' } });
    (prisma.forumThread.create as any).mockResolvedValue({
      id: 'thread-1', title: 'Tips hotel Makkah', category: 'sharing',
    });

    const { POST } = await import('@/app/api/forum/route');
    const res = await POST(createReq('/api/forum', 'POST', {
      title: 'Tips memilih hotel dekat Masjidil Haram',
      content: 'Berikut tips yang bisa membantu agen travel dalam memilih hotel terbaik.',
      category: 'sharing',
    }));
    expect(res.status).toBe(201);
  });
});

describe('POST /api/forum/[id]/replies', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 401 when not authenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { POST } = await import('@/app/api/forum/[id]/replies/route');
    const res = await POST(
      createReq('/api/forum/thread-1/replies', 'POST', { content: 'Nice post!' }),
      { params: Promise.resolve({ id: 'thread-1' }) }
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 for content too short', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.forumThread.findUnique as any).mockResolvedValue({ id: 'thread-1', isLocked: false });

    const { POST } = await import('@/app/api/forum/[id]/replies/route');
    const res = await POST(
      createReq('/api/forum/thread-1/replies', 'POST', { content: 'Ok' }),
      { params: Promise.resolve({ id: 'thread-1' }) }
    );
    expect(res.status).toBe(400);
  });
});
