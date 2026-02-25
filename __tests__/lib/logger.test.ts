import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('logger', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('outputs JSON in production mode', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { logger } = await import('@/lib/logger');
    logger.info('test message', { key: 'value' });

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const output = consoleSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe('info');
    expect(parsed.msg).toBe('test message');
    expect(parsed.key).toBe('value');
    expect(parsed.timestamp).toBeDefined();

    consoleSpy.mockRestore();
  });

  it('outputs readable format in dev mode', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { logger } = await import('@/lib/logger');
    logger.info('dev message');

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const output = consoleSpy.mock.calls[0][0];
    expect(output).toContain('INFO');
    expect(output).toContain('dev message');

    consoleSpy.mockRestore();
  });

  it('warn calls console.warn', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { logger } = await import('@/lib/logger');
    logger.warn('warning');

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
  });

  it('error calls console.error', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { logger } = await import('@/lib/logger');
    logger.error('error msg');

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
  });

  it('debug is suppressed in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    const { logger } = await import('@/lib/logger');
    logger.debug('should not appear');

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
