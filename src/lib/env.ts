import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().optional(),

  // SMTP (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Storage
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),

  // S3 (optional, required when STORAGE_DRIVER=s3)
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // Security
  TOTP_ENCRYPTION_KEY: z.string().min(32, 'TOTP_ENCRYPTION_KEY must be at least 32 characters').optional(),
  DATA_ENCRYPTION_KEY: z.string().min(64, 'DATA_ENCRYPTION_KEY must be 64 hex chars (32 bytes)').optional(),

  // Cron
  CRON_ENABLED: z.string().default('true').transform(v => v === 'true'),

  // Error Monitoring
  ERROR_MONITOR_DSN: z.string().optional(),
  APP_VERSION: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map(issue => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  // Validate S3 vars when STORAGE_DRIVER=s3
  if (result.data.STORAGE_DRIVER === 's3') {
    const missing = ['S3_BUCKET', 'S3_REGION', 'S3_ACCESS_KEY', 'S3_SECRET_KEY']
      .filter(k => !result.data[k as keyof Env]);
    if (missing.length > 0) {
      throw new Error(`STORAGE_DRIVER=s3 requires: ${missing.join(', ')}`);
    }
  }

  // Production security checks
  if (result.data.NODE_ENV === 'production') {
    const secret = result.data.JWT_SECRET;
    if (secret.includes('dummy') || secret.includes('default') || secret.includes('changeme')) {
      throw new Error('JWT_SECRET contains a default/dummy value. Set a strong secret in production.');
    }
    if (!result.data.TOTP_ENCRYPTION_KEY) {
      console.warn('[SECURITY] TOTP_ENCRYPTION_KEY is not set. 2FA will not work in production.');
    }
    if (!result.data.DATA_ENCRYPTION_KEY) {
      console.warn('[SECURITY] DATA_ENCRYPTION_KEY is not set. Sensitive fields (NIK, phone) will be stored in plaintext.');
    }
  }

  cachedEnv = result.data;
  return result.data;
}

export function getEnv(): Env {
  if (!cachedEnv) {
    return validateEnv();
  }
  return cachedEnv;
}
