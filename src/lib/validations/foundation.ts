import { z } from 'zod';

export const createCampaignSchema = z.object({
  title: z.string().min(5, 'Judul kampanye minimal 5 karakter'),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter'),
  category: z.enum(['bencana', 'masjid', 'yatim', 'kesehatan', 'pendidikan', 'pelatihan', 'umrah_dhuafa'], {
    message: 'Kategori tidak valid',
  }),
  targetAmount: z.number().positive('Target dana harus lebih dari 0'),
  deadline: z.string().optional().nullable(),
  imageUrl: z.string().url('URL gambar tidak valid').optional().nullable(),
});

export const createDonationSchema = z.object({
  campaignId: z.string().uuid('ID kampanye tidak valid'),
  donorName: z.string().min(2, 'Nama donatur minimal 2 karakter'),
  donorEmail: z.string().email('Format email tidak valid').optional().nullable(),
  amount: z.number().positive('Jumlah donasi harus lebih dari 0'),
  type: z.enum(['onetime', 'recurring'], { message: 'Tipe donasi tidak valid' }),
  method: z.enum(['transfer', 'cash', 'gezmapay'], { message: 'Metode pembayaran tidak valid' }),
  isAnonymous: z.boolean().default(false),
});

export const createGoodsSchema = z.object({
  title: z.string().min(3, 'Judul barang minimal 3 karakter'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  category: z.enum(['pakaian', 'ibadah', 'elektronik', 'lainnya'], { message: 'Kategori tidak valid' }),
  condition: z.enum(['baik', 'cukup_baik'], { message: 'Kondisi tidak valid' }),
  imageUrl: z.string().url('URL gambar tidak valid').optional().nullable(),
});

export const createFinancingSchema = z.object({
  amount: z.number().positive('Jumlah pinjaman harus lebih dari 0').max(500_000_000, 'Maksimal pinjaman Rp 500 juta'),
  purpose: z.string().min(10, 'Tujuan pinjaman minimal 10 karakter'),
  tenorMonths: z.union([z.literal(3), z.literal(6), z.literal(12)], {
    message: 'Tenor harus 3, 6, atau 12 bulan',
  }),
});

export type CreateCampaignData = z.infer<typeof createCampaignSchema>;
export type CreateDonationData = z.infer<typeof createDonationSchema>;
export type CreateGoodsData = z.infer<typeof createGoodsSchema>;
export type CreateFinancingData = z.infer<typeof createFinancingSchema>;
