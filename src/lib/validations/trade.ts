import { z } from 'zod';

export const tradeCategories = ['makanan', 'buah', 'fashion', 'kosmetik', 'kerajinan', 'ibadah'] as const;

export const createTradeProductSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter').max(200),
  producer: z.string().min(2, 'Nama produsen minimal 2 karakter'),
  origin: z.string().min(3, 'Asal produk minimal 3 karakter'),
  category: z.enum(tradeCategories),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter'),
  emoji: z.string().default('📦'),
  certifications: z.array(z.string()).default([]),
  moq: z.string().min(1, 'MOQ harus diisi'),
  targetMarkets: z.array(z.string()).min(1, 'Minimal 1 target market'),
  price: z.string().min(1, 'Harga harus diisi'),
});

export const updateTradeProductSchema = createTradeProductSchema.partial();

export const curateTradeProductSchema = z.object({
  status: z.enum(['active', 'rejected']),
  rejectionReason: z.string().optional(),
});

export const createTradeInquirySchema = z.object({
  message: z.string().min(10, 'Pesan minimal 10 karakter').max(1000, 'Pesan maksimal 1000 karakter'),
});

export type CreateTradeProductData = z.infer<typeof createTradeProductSchema>;
export type UpdateTradeProductData = z.infer<typeof updateTradeProductSchema>;
export type CurateTradeProductData = z.infer<typeof curateTradeProductSchema>;
export type CreateTradeInquiryData = z.infer<typeof createTradeInquirySchema>;
