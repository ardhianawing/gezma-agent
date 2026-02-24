import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    academyCourse: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    academyLesson: { findFirst: vi.fn() },
    academyCourseProgress: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    academyCourseReview: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
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

describe('GET /api/academy/courses', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 401 when unauthenticated', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(null);

    const { GET } = await import('@/app/api/academy/courses/route');
    const req = new Request('http://localhost:3000/api/academy/courses') as any;
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns courses with pagination', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.academyCourse.findMany as any).mockResolvedValue([]);
    (prisma.academyCourse.count as any).mockResolvedValue(0);

    const { GET } = await import('@/app/api/academy/courses/route');
    const req = new Request('http://localhost:3000/api/academy/courses') as any;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.courses).toBeDefined();
    expect(json.total).toBeDefined();
  });
});

describe('GET /api/academy/courses/[id]', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 404 for non-existent course', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.academyCourse.findUnique as any).mockResolvedValue(null);

    const { GET } = await import('@/app/api/academy/courses/[id]/route');
    const req = new Request('http://localhost:3000/api/academy/courses/x') as any;
    const res = await GET(req, { params: Promise.resolve({ id: 'non-existent' }) });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/academy/courses/[id]/lessons/[lessonId]', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 404 for non-existent lesson', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.academyLesson.findFirst as any).mockResolvedValue(null);

    const { GET } = await import('@/app/api/academy/courses/[id]/lessons/[lessonId]/route');
    const req = new Request('http://localhost:3000/api/academy/courses/c1/lessons/l999') as any;
    const res = await GET(req, { params: Promise.resolve({ id: 'c1', lessonId: 'l999' }) });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/academy/[courseId]/reviews', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 400 for invalid rating (Zod)', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { POST } = await import('@/app/api/academy/[courseId]/reviews/route');
    const req = createReq({ rating: 0 }, '/api/academy/c1/reviews');
    const res = await POST(req, { params: Promise.resolve({ courseId: 'c1' }) });
    expect(res.status).toBe(400);
  });

  it('returns 400 for rating > 5', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { POST } = await import('@/app/api/academy/[courseId]/reviews/route');
    const req = createReq({ rating: 6 }, '/api/academy/c1/reviews');
    const res = await POST(req, { params: Promise.resolve({ courseId: 'c1' }) });
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent course', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.academyCourse.findUnique as any).mockResolvedValue(null);

    const { POST } = await import('@/app/api/academy/[courseId]/reviews/route');
    const req = createReq({ rating: 5, comment: 'Great!' }, '/api/academy/c999/reviews');
    const res = await POST(req, { params: Promise.resolve({ courseId: 'c999' }) });
    expect(res.status).toBe(404);
  });

  it('returns 409 for duplicate review', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.academyCourse.findUnique as any).mockResolvedValue({ id: 'c1' });
    (prisma.academyCourseReview.findUnique as any).mockResolvedValue({ id: 'existing' });

    const { POST } = await import('@/app/api/academy/[courseId]/reviews/route');
    const req = createReq({ rating: 5 }, '/api/academy/c1/reviews');
    const res = await POST(req, { params: Promise.resolve({ courseId: 'c1' }) });
    expect(res.status).toBe(409);
  });

  it('creates review successfully', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.academyCourse.findUnique as any).mockResolvedValue({ id: 'c1' });
    (prisma.academyCourseReview.findUnique as any).mockResolvedValue(null);
    (prisma.academyCourseReview.create as any).mockResolvedValue({
      id: 'rev-1', rating: 5, comment: 'Great!', userId: 'user-1',
      user: { name: 'Admin' }, createdAt: new Date(),
    });

    const { POST } = await import('@/app/api/academy/[courseId]/reviews/route');
    const req = createReq({ rating: 5, comment: 'Great!' }, '/api/academy/c1/reviews');
    const res = await POST(req, { params: Promise.resolve({ courseId: 'c1' }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /api/academy/progress/[courseId]', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 400 when lessonId is missing', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);

    const { POST } = await import('@/app/api/academy/progress/[courseId]/route');
    const req = createReq({}, '/api/academy/progress/c1');
    const res = await POST(req, { params: Promise.resolve({ courseId: 'c1' }) });
    expect(res.status).toBe(400);
  });

  it('returns 404 when lesson not in course', async () => {
    const { getAuthPayload } = await import('@/lib/auth-server');
    (getAuthPayload as any).mockReturnValue(AUTH_PAYLOAD);
    const { prisma } = await import('@/lib/prisma');
    (prisma.academyLesson.findFirst as any).mockResolvedValue(null);

    const { POST } = await import('@/app/api/academy/progress/[courseId]/route');
    const req = createReq({ lessonId: 'l999' }, '/api/academy/progress/c1');
    const res = await POST(req, { params: Promise.resolve({ courseId: 'c1' }) });
    expect(res.status).toBe(404);
  });
});
