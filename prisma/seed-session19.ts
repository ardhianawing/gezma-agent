/**
 * Session 19 Seed: Platform Services & Documents
 */

import type { PrismaClient } from '../src/generated/prisma/client';

const S19_IDS = {
  services: [
    '00000000-0000-4000-a000-000000000900',
    '00000000-0000-4000-a000-000000000901',
    '00000000-0000-4000-a000-000000000902',
    '00000000-0000-4000-a000-000000000903',
    '00000000-0000-4000-a000-000000000904',
    '00000000-0000-4000-a000-000000000905',
  ],
  documents: [
    '00000000-0000-4000-a000-000000000910',
    '00000000-0000-4000-a000-000000000911',
    '00000000-0000-4000-a000-000000000912',
    '00000000-0000-4000-a000-000000000913',
    '00000000-0000-4000-a000-000000000914',
    '00000000-0000-4000-a000-000000000915',
  ],
};

async function seedServices(prisma: PrismaClient) {
  console.log('Seeding platform services...');

  const services = [
    {
      id: S19_IDS.services[0],
      title: 'Konsultasi Legal',
      description: 'Pendampingan izin PPIU, review kontrak, dan compliance regulasi',
      emoji: '\u2696\uFE0F',
      color: '#2563EB',
      category: 'legal',
      features: ['Konsultasi izin PPIU', 'Review kontrak vendor', 'Pendampingan audit Kemenag', 'Update regulasi berkala'],
      ctaText: 'Hubungi Legal',
      ctaLink: 'https://wa.me/6281234567890?text=Halo%20GEZMA%2C%20saya%20butuh%20konsultasi%20legal',
      order: 0,
    },
    {
      id: S19_IDS.services[1],
      title: 'Partner Visa Resmi',
      description: 'Muassasah terverifikasi Saudi untuk proses visa cepat dan aman',
      emoji: '\uD83D\uDCC4',
      color: '#059669',
      category: 'visa',
      features: ['Muassasah terverifikasi', 'Proses visa 3-5 hari', 'Tracking status real-time', 'Support visa bermasalah'],
      ctaText: 'Lihat Partner',
      ctaLink: '/marketplace?category=visa',
      order: 1,
    },
    {
      id: S19_IDS.services[2],
      title: 'Download Dokumen',
      description: 'Template, formulir, dan SOP siap pakai untuk operasional',
      emoji: '\uD83D\uDCE5',
      color: '#7C3AED',
      category: 'dokumen',
      features: ['Template kontrak jemaah', 'Form manifest keberangkatan', 'SOP operasional umrah', 'Checklist dokumen jemaah'],
      ctaText: 'Lihat Dokumen',
      ctaLink: '#download-dokumen-section',
      order: 2,
    },
    {
      id: S19_IDS.services[3],
      title: 'Support & Bantuan',
      description: 'Tim support siap membantu kebutuhan operasional Anda',
      emoji: '\uD83C\uDFA7',
      color: '#D97706',
      category: 'support',
      features: ['Live chat 24/7', 'Ticket support system', 'Knowledge base lengkap', 'Video tutorial'],
      ctaText: 'Hubungi Support',
      ctaLink: '/help',
      order: 3,
    },
    {
      id: S19_IDS.services[4],
      title: 'Partner Asuransi',
      description: 'Asuransi perjalanan umrah dengan coverage komprehensif',
      emoji: '\uD83D\uDEE1\uFE0F',
      color: '#DC2626',
      category: 'asuransi',
      features: ['Asuransi perjalanan umrah', 'Klaim cepat & mudah', 'Coverage komprehensif', 'Harga khusus member'],
      ctaText: 'Lihat Partner',
      ctaLink: '/marketplace?category=asuransi',
      order: 4,
    },
    {
      id: S19_IDS.services[5],
      title: 'Komunitas & Networking',
      description: 'Jaringan sesama travel agent untuk kolaborasi dan sharing',
      emoji: '\uD83D\uDC65',
      color: '#0891B2',
      category: 'komunitas',
      features: ['Gathering bulanan', 'Webinar eksklusif', 'Grup WhatsApp PPIU', 'Direktori travel agent'],
      ctaText: 'Gabung Sekarang',
      ctaLink: '/forum',
      order: 5,
    },
  ];

  for (const svc of services) {
    const existing = await (prisma as any).platformService.findUnique({ where: { id: svc.id } });
    if (!existing) {
      await (prisma as any).platformService.create({ data: svc });
    }
  }
  console.log('  Created 6 platform services');
}

async function seedDocuments(prisma: PrismaClient) {
  console.log('Seeding platform documents...');

  const documents = [
    { id: S19_IDS.documents[0], name: 'Template Kontrak Jemaah', format: 'PDF', fileSize: '245 KB', category: 'template' },
    { id: S19_IDS.documents[1], name: 'Form Manifest Keberangkatan', format: 'XLSX', fileSize: '128 KB', category: 'template' },
    { id: S19_IDS.documents[2], name: 'SOP Operasional Umrah', format: 'PDF', fileSize: '512 KB', category: 'sop' },
    { id: S19_IDS.documents[3], name: 'Checklist Dokumen Jemaah', format: 'PDF', fileSize: '89 KB', category: 'checklist' },
    { id: S19_IDS.documents[4], name: 'Template Invoice', format: 'DOCX', fileSize: '156 KB', category: 'template' },
    { id: S19_IDS.documents[5], name: 'Panduan Sistem GEZMA', format: 'PDF', fileSize: '1.2 MB', category: 'general' },
  ];

  for (const doc of documents) {
    const existing = await (prisma as any).platformDocument.findUnique({ where: { id: doc.id } });
    if (!existing) {
      await (prisma as any).platformDocument.create({ data: doc });
    }
  }
  console.log('  Created 6 platform documents');
}

export async function seedSession19(prisma: PrismaClient) {
  console.log('\n--- Session 19 Seed: Services & Documents ---\n');
  await seedServices(prisma);
  await seedDocuments(prisma);
}
