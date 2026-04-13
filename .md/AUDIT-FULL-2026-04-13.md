# Full Application Security Audit — GEZMA Agent

> **Tanggal:** 13 April 2026
> **Scope:** 195 API routes, 22 services, 50+ pages/components, middleware, config, infrastructure
> **Status:** Documented — belum di-fix (prototype/demo phase)

---

## CRITICAL (10 actionable, 1 skipped)

### SKIP: Dev-bypass route — tetap buat demo/presentasi
- `src/app/api/command-center/auth/dev-bypass/route.ts`
- **HAPUS SEBELUM PRODUCTION**

### CRIT-1: Middleware tidak verify JWT — cuma cek cookie ada
- `src/middleware.ts` lines 8, 19-25, 29
- Cookie `token=abc` (string apapun) = bisa akses semua protected pages
- Cookie `cc_token=anything` = akses Command Center
- **Fix:** Verify JWT signature di middleware pakai `jose` (Edge-compatible)

### CRIT-2: MinIO exposed public + default credentials
- `docker-compose.yml` — port 9000+9001 exposed, default `minioadmin/minioadmin`
- **Fix:** Hapus `ports` block, require env vars tanpa default

### CRIT-3: JWT secret lemah + default fallback
- `.env` — JWT secret 52 chars, leet-speak predictable
- `docker-compose.yml` line 46 — default `change-me-in-production`
- **Fix:** Generate random 64+ bytes: `openssl rand -hex 64`, hapus default

### CRIT-4: Payment webhook tanpa signature verification
- `src/app/api/integrations/payment/webhook/route.ts`
- Siapapun bisa POST fake payment notification → mark invoice as paid
- **Fix:** Implement per-provider HMAC verification (Midtrans SHA-512, Xendit callback token)

### CRIT-5: Chat API leak + no input limit
- `src/app/api/chat/route.ts`
- Gemini error body returned ke client (leak API details)
- Messages array tanpa size/length limit → API cost abuse
- **Fix:** Strip error details, add max 20 messages, max 4000 chars/message

### CRIT-6: Blockchain certificate race condition
- `src/lib/services/blockchain.service.ts` lines 44-75
- Duplicate check + create tidak dalam transaction
- `Math.random()` untuk certificate number → collision risk
- **Fix:** Wrap dalam `prisma.$transaction`, pakai `crypto.randomBytes`

### CRIT-7: XSS via dangerouslySetInnerHTML
- `src/app/(dashboard)/academy/[id]/page.tsx` line 568
- `src/app/(pilgrim)/pilgrim/manasik/page.tsx` line 182
- Lesson content dari API langsung di-render tanpa sanitization
- `videoUrl` unvalidated di iframe src
- **Fix:** Pakai DOMPurify, validate videoUrl hostname allowlist

---

## HIGH (26 items)

### Auth — Unprotected Routes (13 route files)

| Route | Method | Data Exposed |
|-------|--------|--------------|
| `api/pilgrims/route.ts` | GET/POST | Pilgrim PII (NIK, phone, email) |
| `api/pilgrims/[id]/route.ts` | GET/PUT/DELETE | Individual pilgrim CRUD |
| `api/trips/route.ts` | GET/POST | Trip management |
| `api/trips/[id]/route.ts` | GET/PUT/DELETE | Individual trip CRUD |
| `api/users/route.ts` | GET/POST | User listing + creation |
| `api/packages/route.ts` | POST | Package creation (pricing) |
| `api/tasks/route.ts` | GET/POST | Task management |
| `api/tasks/[id]/route.ts` | PATCH/DELETE | Task update/delete |
| `api/reports/financial/route.ts` | GET | Revenue Rp 2.85B, debtors |
| `api/reports/conversion/route.ts` | GET | Conversion funnel |
| `api/reports/demographics/route.ts` | GET | Pilgrim demographics |
| `api/reports/documents/route.ts` | GET | Document status |
| `api/reports/payment-aging/route.ts` | GET | Outstanding debts |
| `api/dashboard/stats/route.ts` | GET | Agency metrics |
| `api/dashboard/charts/route.ts` | GET | Revenue charts |
| `api/academy/progress/[courseId]/route.ts` | POST | Unauthenticated progress write |

**Fix:** Add `getAuthPayload()` check ke semua route di atas.

### Auth — Missing dari middleware protectedPaths
- `/activities`, `/paylater`, `/gezmapay`, `/tabungan`
- **Fix:** Tambah ke array `protectedPaths` di `src/middleware.ts`

### Security — Data Exposure

| Issue | File | Detail |
|-------|------|--------|
| Payment `serverKey` leaked | `api/integrations/payment/route.ts` | GET returns server-side secret |
| PII export tanpa role check | `api/agency/export/route.ts` | Any user bisa download semua data |
| `verificationCode` selected | `api/command-center/compliance/route.ts` | Pilgrim verification tokens in memory |
| Internal errors leaked | `blockchain/certificates/route.ts` + 3 files | Raw `error.message` ke client |

### Validation — Missing

| Issue | File |
|-------|------|
| Login no type check | `api/auth/login/route.ts` |
| GEZMAPay no max amount | `api/gezmapay/route.ts` |
| Agency PUT no validation | `api/agency/route.ts` |
| Academy CC routes no Zod | `api/command-center/academy/courses/` (4 files) |
| SOS unvalidated fields | `api/pilgrim-portal/sos/route.ts` |
| WhatsApp broadcast no limit | `api/integrations/whatsapp/broadcast/route.ts` |

### Infrastructure

| Issue | File |
|-------|------|
| CSP `unsafe-eval` + `unsafe-inline` | `next.config.ts` |
| `ignoreBuildErrors: true` | `next.config.ts` |
| Rate limiter in-memory | `src/lib/rate-limiter.ts` |
| No `prisma migrate deploy` di startup | `start.sh` |
| Audit trail logs sensitive fields | `src/lib/audit-trail.ts` |
| Seed pakai `password123` | `prisma/seed.ts` |
| Dockerfile bakes `.env` | `Dockerfile` line 13 |
| HTTP no redirect HTTPS | `docker-compose.yml` |

### Services — Business Logic Bugs

| Issue | File | Impact |
|-------|------|--------|
| `remainingBalance` never updated | `payment.service.ts` | Invoice amount salah |
| Gamification race condition | `gamification.service.ts` | Wrong level |
| `registeredCount` race condition | `pilgrim.service.ts` | Overbooking risk |
| Webhook SSRF | `webhook.service.ts` | Internal network probing |
| Report XSS | `report-generator.service.ts` | Stored XSS |
| Invoice "LUNAS" tautology | `invoice.service.ts` | Logic dead code |
| Pilgrim totalPoints never incremented | `pilgrim-gamification.service.ts` | Always 0 |

### Frontend

| Issue | File |
|-------|------|
| User form no password validation | `settings/users/page.tsx` |

### Rate Limiting Missing

| Route | Issue |
|-------|-------|
| `auth/verify/[code]` | No rate limit on auto-login |
| `settings/security/change-password` | No rate limit |
| `settings/security/totp/disable` | No rate limit |

---

## MEDIUM (11 items)

| Issue | File |
|-------|------|
| Wildcard `**.amazonaws.com` image domain | `next.config.ts` |
| Decryption silently returns tampered data | `src/lib/encryption.ts` |
| PaymentRecord missing indexes | `prisma/schema.prisma` |
| No explicit `url` di datasource | `prisma/schema.prisma` |
| Mailer transport created at module load | `src/lib/mailer.ts` |
| Open redirect via `redirect` param | `src/middleware.ts` |
| Academy content unprotected (conflicts DRM) | `api/academy/courses/` |
| Quiz/review unauthenticated write | `api/academy/[courseId]/quiz + reviews` |
| Pilgrim manasik progress unauthenticated | `api/pilgrim-portal/manasik/progress` |
| Forum read unauthenticated (inconsistent) | `api/forum/route.ts` |
| Activity feed unprotected | `api/activities/route.ts` |

---

## Yang Sudah OK

- SQL injection: aman, semua pakai Prisma ORM
- Email verification flow: proper 256-bit token, 24h expiry
- Password hashing: bcrypt cost 12 (standardized)
- Register input validation: max length, type check (fixed hari ini)
- Video upload: file type + size validation, presigned URLs
- Pilgrim portal auth: `getPilgrimPayload()` diterapkan konsisten
- CC auth: `getCCAuthPayload()` diterapkan konsisten di semua CC API routes
- Rate limiting: diterapkan di auth routes (login, register, forgot-password, reset-password)
- CORS: implicit protection via SameSite cookie + Next.js architecture

---

## Prioritas Fix untuk Production

### Phase 1 — Must fix sebelum live
1. Middleware JWT verification
2. Hapus dev-bypass route
3. Unprotected API routes (add auth)
4. MinIO ports + credentials
5. JWT secret strengthen
6. Payment webhook signature

### Phase 2 — Harus fix segera setelah launch
7. Chat input validation
8. XSS sanitization (DOMPurify)
9. Payment serverKey exposure
10. HTTP → HTTPS redirect
11. Dockerfile .dockerignore

### Phase 3 — Hardening
12. Redis rate limiter
13. CSP nonce-based (remove unsafe-eval)
14. Audit trail sensitive masking
15. Service race conditions (transactions)
16. remainingBalance sync

---

*Generated: 13 April 2026 — Full audit by 6 parallel review agents*
