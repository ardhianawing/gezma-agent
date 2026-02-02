import { z } from 'zod';

export const itineraryActivitySchema = z.object({
  id: z.string(),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu HH:MM'),
  title: z.string().min(3),
  description: z.string().optional(),
  location: z.string().optional(),
});

export const itineraryDaySchema = z.object({
  day: z.number().min(1),
  title: z.string().min(3, 'Judul hari harus diisi'),
  description: z.string().optional(),
  activities: z.array(itineraryActivitySchema).min(1, 'Minimal 1 aktivitas'),
  meals: z.array(z.enum(['breakfast', 'lunch', 'dinner'])),
  hotel: z.string().optional(),
  city: z.string().min(2),
});

export const pricingBreakdownSchema = z.object({
  airline: z.number().min(0),
  hotel: z.number().min(0),
  visa: z.number().min(0),
  transport: z.number().min(0),
  meals: z.number().min(0),
  guide: z.number().min(0),
  insurance: z.number().min(0),
  handling: z.number().min(0),
  others: z.number().min(0),
});

export const packageFormSchema = z.object({
  name: z.string().min(5, 'Nama paket minimal 5 karakter'),
  category: z.enum(['regular', 'plus', 'vip', 'ramadhan', 'budget']),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter'),
  duration: z.number().min(7, 'Durasi minimal 7 hari').max(30, 'Durasi maksimal 30 hari'),

  // Itinerary
  itinerary: z.array(itineraryDaySchema).min(1, 'Minimal 1 hari itinerary'),

  // Pricing
  hpp: pricingBreakdownSchema,
  margin: z.number().min(0).max(100, 'Margin maksimal 100%'),

  // Hotels
  makkahHotel: z.string().min(3),
  makkahHotelRating: z.number().min(3).max(5),
  makkahHotelDistance: z.string(),
  madinahHotel: z.string().min(3),
  madinahHotelRating: z.number().min(3).max(5),
  madinahHotelDistance: z.string(),

  // Airline
  airline: z.string().min(2),

  // Inclusions
  inclusions: z.array(z.string()).min(1, 'Minimal 1 fasilitas termasuk'),
  exclusions: z.array(z.string()),

  // Status
  isActive: z.boolean(),
});

export type PackageFormData = z.infer<typeof packageFormSchema>;
