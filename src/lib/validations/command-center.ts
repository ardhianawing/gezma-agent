import { z } from 'zod';

export const ccLoginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const agencyStatusSchema = z.object({
  ppiuStatus: z.enum(['pending', 'active', 'expiring', 'expired', 'suspended']).optional(),
  isVerified: z.boolean().optional(),
});
