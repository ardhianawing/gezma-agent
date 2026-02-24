import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating minimal 1').max(5, 'Rating maksimal 5'),
  comment: z.string().max(1000).optional(),
});

export type CreateReviewData = z.infer<typeof createReviewSchema>;
