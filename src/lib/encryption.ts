import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.DATA_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('DATA_ENCRYPTION_KEY environment variable is required for field encryption');
  }
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns format: iv:authTag:ciphertext (all hex-encoded).
 * Returns empty string for null/undefined/empty input.
 */
export function encryptField(plaintext: string | null | undefined): string {
  if (!plaintext) return '';

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM encrypted string.
 * Expects format: iv:authTag:ciphertext (all hex-encoded).
 * Returns empty string for null/undefined/empty input.
 * Returns original value if it doesn't look encrypted (migration support).
 */
export function decryptField(encryptedData: string | null | undefined): string {
  if (!encryptedData) return '';

  // If it doesn't contain the expected format, return as-is (unencrypted legacy data)
  const parts = encryptedData.split(':');
  if (parts.length !== 3) return encryptedData;

  // Validate hex format
  const hexPattern = /^[0-9a-fA-F]+$/;
  if (!parts.every(p => hexPattern.test(p))) return encryptedData;

  try {
    const key = getEncryptionKey();
    const [ivHex, authTagHex, ciphertext] = parts;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch {
    // If decryption fails, return original (possibly unencrypted legacy data)
    return encryptedData;
  }
}

/**
 * Check if a value appears to be encrypted (has iv:authTag:ciphertext format).
 */
export function isEncrypted(value: string | null | undefined): boolean {
  if (!value) return false;
  const parts = value.split(':');
  if (parts.length !== 3) return false;
  const hexPattern = /^[0-9a-fA-F]+$/;
  return parts.every(p => hexPattern.test(p));
}

/**
 * Mask a sensitive field for display (e.g. NIK: "327501****0003").
 */
export function maskNIK(nik: string): string {
  if (nik.length < 6) return '****';
  return nik.slice(0, 4) + '****' + nik.slice(-4);
}

export function maskPhone(phone: string): string {
  if (phone.length < 6) return '****';
  return phone.slice(0, 4) + '****' + phone.slice(-2);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '****';
  const maskedLocal = local.slice(0, 2) + '***';
  return `${maskedLocal}@${domain}`;
}

/** Sensitive fields on the Pilgrim model that should be encrypted at rest. */
export const PILGRIM_ENCRYPTED_FIELDS = ['nik', 'phone', 'email', 'whatsapp'] as const;

/**
 * Encrypt sensitive fields on a pilgrim data object before database write.
 */
export function encryptPilgrimFields<T extends Record<string, unknown>>(data: T): T {
  const result = { ...data };
  for (const field of PILGRIM_ENCRYPTED_FIELDS) {
    if (field in result && typeof result[field] === 'string') {
      (result as Record<string, unknown>)[field] = encryptField(result[field] as string);
    }
  }
  return result;
}

/**
 * Decrypt sensitive fields on a pilgrim record after database read.
 */
export function decryptPilgrimFields<T extends Record<string, unknown>>(record: T): T {
  const result = { ...record };
  for (const field of PILGRIM_ENCRYPTED_FIELDS) {
    if (field in result && typeof result[field] === 'string') {
      (result as Record<string, unknown>)[field] = decryptField(result[field] as string);
    }
  }
  return result;
}
