import { z } from 'zod';

export const marketplaceCategories = ['hotel', 'visa', 'transport', 'asuransi', 'mutawwif', 'tiket'] as const;

export const createMarketplaceItemSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  vendor: z.string().min(2, 'Vendor minimal 2 karakter'),
  category: z.enum(marketplaceCategories),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  emoji: z.string().default('📦'),
  badge: z.enum(['Best Seller', 'Premium', 'Popular', 'New']).optional(),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
  details: z.record(z.string(), z.string()).default({}),
  price: z.string().min(1, 'Harga harus diisi'),
  priceAmount: z.number().min(0).default(0),
  priceUnit: z.string().min(1, 'Satuan harga harus diisi'),
  city: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateMarketplaceItemSchema = createMarketplaceItemSchema.partial();

export const createMarketplaceReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating minimal 1').max(5, 'Rating maksimal 5'),
  comment: z.string().min(5, 'Komentar minimal 5 karakter').max(500, 'Komentar maksimal 500 karakter'),
});

export type CreateMarketplaceItemData = z.infer<typeof createMarketplaceItemSchema>;
export type UpdateMarketplaceItemData = z.infer<typeof updateMarketplaceItemSchema>;
export type CreateMarketplaceReviewData = z.infer<typeof createMarketplaceReviewSchema>;
