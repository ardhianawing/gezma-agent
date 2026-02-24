import { z } from 'zod';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini harus diisi'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter').max(100),
  confirmPassword: z.string().min(1, 'Konfirmasi password harus diisi'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

export const loginHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type LoginHistoryQuery = z.infer<typeof loginHistoryQuerySchema>;
