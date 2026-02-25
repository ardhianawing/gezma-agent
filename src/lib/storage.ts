import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface StorageDriver {
  upload(key: string, buffer: Buffer, contentType: string): Promise<string>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

class LocalStorage implements StorageDriver {
  async upload(key: string, buffer: Buffer, _contentType: string): Promise<string> {
    const filePath = path.join(process.cwd(), 'public', 'uploads', key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);
    return `/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(process.cwd(), 'public', 'uploads', key);
    try {
      await unlink(filePath);
    } catch {
      // File may not exist
    }
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }
}

class S3Storage implements StorageDriver {
  private client: S3Client;
  private bucket: string;
  private endpoint?: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET!;
    this.endpoint = process.env.S3_ENDPOINT;
    this.client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: this.endpoint,
      forcePathStyle: true, // MinIO compatible
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
    });
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));
    return this.getUrl(key);
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }

  getUrl(key: string): string {
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }
}

let storageInstance: StorageDriver | null = null;

export function getStorage(): StorageDriver {
  if (!storageInstance) {
    const driver = process.env.STORAGE_DRIVER || 'local';
    storageInstance = driver === 's3' ? new S3Storage() : new LocalStorage();
  }
  return storageInstance;
}
