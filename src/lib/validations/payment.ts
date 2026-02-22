import { z } from 'zod';

export const createPaymentSchema = z.object({
  amount: z.number().positive('Jumlah pembayaran harus lebih dari 0'),
  type: z.enum(['dp', 'installment', 'full', 'refund'], {
    message: 'Tipe pembayaran tidak valid',
  }),
  method: z.enum(['transfer', 'cash', 'card'], {
    message: 'Metode pembayaran tidak valid',
  }),
  date: z.string().min(1, 'Tanggal pembayaran wajib diisi'),
  notes: z.string().optional(),
});

export type CreatePaymentData = z.infer<typeof createPaymentSchema>;
