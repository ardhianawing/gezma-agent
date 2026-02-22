import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  role: z.enum(['owner', 'admin', 'staff', 'marketing']).optional().default('staff'),
  position: z.string().optional(),
  phone: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['owner', 'admin', 'staff', 'marketing']).optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
