import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(),
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));

describe('storage', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('STORAGE_DRIVER', 'local');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('LocalStorage.upload writes file and returns URL', async () => {
    const { getStorage } = await import('@/lib/storage');
    const storage = getStorage();

    const url = await storage.upload('test/file.jpg', Buffer.from('data'), 'image/jpeg');

    expect(mkdir).toHaveBeenCalledWith(
      expect.stringContaining(path.join('public', 'uploads', 'test')),
      { recursive: true }
    );
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('public', 'uploads', 'test', 'file.jpg')),
      Buffer.from('data')
    );
    expect(url).toBe('/uploads/test/file.jpg');
  });

  it('LocalStorage.getUrl returns correct path', async () => {
    const { getStorage } = await import('@/lib/storage');
    const storage = getStorage();

    expect(storage.getUrl('documents/123/passport.pdf')).toBe('/uploads/documents/123/passport.pdf');
  });

  it('LocalStorage.delete removes file', async () => {
    vi.resetModules();
    const { getStorage } = await import('@/lib/storage');
    const storage = getStorage();

    await storage.delete('test/file.jpg');

    expect(unlink).toHaveBeenCalledWith(
      expect.stringContaining(path.join('public', 'uploads', 'test', 'file.jpg'))
    );
  });
});
