import { z } from 'zod';

export const flightInfoSchema = z.object({
  departureAirline: z.string().min(2),
  departureFlightNo: z.string().min(2),
  departureDate: z.string(),
  departureTime: z.string(),
  departureAirport: z.string().min(3),
  departureTerminal: z.string().optional(),

  returnAirline: z.string().min(2),
  returnFlightNo: z.string().min(2),
  returnDate: z.string(),
  returnTime: z.string(),
  returnAirport: z.string().min(3),
  returnTerminal: z.string().optional(),
});

export const tripFormSchema = z.object({
  name: z.string().min(5, 'Nama trip minimal 5 karakter'),
  packageId: z.string().min(1, 'Pilih paket'),

  departureDate: z.string().refine((date) => {
    return new Date(date) > new Date();
  }, 'Tanggal berangkat harus di masa depan'),

  returnDate: z.string(),
  registrationCloseDate: z.string().optional(),

  capacity: z.number().min(10, 'Kapasitas minimal 10').max(200, 'Kapasitas maksimal 200'),

  flightInfo: flightInfoSchema,

  pricePerPerson: z.number().min(0),

  notes: z.string().optional(),
}).refine((data) => {
  return new Date(data.returnDate) > new Date(data.departureDate);
}, {
  message: 'Tanggal pulang harus setelah tanggal berangkat',
  path: ['returnDate'],
});

export type TripFormData = z.infer<typeof tripFormSchema>;

// For adding pilgrim to manifest
export const addToManifestSchema = z.object({
  pilgrimId: z.string().min(1, 'Pilih jemaah'),
  roomNumber: z.string().optional(),
  seatPreference: z.string().optional(),
  mealPreference: z.string().optional(),
  specialNeeds: z.string().optional(),
});
