import { z } from 'zod';

export const createWaitingListSchema = z.object({
  pilgrimName: z.string().min(1, 'Nama jamaah wajib diisi'),
  phone: z.string().min(1, 'Nomor telepon wajib diisi'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
});

export type CreateWaitingListData = z.infer<typeof createWaitingListSchema>;
