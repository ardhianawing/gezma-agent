import { z } from 'zod';

export const emergencyContactSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  phone: z.string().min(10, 'No HP minimal 10 digit').max(15),
  relation: z.string().min(2, 'Hubungan harus diisi'),
});

export const pilgrimFormSchema = z.object({
  // Personal Info
  nik: z
    .string()
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d+$/, 'NIK hanya boleh angka'),
  name: z.string().min(3, 'Nama minimal 3 karakter').max(100),
  gender: z.enum(['male', 'female'], { message: 'Pilih jenis kelamin' }),
  birthPlace: z.string().min(2, 'Tempat lahir harus diisi'),
  birthDate: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 1 && age <= 120;
  }, 'Tanggal lahir tidak valid'),
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
  city: z.string().min(2, 'Kota harus diisi'),
  province: z.string().min(2, 'Provinsi harus diisi'),
  postalCode: z.string().optional(),

  // Contact
  phone: z
    .string()
    .min(10, 'No HP minimal 10 digit')
    .max(15)
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Format No HP tidak valid'),
  email: z.string().email('Email tidak valid'),
  whatsapp: z.string().optional(),

  // Emergency Contact
  emergencyContact: emergencyContactSchema,

  // Optional
  notes: z.string().optional(),
});

export type PilgrimFormData = z.infer<typeof pilgrimFormSchema>;

// For status update
export const pilgrimStatusSchema = z.object({
  status: z.enum(['lead', 'dp', 'lunas', 'dokumen', 'visa', 'ready', 'departed', 'completed']),
  notes: z.string().optional(),
});

// For document upload
export const documentUploadSchema = z.object({
  type: z.enum(['ktp', 'passport', 'photo', 'visa', 'health_cert', 'book_nikah']),
  file: z.any(), // File object, validated separately
  expiryDate: z.string().optional(), // Required for passport
});
