import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().min(1, 'Catatan tidak boleh kosong').max(2000, 'Catatan maksimal 2000 karakter'),
});

export type CreateNoteData = z.infer<typeof createNoteSchema>;
