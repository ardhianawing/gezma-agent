import { describe, it, expect, beforeAll } from 'vitest';
import { encryptField, decryptField, isEncrypted, maskNIK, maskPhone, maskEmail, encryptPilgrimFields, decryptPilgrimFields } from '../src/lib/encryption';

// Set test encryption key (32 bytes = 64 hex chars)
beforeAll(() => {
  process.env.DATA_ENCRYPTION_KEY = 'a'.repeat(64);
});

describe('Encryption - encryptField & decryptField', () => {
  it('should encrypt and decrypt a string correctly', () => {
    const original = '3201011234567890';
    const encrypted = encryptField(original);
    expect(encrypted).not.toBe(original);
    expect(encrypted).toContain(':');

    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should return empty string for null/undefined/empty', () => {
    expect(encryptField(null)).toBe('');
    expect(encryptField(undefined)).toBe('');
    expect(encryptField('')).toBe('');
    expect(decryptField(null)).toBe('');
    expect(decryptField(undefined)).toBe('');
    expect(decryptField('')).toBe('');
  });

  it('should produce different ciphertext for same plaintext (random IV)', () => {
    const plain = 'test-data-123';
    const enc1 = encryptField(plain);
    const enc2 = encryptField(plain);
    expect(enc1).not.toBe(enc2);

    // But both should decrypt to same value
    expect(decryptField(enc1)).toBe(plain);
    expect(decryptField(enc2)).toBe(plain);
  });

  it('should return original value for non-encrypted strings (migration support)', () => {
    const legacy = '0812345678';
    const result = decryptField(legacy);
    expect(result).toBe(legacy);
  });

  it('should handle unicode characters', () => {
    const original = 'Jalan Sudirman No. 123, Jakarta Selatan 日本語';
    const encrypted = encryptField(original);
    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe(original);
  });
});

describe('Encryption - isEncrypted', () => {
  it('should detect encrypted values', () => {
    const encrypted = encryptField('test');
    expect(isEncrypted(encrypted)).toBe(true);
  });

  it('should return false for plain values', () => {
    expect(isEncrypted('plaintext')).toBe(false);
    expect(isEncrypted('0812345678')).toBe(false);
    expect(isEncrypted(null)).toBe(false);
    expect(isEncrypted(undefined)).toBe(false);
  });
});

describe('Masking functions', () => {
  it('should mask NIK correctly', () => {
    expect(maskNIK('3201011234567890')).toBe('3201****7890');
  });

  it('should mask short NIK', () => {
    expect(maskNIK('123')).toBe('****');
  });

  it('should mask phone correctly', () => {
    expect(maskPhone('081234567890')).toBe('0812****90');
  });

  it('should mask email correctly', () => {
    expect(maskEmail('john.doe@gmail.com')).toBe('jo***@gmail.com');
  });
});

describe('Pilgrim field encryption helpers', () => {
  it('should encrypt pilgrim sensitive fields', () => {
    const data = {
      nik: '3201011234567890',
      name: 'Ahmad',
      phone: '081234567890',
      email: 'ahmad@test.com',
      whatsapp: '081234567890',
      city: 'Jakarta',
    };

    const encrypted = encryptPilgrimFields(data);

    // Sensitive fields should be encrypted
    expect(encrypted.nik).not.toBe(data.nik);
    expect(encrypted.phone).not.toBe(data.phone);
    expect(encrypted.email).not.toBe(data.email);
    expect(encrypted.whatsapp).not.toBe(data.whatsapp);

    // Non-sensitive fields should remain unchanged
    expect(encrypted.name).toBe('Ahmad');
    expect(encrypted.city).toBe('Jakarta');
  });

  it('should decrypt pilgrim sensitive fields', () => {
    const original = {
      nik: '3201011234567890',
      name: 'Ahmad',
      phone: '081234567890',
      email: 'ahmad@test.com',
      whatsapp: '081234567890',
    };

    const encrypted = encryptPilgrimFields(original);
    const decrypted = decryptPilgrimFields(encrypted);

    expect(decrypted.nik).toBe(original.nik);
    expect(decrypted.phone).toBe(original.phone);
    expect(decrypted.email).toBe(original.email);
    expect(decrypted.whatsapp).toBe(original.whatsapp);
    expect(decrypted.name).toBe('Ahmad');
  });
});
