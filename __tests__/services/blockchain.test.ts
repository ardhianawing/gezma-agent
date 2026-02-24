import { describe, it, expect, vi } from 'vitest';

// Mock prisma to avoid DB connection in tests
vi.mock('@/lib/prisma', () => ({
  prisma: {},
}));

import {
  generateCertificateNumber,
  simulateTxHash,
  simulateBlockNumber,
} from '@/lib/services/blockchain.service';

describe('generateCertificateNumber', () => {
  it('returns string in correct format GEZMA-YEAR-HEX', () => {
    const certNum = generateCertificateNumber();
    const year = new Date().getFullYear();
    const regex = new RegExp(`^GEZMA-${year}-[0-9A-F]{8}$`);
    expect(certNum).toMatch(regex);
  });

  it('generates unique numbers on multiple calls', () => {
    const numbers = new Set<string>();
    for (let i = 0; i < 20; i++) {
      numbers.add(generateCertificateNumber());
    }
    expect(numbers.size).toBe(20);
  });

  it('contains current year', () => {
    const certNum = generateCertificateNumber();
    const year = new Date().getFullYear().toString();
    expect(certNum).toContain(year);
  });

  it('starts with GEZMA-', () => {
    const certNum = generateCertificateNumber();
    expect(certNum.startsWith('GEZMA-')).toBe(true);
  });
});

describe('simulateTxHash', () => {
  it('starts with 0x', () => {
    const hash = simulateTxHash();
    expect(hash.startsWith('0x')).toBe(true);
  });

  it('has correct length (0x + 64 hex chars = 66 total)', () => {
    const hash = simulateTxHash();
    expect(hash.length).toBe(66);
  });

  it('contains only valid hex characters after 0x', () => {
    const hash = simulateTxHash();
    const hexPart = hash.slice(2);
    expect(hexPart).toMatch(/^[0-9a-f]{64}$/);
  });

  it('generates unique hashes', () => {
    const hashes = new Set<string>();
    for (let i = 0; i < 10; i++) {
      hashes.add(simulateTxHash());
    }
    expect(hashes.size).toBe(10);
  });
});

describe('simulateBlockNumber', () => {
  it('returns a number', () => {
    const blockNum = simulateBlockNumber();
    expect(typeof blockNum).toBe('number');
  });

  it('returns number in valid range', () => {
    const blockNum = simulateBlockNumber();
    expect(blockNum).toBeGreaterThanOrEqual(1000000);
    expect(blockNum).toBeLessThanOrEqual(9999999);
  });

  it('returns integer', () => {
    const blockNum = simulateBlockNumber();
    expect(Number.isInteger(blockNum)).toBe(true);
  });
});
