import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, _resetForTesting } from '@/lib/rate-limiter';

// Mock NextRequest
function createMockReq(path: string, ip?: string): any {
  return {
    url: `http://localhost:3000${path}`,
    nextUrl: { pathname: path },
    headers: {
      get: (name: string) => {
        if (name === 'x-forwarded-for') return ip || '127.0.0.1';
        return null;
      },
    },
  };
}

describe('Rate Limiter', () => {
  beforeEach(() => {
    _resetForTesting();
  });

  it('allows requests within limit', () => {
    const req = createMockReq('/api/auth/login');
    const result = rateLimit(req, { limit: 5, window: 60 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('allows up to the limit', () => {
    const req = createMockReq('/api/auth/login');
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(req, { limit: 5, window: 60 });
      expect(result.allowed).toBe(true);
    }
  });

  it('blocks requests over limit', () => {
    const req = createMockReq('/api/auth/login');
    for (let i = 0; i < 5; i++) {
      rateLimit(req, { limit: 5, window: 60 });
    }
    const result = rateLimit(req, { limit: 5, window: 60 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('tracks different IPs separately', () => {
    const req1 = createMockReq('/api/auth/login', '1.1.1.1');
    const req2 = createMockReq('/api/auth/login', '2.2.2.2');
    for (let i = 0; i < 5; i++) {
      rateLimit(req1, { limit: 5, window: 60 });
    }
    const result1 = rateLimit(req1, { limit: 5, window: 60 });
    const result2 = rateLimit(req2, { limit: 5, window: 60 });
    expect(result1.allowed).toBe(false);
    expect(result2.allowed).toBe(true);
  });

  it('tracks different routes separately', () => {
    const req1 = createMockReq('/api/auth/login', '1.1.1.1');
    const req2 = createMockReq('/api/auth/register', '1.1.1.1');
    for (let i = 0; i < 5; i++) {
      rateLimit(req1, { limit: 5, window: 60 });
    }
    const result1 = rateLimit(req1, { limit: 5, window: 60 });
    const result2 = rateLimit(req2, { limit: 5, window: 60 });
    expect(result1.allowed).toBe(false);
    expect(result2.allowed).toBe(true);
  });

  it('remaining decreases with each request', () => {
    const req = createMockReq('/api/test');
    expect(rateLimit(req, { limit: 3, window: 60 }).remaining).toBe(2);
    expect(rateLimit(req, { limit: 3, window: 60 }).remaining).toBe(1);
    expect(rateLimit(req, { limit: 3, window: 60 }).remaining).toBe(0);
    expect(rateLimit(req, { limit: 3, window: 60 }).remaining).toBe(0);
  });
});
