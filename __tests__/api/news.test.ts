import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    newsArticle: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
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

function createReq(path: string): any {
  return new Request(`http://localhost:3000${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('GET /api/news', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 401 when not authenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { GET } = await import('@/app/api/news/route');
    const res = await GET(createReq('/api/news'));
    expect(res.status).toBe(401);
  });

  it('returns published articles', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.newsArticle.findMany as any).mockResolvedValue([
      { id: '1', title: 'Berita 1', isPublished: true },
    ]);
    (prisma.newsArticle.count as any).mockResolvedValue(1);

    const { GET } = await import('@/app/api/news/route');
    const res = await GET(createReq('/api/news'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
  });
});

describe('GET /api/news/[id]', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 401 when not authenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { GET } = await import('@/app/api/news/[id]/route');
    const res = await GET(createReq('/api/news/article-1'), { params: Promise.resolve({ id: 'article-1' }) });
    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent article', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.newsArticle.findUnique as any).mockResolvedValue(null);

    const { GET } = await import('@/app/api/news/[id]/route');
    const res = await GET(createReq('/api/news/article-999'), { params: Promise.resolve({ id: 'article-999' }) });
    expect(res.status).toBe(404);
  });

  it('returns article detail', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.newsArticle.findUnique as any).mockResolvedValue({
      id: 'article-1', title: 'Berita 1', isPublished: true,
    });

    const { GET } = await import('@/app/api/news/[id]/route');
    const res = await GET(createReq('/api/news/article-1'), { params: Promise.resolve({ id: 'article-1' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe('article-1');
  });
});
