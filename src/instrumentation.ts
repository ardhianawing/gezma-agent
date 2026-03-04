export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/env');
    validateEnv();

    const { logger } = await import('@/lib/logger');
    logger.info('Server starting', {
      nodeVersion: process.version,
      env: process.env.NODE_ENV || 'development',
      pid: process.pid,
    });

    // Production security warnings
    if (process.env.NODE_ENV === 'production') {
      const secret = process.env.JWT_SECRET || '';
      if (secret.length < 64) {
        logger.warn('[SECURITY] JWT_SECRET is less than 64 characters. Consider using a stronger secret.');
      }
      if (!process.env.TOTP_ENCRYPTION_KEY) {
        logger.error('[SECURITY] TOTP_ENCRYPTION_KEY is not set. 2FA functionality disabled.');
      }
    }

    const { captureMessage } = await import('@/lib/error-monitor');
    captureMessage('Server started', 'info', { extra: { nodeVersion: process.version } });

    const { initCronJobs } = await import('@/lib/cron');
    initCronJobs();
  }
}
