import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(200),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
  assigneeName: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();
