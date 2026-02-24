import { z } from 'zod';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_CHANNELS } from '@/lib/services/notification-prefs.service';

const channelSchema = z.object(
  Object.fromEntries(NOTIFICATION_CHANNELS.map((ch) => [ch.key, z.boolean()]))
) as z.ZodObject<Record<string, z.ZodBoolean>>;

export const notificationPreferencesSchema = z.object(
  Object.fromEntries(NOTIFICATION_CATEGORIES.map((cat) => [cat.key, channelSchema]))
);

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
