import { z } from 'zod';

export const createServiceSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(100),
  description: z.string().min(1, 'Deskripsi wajib diisi').max(500),
  emoji: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna harus hex (#RRGGBB)').optional(),
  category: z.enum(['legal', 'visa', 'dokumen', 'support', 'asuransi', 'komunitas']),
  features: z.array(z.string().max(200)).max(10).optional(),
  ctaText: z.string().min(1).max(50),
  ctaLink: z.string().max(500).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const createDocumentSchema = z.object({
  name: z.string().min(1, 'Nama dokumen wajib diisi').max(200),
  description: z.string().max(500).optional(),
  format: z.enum(['PDF', 'XLSX', 'DOCX']),
  fileSize: z.string().min(1),
  fileUrl: z.string().max(500).optional(),
  category: z.enum(['general', 'template', 'sop', 'checklist']).optional(),
  isActive: z.boolean().optional(),
});

export const updateDocumentSchema = createDocumentSchema.partial();
