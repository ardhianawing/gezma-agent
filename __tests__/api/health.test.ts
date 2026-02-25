import { describe, it, expect, vi } from 'vitest';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
}));

describe('GET /api/health', () => {
  it('returns healthy status with DB connected', async () => {
    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.db.connected).toBe(true);
    expect(data.db.latencyMs).toBeTypeOf('number');
    expect(data.memory.heapUsedMB).toBeTypeOf('number');
    expect(data.memory.rssMB).toBeTypeOf('number');
    expect(data.uptime).toBeTypeOf('number');
    expect(data.timestamp).toBeDefined();
  });

  it('returns unhealthy when DB fails', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('Connection refused'));

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('unhealthy');
    expect(data.db.connected).toBe(false);
  });
});

describe('GET /api/health/ready', () => {
  it('returns ready when DB is connected', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }]);

    const { GET } = await import('@/app/api/health/ready/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ready).toBe(true);
    expect(data.checks.database).toBe(true);
  });

  it('returns not ready when DB fails', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('fail'));

    const { GET } = await import('@/app/api/health/ready/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.ready).toBe(false);
    expect(data.checks.database).toBe(false);
  });
});
