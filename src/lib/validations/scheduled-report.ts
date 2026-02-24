import { z } from 'zod';

export const createScheduledReportSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly'], { message: 'Frekuensi tidak valid' }),
  reportType: z.enum(['financial', 'pilgrim', 'trip'], { message: 'Tipe laporan tidak valid' }),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  emailTo: z.string().email('Email tujuan tidak valid'),
});

export const updateScheduledReportSchema = createScheduledReportSchema.partial();

export type CreateScheduledReportData = z.infer<typeof createScheduledReportSchema>;
