import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tradeProduct: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    tradeInquiry: {
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

describe('GET /api/trade', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 401 when not authenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { GET } = await import('@/app/api/trade/route');
    const res = await GET(createReq('/api/trade'));
    expect(res.status).toBe(401);
  });

  it('returns active trade products', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.tradeProduct.findMany as any).mockResolvedValue([
      { id: '1', name: 'Kurma Ajwa', status: 'active' },
    ]);
    (prisma.tradeProduct.count as any).mockResolvedValue(1);
    (prisma.tradeProduct.aggregate as any).mockResolvedValue({ _count: 1 });
    (prisma.tradeProduct.groupBy as any).mockResolvedValue([{ producer: 'Saudi Dates' }]);

    const { GET } = await import('@/app/api/trade/route');
    const res = await GET(createReq('/api/trade'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
  });
});

describe('POST /api/trade', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 401 when not authenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { POST } = await import('@/app/api/trade/route');
    const res = await POST(createReq('/api/trade', 'POST', {}));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid product data', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { POST } = await import('@/app/api/trade/route');
    const res = await POST(createReq('/api/trade', 'POST', { name: 'Ku', category: 'invalid' }));
    expect(res.status).toBe(400);
  });

  it('creates product with valid data', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.user.findUnique as any).mockResolvedValue({ name: 'Admin' });
    (prisma.tradeProduct.create as any).mockResolvedValue({
      id: 'product-1', name: 'Kurma Ajwa Premium', status: 'pending',
    });

    const { POST } = await import('@/app/api/trade/route');
    const res = await POST(createReq('/api/trade', 'POST', {
      name: 'Kurma Ajwa Premium',
      producer: 'Saudi Dates Co',
      origin: 'Madinah, Saudi Arabia',
      category: 'makanan',
      description: 'Kurma Ajwa premium grade A langsung dari kebun Madinah dengan kualitas terbaik.',
      moq: '100 kg',
      targetMarkets: ['Indonesia'],
      price: 'Rp 250.000/kg',
    }));
    expect(res.status).toBe(201);
  });
});

describe('GET /api/trade/my-products', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 401 when not authenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { GET } = await import('@/app/api/trade/my-products/route');
    const res = await GET(createReq('/api/trade/my-products'));
    expect(res.status).toBe(401);
  });

  it('returns own agency products', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.tradeProduct.findMany as any).mockResolvedValue([
      { id: '1', name: 'My Product', agencyId: 'agency-1' },
    ]);

    const { GET } = await import('@/app/api/trade/my-products/route');
    const res = await GET(createReq('/api/trade/my-products'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
  });
});

describe('POST /api/trade/[id]/inquiry', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 401 when not authenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { POST } = await import('@/app/api/trade/[id]/inquiry/route');
    const res = await POST(
      createReq('/api/trade/product-1/inquiry', 'POST', { message: 'Interested in this product' }),
      { params: Promise.resolve({ id: 'product-1' }) }
    );
    expect(res.status).toBe(401);
  });

  it('returns 404 for non-active product', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { prisma } = await import('@/lib/prisma');
    (prisma.tradeProduct.findUnique as any).mockResolvedValue(null);

    const { POST } = await import('@/app/api/trade/[id]/inquiry/route');
    const res = await POST(
      createReq('/api/trade/product-999/inquiry', 'POST', { message: 'Saya tertarik dengan produk ini, bisa kirim info lengkap?' }),
      { params: Promise.resolve({ id: 'product-999' }) }
    );
    expect(res.status).toBe(404);
  });
});
