# Gezma Academy — Video Upload & Streaming (Basic Protection)

## Context

Gezma Academy LMS butuh fitur upload video per lesson/kurikulum. Admin upload video drag & drop, student nonton dengan player yang protected. Storage pakai MinIO (self-hosted S3). Video per part/lesson jadi max 500MB.

---

## Design Decisions

- **Basic protection dulu** — no HLS/AES-128 encryption, video di-serve as-is via presigned URL
- **DRM bisa ditambah nanti** tanpa ubah UX
- **ffmpeg cuma buat thumbnail** — screenshot detik ke-5, bukan HLS conversion
- **Max 500MB per video** — karena video per lesson/part, bukan full course

---

## UX Features

| Feature | Deskripsi |
|---------|-----------|
| **Drag & drop upload** | Admin drag video ke lesson, progress bar, max 500MB |
| **Resume upload** | Internet putus? Lanjut dari chunk terakhir |
| **Bulk upload** | Drag banyak video sekaligus, auto-map ke lessons by nama file |
| **Thumbnail auto-generate** | Screenshot detik ke-5 via ffmpeg, atau upload manual |
| **Drag & drop reorder** | Admin geser urutan lesson di kurikulum |
| **Video preview** | Admin preview video sebelum publish ke student |
| **Progress tracking** | Student buka lagi, lanjut dari posisi terakhir |

---

## Anti-Download (Basic Protection)

| Layer | Fungsi |
|-------|--------|
| **No direct video URL** | Semua akses lewat API proxy |
| **Presigned URLs (60s expiry)** | URL cepat expired |
| **Custom player** | `controlsList="nodownload"`, no right-click, no PiP |
| **Referrer/Origin check** | Block request dari luar domain |
| **Rate limiting** | Prevent automated scraping |

> Untuk upgrade ke full DRM nanti: tambah HLS + AES-128 encryption layer di atas system ini.

---

## Phase 1: Infrastructure & Schema

### 1.1 — Install Dependencies
```
npm install hls.js @aws-sdk/s3-request-presigner
```
- `hls.js` — client-side video player (supports mp4 fallback)
- `@aws-sdk/s3-request-presigner` — S3 presigned URL generation

### 1.2 — Add MinIO to Docker Compose
**File:** `docker-compose.yml`
- Add MinIO service (port 9000 API, 9001 console)
- Add `minio_data` volume
- Env vars: `S3_ENDPOINT`, `S3_BUCKET=gezma-uploads`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION=us-east-1`

### 1.3 — Install ffmpeg di Dockerfile
**File:** `Dockerfile`
- Add `RUN apt-get install -y ffmpeg` (cuma buat thumbnail generation)

### 1.4 — Extend Prisma Schema
**File:** `prisma/schema.prisma`

Update `AcademyLesson` — tambah fields:
- `videoStorageKey String?` — S3 key for video file
- `videoStatus String @default("none")` — none/uploading/processing/ready/error
- `videoError String?`
- `videoDuration Int?` — durasi dalam detik
- `videoSize BigInt?` — ukuran dalam bytes
- `thumbnailKey String?` — S3 key for thumbnail image

New model `AcademyVideoProgress`:
- `id String @id @default(cuid())`
- `lessonId String`
- `userId String` — bisa visitorId atau real userId
- `lastPosition Int` — posisi terakhir dalam detik
- `completed Boolean @default(false)`
- `updatedAt DateTime @updatedAt`
- `@@unique([lessonId, userId])`

### 1.5 — Extend Storage with Signed URLs & Multipart
**File:** `src/lib/storage.ts`

Add to `StorageDriver` interface:
- `getSignedUrl(key, expiresInSeconds): Promise<string>`
- `createMultipartUpload(key, contentType): Promise<string>` — returns uploadId
- `getPartSignedUrl(key, uploadId, partNumber, expiresIn): Promise<string>`
- `completeMultipartUpload(key, uploadId, parts): Promise<void>`
- `abortMultipartUpload(key, uploadId): Promise<void>`

---

## Phase 2: Video Upload APIs (Command Center)

### 2.1 — Course CRUD API
**New:** `src/app/api/command-center/academy/courses/route.ts`
- `GET` — list courses from Prisma
- `POST` — create course

**New:** `src/app/api/command-center/academy/courses/[id]/route.ts`
- `GET` — single course + lessons
- `PUT` — update course
- `DELETE` — delete course + cascade delete video files dari S3

### 2.2 — Lesson CRUD API
**New:** `src/app/api/command-center/academy/courses/[id]/lessons/route.ts`
- `GET` — list lessons for course
- `POST` — create lesson

**New:** `src/app/api/command-center/academy/courses/[id]/lessons/[lessonId]/route.ts`
- `PUT` — update lesson metadata + drag reorder (update `order` field)
- `DELETE` — delete lesson + S3 video cleanup

### 2.3 — Chunked Video Upload API (Resumable)
**New:** `src/app/api/command-center/academy/video/initiate/route.ts`
- `POST { lessonId, fileName, fileSize, contentType }`
- Creates S3 multipart upload → returns `uploadId` + presigned URLs per chunk (10MB chunks)
- Saves upload state for resume capability
- Update lesson `videoStatus = 'uploading'`

**New:** `src/app/api/command-center/academy/video/complete/route.ts`
- `POST { lessonId, uploadId, parts }`
- Completes S3 multipart upload
- Triggers thumbnail generation (fire-and-forget)
- Update lesson `videoStorageKey`, `videoSize`, `videoStatus = 'processing'`

**New:** `src/app/api/command-center/academy/video/abort/route.ts`
- `POST { lessonId, uploadId }` — abort failed upload

**New:** `src/app/api/command-center/academy/video/status/[lessonId]/route.ts`
- `GET` — poll processing status

### 2.4 — Bulk Upload API
**New:** `src/app/api/command-center/academy/video/bulk-initiate/route.ts`
- `POST { courseId, files: [{fileName, fileSize, contentType}] }`
- Auto-map files ke lessons by nama file (e.g., "Part 1 - Intro.mp4" → lesson order 1)
- Creates missing lessons kalau belum ada
- Returns array of uploadIds + presigned URLs

### 2.5 — Thumbnail Service
**New:** `src/lib/services/thumbnail.service.ts`

Function `generateThumbnail(lessonId)`:
1. Download video dari S3 ke temp
2. ffmpeg screenshot detik ke-5: `ffmpeg -i input.mp4 -ss 5 -vframes 1 -q:v 2 thumb.jpg`
3. Upload thumbnail ke S3 `academy/thumbnails/{lessonId}.jpg`
4. Update lesson: `thumbnailKey`, `videoStatus = 'ready'`, `videoDuration`
5. Cleanup temp files

### 2.6 — Manual Thumbnail Upload
**New:** `src/app/api/command-center/academy/video/thumbnail/[lessonId]/route.ts`
- `POST` — upload custom thumbnail (max 5MB, jpg/png/webp)
- `DELETE` — remove custom thumbnail, re-generate from video

---

## Phase 3: Video Streaming (Student-facing)

### 3.1 — Video Stream Endpoint
**New:** `src/app/api/academy/video/[lessonId]/stream/route.ts`
- `GET` — authenticated student endpoint
- Generate presigned S3 URL (60s expiry)
- Redirect 302 ke presigned URL
- Validate Origin/Referer header
- Rate limit: 30 req/min

### 3.2 — Thumbnail Endpoint
**New:** `src/app/api/academy/video/[lessonId]/thumbnail/route.ts`
- `GET` — returns presigned URL for thumbnail
- Cache-friendly (thumbnail gak berubah sering)

### 3.3 — Video Progress API
**New:** `src/app/api/academy/video/[lessonId]/progress/route.ts`
- `GET` — get last position + completed status
- `PUT { lastPosition, completed }` — save progress (debounced from client, setiap 10 detik)

---

## Phase 4: Video Player (Frontend)

### 4.1 — SecureVideoPlayer Component
**New:** `src/components/academy/secure-video-player.tsx`

Client component:
1. On mount → fetch video stream URL dari API
2. `<video>` element: `controlsList="nodownload"`, `disablePictureInPicture`
3. Disable right-click on video area
4. Auto-save progress setiap 10 detik via progress API
5. On mount → restore last position
6. Responsive (mobile-friendly, full-width)
7. Loading state + error handling

### 4.2 — Update Student Course Detail Page
**File:** `src/app/(dashboard)/academy/[id]/page.tsx`
- If `lesson.videoStatus === 'ready'` → render `<SecureVideoPlayer>`
- If `lesson.videoUrl` (legacy YouTube) → keep iframe
- Show progress bar per lesson (berapa % sudah ditonton)

### 4.3 — Update CSP Headers
**File:** `next.config.ts`
- Add `media-src 'self' blob:` to CSP

---

## Phase 5: Admin Frontend (Command Center)

### 5.1 — Course Editor Page
**New:** `src/app/(command-center)/command-center/academy/courses/[id]/page.tsx`
- Form: title, description, category, level, instructorName, duration, publish toggle
- Below: Lessons Manager section

### 5.2 — Course Create Page
**New:** `src/app/(command-center)/command-center/academy/courses/new/page.tsx`

### 5.3 — Lesson Manager Component
**New:** `src/components/command-center/academy/lesson-manager.tsx`

Per lesson row:
- Title, order (drag to reorder), duration
- Video status badge: none/uploading/processing/ready/error
- Upload button + drag & drop zone
- Delete video, preview video
- Thumbnail preview

### 5.4 — Video Upload Component
**New:** `src/components/command-center/academy/video-upload.tsx`

Chunked upload flow:
1. Validate type (mp4/webm/mov) & size (max 500MB)
2. POST initiate → get uploadId + presigned URLs
3. Split 10MB chunks → upload parallel (3 concurrent)
4. Progress bar per chunk → aggregate overall
5. POST complete on finish
6. Resume: track uploaded chunks in sessionStorage
7. Retry: chunk gagal → retry 3x sebelum abort

### 5.5 — Bulk Upload Component
**New:** `src/components/command-center/academy/bulk-video-upload.tsx`

1. Drag multiple files
2. Show file list with auto-detected lesson mapping
3. Admin bisa adjust mapping sebelum upload
4. Upload semua parallel (1 video at a time, chunks parallel)
5. Overall progress + per-file progress

### 5.6 — Update Existing Admin Page
**File:** `src/app/(command-center)/command-center/academy/page.tsx`
- Replace mock → fetch from API
- CRUD buttons
- Video status column
- Bulk upload button

---

## Phase 6: Switch Student APIs from Mock to Prisma

### 6.1 — Course List API
**File:** `src/app/api/academy/courses/route.ts`
- Replace mock → Prisma query

### 6.2 — Course Detail + Lessons API
**File:** `src/app/api/academy/courses/[id]/route.ts`
- Replace mock → Prisma query, include video fields

---

## Key Files Summary

### New Files (20)
| File | Purpose |
|------|---------|
| `src/lib/services/thumbnail.service.ts` | ffmpeg thumbnail generation |
| `src/app/api/command-center/academy/courses/route.ts` | Course CRUD (list/create) |
| `src/app/api/command-center/academy/courses/[id]/route.ts` | Course CRUD (get/update/delete) |
| `src/app/api/command-center/academy/courses/[id]/lessons/route.ts` | Lesson CRUD (list/create) |
| `src/app/api/command-center/academy/courses/[id]/lessons/[lessonId]/route.ts` | Lesson CRUD (update/delete) |
| `src/app/api/command-center/academy/video/initiate/route.ts` | Start multipart upload |
| `src/app/api/command-center/academy/video/complete/route.ts` | Complete upload + trigger thumbnail |
| `src/app/api/command-center/academy/video/abort/route.ts` | Abort failed upload |
| `src/app/api/command-center/academy/video/status/[lessonId]/route.ts` | Poll processing status |
| `src/app/api/command-center/academy/video/bulk-initiate/route.ts` | Bulk upload initiate |
| `src/app/api/command-center/academy/video/thumbnail/[lessonId]/route.ts` | Manual thumbnail upload |
| `src/app/api/academy/video/[lessonId]/stream/route.ts` | Video stream (presigned redirect) |
| `src/app/api/academy/video/[lessonId]/thumbnail/route.ts` | Thumbnail endpoint |
| `src/app/api/academy/video/[lessonId]/progress/route.ts` | Save/load watch progress |
| `src/components/academy/secure-video-player.tsx` | Protected video player |
| `src/components/command-center/academy/video-upload.tsx` | Chunked upload component |
| `src/components/command-center/academy/bulk-video-upload.tsx` | Bulk upload component |
| `src/components/command-center/academy/lesson-manager.tsx` | Lesson list + reorder |
| `src/app/(command-center)/command-center/academy/courses/[id]/page.tsx` | Course editor |
| `src/app/(command-center)/command-center/academy/courses/new/page.tsx` | Course create |

### Modified Files (6)
| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add video fields + AcademyVideoProgress |
| `src/lib/storage.ts` | Add signed URLs + multipart methods |
| `docker-compose.yml` | Add MinIO service |
| `Dockerfile` | Install ffmpeg |
| `next.config.ts` | Update CSP for blob: media |
| `src/app/(command-center)/command-center/academy/page.tsx` | Mock → API |

---

## Upgrade Path to Full DRM (Future)

Ketika butuh full protection nanti:
1. Add HLS + AES-128 processing ke thumbnail.service.ts (rename jadi video-processing.service.ts)
2. Add `AcademyVideoKey` model untuk AES key storage
3. Add key delivery endpoint with authenticated tokens
4. Update player dari direct mp4 ke hls.js HLS mode
5. No UX changes needed — admin flow tetap sama
