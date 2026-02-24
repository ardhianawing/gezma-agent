import { z } from 'zod';

const channelSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  whatsapp: z.boolean(),
});

export const notificationPreferencesSchema = z.object({
  payment: channelSchema,
  document: channelSchema,
  trip: channelSchema,
  pilgrim: channelSchema,
  system: channelSchema,
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
