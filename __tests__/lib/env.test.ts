import { describe, it, expect, beforeEach, vi } from 'vitest';

// Reset module cache between tests
beforeEach(() => {
  vi.resetModules();
});

function loadEnvModule() {
  return import('@/lib/env');
}

describe('env validation', () => {
  it('throws when DATABASE_URL is missing', async () => {
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('JWT_SECRET', 'a'.repeat(32));

    const { validateEnv } = await loadEnvModule();
    expect(() => validateEnv()).toThrow('DATABASE_URL');
  });

  it('throws when JWT_SECRET is too short', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://localhost/test');
    vi.stubEnv('JWT_SECRET', 'short');

    const { validateEnv } = await loadEnvModule();
    expect(() => validateEnv()).toThrow('JWT_SECRET');
  });

  it('passes with valid env vars', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://localhost/test');
    vi.stubEnv('JWT_SECRET', 'a'.repeat(32));
    vi.stubEnv('NODE_ENV', 'test');

    const { validateEnv } = await loadEnvModule();
    const env = validateEnv();
    expect(env.DATABASE_URL).toBe('postgresql://localhost/test');
    expect(env.NODE_ENV).toBe('test');
  });

  it('defaults STORAGE_DRIVER to local', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://localhost/test');
    vi.stubEnv('JWT_SECRET', 'a'.repeat(32));
    vi.stubEnv('NODE_ENV', 'test');
    delete process.env.STORAGE_DRIVER;

    const { validateEnv } = await loadEnvModule();
    const env = validateEnv();
    expect(env.STORAGE_DRIVER).toBe('local');
  });

  it('defaults CRON_ENABLED to true', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://localhost/test');
    vi.stubEnv('JWT_SECRET', 'a'.repeat(32));
    vi.stubEnv('NODE_ENV', 'test');
    delete process.env.STORAGE_DRIVER;
    delete process.env.CRON_ENABLED;

    const { validateEnv } = await loadEnvModule();
    const env = validateEnv();
    expect(env.CRON_ENABLED).toBe(true);
  });

  it('getEnv returns cached result', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://localhost/test');
    vi.stubEnv('JWT_SECRET', 'a'.repeat(32));
    vi.stubEnv('NODE_ENV', 'test');
    delete process.env.STORAGE_DRIVER;

    const { validateEnv, getEnv } = await loadEnvModule();
    validateEnv();
    const env = getEnv();
    expect(env.DATABASE_URL).toBe('postgresql://localhost/test');
  });
});
