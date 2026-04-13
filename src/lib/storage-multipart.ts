import {
  S3Client,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB

function getS3Client() {
  return new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
  });
}

function getBucket() {
  return process.env.S3_BUCKET!;
}

export async function createMultipartUpload(key: string, contentType: string): Promise<string> {
  const client = getS3Client();
  const { UploadId } = await client.send(
    new CreateMultipartUploadCommand({
      Bucket: getBucket(),
      Key: key,
      ContentType: contentType,
    })
  );
  if (!UploadId) throw new Error('Failed to create multipart upload');
  return UploadId;
}

export async function getPartPresignedUrls(
  key: string,
  uploadId: string,
  fileSize: number,
  expiresIn = 3600
): Promise<{ partNumber: number; url: string }[]> {
  const client = getS3Client();
  const totalParts = Math.ceil(fileSize / CHUNK_SIZE);
  const urls: { partNumber: number; url: string }[] = [];

  for (let i = 1; i <= totalParts; i++) {
    const url = await getSignedUrl(
      client,
      new UploadPartCommand({
        Bucket: getBucket(),
        Key: key,
        UploadId: uploadId,
        PartNumber: i,
      }),
      { expiresIn }
    );
    urls.push({ partNumber: i, url });
  }

  return urls;
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: { partNumber: number; etag: string }[]
): Promise<void> {
  const client = getS3Client();
  await client.send(
    new CompleteMultipartUploadCommand({
      Bucket: getBucket(),
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
          .sort((a, b) => a.partNumber - b.partNumber)
          .map((p) => ({ PartNumber: p.partNumber, ETag: p.etag })),
      },
    })
  );
}

export async function abortMultipartUpload(key: string, uploadId: string): Promise<void> {
  const client = getS3Client();
  await client.send(
    new AbortMultipartUploadCommand({
      Bucket: getBucket(),
      Key: key,
      UploadId: uploadId,
    })
  );
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 60): Promise<string> {
  const client = getS3Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
    { expiresIn }
  );
}

export async function deleteS3Object(key: string): Promise<void> {
  const client = getS3Client();
  await client.send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}

export async function deleteS3Prefix(prefix: string): Promise<void> {
  const client = getS3Client();
  const { Contents } = await client.send(
    new ListObjectsV2Command({ Bucket: getBucket(), Prefix: prefix })
  );
  if (Contents) {
    for (const obj of Contents) {
      if (obj.Key) await deleteS3Object(obj.Key);
    }
  }
}

export { CHUNK_SIZE };
