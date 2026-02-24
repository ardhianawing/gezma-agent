import { describe, it, expect } from 'vitest';
import { createTaskSchema, updateTaskSchema } from '@/lib/validations/task';

describe('createTaskSchema', () => {
  it('validates correct task data', () => {
    const result = createTaskSchema.safeParse({
      title: 'Follow up dengan jamaah',
      description: 'Hubungi jamaah untuk konfirmasi keberangkatan',
      status: 'todo',
      priority: 'high',
      dueDate: '2026-03-01',
      assignedTo: 'user-1',
      assigneeName: 'Ahmad',
    });
    expect(result.success).toBe(true);
  });

  it('validates minimal task (title only)', () => {
    const result = createTaskSchema.safeParse({
      title: 'Task sederhana',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createTaskSchema.safeParse({
      title: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects title under 3 chars', () => {
    const result = createTaskSchema.safeParse({
      title: 'ab',
    });
    expect(result.success).toBe(false);
  });

  it('rejects title over 200 chars', () => {
    const result = createTaskSchema.safeParse({
      title: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = createTaskSchema.safeParse({
      title: 'Valid title',
      status: 'invalid_status',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority', () => {
    const result = createTaskSchema.safeParse({
      title: 'Valid title',
      priority: 'urgent',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid statuses', () => {
    for (const status of ['todo', 'in_progress', 'done']) {
      const result = createTaskSchema.safeParse({ title: 'Test task', status });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid priorities', () => {
    for (const priority of ['low', 'medium', 'high']) {
      const result = createTaskSchema.safeParse({ title: 'Test task', priority });
      expect(result.success).toBe(true);
    }
  });
});

describe('updateTaskSchema', () => {
  it('allows partial updates', () => {
    const result = updateTaskSchema.safeParse({
      status: 'done',
    });
    expect(result.success).toBe(true);
  });

  it('allows empty object', () => {
    const result = updateTaskSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('validates fields when provided', () => {
    const result = updateTaskSchema.safeParse({
      title: 'ab', // too short
    });
    expect(result.success).toBe(false);
  });
});
