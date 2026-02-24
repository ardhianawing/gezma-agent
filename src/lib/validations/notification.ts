import { z } from 'zod';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_CHANNELS } from '@/lib/services/notification-prefs.service';

const channelSchema = z.object(
  Object.fromEntries(NOTIFICATION_CHANNELS.map((ch) => [ch.key, z.boolean()]))
) as z.ZodObject<Record<string, z.ZodBoolean>>;

export const notificationPreferencesSchema = z.object(
  Object.fromEntries(NOTIFICATION_CATEGORIES.map((cat) => [cat.key, channelSchema]))
);

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;

export const createNotificationSchema = z.object({
  title: z.string().min(1, 'Judul notifikasi wajib diisi'),
  body: z.string().min(1, 'Isi notifikasi wajib diisi'),
  type: z.enum(['info', 'warning', 'success', 'error'], { message: 'Tipe notifikasi tidak valid' }),
  userId: z.string().min(1, 'User ID wajib diisi'),
});

export type CreateNotificationData = z.infer<typeof createNotificationSchema>;
