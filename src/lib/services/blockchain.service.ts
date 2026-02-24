import { prisma } from '@/lib/prisma';

/**
 * Generate certificate number: GEZMA-{YEAR}-{RANDOM_HEX_8chars}
 */
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const hex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('').toUpperCase();
  return `GEZMA-${year}-${hex}`;
}

/**
 * Simulate a blockchain transaction hash: 0x + 64 hex chars
 */
export function simulateTxHash(): string {
  const hex = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `0x${hex}`;
}

/**
 * Simulate a block number between 1000000 and 9999999
 */
export function simulateBlockNumber(): number {
  return Math.floor(Math.random() * 9000000) + 1000000;
}

/**
 * Issue a new blockchain certificate for a pilgrim
 */
export async function issueCertificate(pilgrimId: string, agencyId: string) {
  const pilgrim = await prisma.pilgrim.findFirst({
    where: { id: pilgrimId, agencyId },
  });

  if (!pilgrim) {
    throw new Error('Jamaah tidak ditemukan');
  }

  // Check if pilgrim already has an active certificate
  const existing = await prisma.blockchainCertificate.findFirst({
    where: { pilgrimId, agencyId, status: { not: 'revoked' } },
  });

  if (existing) {
    throw new Error('Jamaah sudah memiliki sertifikat aktif');
  }

  const now = new Date();
  const certificate = await prisma.blockchainCertificate.create({
    data: {
      certificateNumber: generateCertificateNumber(),
      txHash: simulateTxHash(),
      blockNumber: simulateBlockNumber(),
      status: 'verified',
      verifiedAt: now,
      pilgrimId,
      agencyId,
      metadata: {
        pilgrimName: pilgrim.name,
        pilgrimNik: pilgrim.nik,
        network: 'Gezma Simulated Chain',
        consensus: 'Proof of Authority',
        gasUsed: Math.floor(Math.random() * 50000) + 21000,
        confirmations: Math.floor(Math.random() * 100) + 12,
      },
    },
    include: {
      pilgrim: { select: { name: true, nik: true } },
      agency: { select: { name: true } },
    },
  });

  return certificate;
}

/**
 * Verify a certificate by its certificate number (public)
 */
export async function verifyCertificate(certificateNumber: string) {
  const certificate = await prisma.blockchainCertificate.findUnique({
    where: { certificateNumber },
    include: {
      pilgrim: { select: { name: true, nik: true } },
      agency: { select: { name: true } },
    },
  });

  if (!certificate) {
    return null;
  }

  return certificate;
}

/**
 * Revoke a certificate
 */
export async function revokeCertificate(id: string, agencyId: string) {
  const certificate = await prisma.blockchainCertificate.findFirst({
    where: { id, agencyId },
  });

  if (!certificate) {
    throw new Error('Sertifikat tidak ditemukan');
  }

  if (certificate.status === 'revoked') {
    throw new Error('Sertifikat sudah dicabut');
  }

  const updated = await prisma.blockchainCertificate.update({
    where: { id },
    data: { status: 'revoked' },
    include: {
      pilgrim: { select: { name: true, nik: true } },
      agency: { select: { name: true } },
    },
  });

  return updated;
}
