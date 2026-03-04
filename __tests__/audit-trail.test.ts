import { describe, it, expect } from 'vitest';
import { diffChanges } from '@/lib/audit-trail';

describe('Audit Trail - diffChanges', () => {
  it('detects changed fields', () => {
    const oldData = { name: 'Ahmad', phone: '08123', email: 'a@b.com' };
    const newData = { name: 'Ahmad Fauzi', phone: '08123', email: 'af@b.com' };

    const changes = diffChanges(oldData, newData);

    expect(changes).toEqual([
      { field: 'name', oldValue: 'Ahmad', newValue: 'Ahmad Fauzi' },
      { field: 'email', oldValue: 'a@b.com', newValue: 'af@b.com' },
    ]);
  });

  it('returns empty array when no changes', () => {
    const data = { name: 'Test', value: 42 };
    const changes = diffChanges(data, data);
    expect(changes).toEqual([]);
  });

  it('masks sensitive fields', () => {
    const oldData = { password: 'old', hashedPassword: 'abc', name: 'Test' };
    const newData = { password: 'new', hashedPassword: 'def', name: 'Test2' };

    const changes = diffChanges(oldData, newData);

    const passwordChange = changes.find(c => c.field === 'password');
    expect(passwordChange?.oldValue).toBe('***');
    expect(passwordChange?.newValue).toBe('***');

    const nameChange = changes.find(c => c.field === 'name');
    expect(nameChange?.oldValue).toBe('Test');
    expect(nameChange?.newValue).toBe('Test2');
  });

  it('only tracks specified fields', () => {
    const oldData = { name: 'A', email: 'a@b', phone: '123' };
    const newData = { name: 'B', email: 'c@d', phone: '456' };

    const changes = diffChanges(oldData, newData, ['name', 'email']);

    expect(changes.length).toBe(2);
    expect(changes.find(c => c.field === 'phone')).toBeUndefined();
  });

  it('handles null/undefined values', () => {
    const oldData = { notes: null, name: 'Test' };
    const newData = { notes: 'Some note', name: 'Test' };

    const changes = diffChanges(oldData, newData);

    expect(changes).toEqual([
      { field: 'notes', oldValue: null, newValue: 'Some note' },
    ]);
  });

  it('detects changes in nested objects', () => {
    const oldData = { config: { a: 1, b: 2 } };
    const newData = { config: { a: 1, b: 3 } };

    const changes = diffChanges(oldData, newData);
    expect(changes.length).toBe(1);
    expect(changes[0].field).toBe('config');
  });

  it('masks NIK field', () => {
    const oldData = { nik: '1234567890123456' };
    const newData = { nik: '6543210987654321' };

    const changes = diffChanges(oldData, newData);
    expect(changes[0].oldValue).toBe('***');
    expect(changes[0].newValue).toBe('***');
  });
});
