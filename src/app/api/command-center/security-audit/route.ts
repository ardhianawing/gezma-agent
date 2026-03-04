import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  try {
    const jwtSecret = process.env.JWT_SECRET || '';
    const jwtStrength = jwtSecret.length >= 64 ? 'strong' : jwtSecret.length >= 32 ? 'medium' : 'weak';

    const [activeSessions, expiredAgencies, defaultAdmin] = await Promise.all([
      prisma.loginHistory.count({ where: { isActive: true } }),
      prisma.agency.count({
        where: {
          ppiuStatus: 'expired',
        },
      }),
      prisma.systemAdmin.findFirst({
        where: { email: 'admin@gezma.id' },
        select: { password: true },
      }),
    ]);

    // Check if default admin password is still the original bcrypt hash of "admin123!"
    let defaultCredentialsDetected = false;
    if (defaultAdmin) {
      const bcrypt = await import('bcryptjs');
      defaultCredentialsDetected = await bcrypt.compare('admin123!', defaultAdmin.password);
    }

    return NextResponse.json({
      security: {
        jwtSecretStrength: jwtStrength,
        totpEncryptionConfigured: !!process.env.TOTP_ENCRYPTION_KEY,
        storageDriver: process.env.STORAGE_DRIVER || 'local',
        cspHeadersConfigured: true,
        rateLimitingActive: true,
        errorMonitoringDSN: !!process.env.ERROR_MONITOR_DSN,
      },
      stats: {
        activeSessions,
        expiredAgencies,
        defaultCredentialsDetected,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
      },
    });
  } catch (error) {
    logger.error('GET /api/command-center/security-audit error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
