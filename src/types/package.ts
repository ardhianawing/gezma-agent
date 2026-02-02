import { PackageCategory } from './index';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface ItineraryActivity {
  id: string;
  time: string; // e.g., "08:00"
  title: string;
  description?: string;
  location?: string;
}

export interface ItineraryDay {
  day: number;
  date?: string; // Optional, calculated from trip departure
  title: string; // e.g., "Kedatangan di Madinah"
  description?: string;
  activities: ItineraryActivity[];
  meals: MealType[];
  hotel?: string;
  city: string; // "Madinah", "Makkah", "Jeddah"
}

export interface PricingBreakdown {
  airline: number;
  hotel: number;
  visa: number;
  transport: number;
  meals: number;
  guide: number;
  insurance: number;
  handling: number;
  others: number;
}

export interface Package {
  id: string;

  // Basic Info
  name: string;
  slug: string;
  category: PackageCategory;
  description: string;
  duration: number; // days

  // Itinerary
  itinerary: ItineraryDay[];

  // Pricing
  hpp: PricingBreakdown; // Harga Pokok Penjualan
  totalHpp: number;
  margin: number; // percentage
  marginAmount: number;
  publishedPrice: number;

  // Inclusions
  inclusions: string[];
  exclusions: string[];

  // Hotels
  makkahHotel: string;
  makkahHotelRating: number; // 3, 4, 5
  makkahHotelDistance: string; // e.g., "300m dari Masjidil Haram"
  madinahHotel: string;
  madinahHotelRating: number;
  madinahHotelDistance: string;

  // Airline
  airline: string;

  // Status
  isActive: boolean;
  isPromo: boolean;
  promoPrice?: number;
  promoEndDate?: string;

  // Media
  thumbnailUrl?: string;
  galleryUrls?: string[];
  brochureUrl?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}
