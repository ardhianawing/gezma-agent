import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('cron', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('initCronJobs does not throw', async () => {
    vi.stubEnv('CRON_ENABLED', 'true');
    const { initCronJobs } = await import('@/lib/cron');
    expect(() => initCronJobs()).not.toThrow();
  });

  it('registers 3 cron schedules when enabled', async () => {
    vi.stubEnv('CRON_ENABLED', 'true');
    const cron = (await import('node-cron')).default;
    const { initCronJobs } = await import('@/lib/cron');

    initCronJobs();

    expect(cron.schedule).toHaveBeenCalledTimes(3);
    expect(cron.schedule).toHaveBeenCalledWith('0 * * * *', expect.any(Function));
    expect(cron.schedule).toHaveBeenCalledWith('0 1 * * *', expect.any(Function));
    expect(cron.schedule).toHaveBeenCalledWith('0 8 * * *', expect.any(Function));
  });

  it('skips init when CRON_ENABLED=false', async () => {
    vi.stubEnv('CRON_ENABLED', 'false');
    const cron = (await import('node-cron')).default;
    const { initCronJobs } = await import('@/lib/cron');

    initCronJobs();

    expect(cron.schedule).not.toHaveBeenCalled();
  });

  it('logs initialization message when enabled', async () => {
    vi.stubEnv('CRON_ENABLED', 'true');
    const { logger } = await import('@/lib/logger');
    const { initCronJobs } = await import('@/lib/cron');

    initCronJobs();

    expect(logger.info).toHaveBeenCalledWith('Cron jobs initialized', expect.any(Object));
  });
});
