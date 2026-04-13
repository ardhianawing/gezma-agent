# Academy Video Upload & Streaming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable admin to upload videos per lesson in Gezma Academy with chunked resumable upload, auto-thumbnail, drag-reorder lessons, bulk upload, student progress tracking, and basic anti-download protection. Mobile-optimized UI. Use frontend-design skill for all UI components.

**Architecture:** Chunked multipart upload to MinIO/S3 via presigned URLs. Videos served as-is (mp4) through authenticated API proxy with short-lived presigned URLs (60s). Thumbnail auto-generated via ffmpeg screenshot. Student progress saved per lesson. All UI mobile-first with responsive design.

**Tech Stack:** Next.js 16, Prisma 7, MinIO (S3-compatible), @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, ffmpeg (thumbnail only), hls.js (mp4 fallback player), Tailwind CSS

**Important notes:**
- CC pages use inline `cc` color object (not theme hook)
- Student pages use `useTheme()` hook with `c` colors + `useResponsive()` for mobile
- Auth: `getCCAuthPayload()` for CC routes, `getAuthPayload()` for student routes
- Use `frontend-design` skill for all UI components
- All UI must be mobile-optimized

---

## File Structure

### New Files (18)
| File | Responsibility |
|------|----------------|
| `src/lib/storage-multipart.ts` | S3 multipart upload + presigned URL helpers |
| `src/lib/services/thumbnail.service.ts` | ffmpeg thumbnail generation |
| `src/app/api/command-center/academy/courses/route.ts` | CC Course list + create |
| `src/app/api/command-center/academy/courses/[id]/route.ts` | CC Course get/update/delete |
| `src/app/api/command-center/academy/courses/[id]/lessons/route.ts` | CC Lesson list + create |
| `src/app/api/command-center/academy/courses/[id]/lessons/[lessonId]/route.ts` | CC Lesson update/delete |
| `src/app/api/command-center/academy/courses/[id]/lessons/reorder/route.ts` | CC Lesson reorder |
| `src/app/api/command-center/academy/video/initiate/route.ts` | Start multipart upload |
| `src/app/api/command-center/academy/video/complete/route.ts` | Complete upload + trigger thumbnail |
| `src/app/api/command-center/academy/video/abort/route.ts` | Abort failed upload |
| `src/app/api/command-center/academy/video/status/[lessonId]/route.ts` | Poll processing status |
| `src/app/api/command-center/academy/video/thumbnail/[lessonId]/route.ts` | Manual thumbnail upload/delete |
| `src/app/api/academy/video/[lessonId]/stream/route.ts` | Video stream (presigned redirect) |
| `src/app/api/academy/video/[lessonId]/progress/route.ts` | Save/load watch progress |
| `src/components/academy/secure-video-player.tsx` | Protected video player + progress tracking |
| `src/components/command-center/academy/video-upload.tsx` | Chunked upload with progress |
| `src/components/command-center/academy/lesson-manager.tsx` | Lesson list + drag reorder + video status |
| `src/app/(command-center)/command-center/academy/courses/[id]/page.tsx` | Course editor page |

### Modified Files (6)
| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add video fields to AcademyLesson + AcademyVideoProgress model |
| `docker-compose.yml` | Add MinIO service |
| `Dockerfile` | Install ffmpeg |
| `next.config.ts` | Add `media-src 'self' blob:` to CSP |
| `src/app/(command-center)/command-center/academy/page.tsx` | Replace mock → real API, add CRUD |
| `src/app/(dashboard)/academy/[id]/page.tsx` | Add SecureVideoPlayer + progress bar |

---

## Task 1: Prisma Schema — Add Video Fields

**Files:**
- Modify: `prisma/schema.prisma:614-628`

- [ ] **Step 1: Add video fields to AcademyLesson model**

In `prisma/schema.prisma`, update the `AcademyLesson` model (around line 614):

```prisma
model AcademyLesson {
  id        String  @id @default(uuid())
  courseId   String
  course     AcademyCourse @relation(fields: [courseId], references: [id], onDelete: Cascade)
  title      String
  content    String  // markdown/text
  videoUrl   String? // legacy YouTube URLs
  order      Int     @default(0)
  duration   String? // e.g. "30 menit"

  // Video upload fields
  videoStorageKey String?  // S3 key for uploaded video
  videoStatus     String   @default("none") // none, uploading, processing, ready, error
  videoError      String?
  videoDuration   Int?     // duration in seconds
  videoSize       BigInt?  // file size in bytes
  thumbnailKey    String?  // S3 key for thumbnail image

  createdAt  DateTime @default(now())

  videoProgress AcademyVideoProgress[]

  @@index([courseId])
  @@map("academy_lessons")
}
```

- [ ] **Step 2: Add AcademyVideoProgress model**

Add after the AcademyLesson model:

```prisma
model AcademyVideoProgress {
  id           String   @id @default(cuid())
  lessonId     String
  lesson       AcademyLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  userId       String
  lastPosition Int      @default(0) // seconds
  completed    Boolean  @default(false)
  updatedAt    DateTime @updatedAt

  @@unique([lessonId, userId])
  @@index([userId])
  @@map("academy_video_progress")
}
```

- [ ] **Step 3: Run prisma generate and db push**

```bash
npx prisma generate
npx prisma db push
```

Expected: Schema synced, no errors.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(academy): add video upload fields and video progress model"
```

---

## Task 2: Infrastructure — MinIO, ffmpeg, CSP, Dependencies

**Files:**
- Modify: `docker-compose.yml`
- Modify: `Dockerfile`
- Modify: `next.config.ts`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Add MinIO service to docker-compose.yml**

Add after the `db` service:

```yaml
  minio:
    image: minio/minio:latest
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${S3_ACCESS_KEY:-minioadmin}
      MINIO_ROOT_PASSWORD: ${S3_SECRET_KEY:-minioadmin}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - traefik-network
```

Add `minio_data` to volumes section. Add S3 env vars to the `app` service environment:

```yaml
      STORAGE_DRIVER: s3
      S3_ENDPOINT: http://minio:9000
      S3_BUCKET: gezma-uploads
      S3_ACCESS_KEY: ${S3_ACCESS_KEY:-minioadmin}
      S3_SECRET_KEY: ${S3_SECRET_KEY:-minioadmin}
      S3_REGION: us-east-1
```

Add `depends_on` for minio in app service:

```yaml
      minio:
        condition: service_healthy
```

- [ ] **Step 2: Install ffmpeg in Dockerfile**

In the runner stage (Stage 3), before `RUN addgroup`, add:

```dockerfile
# Install ffmpeg for thumbnail generation
RUN apk add --no-cache ffmpeg
```

- [ ] **Step 3: Add media-src to CSP in next.config.ts**

In the CSP array, add `media-src 'self' blob:` line:

```typescript
"media-src 'self' blob:",
```

- [ ] **Step 4: Install @aws-sdk/s3-request-presigner**

```bash
npm install @aws-sdk/s3-request-presigner
```

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml Dockerfile next.config.ts package.json package-lock.json
git commit -m "infra: add MinIO service, ffmpeg, CSP media-src, s3-request-presigner"
```

---

## Task 3: Storage Multipart — Presigned URLs & Multipart Upload

**Files:**
- Create: `src/lib/storage-multipart.ts`

- [ ] **Step 1: Create storage-multipart.ts**

```typescript
import {
  S3Client,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadPartCommand } from '@aws-sdk/client-s3';

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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/storage-multipart.ts
git commit -m "feat: add S3 multipart upload and presigned URL utilities"
```

---

## Task 4: Thumbnail Service

**Files:**
- Create: `src/lib/services/thumbnail.service.ts`

- [ ] **Step 1: Create thumbnail.service.ts**

```typescript
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink, mkdtemp, readFile, rmdir } from 'fs/promises';
import path from 'path';
import os from 'os';
import { getPresignedDownloadUrl, deleteS3Object } from '@/lib/storage-multipart';
import { getStorage } from '@/lib/storage';

const execFileAsync = promisify(execFile);

export async function generateThumbnail(
  lessonId: string,
  videoStorageKey: string
): Promise<{ thumbnailKey: string; videoDuration: number }> {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'gezma-thumb-'));
  const videoPath = path.join(tmpDir, 'input.mp4');
  const thumbPath = path.join(tmpDir, 'thumb.jpg');

  try {
    // Download video from S3
    const videoUrl = await getPresignedDownloadUrl(videoStorageKey, 300);
    const response = await fetch(videoUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(videoPath, buffer);

    // Get video duration
    const { stdout: probeOut } = await execFileAsync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      videoPath,
    ]);
    const videoDuration = Math.round(parseFloat(probeOut.trim()));

    // Generate thumbnail at 5 seconds (or 1 second if video is shorter)
    const seekTo = Math.min(5, Math.max(1, videoDuration - 1));
    await execFileAsync('ffmpeg', [
      '-i', videoPath,
      '-ss', String(seekTo),
      '-vframes', '1',
      '-q:v', '2',
      '-vf', 'scale=640:-1',
      thumbPath,
    ]);

    // Upload thumbnail to S3
    const thumbnailKey = `academy/thumbnails/${lessonId}.jpg`;
    const thumbBuffer = await readFile(thumbPath);
    const storage = getStorage();
    await storage.upload(thumbnailKey, thumbBuffer, 'image/jpeg');

    return { thumbnailKey, videoDuration };
  } finally {
    // Cleanup temp files
    try {
      await unlink(videoPath).catch(() => {});
      await unlink(thumbPath).catch(() => {});
      await rmdir(tmpDir).catch(() => {});
    } catch {
      // ignore cleanup errors
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/services/thumbnail.service.ts
git commit -m "feat: add thumbnail generation service using ffmpeg"
```

---

## Task 5: CC Course CRUD API

**Files:**
- Create: `src/app/api/command-center/academy/courses/route.ts`
- Create: `src/app/api/command-center/academy/courses/[id]/route.ts`

- [ ] **Step 1: Create courses list + create route**

```typescript
// src/app/api/command-center/academy/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload, } from '@/lib/auth-command-center';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (status === 'published') where.isPublished = true;
  if (status === 'draft') where.isPublished = false;
  if (search) where.title = { contains: search, mode: 'insensitive' };

  const courses = await prisma.academyCourse.findMany({
    where,
    include: {
      lessons: { select: { id: true, videoStatus: true }, orderBy: { order: 'asc' } },
      _count: { select: { progress: true, reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ courses });
}

export async function POST(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, description, category, level, instructorName, duration } = body;

  if (!title || !description || !category || !level || !instructorName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const course = await prisma.academyCourse.create({
    data: { title, description, category, level, instructorName, duration: duration || '0 jam' },
  });

  return NextResponse.json({ course }, { status: 201 });
}
```

- [ ] **Step 2: Create course detail + update + delete route**

```typescript
// src/app/api/command-center/academy/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import prisma from '@/lib/prisma';
import { deleteS3Object } from '@/lib/storage-multipart';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const course = await prisma.academyCourse.findUnique({
    where: { id },
    include: {
      lessons: { orderBy: { order: 'asc' } },
      _count: { select: { progress: true, reviews: true } },
    },
  });

  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ course });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, description, category, level, instructorName, duration, isPublished } = body;

  const course = await prisma.academyCourse.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(level !== undefined && { level }),
      ...(instructorName !== undefined && { instructorName }),
      ...(duration !== undefined && { duration }),
      ...(isPublished !== undefined && { isPublished }),
    },
  });

  return NextResponse.json({ course });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Delete video files from S3
  const lessons = await prisma.academyLesson.findMany({
    where: { courseId: id },
    select: { videoStorageKey: true, thumbnailKey: true },
  });

  for (const lesson of lessons) {
    if (lesson.videoStorageKey) await deleteS3Object(lesson.videoStorageKey).catch(() => {});
    if (lesson.thumbnailKey) await deleteS3Object(lesson.thumbnailKey).catch(() => {});
  }

  await prisma.academyCourse.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/command-center/academy/courses/
git commit -m "feat(api): add CC course CRUD endpoints"
```

---

## Task 6: CC Lesson CRUD + Reorder API

**Files:**
- Create: `src/app/api/command-center/academy/courses/[id]/lessons/route.ts`
- Create: `src/app/api/command-center/academy/courses/[id]/lessons/[lessonId]/route.ts`
- Create: `src/app/api/command-center/academy/courses/[id]/lessons/reorder/route.ts`

- [ ] **Step 1: Create lesson list + create route**

```typescript
// src/app/api/command-center/academy/courses/[id]/lessons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const lessons = await prisma.academyLesson.findMany({
    where: { courseId: id },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json({ lessons });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, content, duration } = body;

  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  // Get next order number
  const lastLesson = await prisma.academyLesson.findFirst({
    where: { courseId: id },
    orderBy: { order: 'desc' },
    select: { order: true },
  });
  const nextOrder = (lastLesson?.order ?? -1) + 1;

  const lesson = await prisma.academyLesson.create({
    data: {
      courseId: id,
      title,
      content: content || '',
      duration: duration || null,
      order: nextOrder,
    },
  });

  // Update course totalLessons
  const count = await prisma.academyLesson.count({ where: { courseId: id } });
  await prisma.academyCourse.update({ where: { id }, data: { totalLessons: count } });

  return NextResponse.json({ lesson }, { status: 201 });
}
```

- [ ] **Step 2: Create lesson update + delete route**

```typescript
// src/app/api/command-center/academy/courses/[id]/lessons/[lessonId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import prisma from '@/lib/prisma';
import { deleteS3Object } from '@/lib/storage-multipart';

type Params = { params: Promise<{ id: string; lessonId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { lessonId } = await params;
  const body = await req.json();
  const { title, content, duration } = body;

  const lesson = await prisma.academyLesson.update({
    where: { id: lessonId },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(duration !== undefined && { duration }),
    },
  });

  return NextResponse.json({ lesson });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, lessonId } = await params;

  // Delete video + thumbnail from S3
  const lesson = await prisma.academyLesson.findUnique({
    where: { id: lessonId },
    select: { videoStorageKey: true, thumbnailKey: true },
  });

  if (lesson?.videoStorageKey) await deleteS3Object(lesson.videoStorageKey).catch(() => {});
  if (lesson?.thumbnailKey) await deleteS3Object(lesson.thumbnailKey).catch(() => {});

  await prisma.academyLesson.delete({ where: { id: lessonId } });

  // Update course totalLessons
  const count = await prisma.academyLesson.count({ where: { courseId: id } });
  await prisma.academyCourse.update({ where: { id }, data: { totalLessons: count } });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Create lesson reorder route**

```typescript
// src/app/api/command-center/academy/courses/[id]/lessons/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { lessonIds } = body as { lessonIds: string[] };

  if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
    return NextResponse.json({ error: 'lessonIds array required' }, { status: 400 });
  }

  // Update order for each lesson
  await prisma.$transaction(
    lessonIds.map((id, index) =>
      prisma.academyLesson.update({ where: { id }, data: { order: index } })
    )
  );

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/command-center/academy/courses/
git commit -m "feat(api): add CC lesson CRUD and reorder endpoints"
```

---

## Task 7: Video Upload APIs (initiate, complete, abort, status)

**Files:**
- Create: `src/app/api/command-center/academy/video/initiate/route.ts`
- Create: `src/app/api/command-center/academy/video/complete/route.ts`
- Create: `src/app/api/command-center/academy/video/abort/route.ts`
- Create: `src/app/api/command-center/academy/video/status/[lessonId]/route.ts`

- [ ] **Step 1: Create initiate route**

```typescript
// src/app/api/command-center/academy/video/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import prisma from '@/lib/prisma';
import { createMultipartUpload, getPartPresignedUrls, CHUNK_SIZE } from '@/lib/storage-multipart';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export async function POST(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { lessonId, fileName, fileSize, contentType } = body;

  if (!lessonId || !fileName || !fileSize || !contentType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (fileSize > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Max 500MB' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: 'Invalid file type. Allowed: mp4, webm, mov' }, { status: 400 });
  }

  const lesson = await prisma.academyLesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

  const ext = fileName.split('.').pop() || 'mp4';
  const storageKey = `academy/videos/${lessonId}.${ext}`;

  const uploadId = await createMultipartUpload(storageKey, contentType);
  const parts = await getPartPresignedUrls(storageKey, uploadId, fileSize);

  await prisma.academyLesson.update({
    where: { id: lessonId },
    data: { videoStatus: 'uploading', videoStorageKey: storageKey, videoSize: BigInt(fileSize) },
  });

  return NextResponse.json({
    uploadId,
    storageKey,
    parts,
    chunkSize: CHUNK_SIZE,
  });
}
```

- [ ] **Step 2: Create complete route**

```typescript
// src/app/api/command-center/academy/video/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import prisma from '@/lib/prisma';
import { completeMultipartUpload } from '@/lib/storage-multipart';
import { generateThumbnail } from '@/lib/services/thumbnail.service';

export async function POST(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { lessonId, uploadId, parts, storageKey } = body;

  if (!lessonId || !uploadId || !parts || !storageKey) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await completeMultipartUpload(storageKey, uploadId, parts);

  await prisma.academyLesson.update({
    where: { id: lessonId },
    data: { videoStatus: 'processing' },
  });

  // Fire-and-forget thumbnail generation
  generateThumbnail(lessonId, storageKey)
    .then(async ({ thumbnailKey, videoDuration }) => {
      await prisma.academyLesson.update({
        where: { id: lessonId },
        data: { thumbnailKey, videoDuration, videoStatus: 'ready' },
      });
    })
    .catch(async (err) => {
      console.error('Thumbnail generation failed:', err);
      // Video is still usable without thumbnail
      await prisma.academyLesson.update({
        where: { id: lessonId },
        data: { videoStatus: 'ready', videoError: 'Thumbnail generation failed' },
      });
    });

  return NextResponse.json({ success: true, status: 'processing' });
}
```

- [ ] **Step 3: Create abort route**

```typescript
// src/app/api/command-center/academy/video/abort/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import prisma from '@/lib/prisma';
import { abortMultipartUpload } from '@/lib/storage-multipart';

export async function POST(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { lessonId, uploadId, storageKey } = body;

  if (!lessonId || !uploadId || !storageKey) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await abortMultipartUpload(storageKey, uploadId).catch(() => {});

  await prisma.academyLesson.update({
    where: { id: lessonId },
    data: { videoStatus: 'none', videoStorageKey: null, videoSize: null },
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Create status polling route**

```typescript
// src/app/api/command-center/academy/video/status/[lessonId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { lessonId } = await params;
  const lesson = await prisma.academyLesson.findUnique({
    where: { id: lessonId },
    select: { videoStatus: true, videoError: true, videoDuration: true, thumbnailKey: true, videoSize: true },
  });

  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(lesson);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/command-center/academy/video/
git commit -m "feat(api): add video upload initiate, complete, abort, status endpoints"
```

---

## Task 8: Thumbnail Upload + Video Stream + Progress APIs

**Files:**
- Create: `src/app/api/command-center/academy/video/thumbnail/[lessonId]/route.ts`
- Create: `src/app/api/academy/video/[lessonId]/stream/route.ts`
- Create: `src/app/api/academy/video/[lessonId]/progress/route.ts`

- [ ] **Step 1: Create manual thumbnail upload route**

```typescript
// src/app/api/command-center/academy/video/thumbnail/[lessonId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import prisma from '@/lib/prisma';
import { getStorage } from '@/lib/storage';
import { deleteS3Object } from '@/lib/storage-multipart';

const MAX_THUMB_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { lessonId } = await params;
  const formData = await req.formData();
  const file = formData.get('thumbnail') as File | null;

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (file.size > MAX_THUMB_SIZE) return NextResponse.json({ error: 'Max 5MB' }, { status: 400 });
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Must be image' }, { status: 400 });

  const ext = file.name.split('.').pop() || 'jpg';
  const thumbnailKey = `academy/thumbnails/${lessonId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const storage = getStorage();
  await storage.upload(thumbnailKey, buffer, file.type);

  await prisma.academyLesson.update({
    where: { id: lessonId },
    data: { thumbnailKey },
  });

  return NextResponse.json({ thumbnailKey });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { lessonId } = await params;
  const lesson = await prisma.academyLesson.findUnique({
    where: { id: lessonId },
    select: { thumbnailKey: true },
  });

  if (lesson?.thumbnailKey) {
    await deleteS3Object(lesson.thumbnailKey).catch(() => {});
    await prisma.academyLesson.update({
      where: { id: lessonId },
      data: { thumbnailKey: null },
    });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create video stream route (student-facing)**

```typescript
// src/app/api/academy/video/[lessonId]/stream/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { getPresignedDownloadUrl } from '@/lib/storage-multipart';
import { rateLimit } from '@/lib/rate-limiter';

export async function GET(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const rl = rateLimit(req, { limit: 30, window: 60 });
  if (!rl.allowed) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });

  // Check referrer
  const referer = req.headers.get('referer') || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  if (referer && !referer.startsWith(appUrl)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { lessonId } = await params;
  const lesson = await prisma.academyLesson.findUnique({
    where: { id: lessonId },
    select: { videoStorageKey: true, videoStatus: true },
  });

  if (!lesson || !lesson.videoStorageKey || lesson.videoStatus !== 'ready') {
    return NextResponse.json({ error: 'Video not available' }, { status: 404 });
  }

  const url = await getPresignedDownloadUrl(lesson.videoStorageKey, 60);
  return NextResponse.redirect(url, 302);
}
```

- [ ] **Step 3: Create video progress route**

```typescript
// src/app/api/academy/video/[lessonId]/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { lessonId } = await params;
  const progress = await prisma.academyVideoProgress.findUnique({
    where: { lessonId_userId: { lessonId, userId: auth.userId } },
  });

  return NextResponse.json({ lastPosition: progress?.lastPosition ?? 0, completed: progress?.completed ?? false });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { lessonId } = await params;
  const body = await req.json();
  const { lastPosition, completed } = body;

  const progress = await prisma.academyVideoProgress.upsert({
    where: { lessonId_userId: { lessonId, userId: auth.userId } },
    create: { lessonId, userId: auth.userId, lastPosition: lastPosition ?? 0, completed: completed ?? false },
    update: { lastPosition: lastPosition ?? undefined, completed: completed ?? undefined },
  });

  return NextResponse.json(progress);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/command-center/academy/video/thumbnail/ src/app/api/academy/video/
git commit -m "feat(api): add thumbnail upload, video stream, and progress endpoints"
```

---

## Task 9: SecureVideoPlayer Component (Frontend)

**Files:**
- Create: `src/components/academy/secure-video-player.tsx`

**Use frontend-design skill for this component. Mobile-first responsive design.**

- [ ] **Step 1: Create SecureVideoPlayer**

Build using frontend-design skill. Requirements:
- Props: `lessonId: string`
- Fetches video stream URL from `/api/academy/video/{lessonId}/stream`
- Loads last position from `/api/academy/video/{lessonId}/progress` on mount
- Auto-saves progress every 10 seconds via PUT to progress endpoint
- `<video>` with `controlsList="nodownload"` and `disablePictureInPicture`
- Disable right-click on video wrapper
- Loading skeleton while video loads
- Error state with retry button
- Responsive: full-width, 16:9 aspect ratio
- Mobile: touch-friendly controls, no PiP

- [ ] **Step 2: Commit**

```bash
git add src/components/academy/secure-video-player.tsx
git commit -m "feat(ui): add SecureVideoPlayer component with progress tracking"
```

---

## Task 10: Video Upload Component (CC Frontend)

**Files:**
- Create: `src/components/command-center/academy/video-upload.tsx`

**Use frontend-design skill. Mobile-optimized.**

- [ ] **Step 1: Create VideoUpload component**

Build using frontend-design skill. Requirements:
- Props: `lessonId: string, onComplete: () => void, currentStatus: string`
- Drag & drop zone + file input button
- Validates: mp4/webm/mov, max 500MB
- Flow: initiate → chunk upload (10MB, 3 parallel) → complete → poll status
- Progress bar with percentage and upload speed
- Resume capability: store uploaded chunks in sessionStorage keyed by `upload-${lessonId}`
- Retry failed chunks 3x before showing error
- Abort button during upload
- Status display: uploading (blue), processing (yellow spinner), ready (green check), error (red)
- Uses CC color scheme (`cc` object pattern)
- Mobile: full-width drop zone, touch-friendly buttons

- [ ] **Step 2: Commit**

```bash
git add src/components/command-center/academy/video-upload.tsx
git commit -m "feat(ui): add chunked video upload component with resume support"
```

---

## Task 11: Lesson Manager Component (CC Frontend)

**Files:**
- Create: `src/components/command-center/academy/lesson-manager.tsx`

**Use frontend-design skill. Mobile-optimized.**

- [ ] **Step 1: Create LessonManager component**

Build using frontend-design skill. Requirements:
- Props: `courseId: string, lessons: Lesson[], onUpdate: () => void`
- List of lessons with drag-to-reorder (HTML5 DnD, existing pattern from Kanban)
- Per lesson row shows: order number, title, duration, video status badge, thumbnail preview
- "Add Lesson" form (title, content textarea, duration)
- Edit lesson inline (click to edit title/content)
- Delete lesson with confirm dialog
- VideoUpload component integrated per lesson
- Manual thumbnail upload option
- Preview button (opens modal with SecureVideoPlayer)
- Uses CC color scheme
- Mobile: stack layout, simplified drag (up/down buttons instead), touch-friendly

- [ ] **Step 2: Commit**

```bash
git add src/components/command-center/academy/lesson-manager.tsx
git commit -m "feat(ui): add lesson manager with drag reorder and video upload"
```

---

## Task 12: Course Editor Page (CC Frontend)

**Files:**
- Create: `src/app/(command-center)/command-center/academy/courses/[id]/page.tsx`

**Use frontend-design skill. Mobile-optimized.**

- [ ] **Step 1: Create Course Editor page**

Build using frontend-design skill. Requirements:
- Fetch course from `/api/command-center/academy/courses/{id}`
- Form: title, description (textarea), category (select: operasional/manasik/bisnis/tutorial), level (select: pemula/menengah/lanjutan), instructorName, duration
- Published toggle switch
- Save button with loading state
- Below form: LessonManager component
- Back button to CC academy list
- Uses CC color scheme
- Mobile: single-column form, full-width inputs

- [ ] **Step 2: Commit**

```bash
git add src/app/(command-center)/command-center/academy/courses/
git commit -m "feat(ui): add CC course editor page with lesson management"
```

---

## Task 13: Update CC Academy List Page — Mock to Real API

**Files:**
- Modify: `src/app/(command-center)/command-center/academy/page.tsx`

- [ ] **Step 1: Replace mock data with real API**

Key changes:
- Remove `MOCK_COURSES` array
- Add `useEffect` to fetch from `/api/command-center/academy/courses`
- Stats bar: calculate from real data (total courses, total enrollments from `_count.progress`, etc.)
- "Create Course" button → navigate to `/command-center/academy/courses/new`
- "Edit" button → navigate to `/command-center/academy/courses/{id}`
- "Delete" → call DELETE API with confirm dialog
- "Publish/Unpublish" → call PUT API to toggle `isPublished`
- Add video status column showing count of ready/processing/none videos per course
- Add loading skeleton
- Mobile: responsive table → card layout on mobile

- [ ] **Step 2: Create Course Create page (simple redirect/inline)**

Create `src/app/(command-center)/command-center/academy/courses/new/page.tsx`:
- Same form as editor but empty state
- POST to create course
- Redirect to course editor after creation

- [ ] **Step 3: Commit**

```bash
git add src/app/(command-center)/command-center/academy/
git commit -m "feat(ui): replace CC academy mock data with real API, add create page"
```

---

## Task 14: Update Student Course Detail — Add Video Player

**Files:**
- Modify: `src/app/(dashboard)/academy/[id]/page.tsx`

- [ ] **Step 1: Add SecureVideoPlayer to lesson view**

In the lesson accordion content area:
- If `lesson.videoStatus === 'ready'` → render `<SecureVideoPlayer lessonId={lesson.id} />`
- If `lesson.videoUrl` (legacy YouTube) → keep existing iframe
- Else → show "Tidak ada video" placeholder
- Add video progress indicator per lesson (small bar under lesson title)
- Update `Lesson` interface: add `videoStatus?: string`, `thumbnailKey?: string`

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/academy/[id]/page.tsx
git commit -m "feat(ui): add video player to student course detail page"
```

---

## Task 15: Final Verification & Integration Test

- [ ] **Step 1: Run prisma generate + db push**

```bash
npx prisma generate && npx prisma db push
```

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Manual test flow**

1. Start MinIO: `docker-compose up minio -d`
2. Create bucket: access MinIO console at `:9001`, create `gezma-uploads` bucket
3. Start app: `npm run dev`
4. Go to CC Academy → Create Course → Add Lessons → Upload Video per lesson
5. Verify upload progress, thumbnail auto-generated
6. Go to Student Academy → Open course → Play video
7. Verify video plays, progress saves, no download button
8. Test on mobile viewport (375px)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(academy): complete video upload and streaming system"
```
