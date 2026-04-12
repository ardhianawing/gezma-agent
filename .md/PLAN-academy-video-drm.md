# Gezma Academy — Video Upload & DRM-like Streaming

## Context

Gezma Academy saat ini pakai mock data dan YouTube embeds untuk video. User (super admin di Command Center) butuh bisa upload video sendiri per lesson seperti Udemy, dengan proteksi anti-download (IDM, browser extensions, downloader apapun). Storage pakai MinIO (self-hosted S3). Video bisa sampai 2GB per file, jadi butuh chunked/resumable upload.

---

## Anti-Download Strategy (Layered Protection)

| Layer | Fungsi |
|-------|--------|
| **HLS + AES-128 encryption** | Video dipecah jadi segments terenkripsi. IDM cuma dapat file .ts kecil yang encrypted, useless tanpa key |
| **Authenticated key delivery** | Decryption key cuma bisa diambil dengan session aktif + short-lived token (5 menit) |
| **No direct video URL** | Semua akses video lewat authenticated API proxy |
| **S3 presigned URLs (60s expiry)** | Bahkan URL segment cepat expired |
| **Custom player (hls.js)** | `controlsList="nodownload"`, no right-click, no native download button |
| **Referrer/Origin check** | Block request dari luar domain Gezma |
| **Rate limiting** | Prevent automated scraping |

> Note: Tidak ada DRM yang 100% unbreakable (screen recording selalu bisa). Tapi layer di atas defeat semua common download tools.

---

## Phase 1: Infrastructure & Schema

### 1.1 — Install Dependencies
```
npm install hls.js @aws-sdk/s3-request-presigner
```
- `hls.js` — client-side HLS player
- `@aws-sdk/s3-request-presigner` — S3 presigned URL generation

### 1.2 — Add MinIO to Docker Compose
**File:** `docker-compose.yml`
- Add MinIO service (port 9000 API, 9001 console)
- Add `minio_data` volume
- Update app env: `STORAGE_DRIVER=s3`, `S3_ENDPOINT=http://minio:9000`, `S3_BUCKET=gezma-uploads`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION=us-east-1`
- Add `VIDEO_TOKEN_SECRET` env var (untuk video access JWT)

### 1.3 — Install ffmpeg di Dockerfile
**File:** `Dockerfile`
- Add `RUN apt-get install -y ffmpeg` (atau `apk add ffmpeg` kalau alpine)

### 1.4 — Extend Prisma Schema
**File:** `prisma/schema.prisma`

Update `AcademyLesson` — tambah fields:
- `videoStorageKey String?` — S3 key for original video
- `hlsManifestKey String?` — S3 key for HLS .m3u8
- `hlsKeyId String?` — ID untuk lookup AES key
- `videoStatus String @default("none")` — none/uploading/processing/ready/error
- `videoError String?`
- `videoDuration Int?` — durasi dalam detik
- `videoSize BigInt?` — ukuran original dalam bytes

New model `AcademyVideoKey`:
- `id String @id`
- `lessonId String @unique`
- `aesKey Bytes` — 16 bytes AES-128 key
- `iv String` — hex-encoded IV
- `createdAt DateTime`

### 1.5 — Extend Storage with Signed URLs & Multipart
**File:** `src/lib/storage.ts`

Add to `StorageDriver` interface:
- `getSignedUrl(key: string, expiresInSeconds: number): Promise<string>`
- `createMultipartUpload(key: string, contentType: string): Promise<string>` — returns uploadId
- `getPartSignedUrl(key: string, uploadId: string, partNumber: number, expiresIn: number): Promise<string>`
- `completeMultipartUpload(key: string, uploadId: string, parts: {partNumber: number, etag: string}[]): Promise<void>`
- `abortMultipartUpload(key: string, uploadId: string): Promise<void>`
- `getObject(key: string): Promise<Buffer>` — for reading m3u8 manifests

Implement di `S3Storage` pakai:
- `@aws-sdk/s3-request-presigner` → `getSignedUrl()`
- `CreateMultipartUploadCommand`, `UploadPartCommand`, `CompleteMultipartUploadCommand`, `AbortMultipartUploadCommand`
- `GetObjectCommand` for reading objects

`LocalStorage` fallback: simple implementations for dev (getSignedUrl returns local path, multipart not needed).

---

## Phase 2: Video Upload APIs (Command Center)

### 2.1 — Course CRUD API
**New:** `src/app/api/command-center/academy/courses/route.ts`
- `GET` — list courses from Prisma (replace mock)
- `POST` — create course (title, description, category, level, instructorName, duration, thumbnailUrl)

**New:** `src/app/api/command-center/academy/courses/[id]/route.ts`
- `GET` — single course + lessons
- `PUT` — update course
- `DELETE` — delete course + cascade delete video files dari S3

Auth: semua pakai `getCCAuthPayload()` dari `src/lib/auth-command-center.ts`

### 2.2 — Lesson CRUD API
**New:** `src/app/api/command-center/academy/courses/[id]/lessons/route.ts`
- `GET` — list lessons for course
- `POST` — create lesson (title, content, order, duration)

**New:** `src/app/api/command-center/academy/courses/[id]/lessons/[lessonId]/route.ts`
- `PUT` — update lesson metadata
- `DELETE` — delete lesson + S3 video cleanup

### 2.3 — Chunked Video Upload API (S3 Multipart)
Untuk file 500MB-2GB, pakai **S3 Multipart Upload** — client upload langsung ke MinIO/S3 via presigned URLs per chunk.

**New:** `src/app/api/command-center/academy/video/initiate/route.ts`
- `POST { lessonId, fileName, fileSize, contentType }` 
- Creates S3 multipart upload → returns `uploadId` + presigned URLs untuk semua parts (chunk size: 10MB)
- Update lesson `videoStatus = 'uploading'`

**New:** `src/app/api/command-center/academy/video/complete/route.ts`
- `POST { lessonId, uploadId, parts: [{partNumber, etag}] }`
- Completes S3 multipart upload
- Update lesson `videoStorageKey`, `videoSize`
- Auto-trigger video processing (fire-and-forget)
- Update lesson `videoStatus = 'processing'`

**New:** `src/app/api/command-center/academy/video/abort/route.ts`
- `POST { lessonId, uploadId }` — abort failed upload, cleanup

**New:** `src/app/api/command-center/academy/video/status/[lessonId]/route.ts`
- `GET` — poll video processing status (videoStatus, videoError, videoDuration)

### 2.4 — Video Processing Service
**New:** `src/lib/services/video-processing.service.ts`

Function `processVideoToHls(lessonId: string)`:
1. Download raw video dari S3 ke temp directory
2. Generate random 16-byte AES key + IV
3. Save key to `AcademyVideoKey` table
4. Create `keyinfo.txt` pointing to key delivery URL: `/api/academy/video/{lessonId}/key`
5. Run ffmpeg via `child_process.execFile`:
   ```
   ffmpeg -i input.mp4 \
     -codec:v libx264 -codec:a aac \
     -hls_time 10 \
     -hls_playlist_type vod \
     -hls_key_info_file keyinfo.txt \
     -hls_segment_filename "segment_%03d.ts" \
     output.m3u8
   ```
6. Upload semua .ts segments + .m3u8 ke S3 under `academy/hls/{lessonId}/`
7. Update lesson: `hlsManifestKey`, `hlsKeyId`, `videoStatus = 'ready'`, `videoDuration`
8. Cleanup temp files
9. On error: update `videoStatus = 'error'`, `videoError`

Runs async (fire-and-forget dari complete endpoint). Admin polls status.

---

## Phase 3: Authenticated Video Streaming (Student-facing)

### 3.1 — Video Access Token
**New:** `src/lib/video-token.ts`
- `signVideoToken(lessonId, userId)` → JWT valid 5 menit, signed with `VIDEO_TOKEN_SECRET`
- `verifyVideoToken(token, lessonId, userId)` → boolean

**New:** `src/app/api/academy/video/[lessonId]/token/route.ts`
- `POST` — authenticated student endpoint, returns `{ token }` valid 5 min
- Requires valid `getAuthPayload()` session

### 3.2 — HLS Manifest Endpoint
**New:** `src/app/api/academy/video/[lessonId]/manifest/route.ts`
- `GET ?token=xxx` — requires auth cookie + valid videoToken
- Reads .m3u8 dari S3 via `getObject()`
- **Rewrites URLs** in manifest:
  - Segment URLs → `/api/academy/video/{lessonId}/segment/{name}?token=xxx`
  - Key URI → `/api/academy/video/{lessonId}/key?token=xxx`
- Returns `Content-Type: application/vnd.apple.mpegurl`
- `Cache-Control: no-store`
- Rate limit: 30 req/min

### 3.3 — HLS Segment Proxy
**New:** `src/app/api/academy/video/[lessonId]/segment/[segmentName]/route.ts`
- `GET ?token=xxx` — requires auth + videoToken
- Generate presigned S3 URL (60s expiry) → redirect 302
- Rate limit: 300 req/min (banyak segments per video)
- Validate Origin/Referer header

### 3.4 — Key Delivery Endpoint
**New:** `src/app/api/academy/video/[lessonId]/key/route.ts`
- `GET ?token=xxx` — requires auth + videoToken
- Fetch AES key dari `AcademyVideoKey` table
- Return raw 16 bytes as `application/octet-stream`
- `Cache-Control: no-store, no-cache`
- Validate Referer matches app domain
- Rate limit: 10 req/min (agresif)

---

## Phase 4: Secure Video Player (Frontend)

### 4.1 — SecureVideoPlayer Component
**New:** `src/components/academy/secure-video-player.tsx`

Client component yang:
1. On mount → `POST /api/academy/video/{lessonId}/token` → dapat `videoToken`
2. Init `hls.js` dengan `xhrSetup` yang attach credentials + token
3. Source: `/api/academy/video/{lessonId}/manifest?token={videoToken}`
4. `<video>` element: `controlsList="nodownload"`, `disablePictureInPicture`
5. Wrapper: `onContextMenu={e => e.preventDefault()}` (disable right-click)
6. Auto-refresh token setiap 4 menit sebelum expired
7. Loading state + error handling
8. Responsive (mobile-friendly, full-width)

### 4.2 — Update Student Course Detail Page
**File:** `src/app/(dashboard)/academy/[id]/page.tsx`

Replace YouTube iframe logic:
- If `lesson.videoStatus === 'ready'` → render `<SecureVideoPlayer lessonId={lesson.id} />`
- If `lesson.videoUrl` (legacy YouTube) → keep iframe
- Else → "No video" placeholder

Update `Lesson` type interface: tambah `videoStatus`, `hlsManifestKey`

### 4.3 — Update CSP Headers
**File:** `next.config.ts`

Add to Content-Security-Policy:
- `media-src 'self' blob:` — needed for hls.js blob URLs
- Keep `frame-src 'self' https://www.youtube.com` for legacy

---

## Phase 5: Admin Frontend (Command Center)

### 5.1 — Course Editor Page
**New:** `src/app/(command-center)/command-center/academy/courses/[id]/page.tsx`

Form fields: title, description, category (select), level (select), instructorName, duration, publish toggle.

Below form: **Lessons Manager** section — sortable list of lessons.

### 5.2 — Course Create Page
**New:** `src/app/(command-center)/command-center/academy/courses/new/page.tsx`

Same form as editor, empty state. POST to create.

### 5.3 — Lesson Manager Component
**New:** `src/components/command-center/academy/lesson-manager.tsx`

Per lesson row:
- Title, order (drag/reorder), duration
- Video status badge: none (gray) / uploading (blue+progress%) / processing (yellow+spinner) / ready (green) / error (red)
- Upload button → file input `accept="video/*"`
- Delete video button
- Preview button (opens modal with SecureVideoPlayer)

### 5.4 — Video Upload Component
**New:** `src/components/command-center/academy/video-upload.tsx`

Chunked upload flow:
1. User pilih file → validate type (mp4/webm/mov) & size (max 2GB)
2. `POST /api/command-center/academy/video/initiate` → dapat `uploadId` + presigned URLs
3. Split file jadi 10MB chunks → upload parallel (3 concurrent) ke presigned URLs
4. Track progress per chunk → aggregate jadi overall progress bar
5. On complete → `POST /api/command-center/academy/video/complete`
6. Poll status setiap 5 detik sampai `videoStatus = ready` atau `error`
7. Retry logic: kalau chunk gagal, retry 3x sebelum abort

### 5.5 — Update Existing Admin Page
**File:** `src/app/(command-center)/command-center/academy/page.tsx`

- Replace `MOCK_COURSES` → fetch dari `/api/command-center/academy/courses`
- "Create Course" button → navigate ke `/command-center/academy/courses/new`
- "Edit" button → navigate ke `/command-center/academy/courses/[id]`
- "Delete" → call DELETE API
- Add video status column di table

---

## Phase 6: Switch Student APIs from Mock to Prisma

### 6.1 — Course List API
**File:** `src/app/api/academy/courses/route.ts`
- Replace mock data → Prisma query with filters (category, level, search, pagination)

### 6.2 — Course Detail + Lessons API
**File:** `src/app/api/academy/courses/[id]/route.ts`
- Replace mock → Prisma query, include lessons with video fields

### 6.3 — Lesson Content API
**File:** `src/app/api/academy/courses/[id]/lessons/[lessonId]/route.ts`
- Replace generated content → Prisma query, return real lesson content + video status

---

## Key Files Summary

### New Files (16)
| File | Purpose |
|------|---------|
| `src/lib/services/video-processing.service.ts` | ffmpeg HLS + AES-128 conversion |
| `src/lib/video-token.ts` | Video access JWT sign/verify |
| `src/app/api/command-center/academy/courses/route.ts` | Course CRUD (list/create) |
| `src/app/api/command-center/academy/courses/[id]/route.ts` | Course CRUD (get/update/delete) |
| `src/app/api/command-center/academy/courses/[id]/lessons/route.ts` | Lesson CRUD (list/create) |
| `src/app/api/command-center/academy/courses/[id]/lessons/[lessonId]/route.ts` | Lesson CRUD (update/delete) |
| `src/app/api/command-center/academy/video/initiate/route.ts` | Start multipart upload |
| `src/app/api/command-center/academy/video/complete/route.ts` | Complete upload + trigger processing |
| `src/app/api/command-center/academy/video/abort/route.ts` | Abort failed upload |
| `src/app/api/command-center/academy/video/status/[lessonId]/route.ts` | Poll processing status |
| `src/app/api/academy/video/[lessonId]/token/route.ts` | Video access token |
| `src/app/api/academy/video/[lessonId]/manifest/route.ts` | HLS manifest proxy |
| `src/app/api/academy/video/[lessonId]/segment/[segmentName]/route.ts` | HLS segment proxy |
| `src/app/api/academy/video/[lessonId]/key/route.ts` | AES key delivery |
| `src/components/academy/secure-video-player.tsx` | DRM-like video player |
| `src/components/command-center/academy/video-upload.tsx` | Chunked upload component |
| `src/components/command-center/academy/lesson-manager.tsx` | Lesson list management |

### Modified Files (7)
| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add video fields + AcademyVideoKey model |
| `src/lib/storage.ts` | Add signed URLs + multipart upload methods |
| `docker-compose.yml` | Add MinIO service |
| `Dockerfile` | Install ffmpeg |
| `next.config.ts` | Update CSP for blob: media |
| `src/app/(dashboard)/academy/[id]/page.tsx` | Replace iframe → SecureVideoPlayer |
| `src/app/(command-center)/command-center/academy/page.tsx` | Mock → API, add CRUD navigation |

### Existing Files to Reuse
| File | What to reuse |
|------|---------------|
| `src/lib/auth-command-center.ts` | `getCCAuthPayload()` for admin endpoints |
| `src/lib/auth-server.ts` | `getAuthPayload()` for student video endpoints |
| `src/lib/rate-limiter.ts` | `rateLimit()` for all video endpoints |
| `src/lib/logger.ts` | `logger` for video access logging |

---

## Verification

1. **MinIO**: `docker-compose up minio` → access console at `:9001`, verify bucket creation
2. **Schema**: `npx prisma db push` → verify new fields + AcademyVideoKey table
3. **Upload flow**: Command Center → Create Course → Add Lesson → Upload video (test with ~50MB file first, then large file) → verify chunks upload to MinIO → verify processing triggers
4. **Processing**: Check lesson videoStatus transitions: uploading → processing → ready. Verify HLS files in MinIO bucket under `academy/hls/{lessonId}/`
5. **Playback**: Open lesson di student page → verify hls.js player loads → video plays → check Network tab: no direct video URL exposed, only manifest/segment/key endpoints
6. **Anti-download test**: Try IDM, Video DownloadHelper extension, right-click save — semua harus gagal. IDM mungkin capture .ts segments tapi encrypted/useless
7. **Auth test**: Try access `/api/academy/video/{lessonId}/manifest` tanpa login → 401. Try with expired token → 401
8. **Mobile**: Test player di viewport 375px, pastikan responsive + controls accessible
