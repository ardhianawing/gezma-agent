import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock otplib - matching actual imports: generateSecret, generateURI, verify
vi.mock('otplib', () => ({
  generateSecret: vi.fn().mockReturnValue('JBSWY3DPEHPK3PXP'),
  generateURI: vi.fn().mockReturnValue('otpauth://totp/Gezma%20Agent:test@test.com?secret=JBSWY3DPEHPK3PXP&issuer=Gezma%20Agent'),
  verify: vi.fn().mockResolvedValue({ valid: true }),
}));

// Mock qrcode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockqr'),
  },
}));

// Set env
vi.stubEnv('TOTP_ENCRYPTION_KEY', 'a'.repeat(64));

describe('TOTP Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('encryptSecret and decryptSecret are inverses', async () => {
    const { encryptSecret, decryptSecret } = await import('@/lib/services/totp.service');
    const original = 'JBSWY3DPEHPK3PXP';
    const encrypted = encryptSecret(original);

    expect(encrypted).not.toBe(original);
    expect(encrypted).toContain(':'); // iv:authTag:encrypted format

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(original);
  });

  it('encryptSecret produces different outputs for same input', async () => {
    const { encryptSecret } = await import('@/lib/services/totp.service');
    const original = 'JBSWY3DPEHPK3PXP';
    const enc1 = encryptSecret(original);
    const enc2 = encryptSecret(original);
    // Different IVs should produce different ciphertexts
    expect(enc1).not.toBe(enc2);
  });

  it('encrypted format has 3 hex parts separated by colons', async () => {
    const { encryptSecret } = await import('@/lib/services/totp.service');
    const encrypted = encryptSecret('TEST_SECRET');
    const parts = encrypted.split(':');
    expect(parts).toHaveLength(3);
    // Each part should be hex
    parts.forEach((part) => {
      expect(part).toMatch(/^[0-9a-f]+$/);
    });
  });

  it('decryptSecret throws on invalid data', async () => {
    const { decryptSecret } = await import('@/lib/services/totp.service');
    expect(() => decryptSecret('invalid')).toThrow();
  });

  it('generateTotpSecret returns expected structure', async () => {
    const { generateTotpSecret } = await import('@/lib/services/totp.service');
    const result = await generateTotpSecret('test@test.com');

    expect(result).toHaveProperty('secret');
    expect(result).toHaveProperty('otpauthUrl');
    expect(result).toHaveProperty('qrDataUrl');
    expect(result.secret).toBe('JBSWY3DPEHPK3PXP');
  });

  it('verifyToken returns boolean', async () => {
    const { encryptSecret, verifyToken } = await import('@/lib/services/totp.service');
    const encrypted = encryptSecret('JBSWY3DPEHPK3PXP');
    const result = await verifyToken(encrypted, '123456');
    expect(typeof result).toBe('boolean');
  });
});
