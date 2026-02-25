# GEZMA Agent — Development Checkpoint

> **Last Updated:** 2026-02-25 (Session 13 — Production Readiness)
> **Blueprint Reference:** `GEZMA-AGENT-PLAN-v2.md`, `DEVELOPMENT-PLAN-v3.md`

---

## STATUS RINGKAS

| Kategori | Status | Keterangan |
|----------|--------|------------|
| **Phase 1: Core Agent Dashboard** | ✅ 100% Done | Semua modul + API |
| **Phase 2A: Platform Pages** | ✅ Done | 6 halaman dengan mock data |
| **Phase 2B: Agent Backlog** | ✅ 100% Done | Manifest, Timeline, Bulk, Import CSV + 5 low-priority backlog + 28 bug fixes |
| **Phase 2C: Gezma Pilgrim MVP** | ✅ Done | 6 → 8 halaman (+ documents, payments) + layout + real DB |
| **Phase 2D: Internal Features** | ✅ Done | 7 fitur: charts, reports, activity log, doc upload, CSV export |
| **Phase 3: Integrasi** | ✅ Prep Done | 4 service layers + 15 API endpoints + 7 UI pages (mock) |
| **Phase 4: Advanced** | ✅ 5/5 Done | Gamifikasi, Command Center, White-label, Blockchain, Academy LMS |
| **Session 9: Polish** | ✅ Done | Error Boundaries, Security Settings, Pilgrim Gamification, CC Analytics |
| **Session 10: Mega Features** | ✅ Done | 37 features: Security, Productivity, Pilgrim Portal, Platform, Academy, CC |
| **Session 11: Hardening** | ✅ Done | Zod validation, rate limiting, try/catch, logActivity, cleanup, 85 new tests |
| **Session 12: UI/UX Polish** | ✅ Done | Skeleton loaders, toast notifications, ConfirmDialog, button spinners, accessibility, empty states |
| **Session 13: Production Readiness** | ✅ Done | Env validation, CSP headers, structured logger, storage abstraction, cron jobs, gamification hooks |
| **PWA** | ✅ Done | Service Worker, Install Prompt, Offline |
| **Deployment** | ✅ Ready | Docker + Nginx + Traefik |

---

## A. PHASE 1 — CORE AGENT DASHBOARD (100%)

### 1. Authentication & Security
| Fitur | Status |
|-------|--------|
| Login (JWT cookie, 7 hari) | ✅ |
| Register (3 step: Agency → PIC → Password) | ✅ |
| Email Verification | ✅ |
| Forgot Password (SMTP) | ✅ |
| Change Password | ✅ |
| Auth Middleware | ✅ |
| Role System (owner, admin, staff, marketing) | ✅ |

### 2. Pilgrims (CRM Jemaah)
| Fitur | Status |
|-------|--------|
| CRUD + Search + Filter + Pagination | ✅ |
| Upload/Hapus Dokumen (KTP, Paspor, dll) | ✅ |
| Status Lifecycle (8 status + badge warna) | ✅ |
| Status Timeline Visual | ✅ |
| Checklist per Jemaah (9 item) | ✅ |
| Payment Records (DP, Cicilan, Lunas, Refund) | ✅ |
| Trip Assignment | ✅ |
| Export CSV (server-side, UTF-8 BOM) | ✅ UPGRADED |
| Import CSV (upload, preview, mapping, validate) | ✅ |
| Bulk Actions (status, trip assign, delete) | ✅ |

### 3. Packages (Paket Umrah)
| Fitur | Status |
|-------|--------|
| CRUD + Search + Filter | ✅ |
| HPP Calculator (9 komponen biaya) | ✅ |
| Margin & Published Price (auto-calculate) | ✅ |
| Itinerary Builder (day-by-day) | ✅ |
| **Itinerary Display (timeline, city badge)** | ✅ NEW |
| Kategori (Regular/Plus/VIP/Ramadhan/Budget) | ✅ |

### 4. Trips (Keberangkatan)
| Fitur | Status |
|-------|--------|
| CRUD + Search + Filter | ✅ |
| Manifest CRUD (add/remove pilgrim) | ✅ |
| Room Assignment (inline editing) | ✅ |
| Capacity Progress Bar | ✅ |
| Operational Checklist (8 item) | ✅ |
| Print Manifest | ✅ |

### 5. Dashboard
| Fitur | Status |
|-------|--------|
| Stats Summary, Activity Log, Alerts, Quick Actions, Upcoming Trips | ✅ |
| **Revenue Trend Chart (LineChart, 12 bulan)** | ✅ NEW |
| **Pilgrim Status Distribution (PieChart)** | ✅ NEW |
| **Trip Capacity Chart (BarChart)** | ✅ NEW |

### 6. Reports (5 Tab)
| Fitur | Status |
|-------|--------|
| **Tab Keuangan:** Revenue, Outstanding, Collection Rate, Breakdown, Trend | ✅ |
| **Tab Demografi:** Gender pie chart, age bar chart, top 10 provinsi | ✅ NEW |
| **Tab Dokumen:** Per-type completion rate, stacked progress bar | ✅ NEW |
| **Tab Aging:** Aging buckets (0-30, 31-60, 61-90, 90+), top 10 debtors | ✅ NEW |
| **Tab Funnel:** Conversion funnel (lead → completed), percentage bars | ✅ NEW |
| **Export CSV** per tab (server-side) | ✅ NEW |

### 7. Activity Log
| Fitur | Status |
|-------|--------|
| Dashboard widget (6 item terbaru) | ✅ |
| **Full page (`/activities`) — filter, search, pagination** | ✅ NEW |

### 8. Settings
| Fitur | Status |
|-------|--------|
| Theme (Light/Dark), Language (ID/EN), Password, Users, Agency Profile | ✅ |
| Notification Preferences (5 kategori × 3 channel) | ✅ |
| Granular Permissions (25 permissions, role matrix, UI gates) | ✅ |

### 9. AI Assistant
| Fitur | Status |
|-------|--------|
| Chat Widget + Gemini 2.0 Flash | ✅ |

### 10. PWA
| Fitur | Status |
|-------|--------|
| Manifest, Service Worker, Offline, Install Prompt, Update Prompt | ✅ |

---

## B. PHASE 2A — PLATFORM PAGES (100%)

Semua 6 halaman sudah dibangun dengan mock data (bukan Coming Soon lagi):

| Page | Mock Data | Fitur Utama |
|------|-----------|-------------|
| Berita | 10 artikel | Featured section, kategori, search, breaking badge |
| Akademi | 12 kursus | Stats, kategori+level filter, progress bar, rating |
| Layanan | static | 6 service cards, download dokumen, kontak |
| Trade Centre | 20 produk | Tabs, sertifikasi, stepper pengajuan |
| Marketplace | 30 item | Category tabs, sort, filter hotel, rating |
| Forum | 12 thread | Table layout, sort, pinned/hot/solved, pagination |

---

## C. PHASE 2B — AGENT BACKLOG (100%)

| Fitur | Status | API | UI |
|-------|--------|-----|-----|
| Manifest CRUD | ✅ | POST/PATCH/DELETE `/trips/[id]/manifest` | Modal add, inline room edit, remove |
| Status Timeline | ✅ | GET `/pilgrims/[id]/history` | Horizontal progress + vertical timeline |
| Bulk Actions | ✅ | POST `/pilgrims/bulk` | Checkboxes, floating bar, dropdowns |
| Import CSV | ✅ | POST `/pilgrims/import` | 3-step modal, template download |

### Low Priority Backlog — ✅ All Done (Session 4) + Hardened (Session 5)
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Brochure Generator (PDF) | ✅ Done | jsPDF + jspdf-autotable, download dari detail paket |
| Package Duplicate | ✅ Done | Clone paket dengan "(Copy)" suffix, isActive=false |
| QR Verification Page | ✅ Done | Generate QR per jemaah, public verify page |
| Granular Roles & Permissions | ✅ Done | 25 permissions, role matrix, per-user overrides, API guards |
| Notification Preferences | ✅ Done | 5 kategori × 3 channel, toggle grid UI |

### Session 5 — Review & Bug Fix (28 Issues Resolved)

Comprehensive code review + end-to-end testing (84/84 tests PASS). All issues fixed:

| Severity | Count | Fixes |
|----------|-------|-------|
| CRITICAL | 4 | Permission guards (`checkPermission`) on all 15+ API mutating routes, role validation, owner-only restrictions |
| HIGH | 8 | Brochure null safety (category/airline/hotels/activities/inclusions), PDF download cross-browser fix, remove broken Quick Notifications UI, Zod schema dynamic, mergeWithDefaults immutable |
| MEDIUM | 8 | QR URL env var (`NEXT_PUBLIC_APP_URL`), NIK masking `>=10`, slug strip hyphens, notification toggle disabled during save, copy link feedback, verify API select cleanup |
| LOW | 8 | `usePermission` returns false during loading, `formatDate` isNaN validation, `isVerified` checks `ppiuStatus`, JWT fallback secret removed (5 files), UI permission gates on list pages |

**Files changed:** 43 | **Insertions:** 236 | **Deletions:** 172

---

## D. PHASE 2C — GEZMA PILGRIM MVP (100%)

App terpisah untuk jemaah (route group `(pilgrim)`) dengan layout mobile-first, bottom nav, green theme:

| Fitur | Status | Keterangan |
|-------|--------|------------|
| Layout + Navigation | ✅ | Bottom nav 6 item (+ Dokumen) + top nav (desktop), green accent (#059669) |
| Pilgrim Context | ✅ | Login state via httpOnly cookie (JWT), auto-restore session, `refreshData()` callback |
| Login dengan booking code | ✅ | Real DB auth via API, JWT token (30-day), error handling |
| **Pilgrim Auth (JWT)** | ✅ | `auth-pilgrim.ts` — sign/verify pilgrim_token cookie |
| **Pilgrim Portal API** | ✅ | 5 endpoints: login, me, logout, documents (GET/POST) |
| **Data Transformer** | ✅ | `pilgrim-portal.service.ts` — DB rows → PilgrimPortalData (incl. fileUrl/fileName) |
| Dashboard jemaah | ✅ | Welcome, status progress (8 step), quick info, payment summary + "Lihat Detail" link, docs, agency contact |
| Detail perjalanan | ✅ | Countdown timer, flight info, hotels, muthawwif, room assignment, itinerary timeline |
| Manasik digital | ✅ | 8 materi dari DB per-agency, progress tracking persisten via API |
| Panduan doa | ✅ | 16 doa dari DB per-agency, favorit persisten via API |
| **Document Upload** | ✅ NEW | Upload per doc type (JPG/PNG/WebP/PDF, 5MB), status badge, progress bar |
| **Payment History** | ✅ NEW | Full timeline, progress bar, summary cards (total/paid/remaining) |
| Profile & dokumen | ✅ | Data pribadi, kontak, kamar, dokumen checklist, travel agent info, logout |

---

## E. PHASE 2D — INTERNAL FEATURES (Session 6) ✅ NEW

7 fitur high-impact tanpa API key external:

| Fitur | Files Created | Files Modified | Keterangan |
|-------|--------------|----------------|------------|
| **Itinerary Display** | 0 | 1 | Vertical timeline di package detail, city badges (Makkah/Madinah/Jeddah) |
| **Document Upload** | 2 | 4 | Pilgrim upload FormData, local filesystem, upsert PilgrimDocument |
| **Payment History** | 1 | 1 | Pilgrim full payment page, timeline, progress bar |
| **Dashboard Charts** | 4 | 1 | 3 Recharts (LineChart, PieChart, BarChart) + API endpoint |
| **Activity Log Page** | 1 | 2 | Full page with type filter, search, pagination, sidebar menu |
| **Advanced Reports** | 4 | 1 | 5-tab reports: Keuangan, Demografi, Dokumen, Aging, Funnel |
| **CSV Export** | 3 | 1 | Server-side UTF-8 BOM, pilgrims + payments endpoints |

**Total:** 15 new files, 11 modified files, 1926 insertions

---

## F. PHASE 3 — INTEGRASI (Preparation Done)

Semua menggunakan mock data, siap connect real API ketika key tersedia:

| Integrasi | Service | API Endpoints | UI Pages | Status |
|-----------|---------|---------------|----------|--------|
| **Nusuk API** | nusuk.service.ts | 3 (config, hotels, visa) | Settings + detail config | ✅ Mock |
| **Payment Gateway** | payment-gateway.service.ts | 4 (config, invoices, webhook) | Settings + pilgrim invoice | ✅ Mock |
| **WhatsApp** | whatsapp.service.ts | 5 (config, test, send, broadcast, templates) | Settings + trip broadcast | ✅ Mock |
| **UmrahCash** | umrahcash.service.ts | 3 (config, rate, transfer) | Settings + calculator | ✅ Mock |

---

## G. PHASE 4A — ADVANCED FEATURES (Session 7) ✅ 3/5 Done

3 fitur Phase 4 diimplementasi dalam 1 session:

### Gamifikasi ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Point System (8 rules) | ✅ | Auto-award via activity logger hook (fire-and-forget) |
| Badge System (11 badges) | ✅ | Auto-check after points awarded |
| Leaderboard | ✅ | Top 10 agencies per month, AgencyLeaderboard model |
| Level System | ✅ | Every 100 points = 1 level |
| Gamification Page | ✅ | Stats bar, badge showcase, leaderboard, point history |
| Dashboard Widget | ✅ | Points/Level card + mini top 5 leaderboard |

### Command Center (Admin Asosiasi) ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| SystemAdmin Model | ✅ | Terpisah dari User, independent JWT (cc_token) |
| Auth System | ✅ | Login, me, logout — 3 API endpoints |
| Dashboard | ✅ | Global stats (agencies, pilgrims, trips, revenue), recent agencies |
| Agencies List | ✅ | Search, status filter, pagination |
| Agency Detail | ✅ | Info, users, stats, approve/suspend actions |
| Audit Log API | ✅ | Cross-agency activity logs, filterable |
| Blue Theme Layout | ✅ | Independent layout, dark sidebar, #2563EB primary |

### White-label Branding ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Agency Branding Fields | ✅ | primaryColor, secondaryColor, faviconUrl, logoLightUrl, logoDarkUrl, appTitle |
| BrandingProvider | ✅ | Context + useBranding hook, auto-fetch on mount |
| Theme Override | ✅ | Dynamic primary/primaryLight/primaryHover/sidebarActiveItem from branding |
| Color Utils | ✅ | lighten, darken, hexToRgba helper functions |
| Sidebar Branding | ✅ | Uses branding logo + appTitle |
| Settings Page | ✅ | Color picker, logo URLs, favicon, live preview |

**DB Changes:** +4 models (PointEvent, UserBadge, AgencyLeaderboard, SystemAdmin), extended User (+totalPoints, level), extended Agency (+branding fields, totalPoints)
**New files:** 24 | **Modified:** 8 | **Total insertions:** 2671
**Default SystemAdmin:** `admin@gezma.id` / `admin123!`

---

## H. PHASE 4B — BLOCKCHAIN + CC POLISH + ACADEMY LMS + TESTS (Session 8) ✅

5 area dikerjakan dalam 1 session, menuntaskan seluruh Phase 4:

### Blockchain Verification (Mock) ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| BlockchainCertificate Model | ✅ | Prisma model, cert number, tx hash, status lifecycle |
| Blockchain Service | ✅ | `blockchain.service.ts` — cert generation, tx hash simulation, issue/verify/revoke |
| 5 API Endpoints | ✅ | POST/GET certificates, GET detail, POST revoke, GET public verify |
| Dashboard Page (`/blockchain`) | ✅ | Stats bar, certificate table, issue modal, detail modal |
| Public Verify Page | ✅ | `/verify/certificate/[number]` — public certificate verification |
| Sidebar Menu + Middleware | ✅ | Shield icon, protected route |

### Command Center Polish ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Audit Log UI Page | ✅ | `/command-center/audit-log` — filter bar, paginated table, CC blue theme |
| Responsive Layout | ✅ | Mobile hamburger menu, overlay sidebar, sticky header |
| PPIU Expiry Alerts | ✅ | `/api/command-center/alerts` API + dashboard alert banner |

### Academy LMS (Full) ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| 3 Prisma Models | ✅ | AcademyCourse, AcademyLesson, AcademyCourseProgress |
| 5 API Endpoints | ✅ | Course list, course detail, lesson content, progress tracking, user progress |
| Seed Script | ✅ | `prisma/seed-academy.ts` — 12 courses + 36 lessons |
| Academy Page (Live API) | ✅ | Replaced mock data with real DB calls |
| Course Detail Page | ✅ | `/academy/[id]` — lesson viewer, progress tracking |

### Unit Tests ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| 6 New Test Files | ✅ | blockchain, gamification, auth-cc, color-utils, validations (gamification + command-center) |
| Total Tests | ✅ | 235 tests across 17 test files, all passing |

### E2E Tests (Playwright) ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Playwright Setup | ✅ | Config + chromium only |
| 5 Spec Files | ✅ | auth, dashboard, pilgrims, command-center, navigation |
| Script | ✅ | `npm run test:e2e` |

**DB Changes:** +4 models (BlockchainCertificate, AcademyCourse, AcademyLesson, AcademyCourseProgress)
**New files:** 36 | **Build:** 0 TypeScript errors, 113 routes
**Total pages:** Dashboard 27 (was 25), CC 6 (was 5), Verify 3 (was 2)

---

## I. SESSION 9 — ERROR BOUNDARIES + SECURITY + PILGRIM GAMIFICATION + CC ANALYTICS ✅

6 fitur dikerjakan dalam 1 session:

### Error Boundaries ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| PilgrimErrorBoundary | ✅ | Green theme, "Coba Lagi" reset button, bahasa Indonesia |
| CCErrorBoundary | ✅ | Blue theme, "Muat Ulang" reset button |
| Layout Integration | ✅ | Wraps children in both pilgrim + CC layouts |

### Settings Security ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Login History Recording | ✅ | IP + user agent captured on every login |
| LoginHistory Model | ✅ | Prisma model with userId, ipAddress, userAgent, loginAt, logoutAt |
| Change Password API | ✅ | `POST /api/settings/security/change-password` — Zod validated |
| Login History API | ✅ | `GET /api/settings/security/login-history` — paginated |
| Security Settings Page | ✅ | `/settings/security` — password form, login history table, tips |
| Settings Navigation | ✅ | "Keamanan" section now links to security page |

### Pilgrim Gamification ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| PilgrimPointEvent Model | ✅ | pilgrimId, action, points, description, metadata |
| PilgrimBadge Model | ✅ | pilgrimId, badgeKey, badgeName, badgeDescription, badgeIcon |
| Gamification Service | ✅ | 6 point rules, 6 badge definitions, level system (50pts/level) |
| 3 API Endpoints | ✅ | stats, history (paginated), badges (earned + locked) |
| Endpoint Hooks | ✅ | Points on: doa favorite, manasik complete, document upload |
| Achievements Page | ✅ | `/pilgrim/achievements` — stats bar, badge grid, point history |
| Dashboard Widget | ✅ | Level/Points/Badge card on pilgrim home, links to achievements |
| Navigation | ✅ | "Pencapaian" (Trophy) added to pilgrim bottom nav |

### Command Center Analytics ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Analytics API | ✅ | `GET /api/command-center/analytics?period=30d` — 5 data sets |
| Pilgrim Growth Chart | ✅ | LineChart — daily registrations over period |
| Top Agencies Chart | ✅ | Horizontal BarChart — top 10 by pilgrim count |
| Trip Status Chart | ✅ | PieChart — distribution by status |
| Revenue Chart | ✅ | AreaChart — monthly revenue estimate |
| Period Filter | ✅ | 7d, 30d, 90d, 1y toggle buttons |

### Unit Tests ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| pilgrim-gamification.test.ts | ✅ | 23 tests — point rules, badge definitions, level calculation |
| login-history.test.ts | ✅ | 5 tests — record structure, IP validation, date handling |
| security.test.ts | ✅ | 11 tests — changePassword schema, loginHistoryQuery schema |
| **Total** | ✅ | **274 tests across 20 test files, all passing** |

**DB Changes:** +3 models (PilgrimPointEvent, PilgrimBadge, LoginHistory) — total 24 models
**New files:** 15 | **Modified:** 10 | **Total insertions:** 2020
**Build:** 0 TypeScript errors, 121 routes

---

## J. SESSION 10 — MEGA FEATURE SESSION (37 Features) ✅

37 fitur diimplementasi dalam 1 session besar, 12 batch parallel:

### Prisma Schema Update ✅
| Perubahan | Keterangan |
|-----------|------------|
| 15 new models | PilgrimNote, AgencyTask, EmailTemplate, WaitingList, PilgrimPhoto, PilgrimTestimonial, Referral, Notification, ScheduledReport, AcademyQuiz, AcademyQuizQuestion, AcademyQuizAttempt, AcademyCourseReview, RoommatePreference |
| User fields | +totpSecret, +totpEnabled, +onboardingCompleted |
| LoginHistory fields | +sessionToken, +isActive |
| Agency fields | +slug @unique |
| Trip fields | +shareCode @unique |
| **Total models** | **39** (was 24) |

### Batch 1: Security & Auth ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| API Rate Limiting | ✅ | In-memory sliding window, `rateLimit(req, { limit, window })`, per IP+route |
| 2FA/TOTP | ✅ | otplib + AES-256-GCM encryption, QR setup, verify, disable, login flow with tempToken |
| Session Management | ✅ | List active sessions, revoke access, sessionToken tracking |

### Batch 2: Agent Productivity Core ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Global Search / Command Palette | ✅ | Ctrl+K, debounced search across pilgrims/packages/trips, keyboard nav |
| Kanban Board Pilgrim | ✅ | 8-column status board, HTML5 DnD, PATCH status on drop |
| Calendar View Trips | ✅ | Custom month grid, trip dots on departure/return dates, day click panel |
| Internal Notes per Pilgrim | ✅ | CRUD notes with author tracking, timeAgo display |
| Task Management | ✅ | 3-column Kanban (Todo/In Progress/Done), filter by assignee, create/edit/delete |

### Batch 3: Agent Productivity Extended ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Invoice/Kwitansi PDF | ✅ | jsPDF, agency header, payment table, "LUNAS" watermark, download endpoint |
| Email Templates | ✅ | CRUD per event (welcome/payment_reminder/departure_reminder), variable interpolation |
| Waiting List | ✅ | Per-trip waiting list, add/remove entries, shown when trip at capacity |

### Batch 4: Pilgrim Portal Enhancement ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Packing Checklist | ✅ | 7 categories, localStorage persistence, add custom items, progress bar |
| Prayer Times Widget | ✅ | Astronomical calculation, Makkah/Madinah toggle, highlight next prayer |
| Currency Converter | ✅ | IDR ↔ SAR, editable rate, localStorage persistence |
| Emergency Contacts | ✅ | KBRI, KJRI, RS, Ambulans, Polisi, Pemadam, Kemenag — with tel: links |
| Itinerary Sharing | ✅ | Generate shareCode, public page `/share/itinerary/[code]` (no auth) |
| Photo Gallery | ✅ | Upload/list/delete photos with captions |
| Testimonial/Review | ✅ | Star rating + comment, only for completed trips |

### Batch 5: Platform & Marketing ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Referral System | ✅ | Generate code, use code → award points to referrer, stats |
| Public Agency Profile | ✅ | `/agency/[slug]` — public page with packages, testimonials, stats |
| Onboarding Tour | ✅ | Step-by-step highlight overlay, "Lanjut"/"Lewati", auto-show for new users |
| Notification Center | ✅ | Bell + unread badge, dropdown, full page, mark read, filter, CRUD |

### Batch 6: Data & Reporting ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Customizable Dashboard | ✅ | Widget show/hide, edit mode, localStorage persistence, reset to default |
| Scheduled Reports | ✅ | Configure frequency (weekly/monthly), report type, email recipients |
| Data Backup/Export | ✅ | Export all agency data as JSON (pilgrims, packages, trips, payments) |
| Comparison Analytics | ✅ | Period comparison toggle, delta indicators (green/red %) |

### Batch 7: Academy Enhancement ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Quiz & Assessment | ✅ | Per-course quiz with questions, attempt scoring, pass/fail, one-at-a-time UI |
| Certificate Generator | ✅ | jsPDF decorative certificate, name/course/date/score, download when passed |
| Course Rating & Review | ✅ | 1-5 star, one per user, avg rating on course cards |

### Batch 8: Command Center Enhancement ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Compliance Dashboard | ✅ | Weighted score (PPIU 40%, docs 30%, activity 20%, verified 10%), color-coded |
| Auto-block Expired PPIU | ✅ | Find expired agencies, auto-suspend, confirmation dialog |

### Batch 9: Platform Detail Pages ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| News Article Detail | ✅ | `/news/[id]` — full content, related articles |
| Forum Thread Detail | ✅ | `/forum/[id]` — full content, mock replies |
| Marketplace Item Detail | ✅ | `/marketplace/[id]` — full display, related items |
| Help/FAQ Page | ✅ | 25 FAQs in 5 categories, searchable, accordion |

### Batch 10: Other Features ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Pilgrim Roommate Matching | ✅ | Preference form (gender, age, smoking, snoring, language), matching algorithm |
| Package Builder Wizard | ✅ | 4-step wizard (Flight → Hotel Makkah → Hotel Madinah → Visa), running total |

### Navigation & Wiring ✅
| Perubahan | Keterangan |
|-----------|------------|
| Sidebar | +Tugas (CheckSquare), +Notifikasi (Bell) |
| Middleware | +/tasks, +/notifications to protectedPaths |
| Pilgrim Layout | +Packing, +Emergency nav items |
| CC Layout | +Kepatuhan nav item |

### Unit Tests ✅
| Test File | Tests | Keterangan |
|-----------|-------|------------|
| rate-limiter.test.ts | 6 | Sliding window, IP/route isolation, remaining count |
| notification.test.ts | 5 | createNotification structure validation |
| totp.test.ts | 6 | Encrypt/decrypt, format validation, generateSecret, verifyToken |
| invoice.test.ts | 3 | PDF generation with mocked jsPDF, empty payments, remaining balance |
| task.test.ts | 12 | Zod schema create/update validation |
| email-template.test.ts | 9 | Zod schema validation |
| prayer-times.test.ts | 6 | Calculation, format, chronological order, city comparison, next prayer |
| academy-quiz.test.ts | 9 | Score calculation, pass/fail, edge cases |
| **Total** | **330 tests across 28 files, all passing** |

**DB Changes:** +15 models (24 → 39 total)
**New files:** ~74 | **Modified:** ~21 | **Total insertions:** 15,223
**Build:** 0 TypeScript errors | **Tests:** 330/330 passing

---

## K. SESSION 11 — CODEBASE HARDENING & QUALITY ✅

Comprehensive audit + fix of ~50 quality/security gaps across the codebase:

### Batch 1: Foundation ✅
| Perubahan | Keterangan |
|-----------|------------|
| Activity Logger Types | Extended from 5 → 9 types (`+user, agency, settings, system`), 8 → 10 actions (`+revoked, sent`) |
| Password Policy Fix | `min(6)` → `min(8)` in `changePasswordSchema` + `reset-password` route |
| 5 New Zod Schemas | `note.ts`, `waiting-list.ts`, `scheduled-report.ts`, `academy-review.ts`, `notification.ts` (extended) |

### Batch 2: Zod Validation Wiring (16 routes) ✅
| Route Group | Routes Wired | Schema Source |
|-------------|-------------|---------------|
| Users | POST, PUT | `createUserSchema`, `updateUserSchema` |
| Payments | POST | `createPaymentSchema` |
| Notes | POST | `createNoteSchema` (new) |
| Waiting List | POST | `createWaitingListSchema` (new) |
| Scheduled Reports | POST, PATCH | `createScheduledReportSchema` (new) |
| Academy Reviews | POST | `createReviewSchema` (new) |
| Email Templates | POST, PATCH | Already wired (verified) |
| Change Password | POST | Already wired (verified) |
| Pilgrim Portal | 4 routes | Inline Zod (testimonial, gallery, referral, roommate) |

### Batch 3: Rate Limiting (7 auth routes) ✅
| Route | Limit | Window |
|-------|-------|--------|
| `auth/register` | 3/min | 60s |
| `auth/forgot-password` | 3/min | 60s |
| `auth/reset-password` | 5/min | 60s |
| `auth/totp-verify` | 5/min | 60s |
| `command-center/auth/login` | 5/min | 60s |
| `pilgrim-portal/login` | 5/min | 60s |
| `settings/security/change-password` | 3/min | 60s |

### Batch 4: Error Handling + Activity Logging ✅
| Perubahan | Count | Routes |
|-----------|-------|--------|
| try/catch added | 9 route files | Academy (courses, lessons, progress), email-templates, waiting-list, invoice |
| logActivity added | 13 mutations | Users CRUD, agency PUT, notes POST, email-templates, scheduled-reports, blockchain revoke, send-scheduled, waiting-list |

### Batch 5: Cleanup + Tests ✅
| Perubahan | Keterangan |
|-----------|------------|
| Removed deps | `class-variance-authority`, `@tanstack/react-table`, `dotenv` (all unused) |
| Normalized imports | `zod/v4` → `zod` in 2 files (command-center, gamification) |
| New test files | 6 files: `api/auth`, `api/users`, `api/pilgrims-extended`, `api/academy`, `api/settings`, `validations/new-schemas` |
| Updated test | `security.test.ts` — updated for min(8) password policy |
| **Total tests** | **415 tests across 34 files, all passing** (was 330/28) |

**Files changed:** 48 | **Insertions:** 1,859 | **Deletions:** 345
**Build:** 0 TypeScript errors | **Tests:** 415/415 passing

---

## L. SESSION 12 — UI/UX POLISH ✅

Wire underutilized shared components into pages for consistent, polished UX across the entire app:

### Batch 1: Skeleton Loaders (12 pages) ✅
| Page | Skeleton Type |
|------|---------------|
| Dashboard | TableSkeleton (activities) |
| Packages List | CardSkeleton grid (4) |
| Package Detail | DetailSkeleton |
| Package Edit | FormSkeleton (8 fields) |
| Trips List | CardSkeleton grid (4) |
| Academy Courses | CardSkeleton grid (6) |
| Activities | TableSkeleton (5×3) |
| Blockchain | StatsSkeleton (3) + TableSkeleton |
| Settings Security | TableSkeleton (4×2) |
| CC Agencies | TableSkeleton (5×6) |
| CC Agency Detail | DetailSkeleton |
| Pilgrim Roommate | FormSkeleton (6 fields) |

### Batch 2: Toast Notifications (~25 pages) ✅
| Priority | Pages | Changes |
|----------|-------|---------|
| P1: alert() replacement | 5 files | packages/[id] (6 alerts), settings/users (2), academy/[id], scheduled-reports, pilgrim/gallery |
| P2: Silent catches | 11 files | pilgrims/[id], pilgrims/[id]/edit, pilgrims/new, packages/new, packages/[id]/edit, settings/branding, email-templates, notifications, blockchain, agency, trips/[id] |
| P3: Pilgrim + Integrations | 8 files | packing, profile, documents, nusuk, whatsapp, payment, umrahcash, notifications |

### Batch 3: ConfirmDialog (7 pages) ✅
| Page | Action | Previously |
|------|--------|-----------|
| packages/[id] | Delete package | `window.confirm()` |
| settings/users | Delete user | `window.confirm()` |
| academy/[id] | Delete review | `window.confirm()` |
| scheduled-reports | Delete report | `window.confirm()` |
| pilgrim/gallery | Delete photo | `window.confirm()` |
| tasks | Delete task | No confirmation (added) |
| trips/[id] | Remove waiting list | Toast feedback added |

### Batch 4: Button Loading Spinners (20 pages) ✅
| Group | Pages |
|-------|-------|
| Settings | page, security, branding, users, email-templates, notifications, scheduled-reports |
| Main | agency, blockchain (issue+revoke), pilgrims/[id] (payment+note), tasks |
| Integrations | nusuk, whatsapp, payment, umrahcash |
| Other | pilgrim/roommate, pilgrim/gallery, academy/[id], academy/[id]/quiz, CC login |

Also centralized `@keyframes spin` in `globals.css` and removed 6 inline `<style>` duplicates.

### Batch 5: Accessibility ✅
| Enhancement | Files | Details |
|-------------|-------|---------|
| ConfirmDialog a11y | 1 component | `role="dialog"`, `aria-modal`, `aria-labelledby`, auto-focus cancel button |
| Toast a11y | 1 component | `role="alert"`, `aria-live="assertive"`, close button `aria-label` |
| Icon button aria-labels | 6 pages | pilgrims, users, tasks, blockchain, notifications, trips/[id] |
| Custom modal role="dialog" | 4 pages | pilgrims, trips/[id], blockchain, users |

### Batch 6: Empty State Consistency (12 pages) ✅
| Page | Icon | Title |
|------|------|-------|
| settings/users | Users | Belum ada user |
| activities | Activity | Belum ada aktivitas |
| scheduled-reports | FileText | Belum ada laporan terjadwal |
| blockchain | Shield | Belum ada sertifikat |
| gamification | Trophy/Star | Belum ada data leaderboard / riwayat poin |
| documents | FileText | Belum ada dokumen |
| trips | MapPin | Belum ada trip |
| packages | Package | Conditional (filter-aware) |
| tasks | CheckSquare | Tidak ada task |
| notifications | Bell | Conditional (tab-aware) |
| dashboard | Trophy/Calendar/Clock | 3 empty states |
| reports | BarChart3 | 5 empty states across tabs |

**Files changed:** 44 | **Insertions:** 534 | **Deletions:** 226
**Build:** 0 TypeScript errors | **Tests:** 415/415 passing

---

## M. SESSION 13 — PRODUCTION READINESS ✅

6 production-readiness improvements across 4 batches:

### Batch 1: Foundation ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Environment Validation | ✅ | Zod schema at startup: DATABASE_URL, JWT_SECRET (min 32), STORAGE_DRIVER, CRON_ENABLED |
| CSP Header | ✅ | Content-Security-Policy + Permissions-Policy in next.config.ts |
| Structured Logger | ✅ | JSON output in prod, readable in dev, no deps |
| File Storage Abstraction | ✅ | StorageDriver interface, LocalStorage + S3Storage (MinIO), `getStorage()` singleton |
| Instrumentation Hook | ✅ | `src/instrumentation.ts` — Next.js server startup, env validation + cron init |

### Batch 2: Gamification Hooks ✅
| Fitur | Status | Keterangan |
|-------|--------|------------|
| Daily Login Points | ✅ | `daily_login` (5 pts) awarded on pilgrim login, deduplicated per day |
| Profile Update Points | ✅ | `update_profile` (15 pts) on pilgrim profile self-service update |
| Pilgrim Profile PATCH API | ✅ | `/api/pilgrim-portal/profile` — phone, email, whatsapp, address, etc. |
| Profile Edit UI | ✅ | "Edit Profil" button + inline edit mode in pilgrim profile page |

### Batch 3: Cron Jobs ✅
| Job | Schedule | Keterangan |
|-----|----------|------------|
| Scheduled Reports | `0 * * * *` | Check active reports, send if due (weekly/monthly), update lastSentAt |
| PPIU Auto-Suspend | `0 1 * * *` | Find agencies with expired PPIU, auto-update to 'expired' |
| PPIU Expiry Alerts | `0 8 * * *` | Log warnings for agencies expiring within 30 days |

Also: extracted report-generator.service.ts from send-scheduled route, node-cron + @aws-sdk/client-s3 deps.

### Batch 4: Tests ✅
| Test File | Tests | Keterangan |
|-----------|-------|------------|
| env.test.ts | 6 | Missing vars, short JWT_SECRET, defaults, caching |
| storage.test.ts | 3 | Upload, getUrl, delete (mocked fs) |
| cron.test.ts | 4 | Enable/disable, schedule registration, logging |
| logger.test.ts | 5 | JSON prod, readable dev, levels, debug suppression |
| **Total** | **433 tests across 38 files, all passing** |

**Files changed:** 20 | **Insertions:** 4,340 | **Deletions:** 1,839
**Build:** 0 TypeScript errors | **Tests:** 433/433 passing
**New deps:** node-cron, @aws-sdk/client-s3

---

## N. API ENDPOINTS (~134 Total)

```
Auth:            9 endpoints (login, register, verify, password, totp-verify, me, etc)                   ← UPDATED
Pilgrims:       18 endpoints (CRUD + docs + payments + status + history + bulk + import + QR + export + notes + invoice) ← UPDATED
Packages:        7 endpoints (CRUD + duplicate + brochure)
Trips:           9 endpoints (CRUD + checklist + manifest + manifest/remove + waiting-list)               ← UPDATED
Dashboard:       4 endpoints (stats, alerts, activities, charts)
Reports:         6 endpoints (financial, demographics, documents, payment-aging, conversion, send-scheduled) ← UPDATED
Reports Export:  1 endpoint  (financial/export)
Settings:       10 endpoints (notifications, security ×5, email-templates ×2, scheduled-reports ×2, onboarding) ← UPDATED
Integrations:   15 endpoints (nusuk: 3, payment: 4, whatsapp: 5, umrahcash: 3)
Pilgrim Portal: 21 endpoints (login, me, logout, docs, profile, manasik, doa, gamification ×3, gallery ×2, testimonial, referral ×2, roommate ×2, share-itinerary) ← UPDATED
Verify:          3 endpoints (pilgrim QR + agency QR + certificate verification)
Users:           2 endpoints (CRUD + role management)
Other:           3 endpoints (agency, agency/export, chat AI)                                             ← UPDATED
Search:          1 endpoint  (global search across pilgrims/packages/trips)                               ← NEW
Notifications:   3 endpoints (list+markAllRead, markRead+delete per id)                                  ← NEW
Tasks:           2 endpoints (list+create, update+delete per id)                                          ← NEW
Public:          3 endpoints (agency/public/[slug], share/itinerary/[code], agency/[slug] page)           ← NEW
Gamification:    4 endpoints (stats, badges, leaderboard, history)
Command Center: 11 endpoints (login, me, logout, agencies, agencies/[id], stats, audit-log, alerts, analytics, compliance, auto-suspend) ← UPDATED
Blockchain:      5 endpoints (POST/GET certificates, GET detail, POST revoke, GET public verify)
Academy:        10 endpoints (courses, course detail, lesson, progress, user progress, quiz, quiz/attempt, certificate, reviews ×2) ← UPDATED
```

---

## N. TECH STACK

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | 100% inline styles + useTheme() |
| Database | PostgreSQL + Prisma v7 (39 models) |
| Auth | JWT (HTTP-only cookies) |
| Email | Nodemailer (SMTP) |
| AI | Google Gemini 2.0 Flash |
| Validation | Zod v4 |
| Charts | Recharts |
| Icons | Lucide React |
| PDF | jsPDF + jspdf-autotable |
| QR | qrcode |
| Deployment | Docker + Nginx + Traefik |

---

## O. FILE STRUCTURE

```
src/
├── app/
│   ├── (auth)/           → 4 pages
│   ├── (dashboard)/      → 40+ pages (+tasks, notifications, builder, detail pages, quiz, etc)                   ← UPDATED
│   ├── (command-center)/ → 7 pages (+compliance)                                                                 ← UPDATED
│   ├── (pilgrim)/        → 14+ pages (+packing, currency, emergency, gallery, roommate)                          ← UPDATED
│   ├── api/              → ~133 API endpoints (+35 new routes)                                                   ← UPDATED
│   ├── agency/           → 1 page (public agency profile)                                                        ← NEW
│   ├── share/            → 1 page (public itinerary sharing)                                                     ← NEW
│   ├── verify/           → 3 pages (pilgrim QR, agency QR, certificate/[number])
│   └── offline/          → PWA offline page
├── components/
│   ├── shared/           → 15 reusable components (+command-palette, onboarding-tour)                            ← UPDATED
│   ├── layout/           → 4 (sidebar, header, page-header, notification-bell)                                   ← UPDATED
│   ├── pilgrim/          → 1 (prayer-times-widget)                                                               ← NEW
│   ├── packages/         → 3 (form, itinerary, pricing)
│   ├── pilgrims/         → 3 (document-upload, status-timeline, import-modal)
│   ├── trips/            → 1 (trip-form)
│   ├── dashboard/        → 5 (action-center, quick-actions, revenue-chart, pilgrim-status-chart, trip-capacity-chart)
│   ├── pwa/              → 4 (sw-register, offline, install, update)
│   ├── ai-assistant/     → 1 (ChatWidget)
│   ├── pilgrim-error-boundary.tsx → Pilgrim portal error boundary                   ← NEW
│   └── cc-error-boundary.tsx      → Command Center error boundary                   ← NEW
├── data/                 → 8 mock data files (+pilgrim-portal, manasik, doa)
├── lib/
│   ├── services/         → 15 service files (+totp, invoice, notification, academy-certificate, report-generator) ← UPDATED
│   ├── hooks/            → 4 hooks
│   ├── contexts/         → 2 (pilgrim-context, branding-context)
│   ├── validations/      → 14 schemas (+note, waiting-list, scheduled-report, academy-review) ← UPDATED
│   ├── utils/            → 1 (prayer-times)                                         ← NEW
│   ├── env.ts            → Zod env validation at startup                           ← NEW S13
│   ├── logger.ts         → Structured logger (JSON prod, readable dev)             ← NEW S13
│   ├── storage.ts        → File storage abstraction (local/S3)                     ← NEW S13
│   ├── cron.ts           → Cron jobs (reports, PPIU suspend, alerts)               ← NEW S13
│   ├── rate-limiter.ts   → In-memory sliding window rate limiter                    ← NEW
│   ├── auth-command-center.ts → CC JWT auth (sign, verify, cookie)
│   ├── csv-export.ts     → UTF-8 BOM CSV generator
│   ├── i18n/             → ID + EN translations
│   └── theme/            → Light + Dark + color-utils + branding override
├── types/                → 5 type definition files
├── prisma/
│   └── seed-academy.ts   → Academy seed script (12 courses + 36 lessons)            ← NEW
├── tests/                → 38 unit test files (433 tests)                           ← UPDATED S13
└── e2e/                  → 5 Playwright spec files (auth, dashboard, pilgrims, CC, navigation)
```

---

## P. GIT LOG (Session 3-12)

```
295e01c feat: Session 13 — Production readiness (env validation, CSP, storage, cron, gamification)
85b78c0 feat: Session 12 — UI/UX polish across 44 files
eb03772 fix: Session 11 — Codebase hardening & quality improvements
637c69d feat: Session 10 — Mega Feature Session (37 features)
e6e94a9 docs: update DEVELOPMENT-PLAN-v3.md with Session 9 progress
c4ff048 docs: update BLUEPRINT-TRACKING.md with Session 9 progress
2448dbf docs: update CHECKPOINT.md with Session 9 progress
3a77b1a feat: Session 9 — Error Boundaries, Security, Pilgrim Gamification, CC Analytics
65e5d80 feat: implement Phase 4B — Blockchain, CC Polish, Academy LMS, Tests
747c92e feat: implement Phase 4 — Gamifikasi, Command Center, White-label Branding
d745e74 chore: remove 5 unused utility files
b35f4bc fix: add missing auth protection for /reports and /activities routes
540663c test: add Vitest unit testing setup with 151 tests across 11 files
973b771 feat: implement 7 internal features — charts, reports, activity log, document upload, CSV export
081a204 docs: update CHECKPOINT.md with Session 5 review & 28 bug fixes
b4c5033 fix: resolve 28 review issues across 5 backlog features
2af763f docs: update tracking documents — mark 5 low-priority backlog features as done
72ff2f9 feat: implement 5 low-priority backlog features (brochure, duplicate, QR, permissions, notifications)
0ff9765 feat: connect Manasik & Doa to real database
67343b3 docs: update CHECKPOINT.md with Pilgrim Portal DB integration
5fec158 feat: connect Pilgrim Portal to real database via Prisma
20c498b docs: update CHECKPOINT.md with Phase 3 integration status
df2820c feat: Phase 3 — integration preparation (Nusuk, Payment, WhatsApp, UmrahCash)
a8ebe52 feat: Phase 2C — Gezma Pilgrim MVP (6 pages + layout + mock data)
8d66480 docs: update CHECKPOINT.md with Phase 2A + 2B completion status
6da6555 feat: Phase 2B — manifest CRUD, status timeline, bulk actions, CSV import
```

---

## Q. SESSION 14 PLAN — Database & Infrastructure Hardening

Audit hasil Session 13 menemukan production gaps kritis yang bisa ditangani tanpa external deps:

### Batch 1: Database Indexes (CRITICAL)
Prisma schema memiliki **0 `@@index`** — semua query multi-tenant (filter by `agencyId`) melakukan full table scan.

| Model | Index | Alasan |
|-------|-------|--------|
| Pilgrim | `@@index([agencyId])` | Multi-tenant query utama, dipakai di 20+ API |
| User | `@@index([agencyId])` | User listing per agency |
| ActivityLog | `@@index([agencyId])`, `@@index([userId])` | Logged on every mutation |
| Trip | `@@index([agencyId])` | Trip listing, calendar, cron reports |
| Package | `@@index([agencyId])` | Package listing per agency |
| PaymentRecord | `@@index([pilgrimId])` | Payment history lookup |
| PilgrimDocument | `@@index([pilgrimId])` | Document listing per pilgrim |
| Notification | `@@index([userId])`, `@@index([agencyId])` | Notification center queries |
| LoginHistory | `@@index([userId])` | Security audit |
| PointEvent | `@@index([userId, agencyId])` | Gamification leaderboard |
| PilgrimPointEvent | `@@index([pilgrimId])` | Pilgrim gamification |
| PilgrimManasikProgress | `@@index([pilgrimId])` | Manasik progress |
| PilgrimDoaFavorite | `@@index([pilgrimId])` | Doa favorites |
| Agency | `@@index([ppiuStatus, ppiuExpiryDate])` | Cron PPIU auto-suspend |
| ScheduledReport | `@@index([isActive, agencyId])` | Cron scheduled reports |
| AgencyTask | `@@index([agencyId])` | Task management |
| PilgrimBadge | `@@index([pilgrimId])` | Badge lookup |

### Batch 2: Health Check & Monitoring
- **`/api/health`** — DB ping + uptime + memory, untuk Traefik/Docker healthcheck
- **`/api/health/ready`** — Readiness probe (DB connected, cron running)
- Update `docker-compose.yml` healthcheck dari `curl` ke health endpoint

### Batch 3: SEO & Security
- **`src/app/robots.ts`** — Block `/dashboard/*`, `/api/*`, `/command-center/*`, `/pilgrim/*`
- **`src/app/sitemap.ts`** — Public pages: `/`, `/agency/[slug]`, `/verify/*`, `/help`
- **`.env.example`** — Expand dari 20 → 35+ vars with descriptions + required/optional markers

### Batch 4: Image Optimization & Performance
- **`next.config.ts`** `images` config — formats (webp/avif), domains (S3), device sizes
- **Console.error cleanup** — Replace 50+ `console.error` in API routes with `logger.error`

### Batch 5: Tests + Verification
- Unit tests for health endpoint, new index validation
- `npx tsc --noEmit` + `npm run test` + `npm run build`
- `prisma db push` to apply indexes

---

## R. FUTURE STEPS (Beyond Session 14)

1. **Phase 3: Real API** — Connect real API keys (Nusuk, Payment Gateway, WhatsApp, UmrahCash)
2. **Mobile Native** — Flutter app (di luar scope web — separate project)
3. **Production Hardening** — Change SystemAdmin default password, secure JWT_SECRET, SSL certs, TOTP_ENCRYPTION_KEY
4. **E2E Test CI** — Integrate Playwright into CI/CD pipeline
5. **Real Blockchain** — Replace mock tx hash with actual blockchain integration (e.g., Polygon/Base)
6. **Academy Content** — Add real course content, video embeds, seed quiz data
7. **S3 Storage** — Configure STORAGE_DRIVER=s3 with MinIO/S3 bucket for production file storage
8. **Error Monitoring** — Sentry integration for real-time error tracking
9. **API Documentation** — OpenAPI/Swagger auto-generated from Zod schemas
