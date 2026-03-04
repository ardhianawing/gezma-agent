# Session 19 — Action Items & Known Issues

> **Tanggal:** 4 Maret 2026
> **Status:** Code written, belum diverifikasi (build/test belum jalan)

---

## CRITICAL: /tmp Error pada Termux

### Problem
Semua command yang membutuhkan `/tmp` gagal di Termux Android:

```
ENOENT: no such file or directory, mkdir '/tmp/claude-10282/...'
```

Ini mempengaruhi:
- `npx prisma generate` — tidak bisa generate Prisma client
- `npx prisma db push` — tidak bisa sync schema ke database
- `npm install` — tidak bisa install dependency baru
- `npm run build` — tidak bisa build Next.js
- `npm run test` — tidak bisa jalankan test
- Agent/Task parallelization — Claude Code agents gagal spawn

### Fix (Jalankan Manual)

```bash
# 1. Buat /tmp di Termux (pilih salah satu)
mkdir -p /data/data/com.termux/files/usr/tmp
export TMPDIR=/data/data/com.termux/files/usr/tmp

# ATAU tambahkan ke ~/.bashrc / ~/.zshrc agar permanen:
echo 'export TMPDIR=$PREFIX/tmp' >> ~/.bashrc
source ~/.bashrc

# 2. Setelah TMPDIR fixed, jalankan:
cd ~/gezma-agent
npm install                    # Install wait-on (dependency baru)
npx prisma generate            # Generate Prisma client (2 model baru)
npx prisma db push             # Sync schema ke database
npx prisma db seed             # Seed data baru (services + quizzes)

# 3. Verifikasi
npm run typecheck              # TypeScript check
npm run test                   # 490+ unit tests
npm run build                  # Next.js production build
```

---

## YANG SUDAH DIKERJAKAN (Session 19)

### 1. Production Hardening
- [x] `src/lib/env.ts` — Enhanced validation (reject dummy JWT in prod)
- [x] `src/instrumentation.ts` — Security startup warnings
- [x] `src/app/api/command-center/security-audit/route.ts` — Security audit endpoint
- [x] `prisma/seed.ts` — Default password warning

### 2. E2E Tests in CI
- [x] `.github/workflows/ci.yml` — Added e2e-tests job with PostgreSQL service
- [x] `playwright.config.ts` — Skip webServer in CI
- [x] `package.json` — Added wait-on devDependency

### 3. Error Monitoring
- [x] `src/lib/error-monitor.ts` — Custom error monitor service
- [x] `src/app/api/command-center/errors/route.ts` — CC errors endpoint
- [x] `src/app/api/auth/login/route.ts` — Wired captureException
- [x] `src/lib/env.ts` — ERROR_MONITOR_DSN + APP_VERSION
- [x] `src/instrumentation.ts` — captureMessage on startup

### 4. Services Page Backend
- [x] `prisma/schema.prisma` — PlatformService + PlatformDocument (48 total models)
- [x] `src/lib/validations/services.ts` — Zod schemas
- [x] `src/app/api/services/route.ts` — GET services
- [x] `src/app/api/services/documents/[id]/download/route.ts` — Download tracking
- [x] `src/app/api/command-center/services/route.ts` — CC CRUD
- [x] `prisma/seed-session19.ts` — Seed 6 services + 6 documents
- [x] `src/app/(dashboard)/services/page.tsx` — Frontend wired to API

### 5. Academy Content
- [x] `prisma/seed-academy-quizzes.ts` — 12 quizzes × 5 questions = 60 questions

### 6. Pilgrim Safety
- [x] `src/components/pilgrim/sos-button.tsx` — Floating SOS button
- [x] `src/app/api/pilgrim-portal/sos/route.ts` — SOS alert API
- [x] `src/app/(pilgrim)/layout.tsx` — SOSButton integrated
- [x] `src/app/(pilgrim)/pilgrim/emergency/page.tsx` — GPS share + vCard download

### 7. Tests
- [x] `__tests__/security-hardening.test.ts` — 5 tests
- [x] `__tests__/error-monitor.test.ts` — 9 tests
- [x] `__tests__/validations/services.test.ts` — 10 tests
- [x] `__tests__/pilgrim-safety.test.ts` — 7 tests
- [x] `__tests__/seed-academy-quizzes.test.ts` — 8 tests

---

## YANG HARUS DILAKUKAN (Post Session 19)

### Immediate (Harus Segera)

| # | Task | Command | Alasan |
|---|------|---------|--------|
| 1 | **Fix TMPDIR** | `export TMPDIR=$PREFIX/tmp` | Semua command npm/prisma gagal tanpa ini |
| 2 | **npm install** | `npm install` | Install `wait-on` devDependency |
| 3 | **Prisma generate** | `npx prisma generate` | Generate client untuk 2 model baru |
| 4 | **Prisma db push** | `npx prisma db push` | Sync PlatformService + PlatformDocument ke DB |
| 5 | **Prisma seed** | `npx prisma db seed` | Seed services + academy quizzes |
| 6 | **TypeScript check** | `npm run typecheck` | Verify 0 errors |
| 7 | **Run tests** | `npm run test` | Verify 490+ tests pass |
| 8 | **Build** | `npm run build` | Verify production build succeeds |
| 9 | **Git commit** | `git add . && git commit` | Commit Session 19 changes |

### Short-term (Session 20 Candidates)

| # | Task | Keterangan |
|---|------|------------|
| 1 | **Update API-REFERENCE.md** | Run `npm run docs:api` — 7 new endpoints belum terdokumentasi |
| 2 | **Fix TypeScript errors** (jika ada) | Session 19 code belum di-typecheck karena /tmp error |
| 3 | **Wire error monitor ke lebih banyak routes** | Saat ini hanya auth/login, perlu di semua catch blocks |
| 4 | **GezmaPay UI** | Backend seed sudah ada di Session 18, UI belum dibuat |
| 5 | **Savings (Tabungan) UI** | Backend seed sudah ada di Session 18, UI belum dibuat |
| 6 | **PayLater UI** | Backend seed sudah ada di Session 18, UI belum dibuat |
| 7 | **Dashboard CC: Services widget** | Show service stats di CC dashboard |
| 8 | **Pilgrim Portal: Services page** | Pilgrim view of available services |

### Medium-term

| # | Task | Keterangan |
|---|------|------------|
| 1 | Connect real Nusuk API | Butuh API key dari Saudi |
| 2 | Connect real Payment Gateway | Butuh API key Midtrans/Xendit |
| 3 | Connect real WhatsApp API | Butuh API key provider |
| 4 | Configure S3 storage | STORAGE_DRIVER=s3 dengan bucket asli |
| 5 | Connect Sentry | Set ERROR_MONITOR_DSN |
| 6 | Real blockchain integration | Replace mock tx hash |

---

## FILE BARU SESSION 19

```
NEW:
  src/lib/error-monitor.ts
  src/lib/validations/services.ts
  src/components/pilgrim/sos-button.tsx
  src/app/api/command-center/security-audit/route.ts
  src/app/api/command-center/errors/route.ts
  src/app/api/command-center/services/route.ts
  src/app/api/services/route.ts
  src/app/api/services/documents/[id]/download/route.ts
  src/app/api/pilgrim-portal/sos/route.ts
  prisma/seed-session19.ts
  prisma/seed-academy-quizzes.ts
  __tests__/security-hardening.test.ts
  __tests__/error-monitor.test.ts
  __tests__/validations/services.test.ts
  __tests__/pilgrim-safety.test.ts
  __tests__/seed-academy-quizzes.test.ts

MODIFIED:
  src/lib/env.ts
  src/instrumentation.ts
  src/app/api/auth/login/route.ts
  src/app/(dashboard)/services/page.tsx
  src/app/(pilgrim)/layout.tsx
  src/app/(pilgrim)/pilgrim/emergency/page.tsx
  prisma/schema.prisma
  prisma/seed.ts
  .github/workflows/ci.yml
  playwright.config.ts
  package.json
```

---

*Generated: 4 Maret 2026*
