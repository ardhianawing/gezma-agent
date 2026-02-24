import { z } from 'zod';

export const emailTemplateSchema = z.object({
  event: z.enum(['welcome', 'payment_reminder', 'departure_reminder']),
  subject: z.string().min(3, 'Subject minimal 3 karakter'),
  bodyHtml: z.string().min(10, 'Body HTML minimal 10 karakter'),
  isActive: z.boolean().default(true),
});
