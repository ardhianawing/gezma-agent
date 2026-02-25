import { generateSecret as otpGenerateSecret, generateURI, verify as otpVerify } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

function getTotpEncryptionKey(): string {
  const key = process.env.TOTP_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('TOTP_ENCRYPTION_KEY environment variable is required');
  }
  return key;
}
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

/**
 * Encrypt a TOTP secret using AES-256-GCM.
 * Returns a string in the format: iv:authTag:encrypted (all hex-encoded).
 */
export function encryptSecret(secret: string): string {
  const key = Buffer.from(getTotpEncryptionKey(), 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a TOTP secret encrypted with AES-256-GCM.
 */
export function decryptSecret(encryptedData: string): string {
  const key = Buffer.from(getTotpEncryptionKey(), 'hex');
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate a new TOTP secret for a user.
 * Returns the base32 secret, otpauth URL, and a QR code data URL (PNG).
 */
export async function generateTotpSecret(email: string): Promise<{
  secret: string;
  otpauthUrl: string;
  qrDataUrl: string;
}> {
  const secret = otpGenerateSecret();

  const otpauthUrl = generateURI({
    issuer: 'Gezma Agent',
    label: email,
    secret,
  });

  const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

  return { secret, otpauthUrl, qrDataUrl };
}

/**
 * Verify a TOTP token against an encrypted secret.
 * Returns true if the token is valid.
 */
export async function verifyToken(encryptedSecret: string, token: string): Promise<boolean> {
  try {
    const secret = decryptSecret(encryptedSecret);
    const result = await otpVerify({ token, secret });
    return result.valid;
  } catch {
    return false;
  }
}

/**
 * Verify a TOTP token against a plain (unencrypted) base32 secret.
 * Used during the setup/verification step before the secret is stored.
 */
export async function verifyTokenPlain(secret: string, token: string): Promise<boolean> {
  try {
    const result = await otpVerify({ token, secret });
    return result.valid;
  } catch {
    return false;
  }
}
