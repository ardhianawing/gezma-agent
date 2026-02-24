import { describe, it, expect, beforeAll, vi } from 'vitest';

// Must stub env BEFORE importing the module
vi.stubEnv('JWT_SECRET', 'test-secret-key-for-cc-auth');

// Dynamic import after env is set
let signCCToken: typeof import('@/lib/auth-command-center').signCCToken;
let getCCAuthPayload: typeof import('@/lib/auth-command-center').getCCAuthPayload;
type CCAuthPayload = import('@/lib/auth-command-center').CCAuthPayload;

beforeAll(async () => {
  const mod = await import('@/lib/auth-command-center');
  signCCToken = mod.signCCToken;
  getCCAuthPayload = mod.getCCAuthPayload;
});

// Helper to create mock NextRequest
function createMockRequest(cookies: Record<string, string> = {}) {
  return {
    cookies: {
      get: (name: string) => {
        const value = cookies[name];
        return value ? { value } : undefined;
      },
    },
  } as unknown as import('next/server').NextRequest;
}

describe('signCCToken', () => {
  it('returns a JWT string with 3 parts', () => {
    const payload: CCAuthPayload = {
      adminId: 'admin-1',
      email: 'admin@gezma.id',
      role: 'super_admin',
    };
    const token = signCCToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  it('token can be decoded and contains payload', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    const payload: CCAuthPayload = {
      adminId: 'admin-1',
      email: 'admin@gezma.id',
      role: 'super_admin',
    };
    const token = signCCToken(payload);
    const decoded = jwt.decode(token) as Record<string, unknown>;
    expect(decoded.adminId).toBe('admin-1');
    expect(decoded.email).toBe('admin@gezma.id');
    expect(decoded.role).toBe('super_admin');
  });

  it('token has expiration', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    const payload: CCAuthPayload = {
      adminId: 'admin-1',
      email: 'admin@gezma.id',
      role: 'super_admin',
    };
    const token = signCCToken(payload);
    const decoded = jwt.decode(token) as Record<string, unknown>;
    expect(decoded.exp).toBeDefined();
    expect(typeof decoded.exp).toBe('number');
  });
});

describe('getCCAuthPayload', () => {
  it('returns null when no cc_token cookie', () => {
    const req = createMockRequest({});
    const result = getCCAuthPayload(req);
    expect(result).toBeNull();
  });

  it('returns null for invalid token', () => {
    const req = createMockRequest({ cc_token: 'totally.invalid.token' });
    const result = getCCAuthPayload(req);
    expect(result).toBeNull();
  });

  it('returns null for empty cookie value', () => {
    const req = createMockRequest({ cc_token: '' });
    const result = getCCAuthPayload(req);
    expect(result).toBeNull();
  });

  it('round-trips sign and verify', () => {
    const payload: CCAuthPayload = {
      adminId: 'admin-123',
      email: 'test@gezma.id',
      role: 'super_admin',
    };
    const token = signCCToken(payload);
    const req = createMockRequest({ cc_token: token });
    const result = getCCAuthPayload(req);
    expect(result).not.toBeNull();
    expect(result?.adminId).toBe('admin-123');
    expect(result?.email).toBe('test@gezma.id');
    expect(result?.role).toBe('super_admin');
  });

  it('returns null for token signed with different secret', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    const fakeToken = jwt.sign({ adminId: 'x' }, 'wrong-secret', { expiresIn: '1h' });
    const req = createMockRequest({ cc_token: fakeToken });
    const result = getCCAuthPayload(req);
    expect(result).toBeNull();
  });
});
