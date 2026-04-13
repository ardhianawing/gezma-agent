import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Generate certificate number: GEZMA-{YEAR}-{RANDOM_HEX_8chars}
 * Uses crypto.randomBytes instead of Math.random for security
 */
export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `GEZMA-${year}-${hex}`;
}

/**
 * Simulate a blockchain transaction hash: 0x + 64 hex chars
 */
export function simulateTxHash(): string {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

/**
 * Simulate a block number between 1000000 and 9999999
 */
export function simulateBlockNumber(): number {
  return crypto.randomInt(1000000, 10000000);
}

/**
 * Issue a new blockchain certificate for a pilgrim
 * Uses prisma.$transaction to prevent race conditions
 */
export async function issueCertificate(pilgrimId: string, agencyId: string) {
  return prisma.$transaction(async (tx) => {
    const pilgrim = await tx.pilgrim.findFirst({
      where: { id: pilgrimId, agencyId },
    });

    if (!pilgrim) {
      throw new Error('Jamaah tidak ditemukan');
    }

    // Check if pilgrim already has an active certificate (inside transaction)
    const existing = await tx.blockchainCertificate.findFirst({
      where: { pilgrimId, agencyId, status: { not: 'revoked' } },
    });

    if (existing) {
      throw new Error('Jamaah sudah memiliki sertifikat aktif');
    }

    const now = new Date();
    const certificate = await tx.blockchainCertificate.create({
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
          gasUsed: crypto.randomInt(21000, 71000),
          confirmations: crypto.randomInt(12, 112),
        },
      },
      include: {
        pilgrim: { select: { name: true, nik: true } },
        agency: { select: { name: true } },
      },
    });

    return certificate;
  });
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
