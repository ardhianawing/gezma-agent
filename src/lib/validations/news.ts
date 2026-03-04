import { z } from 'zod';

export const newsCategories = ['regulasi', 'pengumuman', 'event', 'tips', 'peringatan'] as const;

export const createNewsArticleSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter').max(300, 'Judul maksimal 300 karakter'),
  excerpt: z.string().min(10, 'Ringkasan minimal 10 karakter').max(500, 'Ringkasan maksimal 500 karakter'),
  content: z.string().min(20, 'Konten minimal 20 karakter'),
  category: z.enum(newsCategories),
  emoji: z.string().default('📰'),
  tags: z.array(z.string()).max(10, 'Maksimal 10 tags').default([]),
  author: z.string().min(2, 'Nama penulis minimal 2 karakter'),
  authorRole: z.string().min(2, 'Role penulis minimal 2 karakter'),
  readTime: z.number().int().min(1).max(60).default(5),
  isBreaking: z.boolean().default(false),
  isOfficial: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
});

export const updateNewsArticleSchema = createNewsArticleSchema.partial();

export type CreateNewsArticleData = z.infer<typeof createNewsArticleSchema>;
export type UpdateNewsArticleData = z.infer<typeof updateNewsArticleSchema>;
