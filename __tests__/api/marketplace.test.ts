import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    marketplaceItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    marketplaceReview: {
      create: vi.fn(),
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

describe('GET /api/marketplace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 401 when not authenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { GET } = await import('@/app/api/marketplace/route');
    const res = await GET(createReq('/api/marketplace'));
    expect(res.status).toBe(401);
  });

  it('returns marketplace items', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    const items = [{ id: '1', name: 'Hotel A', category: 'hotel' }];
    (prisma.marketplaceItem.findMany as any).mockResolvedValue(items);
    (prisma.marketplaceItem.count as any).mockResolvedValue(1);

    const { GET } = await import('@/app/api/marketplace/route');
    const res = await GET(createReq('/api/marketplace'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
  });
});

describe('GET /api/marketplace/[id]', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 401 when not authenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { GET } = await import('@/app/api/marketplace/[id]/route');
    const res = await GET(createReq('/api/marketplace/item-1'), { params: Promise.resolve({ id: 'item-1' }) });
    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent item', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.marketplaceItem.findUnique as any).mockResolvedValue(null);

    const { GET } = await import('@/app/api/marketplace/[id]/route');
    const res = await GET(createReq('/api/marketplace/item-999'), { params: Promise.resolve({ id: 'item-999' }) });
    expect(res.status).toBe(404);
  });

  it('returns item detail', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.marketplaceItem.findUnique as any).mockResolvedValue({
      id: 'item-1', name: 'Hotel A', reviews: [],
    });

    const { GET } = await import('@/app/api/marketplace/[id]/route');
    const res = await GET(createReq('/api/marketplace/item-1'), { params: Promise.resolve({ id: 'item-1' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe('item-1');
  });
});

describe('POST /api/marketplace/[id]/reviews', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 401 when not authenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { POST } = await import('@/app/api/marketplace/[id]/reviews/route');
    const res = await POST(
      createReq('/api/marketplace/item-1/reviews', 'POST', { rating: 5, comment: 'Great service!' }),
      { params: Promise.resolve({ id: 'item-1' }) }
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid review data', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { POST } = await import('@/app/api/marketplace/[id]/reviews/route');
    const res = await POST(
      createReq('/api/marketplace/item-1/reviews', 'POST', { rating: 0, comment: 'Ok' }),
      { params: Promise.resolve({ id: 'item-1' }) }
    );
    expect(res.status).toBe(400);
  });
});
