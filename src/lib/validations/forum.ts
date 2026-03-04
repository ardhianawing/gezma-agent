import { z } from 'zod';

export const forumCategories = ['review', 'regulasi', 'operasional', 'sharing', 'scam', 'tanya'] as const;

export const createForumThreadSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter').max(200, 'Judul maksimal 200 karakter'),
  content: z.string().min(20, 'Konten minimal 20 karakter'),
  category: z.enum(forumCategories),
  tags: z.array(z.string()).max(5, 'Maksimal 5 tags').default([]),
});

export const updateForumThreadSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(20).optional(),
  category: z.enum(forumCategories).optional(),
  tags: z.array(z.string()).max(5).optional(),
  isSolved: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isHot: z.boolean().optional(),
});

export const createForumReplySchema = z.object({
  content: z.string().min(3, 'Balasan minimal 3 karakter').max(5000, 'Balasan maksimal 5000 karakter'),
});

export type CreateForumThreadData = z.infer<typeof createForumThreadSchema>;
export type UpdateForumThreadData = z.infer<typeof updateForumThreadSchema>;
export type CreateForumReplyData = z.infer<typeof createForumReplySchema>;
