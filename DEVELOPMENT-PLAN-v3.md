# 🕋 GEZMA Development Plan v3.0

> **Created:** 2026-02-23
> **Last Updated:** 2026-02-25 (Session 11 — Codebase Hardening & Quality)
> **Status:** Phase 1-4 Complete + Session 11 (hardening, 39 models, 415 tests)
> **Scope:** Phase 2 (Platform & Ecosystem) + Phase 3 (Integration) + Phase 4 (Advanced)

---

## 📋 DAFTAR ISI

1. [Status Saat Ini](#1-status-saat-ini)
2. [Development Phases Overview](#2-development-phases-overview)
3. [Phase 2A: Platform Pages](#3-phase-2a-platform-pages)
4. [Phase 2B: Agent Backlog](#4-phase-2b-agent-backlog)
5. [Phase 2C: Gezma Pilgrim (MVP)](#5-phase-2c-gezma-pilgrim-mvp)
6. [Phase 2D: Internal Features](#6-phase-2d-internal-features)
7. [Phase 3: Integrasi](#7-phase-3-integrasi)
8. [Phase 4: Advanced Features](#8-phase-4-advanced-features)
9. [Technical Guidelines](#9-technical-guidelines)
10. [Execution Checklist](#10-execution-checklist)

---

## 1. STATUS SAAT INI

### ✅ Phase 1 — Core Agent Dashboard (100%)

| Modul | Completion | Notes |
|-------|------------|-------|
| **Auth System** | 100% | Login, Register, Email Verify, Forgot Password, Change Password |
| **Dashboard** | 100% | Stats, Alerts, Activity Log, Charts, Customizable Layout, Onboarding Tour |
| **Pilgrims CRM** | 100% | CRUD, Documents, Payments, Status, Timeline, Bulk, Import/Export CSV, QR, Kanban, Notes, Invoice PDF |
| **Packages** | 100% | CRUD, HPP Calculator, Itinerary Builder, Display, Duplicate, Brochure PDF, Package Builder Wizard |
| **Trips** | 100% | CRUD, Manifest CRUD, Room Assignment, Checklist, Print, Calendar View, Waiting List |
| **Reports** | 100% | 5-tab + CSV Export + Comparison Analytics + Scheduled Reports |
| **Settings** | 100% | Theme, Language, Users, Agency, Notifications, Permissions, Security/2FA, Email Templates, Scheduled Reports |
| **AI Assistant** | 100% | Gemini 2.0 Flash integration |
| **PWA** | 100% | Installable, Offline, Service Worker, Update Prompt |
| **Activity Log** | 100% | Dashboard widget + Full page with filter, search, pagination |

### ✅ Phase 2A — Platform Pages (100%)

| Page | Route | Status | Mock Data |
|------|-------|--------|-----------|
| Berita | `/news` | ✅ Done | 10 artikel |
| Akademi | `/academy` | ✅ Done | 12 kursus |
| Layanan | `/services` | ✅ Done | Static |
| Trade Centre | `/trade` | ✅ Done | 20 produk |
| Marketplace | `/marketplace` | ✅ Done | 30 items |
| Forum | `/forum` | ✅ Done | 12 threads |

### ✅ Phase 2B — Agent Backlog (100%)

| Feature | Priority | Status |
|---------|----------|--------|
| Manifest CRUD | HIGH | ✅ Done |
| Status Timeline Visual | MEDIUM | ✅ Done |
| Bulk Actions | MEDIUM | ✅ Done |
| Import CSV Jemaah | MEDIUM | ✅ Done |
| Brochure Generator (PDF) | LOW | ✅ Done |
| Package Duplicate | LOW | ✅ Done |
| QR Verification | LOW | ✅ Done |
| Granular Permissions | LOW | ✅ Done |
| Notification Preferences | LOW | ✅ Done |

### ✅ Phase 2C — Gezma Pilgrim MVP (100%)

| Feature | Status |
|---------|--------|
| Layout + Bottom Nav | ✅ Done |
| Login (booking code, JWT) | ✅ Done |
| Dashboard jemaah | ✅ Done |
| Detail perjalanan | ✅ Done |
| Manasik digital (real DB) | ✅ Done |
| Panduan doa (real DB) | ✅ Done |
| Document Upload | ✅ Done |
| Payment History | ✅ Done |
| Profile & dokumen | ✅ Done |

### ✅ Phase 2D — Internal Features (100%)

| Feature | Status |
|---------|--------|
| Itinerary Display (timeline) | ✅ Done |
| Dashboard Charts (3 Recharts) | ✅ Done |
| Activity Log Full Page | ✅ Done |
| Advanced Reports (5 tab) | ✅ Done |
| CSV Export (server-side) | ✅ Done |

### ✅ Phase 3 — Integrasi Preparation (100%)

| Integration | Status | Notes |
|-------------|--------|-------|
| Nusuk API | ✅ Mock | Service + 3 API + Settings UI |
| Payment Gateway | ✅ Mock | Service + 4 API + Settings UI + Pilgrim invoice |
| WhatsApp | ✅ Mock | Service + 5 API + Settings UI + Broadcast |
| UmrahCash | ✅ Mock | Service + 3 API + Settings UI + Calculator |

### ✅ Phase 4 — Advanced (4/5 Done)

| Feature | Status | Notes |
|---------|--------|-------|
| Gamifikasi | ✅ Done | Point system (8 rules), 11 badges, leaderboard, auto-award via activity logger |
| Command Center | ✅ Done | SystemAdmin auth, agencies CRUD, audit log, PPIU alerts, analytics, compliance, auto-suspend |
| White-label Branding | ✅ Done | Custom colors/logo/title per agency, BrandingProvider, live preview settings |
| Blockchain Verification | ✅ Done | Mock simulation (service + 5 API + dashboard + public verify) |
| Mobile Native | 🔲 Belum | Flutter app (di luar scope Next.js) |

**DB models (39 total):** 24 from Phase 1-4 + 15 new from Session 10
**Session 7:** 24 new files | 8 modified | 2671 insertions
**Session 8:** Blockchain, CC Polish, Academy LMS, 235 unit tests, E2E Playwright
**Session 9:** Error Boundaries, Security Settings, Pilgrim Gamification, CC Analytics, 274 unit tests
**Session 10:** 37 features, 15 new models, ~74 new files, ~21 modified, 15,223 insertions, 330 unit tests
**Session 11:** Codebase hardening — Zod on 16 routes, rate limiting on 7 auth routes, try/catch on 9 routes, logActivity on 13 routes, 5 new schemas, 85 new tests → 415 total (34 files)

---

## 2. DEVELOPMENT PHASES OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                    GEZMA DEVELOPMENT ROADMAP                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1 ✅ DONE                                                │
│  Core Agent (CRM, Packages, Trips, Dashboard, Reports,          │
│  Settings, AI, PWA, Auth)                                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  PHASE 2A ✅ DONE ─── Platform Pages                            │
│  ├── Berita (News)                      ✅                      │
│  ├── Akademi (LMS)                      ✅                      │
│  ├── Layanan (Services)                 ✅                      │
│  ├── Marketplace                        ✅                      │
│  ├── Forum                              ✅                      │
│  ├── Trade Centre                       ✅                      │
│  └── Sidebar Navigation Update          ✅                      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  PHASE 2B ✅ DONE ─── Agent Backlog                             │
│  ├── Manifest CRUD                      ✅                      │
│  ├── Status Timeline Visual             ✅                      │
│  ├── Bulk Actions                       ✅                      │
│  ├── Import CSV Jemaah                  ✅                      │
│  ├── Brochure Generator (PDF)           ✅                      │
│  ├── Package Duplicate                  ✅                      │
│  ├── QR Verification                    ✅                      │
│  ├── Granular Permissions               ✅                      │
│  └── Notification Preferences           ✅                      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  PHASE 2C ✅ DONE ─── Gezma Pilgrim (MVP)                      │
│  ├── Layout + Auth (JWT)                ✅                      │
│  ├── Dashboard + Trip Detail            ✅                      │
│  ├── Manasik Digital (real DB)          ✅                      │
│  ├── Panduan Doa (real DB)              ✅                      │
│  ├── Document Upload                    ✅                      │
│  ├── Payment History                    ✅                      │
│  └── Profile & Documents                ✅                      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  PHASE 2D ✅ DONE ─── Internal Features                        │
│  ├── Itinerary Display (timeline)       ✅                      │
│  ├── Dashboard Charts (Recharts)        ✅                      │
│  ├── Activity Log Full Page             ✅                      │
│  ├── Advanced Reports (5 tab)           ✅                      │
│  └── CSV Export (server-side)           ✅                      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  PHASE 3 ✅ PREP DONE ─── Integrasi (Mock, Siap Connect)      │
│  ├── Nusuk API                          ✅ Mock                 │
│  ├── Payment Gateway                    ✅ Mock                 │
│  ├── WhatsApp API                       ✅ Mock                 │
│  └── UmrahCash (Fintech)               ✅ Mock                 │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  PHASE 4 ✅ ─── Advanced Features (4/5)                        │
│  ├── Gamifikasi                          ✅                    │
│  ├── Command Center (Admin Asosiasi)     ✅                    │
│  ├── White-label Branding                ✅                    │
│  ├── Blockchain Verification             ✅ Mock               │
│  ├── Error Boundaries                    ✅                    │
│  ├── Security Settings                   ✅                    │
│  ├── Pilgrim Gamification                ✅                    │
│  ├── CC Big Data Analytics               ✅                    │
│  └── Mobile Native (Flutter)             🔲 Out of scope      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  SESSION 10 ✅ ─── Mega Feature Session (37 Features)          │
│  ├── Security: Rate Limiting, 2FA/TOTP, Sessions     ✅       │
│  ├── Productivity: Search, Kanban, Calendar, Tasks    ✅       │
│  ├── Agent: Invoice, Email Templates, Waiting List    ✅       │
│  ├── Pilgrim: Packing, Prayer, Currency, Emergency    ✅       │
│  ├── Pilgrim: Gallery, Testimonial, Referral, Room    ✅       │
│  ├── Platform: Notifications, Onboarding, Agency      ✅       │
│  ├── Reports: Scheduled, Export, Comparison           ✅       │
│  ├── Academy: Quiz, Certificates, Reviews             ✅       │
│  ├── CC: Compliance, Auto-suspend                     ✅       │
│  ├── Detail: News, Forum, Marketplace, Help/FAQ       ✅       │
│  ├── Other: Roommate Matching, Package Builder        ✅       │
│  └── Tests: 56 new → 330 total (28 files)            ✅       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  SESSION 11 ✅ ─── Codebase Hardening & Quality                │
│  ├── Zod Validation: 16 routes wired with safeParse   ✅       │
│  ├── Rate Limiting: 7 auth routes protected            ✅       │
│  ├── Error Handling: try/catch on 9 route files        ✅       │
│  ├── Activity Logging: logActivity on 13 mutations     ✅       │
│  ├── Schemas: 5 new Zod validation schemas             ✅       │
│  ├── Password Policy: min(6)→min(8) normalized         ✅       │
│  ├── Cleanup: 3 unused deps removed, zod imports       ✅       │
│  └── Tests: 85 new → 415 total (34 files)             ✅       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. PHASE 2A: PLATFORM PAGES ✅ DONE

### Urutan Eksekusi

| # | Page | Status | Mock Data |
|---|------|--------|-----------|
| 1 | Berita | ✅ Done | 10 artikel — featured, kategori, search, breaking badge |
| 2 | Akademi | ✅ Done | 12 kursus — stats, kategori+level filter, progress, rating |
| 3 | Layanan | ✅ Done | Static — 6 service cards, download, kontak |
| 4 | Trade Centre | ✅ Done | 20 produk — tabs, sertifikasi, stepper pengajuan |
| 5 | Marketplace | ✅ Done | 30 items — category tabs, sort, filter, rating |
| 6 | Forum | ✅ Done | 12 threads — table layout, sort, pinned/hot/solved |
| 7 | Sidebar Update | ✅ Done | Platform section di sidebar |

---

### 3.1 BERITA (News)

**Referensi Desain:** Portal berita modern (Kompas.com style, tapi lebih clean)

**Struktur Folder:**
```
src/
├── app/(dashboard)/news/
│   └── page.tsx              # Halaman utama berita
└── data/
    └── mock-news.ts          # Mock data berita
```

**Kategori:**
- Semua
- Regulasi (📜) - Update Saudi/Kemenag
- Pengumuman (📢) - Info GEZMA
- Event (📅) - Webinar, gathering
- Tips & Artikel (💡) - Edukasi
- Peringatan (⚠️) - Scam alert, warning

**Komponen UI:**
- Featured/Headline section (1 besar + 1 kecil)
- Category pills (horizontal scroll)
- Search bar
- Article list dengan emoji thumbnail, category badge, title + excerpt, read time
- Breaking news badge (merah)
- Official badge untuk artikel GEZMA

---

### 3.2 AKADEMI (Academy/LMS)

**Referensi Desain:** Udemy-style course catalog

**Komponen UI:**
- Stats bar (Total kursus, Terdaftar, Lulus, Sertifikat)
- Category pills + Level filter (Pemula/Menengah/Lanjutan)
- Search bar
- Course grid cards: emoji thumbnail, level badge, rating stars, progress bar

---

### 3.3 LAYANAN (Services)

**Struktur:** Static page — 6 service cards, download dokumen section, contact section

---

### 3.4 TRADE CENTRE (Ekspor Produk)

**Komponen UI:**
- Stats bar + Tabs: Katalog Produk | Pengajuan Saya
- Category pills + search
- Product grid: certification badges (Halal, BPOM, SNI), MOQ, target market
- Pengajuan: CTA banner, 5-step proses kurasi

---

### 3.5 MARKETPLACE (B2B Supply)

**Kategori:** Hotel, Visa, Bus & Handling, Asuransi, Mutawwif, Tiket Pesawat

**Komponen UI:**
- Category tabs + search + sort + filter panel (city, rating, price)
- Product grid: badge, vendor, rating, tags, price + CTA

---

### 3.6 FORUM (Komunitas)

**Komponen UI:**
- Thread table layout (Flexbox)
- Category pills + search + sort (Terbaru/Terpanas/Top)
- Pinned, hot, solved badges
- Pagination

---

## 4. PHASE 2B: AGENT BACKLOG ✅ DONE

### 4.1 MANIFEST CRUD ✅

**API Endpoints:**
- `POST /api/trips/[id]/manifest` — Add pilgrim
- `PATCH /api/trips/[id]/manifest` — Update room
- `DELETE /api/trips/[id]/manifest` — Remove pilgrim

**UI:** Modal add, inline room edit, remove button di trip detail

---

### 4.2 STATUS TIMELINE VISUAL ✅

**API:** `GET /api/pilgrims/[id]/history`

**UI:** Horizontal progress bar + vertical timeline di pilgrim detail

---

### 4.3 BULK ACTIONS ✅

**API:** `POST /api/pilgrims/bulk`

**UI:** Checkboxes + floating action bar (update status, assign trip, delete)

---

### 4.4 IMPORT CSV JEMAAH ✅

**API:** `POST /api/pilgrims/import`

**UI:** 3-step modal (upload → preview & mapping → validate & import), template download

---

### 4.5 BROCHURE GENERATOR (PDF) ✅

**Library:** jsPDF + jspdf-autotable

**UI:** "Generate Brosur" button di package detail → download PDF

---

### 4.6 PACKAGE DUPLICATE ✅

Clone paket dengan "(Copy)" suffix, isActive=false

---

### 4.7 QR VERIFICATION ✅

Generate QR per jemaah, public verify page di `/verify/[code]`

Env var: `NEXT_PUBLIC_APP_URL`

---

### 4.8 GRANULAR PERMISSIONS ✅

25 permissions, role matrix (owner/admin/staff/marketing), per-user overrides, API guards via `checkPermission()`, UI gates via `usePermission()`

---

### 4.9 NOTIFICATION PREFERENCES ✅

5 kategori × 3 channel, toggle grid UI, `NotificationPreference` model

---

### Session 5 — Review & Bug Fix (28 Issues)

Comprehensive code review fixing 4 CRITICAL + 8 HIGH + 8 MEDIUM + 8 LOW issues across 43 files.

---

## 5. PHASE 2C: GEZMA PILGRIM (MVP) ✅ DONE

### Overview

App terpisah untuk jemaah (route group `(pilgrim)`) dengan layout mobile-first, bottom nav, green theme (#059669).

### Struktur

```
src/app/(pilgrim)/
├── layout.tsx           # Bottom nav (6 items) + top nav (desktop)
├── pilgrim/
│   ├── login/page.tsx   # Login dengan booking code (JWT 30-day)
│   ├── page.tsx         # Dashboard: welcome, status progress, payment summary
│   ├── trip/page.tsx    # Countdown, flight, hotels, itinerary
│   ├── manasik/page.tsx # 8 materi dari DB, progress tracking
│   ├── doa/page.tsx     # 16 doa dari DB, favorit persisten
│   ├── documents/page.tsx  # Upload per doc type, status badge
│   ├── payments/page.tsx   # Full timeline, progress bar, summary
│   └── profile/page.tsx    # Data pribadi, kontak, dokumen, logout
```

### Auth System

- `src/lib/auth-pilgrim.ts` — sign/verify `pilgrim_token` cookie (30-day)
- 5 API endpoints: login, me, logout, documents (GET/POST)
- `PilgrimContext` with `refreshData()` callback

### Data

- Real database via Prisma (Pilgrim, PilgrimDocument, PaymentRecord, ManasikLesson, DoaPrayer)
- `pilgrim-portal.service.ts` — DB rows → PilgrimPortalData transformer

---

## 6. PHASE 2D: INTERNAL FEATURES ✅ DONE

7 fitur high-impact tanpa API key external (Session 6):

### 6.1 Itinerary Display ✅

- Vertical timeline di package detail page
- City badges warna-coded: Makkah (emerald), Madinah (blue), Jeddah (amber)
- Day circles (H-1, H-2...) + activities list

### 6.2 Document Upload (Pilgrim) ✅

- `POST /api/pilgrim-portal/documents` — FormData upload, local filesystem
- `GET /api/pilgrim-portal/documents` — List fresh from DB
- Page: grid cards per doc type, status badge, upload button, progress bar
- Validation: JPG/PNG/WebP/PDF, max 5MB

### 6.3 Payment History (Pilgrim) ✅

- Full page at `/pilgrim/payments`
- Progress bar with percentage, 3 summary cards (Total/Paid/Remaining)
- Payment timeline with colored type badges

### 6.4 Dashboard Charts ✅

- `GET /api/dashboard/charts` — 3 datasets from real DB
- `RevenueChart` — LineChart (12 bulan, PaymentRecord grouped by month)
- `PilgrimStatusChart` — PieChart donut (count per status)
- `TripCapacityChart` — BarChart (capacity vs registered per trip)

### 6.5 Activity Log Full Page ✅

- `/activities` route with PageHeader
- Type filter dropdown + search input
- Paginated list with color-coded dots, action badges, timeAgo
- API updated: `page`, `limit`, `type`, `search` query params

### 6.6 Advanced Reports (5 Tab) ✅

- **Keuangan:** Revenue, Outstanding, Collection Rate, Breakdown, Trend chart
- **Demografi:** Gender pie chart, age bar chart, top 10 provinsi
- **Dokumen:** Per-type completion rate, stacked progress bars
- **Aging:** Aging buckets (0-30, 31-60, 61-90, 90+), top 10 debtors
- **Funnel:** Conversion funnel (lead → completed), percentage bars
- Export CSV per tab

### 6.7 CSV Export ✅

- `src/lib/csv-export.ts` — `generateCSV()` + `downloadCSV()` with UTF-8 BOM
- `GET /api/pilgrims/export` — Server-side, 15 columns
- `GET /api/reports/financial/export` — Payments, 7 columns

**Total Session 6:** 15 new files, 11 modified files, 1926 insertions

---

## 7. PHASE 3: INTEGRASI ✅ PREP DONE

Semua menggunakan mock data. Siap connect real API ketika key tersedia.

### 7.1 NUSUK API

**Service:** `src/lib/services/nusuk.service.ts`
**API:** 3 endpoints (config, hotels, visa)
**UI:** Settings config page + hotel/visa detail

**When Real API Available:**
- Hotel inventory sync
- Visa submission
- Status tracking

---

### 7.2 PAYMENT GATEWAY

**Service:** `src/lib/services/payment-gateway.service.ts`
**API:** 4 endpoints (config, invoices, webhook, status)
**UI:** Settings config + pilgrim invoice page

**Provider Options:** Midtrans, Xendit, atau Duitku

**Features (Ready):**
- Virtual Account, QRIS, Credit Card, E-Wallet
- Auto-update payment status via webhook
- Receipt generation

---

### 7.3 WHATSAPP API

**Service:** `src/lib/services/whatsapp.service.ts`
**API:** 5 endpoints (config, test, send, broadcast, templates)
**UI:** Settings config + trip broadcast page

**Provider Options:** Fonnte, Wablas, atau official WhatsApp Business API

---

### 7.4 UMRAHCASH (Fintech)

**Service:** `src/lib/services/umrahcash.service.ts`
**API:** 3 endpoints (config, rate, transfer)
**UI:** Settings config + calculator page

---

## 8. PHASE 4: ADVANCED FEATURES (4/5 Done)

### Session 7 — Gamifikasi + Command Center + White-label (2026-02-24)

| Feature | Complexity | Status | Notes |
|---------|------------|--------|-------|
| **Gamifikasi** | HIGH | ✅ Done | 8 point rules, 11 badges, leaderboard, auto-award via activity logger |
| **Command Center** | MEDIUM | ✅ Done | SystemAdmin model, independent JWT auth (cc_token), blue layout, agencies CRUD |
| **White-label Branding** | MEDIUM | ✅ Done | Custom primaryColor/logo/title per agency, BrandingProvider, theme override |

### Session 8 — Blockchain + CC Polish + Academy LMS + Tests (2026-02-24)

| Feature | Complexity | Status | Notes |
|---------|------------|--------|-------|
| **Blockchain Verification** | HIGH | ✅ Done | Mock simulation — service + 5 API + dashboard page + public verify |
| **Command Center Polish** | MEDIUM | ✅ Done | Audit log UI page, responsive layout fixes, PPIU expiry alerts |
| **Academy LMS** | MEDIUM | ✅ Done | Full implementation — DB models, API (5 endpoints), seed data, course detail page |
| **Unit Tests** | MEDIUM | ✅ Done | 235 total (was ~151), 6 new test files |
| **E2E Tests** | MEDIUM | ✅ Done | Playwright setup, 5 spec files |
| Mobile Native | HIGH | 🔲 | Flutter app (di luar scope Next.js) |
| Paket Modular | MEDIUM | 🔲 | Umrah backpacker, component-based |
| Tabungan Umrah | HIGH | 🔲 | Fintech partnership needed |
| PayLater Syariah | HIGH | 🔲 | Lembaga keuangan partnership |

### 8.1 GAMIFIKASI ✅

**DB Models:** `PointEvent`, `UserBadge`, `AgencyLeaderboard` + extended `User` (totalPoints, level) + `Agency` (totalPoints)

**Point System (8 rules):**
| Action | Points |
|--------|--------|
| Tambah jemaah | +10 |
| Jemaah lunas | +25 |
| Jemaah completed | +50 |
| Buat paket | +15 |
| Buat trip | +20 |
| Upload dokumen | +5 |
| Catat pembayaran | +10 |
| Jemaah departed | +30 |

**11 Badges:** first_pilgrim, pilgrim_10/50/100, first_trip, trip_master, first_package, revenue_10m/100m, level_5/10

**Files:**
- `src/lib/services/gamification.service.ts` — awardPoints, checkAndAwardBadges, calculateLevel, getLeaderboard
- `src/lib/validations/gamification.ts` — Zod schemas
- `src/app/api/gamification/` — 4 endpoints (stats, badges, leaderboard, history)
- `src/app/(dashboard)/gamification/page.tsx` — Full page (stats, badges, leaderboard, history)
- `src/lib/activity-logger.ts` — Modified: auto-award points on every logged action

---

### 8.2 COMMAND CENTER ✅

**DB Model:** `SystemAdmin` (terpisah dari User, bukan multi-tenant)

**Auth:** `cc_token` cookie (httpOnly, 7 days), independent JWT sign/verify

**API Endpoints (8):**
```
POST /api/command-center/auth/login
GET  /api/command-center/auth/me
POST /api/command-center/auth/logout
GET  /api/command-center/agencies
GET  /api/command-center/agencies/[id]
PATCH /api/command-center/agencies/[id]
GET  /api/command-center/stats
GET  /api/command-center/audit-log
GET  /api/command-center/alerts              ← NEW (Session 8)
```

**UI Pages (6):**
- `(command-center)/layout.tsx` — Independent layout, blue theme (#2563EB), dark sidebar
- `command-center/login/page.tsx` — Admin login
- `command-center/page.tsx` — Dashboard (global stats, recent agencies)
- `command-center/agencies/page.tsx` — Agency list (search, status filter, pagination)
- `command-center/agencies/[id]/page.tsx` — Agency detail (info, users, approve/suspend)
- `command-center/audit-log/page.tsx` — Audit log (filters, search, pagination) ← NEW (Session 8)

**Default Admin:** `admin@gezma.id` / `admin123!`

---

### 8.3 WHITE-LABEL BRANDING ✅

**Extended Agency Model:** +secondaryColor, faviconUrl, logoLightUrl, logoDarkUrl, appTitle

**Files:**
- `src/lib/theme/color-utils.ts` — lighten, darken, hexToRgba
- `src/lib/contexts/branding-context.tsx` — BrandingProvider + useBranding hook
- `src/lib/theme/index.tsx` — Modified: accepts branding override for dynamic primary color
- `src/components/layout/sidebar.tsx` — Modified: uses branding logo + appTitle
- `src/app/(dashboard)/layout.tsx` — Modified: wraps with BrandingProvider
- `src/app/(dashboard)/settings/branding/page.tsx` — Color picker, logo URLs, live preview
- `src/app/api/agency/route.ts` — Modified: PUT accepts branding fields

---

### 8.4 BLOCKCHAIN VERIFICATION ✅

**Service:** `src/lib/services/blockchain.service.ts` — Mock blockchain simulation (hash generation, certificate chain)

**API Endpoints (5):**
```
GET    /api/blockchain/certificates     — List certificates (by agency)
POST   /api/blockchain/certificates     — Issue new certificate
GET    /api/blockchain/certificates/[id] — Certificate detail
POST   /api/blockchain/certificates/[id]/verify — Verify certificate
GET    /api/verify/blockchain/[hash]    — Public verification page
```

**UI:**
- `(dashboard)/blockchain/page.tsx` — Dashboard: stats, certificate list, issue new
- `verify/blockchain/[hash]/page.tsx` — Public verify page (no auth needed)

---

### 8.5 ACADEMY LMS ✅

**DB Models:** `AcademyCourse`, `AcademyLesson`, `AcademyCourseProgress`, `AcademyQuiz`, `AcademyQuizQuestion`, `AcademyQuizAttempt`, `AcademyCourseReview`

**API Endpoints (10):**
```
GET  /api/academy/courses              — List courses
GET  /api/academy/courses/[id]         — Course detail + lessons
GET  /api/academy/courses/[id]/lessons/[lessonId] — Lesson content
POST /api/academy/progress             — Mark lesson complete
GET  /api/academy/progress             — User progress
GET  /api/academy/[courseId]/quiz       — Quiz + questions (S10)
POST /api/academy/[courseId]/quiz/attempt — Submit quiz attempt (S10)
GET  /api/academy/[courseId]/certificate — Download certificate PDF (S10)
GET  /api/academy/[courseId]/reviews    — Course reviews + avg rating (S10)
POST /api/academy/[courseId]/reviews    — Submit review (S10)
```

**UI:**
- `(dashboard)/academy/[id]/page.tsx` — Course detail with lessons, reviews, quiz/cert buttons
- `(dashboard)/academy/[id]/quiz/page.tsx` — Quiz UI, one question at a time, result screen (S10)
- `(dashboard)/academy/page.tsx` — Avg star rating on course cards (S10)
- Seed data: courses + lessons

---

### 8.6 COMMAND CENTER POLISH ✅

**New UI:**
- `(command-center)/audit-log/page.tsx` — Full audit log page with filters
- Responsive layout improvements across all CC pages
- PPIU expiry alert system

**New API:**
```
GET /api/command-center/alerts         — PPIU expiry alerts
```

---

### 8.7 TESTING ✅

**Unit Tests (235 total):**
- 6 new test files added in Session 8
- Coverage across services, API routes, and utilities

**E2E Tests (Playwright):**
- Playwright configuration + setup
- 5 spec files covering core user flows

---

### Session 9 — Error Boundaries + Security + Pilgrim Gamification + CC Analytics (2026-02-24)

| Feature | Complexity | Status | Notes |
|---------|------------|--------|-------|
| **Error Boundaries** | LOW | ✅ Done | Pilgrim (green) + CC (blue) error boundaries, integrated into layouts |
| **Security Settings** | MEDIUM | ✅ Done | Login history recording, change password, login history API, security page |
| **Pilgrim Gamification** | HIGH | ✅ Done | 6 point rules, 6 badges, achievements page, dashboard widget, 3 API endpoints |
| **CC Big Data Analytics** | MEDIUM | ✅ Done | Analytics API (5 datasets), 4 Recharts (Line, Bar, Pie, Area), period filter |
| **Unit Tests** | LOW | ✅ Done | 39 new tests → 274 total, 20 test files |

### 8.8 ERROR BOUNDARIES ✅

**Files:**
- `src/components/pilgrim-error-boundary.tsx` — React class error boundary, green theme (#059669), "Coba Lagi" reset
- `src/components/cc-error-boundary.tsx` — React class error boundary, blue theme (#2563EB), "Muat Ulang" reset
- `src/app/(pilgrim)/layout.tsx` — Wrapped children with PilgrimErrorBoundary
- `src/app/(command-center)/layout.tsx` — Wrapped children with CCErrorBoundary

---

### 8.9 SECURITY SETTINGS ✅

**DB Model:** `LoginHistory` (id, userId, ipAddress?, userAgent?, loginAt, logoutAt?)

**Login Recording:** Modified `POST /api/auth/login` to capture IP (x-forwarded-for / x-real-ip) + user agent → create LoginHistory record

**API Endpoints (2):**
```
GET  /api/settings/security/login-history    — Paginated login history
POST /api/settings/security/change-password  — Change password (old + new + confirm)
```

**Validation:** `src/lib/validations/security.ts` — changePasswordSchema (Zod refine for password match), loginHistoryQuerySchema

**UI:** `src/app/(dashboard)/settings/security/page.tsx` — Change password form + login history table + pagination + security tips

---

### 8.10 PILGRIM GAMIFICATION ✅

**DB Models:** `PilgrimPointEvent`, `PilgrimBadge` (separate from agent gamification)

**Point System (6 rules):**
| Action | Points |
|--------|--------|
| complete_lesson | +10 |
| complete_course | +50 |
| daily_login | +5 |
| update_profile | +15 |
| upload_document | +20 |
| favorite_doa | +5 |

**6 Badges:** langkah_pertama, pelajar_rajin, hafiz_doa, siap_berangkat, ilmu_mantap, profil_lengkap

**Service:** `src/lib/services/pilgrim-gamification.service.ts` — awardPilgrimPoints, checkAndAwardPilgrimBadges, getPilgrimStats, calculatePilgrimLevel

**API Endpoints (3):**
```
GET /api/pilgrim-portal/gamification/stats    — Points, level, badges
GET /api/pilgrim-portal/gamification/history  — Point event history (paginated)
GET /api/pilgrim-portal/gamification/badges   — All badges (earned + locked)
```

**Hooked Into Existing Endpoints:**
- `POST /api/pilgrim-portal/doa/favorites` — +5 points
- `POST /api/pilgrim-portal/manasik/progress` — +10 points
- `POST /api/pilgrim-portal/documents` — +20 points

**UI:**
- `src/app/(pilgrim)/pilgrim/achievements/page.tsx` — Stats bar, badge grid (earned/locked), recent point history
- `src/app/(pilgrim)/pilgrim/page.tsx` — Gamification widget card (level, points, badges)
- Layout: Added "Pencapaian" nav item (trophy icon) to pilgrim bottom nav (7 items total)

---

### 8.11 CC BIG DATA ANALYTICS ✅

**API Endpoint:**
```
GET /api/command-center/analytics?period=30d
```
Returns: pilgrimGrowth, agencyPerformance, tripStats, revenueEstimate, categoryBreakdown

**UI:** Enhanced `(command-center)/command-center/page.tsx`:
- Period filter buttons (7d, 30d, 90d, 1y)
- LineChart: Pilgrim growth trend
- BarChart (horizontal): Top agencies by pilgrim count
- PieChart: Trip status distribution
- AreaChart: Monthly revenue estimate
- All charts use CC blue palette via `useTheme()`

---

### 8.12 SESSION 9 TESTING ✅

**New Test Files (3):**
- `__tests__/services/pilgrim-gamification.test.ts` — 23 tests (calculatePilgrimLevel, PILGRIM_POINT_RULES, PILGRIM_BADGE_DEFINITIONS)
- `__tests__/auth/login-history.test.ts` — 5 tests (record structure, null fields, IP format, date validation)
- `__tests__/validations/security.test.ts` — 11 tests (changePasswordSchema, loginHistoryQuerySchema)

**Total: 274 tests in 20 files (was 235 in 17 files)**

---

### Session 10 — Mega Feature Session: 37 Features (2026-02-25)

| Batch | Features | Status |
|-------|----------|--------|
| **Prisma Schema** | 15 new models + field additions (24 → 39 models) | ✅ Done |
| **Batch 1: Security** | Rate Limiting, 2FA/TOTP, Session Management | ✅ Done |
| **Batch 2: Productivity Core** | Global Search/Cmd Palette, Kanban Pilgrim, Calendar Trips, Notes, Tasks | ✅ Done |
| **Batch 3: Productivity Ext** | Invoice PDF, Email Templates, Waiting List | ✅ Done |
| **Batch 4: Pilgrim Portal** | Packing, Prayer Times, Currency, Emergency, Itinerary Sharing, Gallery, Testimonial | ✅ Done |
| **Batch 5: Platform & Marketing** | Referral, Public Agency Profile, Onboarding Tour, Notification Center | ✅ Done |
| **Batch 6: Data & Reporting** | Customizable Dashboard, Scheduled Reports, Data Export, Comparison Analytics | ✅ Done |
| **Batch 7: Academy** | Quiz & Assessment, Certificate Generator, Course Rating & Review | ✅ Done |
| **Batch 8: Command Center** | Compliance Dashboard, Auto-block Expired PPIU | ✅ Done |
| **Batch 9: Detail Pages** | News/Forum/Marketplace detail pages, Help/FAQ | ✅ Done |
| **Batch 10: Other** | Roommate Matching, Package Builder Wizard | ✅ Done |
| **Batch 11: Navigation** | Sidebar (Tasks, Notifications), Middleware, Pilgrim nav, CC nav | ✅ Done |
| **Batch 12: Unit Tests** | 8 new test files, 56 new tests → 330 total in 28 files | ✅ Done |

### 8.13 NEW PRISMA MODELS (Session 10) ✅

15 new models added:
```
PilgrimNote, AgencyTask, EmailTemplate, WaitingList, PilgrimPhoto,
PilgrimTestimonial, Referral, Notification, ScheduledReport,
AcademyQuiz, AcademyQuizQuestion, AcademyQuizAttempt,
AcademyCourseReview, RoommatePreference
```

New fields on existing models:
- User: +totpSecret, +totpEnabled, +onboardingCompleted
- LoginHistory: +sessionToken, +isActive
- Agency: +slug @unique
- Trip: +shareCode @unique

### 8.14 SECURITY & AUTH (Session 10) ✅

**Rate Limiting:** `src/lib/rate-limiter.ts` — In-memory sliding window, per IP+route, configurable limit/window

**2FA/TOTP:** `src/lib/services/totp.service.ts` — otplib + AES-256-GCM encryption
```
POST /api/settings/security/totp/setup    — Generate secret + QR
POST /api/settings/security/totp/verify   — Verify & enable 2FA
POST /api/settings/security/totp/disable  — Disable 2FA
POST /api/auth/totp-verify                — Verify TOTP during login
```

**Session Management:**
```
GET    /api/settings/security/sessions    — List active sessions
DELETE /api/settings/security/sessions    — Revoke session
```

### 8.15 AGENT PRODUCTIVITY (Session 10) ✅

**Global Search / Command Palette:** `src/components/shared/command-palette.tsx` — Ctrl+K, debounced search, keyboard nav
**Kanban Board:** Pilgrim page alternate view, 8-column DnD, PATCH status on drop
**Calendar View:** Trip page alternate view, custom month grid, trip dots
**Internal Notes:** `POST/GET /api/pilgrims/[id]/notes`, author tracking
**Task Management:** `src/app/(dashboard)/tasks/page.tsx` — 3-column Kanban, CRUD API
**Invoice PDF:** `src/lib/services/invoice.service.ts` — jsPDF, "LUNAS" watermark
**Email Templates:** Per-event templates (welcome/payment_reminder/departure_reminder), variable interpolation
**Waiting List:** Per-trip when at capacity, add/remove entries
**Notification Center:** Bell badge, dropdown, full page, mark read, filter

### 8.16 PILGRIM PORTAL ENHANCEMENT (Session 10) ✅

7 new pages + 2 new API groups:
- `/pilgrim/packing` — 7 category checklist, localStorage, custom items, progress bar
- `/pilgrim/currency` — IDR ↔ SAR converter, editable rate
- `/pilgrim/emergency` — KBRI, KJRI, RS, police, ambulance, Kemenag hotline
- `/pilgrim/gallery` — Photo upload/list/delete with captions
- `/pilgrim/roommate` — Preference form + matching algorithm
- Itinerary sharing: `/share/itinerary/[code]` (public)
- Testimonial: Star rating + comment for completed trips
- Referral: Generate/share code, bonus points

Prayer Times Widget: `src/lib/utils/prayer-times.ts` — Astronomical calculation, Makkah/Madinah

### 8.17 PLATFORM & MARKETING (Session 10) ✅

- Public Agency Profile: `/agency/[slug]` — packages, testimonials, stats (no auth)
- Onboarding Tour: `src/components/shared/onboarding-tour.tsx` — step highlight overlay
- Customizable Dashboard: Widget show/hide, edit mode, localStorage persist
- Data Export: JSON export of all agency data
- Comparison Analytics: Period comparison, delta indicators
- Scheduled Reports: Configure frequency, type, email recipients

### 8.18 PLATFORM DETAIL PAGES (Session 10) ✅

- `/news/[id]` — Full article, related articles
- `/forum/[id]` — Full thread, mock replies
- `/marketplace/[id]` — Full item display, related items
- `/help` — 25 FAQs in 5 categories, searchable, accordion

### 8.19 COMMAND CENTER ENHANCEMENT (Session 10) ✅

**Compliance Dashboard:** `/command-center/compliance` — Weighted score (PPIU 40%, docs 30%, activity 20%, verified 10%), color-coded
**Auto-suspend:** `POST /api/command-center/auto-suspend` — Find & suspend expired PPIU agencies

### 8.20 SESSION 10 TESTING ✅

**New Test Files (8):**
- `rate-limiter.test.ts` — 6 tests (sliding window, IP/route isolation)
- `notification.test.ts` — 5 tests (createNotification structure)
- `totp.test.ts` — 6 tests (encrypt/decrypt, format, generate, verify)
- `invoice.test.ts` — 3 tests (PDF generation with mocked jsPDF)
- `task.test.ts` — 12 tests (Zod schema validation)
- `email-template.test.ts` — 9 tests (Zod schema validation)
- `prayer-times.test.ts` — 6 tests (calculation, format, chronology, next prayer)
- `academy-quiz.test.ts` — 9 tests (scoring, pass/fail, edge cases)

**Total: 330 tests in 28 files (was 274 in 20 files)**

---

### 8.21 Session 11 — Batch 1: Foundation (Activity Logger + Password + Schemas)

**Activity Logger Types Extended:**
- `src/lib/activity-logger.ts` — type union: added `user | agency | settings | system`; action union: added `revoked | sent`

**Password Policy Fix:**
- `src/lib/validations/security.ts` — `resetPasswordSchema` min(6) → min(8)
- `src/app/api/auth/reset-password/route.ts` — hardcoded `length < 6` → `length < 8`

**New Zod Schemas (5):**
- `src/lib/validations/note.ts` — `createNoteSchema` (content min 1, max 2000)
- `src/lib/validations/waiting-list.ts` — `createWaitingListSchema` (pilgrimName, phone, email?, notes?)
- `src/lib/validations/notification.ts` — `createNotificationSchema` (title, body, type enum, userId)
- `src/lib/validations/scheduled-report.ts` — `createScheduledReportSchema` + `updateScheduledReportSchema`
- `src/lib/validations/academy-review.ts` — `createReviewSchema` (rating 1-5, comment?)

### 8.22 Session 11 — Batch 2: Zod Validation on 16 Routes

Wired `safeParse()` + `error.flatten().fieldErrors` on:
- `api/users/route.ts` POST, `api/users/[id]/route.ts` PUT
- `api/pilgrims/[id]/payments/route.ts` POST, `api/pilgrims/[id]/notes/route.ts` POST
- `api/trips/[id]/waiting-list/route.ts` POST
- `api/settings/scheduled-reports/route.ts` POST, `api/settings/scheduled-reports/[id]/route.ts` PATCH
- `api/academy/[courseId]/reviews/route.ts` POST
- `api/pilgrim-portal/testimonial/route.ts` POST (inline schema)
- `api/pilgrim-portal/gallery/route.ts` POST (inline schema)
- `api/pilgrim-portal/referral/use/route.ts` POST (inline schema)
- `api/pilgrim-portal/roommate/route.ts` POST (inline schema)
- Verified existing wiring on email-templates and change-password routes

### 8.23 Session 11 — Batch 3: Rate Limiting on 7 Auth Routes

Added `rateLimit(req, { limit, window })` to:
- `api/auth/register/route.ts` — 3 req/60s
- `api/auth/forgot-password/route.ts` — 3 req/60s
- `api/auth/reset-password/route.ts` — 5 req/60s
- `api/auth/totp-verify/route.ts` — 5 req/60s
- `api/command-center/auth/login/route.ts` — 5 req/60s
- `api/pilgrim-portal/login/route.ts` — 5 req/60s
- `api/settings/security/change-password/route.ts` — 3 req/60s

### 8.24 Session 11 — Batch 4: try/catch + logActivity

**try/catch on 9 route files:**
- academy/courses, academy/courses/[id], academy/courses/[id]/lessons/[lessonId]
- academy/progress, academy/progress/[courseId]
- pilgrims/[id]/invoice, settings/email-templates, settings/email-templates/[event]
- trips/[id]/waiting-list

**logActivity on 13 mutation routes:**
- users POST/PUT/DELETE, agency PUT, pilgrims/[id]/notes POST
- settings/email-templates POST/PATCH, settings/scheduled-reports POST/PATCH/DELETE
- blockchain/certificates/[id]/revoke POST, reports/send-scheduled POST
- trips/[id]/waiting-list POST

### 8.25 Session 11 — Batch 5: Cleanup + Tests

**Cleanup:**
- Removed unused deps: `class-variance-authority`, `@tanstack/react-table`, `dotenv`
- Normalized `zod/v4` → `zod` imports in `command-center.ts`, `gamification.ts`

**New Test Files (6, 85 tests):**
- `new-schemas.test.ts` — 34 tests (all 5 new schemas + updated security)
- `auth.test.ts` — 10 tests (rate limiting + validation on login/register/forgot/reset)
- `users.test.ts` — 9 tests (CRUD validation, auth guard, Zod errors, logActivity)
- `pilgrims-extended.test.ts` — 10 tests (notes, payments, invoice validation)
- `academy.test.ts` — 11 tests (courses, lessons, reviews, progress)
- `settings.test.ts` — 10 tests (email-templates, scheduled-reports, change-password)

**Total: 415 tests in 34 files (was 330 in 28 files)**

---

## 9. TECHNICAL GUIDELINES

### 9.1 Styling Rules

**WAJIB: 100% Inline Styles**

```tsx
// ✅ BENAR
<div style={{
  padding: '16px',
  backgroundColor: 'white',
  borderRadius: '12px'
}}>

// ❌ SALAH - Sering ter-override
<div className="p-4 bg-white rounded-lg">
```

**Alasan:** Tailwind classes sering ter-override oleh component library atau stylesheet lain.

---

### 9.2 Component Patterns

**Page Header:**
```tsx
<div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
  <div>
    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
      Page Title
    </h1>
    <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
      Description text
    </p>
  </div>
  {/* Content */}
</div>
```

**Card Grid:**
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '16px'
}}>
  {items.map(item => <Card key={item.id} />)}
</div>
```

---

### 9.3 Mock Data Structure

**Location:** `src/data/mock-*.ts`

**Pattern:**
```typescript
export type CategoryType = 'cat1' | 'cat2' | 'cat3';
export interface Item { id: string; name: string; category: CategoryType; }
export const categories = [ { id: 'cat1', label: 'Category 1', icon: '📦', color: '#2563EB' } ];
export const stats = { totalItems: 100 };
export const items: Item[] = [ /* ... */ ];
```

---

### 9.4 File Naming

```
Pages:         page.tsx (Next.js convention)
Components:    kebab-case.tsx (e.g., rooming-list.tsx)
Mock Data:     mock-{domain}.ts (e.g., mock-forum.ts)
Services:      {domain}.service.ts
Types:         {domain}.ts atau index.ts
```

---

### 9.5 API Patterns

```typescript
// Auth check
const auth = await getAuthPayload(req);
if (!auth) return unauthorizedResponse();

// Permission check
const allowed = await checkPermission(auth, 'pilgrims.create');
if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

// Validation
const result = schema.safeParse(body);
if (!result.success) return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });

// Activity logging
await logActivity({ agencyId: auth.agencyId, userId: auth.userId, ... });
```

---

## 10. EXECUTION CHECKLIST

### Phase 2A: Platform Pages ✅

```
✅ BERITA — mock-news.ts + page.tsx + kategori + search + responsive
✅ AKADEMI — mock-academy.ts + page.tsx + kategori + level + search + responsive
✅ LAYANAN — page.tsx (static) + semua section + responsive
✅ TRADE CENTRE — mock-trade.ts + page.tsx + tabs + kategori + search + responsive
✅ MARKETPLACE — mock-marketplace.ts + page.tsx + tabs + filter + sort + search + responsive
✅ FORUM — mock-forum.ts + page.tsx + kategori + sort + search + table layout + responsive
✅ SIDEBAR UPDATE — Platform section added
```

### Phase 2B: Agent Backlog ✅

```
✅ MANIFEST CRUD — 3 API endpoints + modal add + inline edit + remove
✅ STATUS TIMELINE — API + horizontal progress + vertical timeline
✅ BULK ACTIONS — Checkboxes + floating bar + API
✅ IMPORT CSV — 3-step modal + preview + validation + API
✅ BROCHURE GENERATOR — jsPDF + autotable + download button
✅ PACKAGE DUPLICATE — Clone with "(Copy)" suffix
✅ QR VERIFICATION — Generate QR + public verify page
✅ GRANULAR PERMISSIONS — 25 perms + role matrix + API guards + UI gates
✅ NOTIFICATION PREFERENCES — 5×3 grid + DB model + API
✅ SESSION 5 REVIEW — 28 bug fixes (4 critical + 8 high + 8 medium + 8 low)
```

### Phase 2C: Gezma Pilgrim MVP ✅

```
✅ LAYOUT — Bottom nav 6 items + top nav desktop + green theme
✅ AUTH — JWT pilgrim_token (30-day) + booking code login
✅ DASHBOARD — Welcome + status progress + payment summary + docs
✅ TRIP DETAIL — Countdown + flight + hotels + itinerary
✅ MANASIK — 8 materi dari DB + progress tracking API
✅ DOA — 16 doa dari DB + favorit API
✅ DOCUMENT UPLOAD — Upload per type + status badge + progress
✅ PAYMENT HISTORY — Timeline + progress bar + summary cards
✅ PROFILE — Data pribadi + kontak + dokumen + logout
```

### Phase 2D: Internal Features ✅

```
✅ ITINERARY DISPLAY — Vertical timeline + city badges di package detail
✅ DASHBOARD CHARTS — 3 Recharts (Line, Pie, Bar) + API endpoint
✅ ACTIVITY LOG PAGE — Full page + type filter + search + pagination
✅ ADVANCED REPORTS — 5-tab (Keuangan, Demografi, Dokumen, Aging, Funnel)
✅ CSV EXPORT — Server-side UTF-8 BOM + pilgrims + payments endpoints
```

### Phase 3: Integrasi (Preparation) ✅

```
✅ NUSUK — Service + 3 API + Settings UI (mock)
✅ PAYMENT GATEWAY — Service + 4 API + Settings UI + Invoice (mock)
✅ WHATSAPP — Service + 5 API + Settings UI + Broadcast (mock)
✅ UMRAHCASH — Service + 3 API + Settings UI + Calculator (mock)
```

### Phase 4: Advanced (4/5 Done)

```
✅ GAMIFIKASI — 8 point rules, 11 badges, leaderboard, auto-award, dashboard widget, full page
✅ COMMAND CENTER — SystemAdmin auth, 11 API endpoints, blue layout, agencies CRUD, audit log, PPIU alerts, compliance, auto-suspend
✅ WHITE-LABEL — BrandingProvider, color-utils, theme override, settings page, sidebar branding
✅ BLOCKCHAIN — Mock simulation, service + 5 API + dashboard + public verify
✅ ACADEMY LMS — Full DB (7 models), 10 API, seed data, course detail, quiz, certificates, reviews
✅ CC POLISH — Audit log UI, responsive layout, PPIU expiry alerts
✅ TESTING — 415 unit tests (34 files) + Playwright E2E (5 specs)
✅ ERROR BOUNDARIES — Pilgrim (green) + CC (blue) error boundaries in layouts
✅ SECURITY SETTINGS — LoginHistory, login recording, change password, 2FA/TOTP, session management, rate limiting
✅ PILGRIM GAMIFICATION — 6 point rules, 6 badges, service, 3 API, achievements page, dashboard widget, nav
✅ CC ANALYTICS — Analytics API (5 datasets), 4 Recharts, period filter
✅ SESSION 10 — 37 features: productivity, pilgrim portal, platform, detail pages, notifications, etc.
✅ SESSION 11 — Hardening: Zod 16 routes, rate limit 7 routes, try/catch 9 routes, logActivity 13 routes, 85 new tests
□ MOBILE NATIVE — Flutter app (out of scope for Next.js)
```

---

## 📎 APPENDIX

### A. API Count Summary (~133 Total)

```
Auth:            9 endpoints (login, register, verify, password, totp-verify, me, etc)
Pilgrims:       18 endpoints (CRUD + docs + payments + status + history + bulk + import + QR + export + notes + invoice)
Packages:        7 endpoints (CRUD + duplicate + brochure)
Trips:           9 endpoints (CRUD + checklist + manifest + manifest/remove + waiting-list)
Dashboard:       4 endpoints (stats, alerts, activities, charts)
Reports:         6 endpoints (financial, demographics, documents, payment-aging, conversion, send-scheduled)
Reports Export:  1 endpoint  (financial/export)
Settings:       10 endpoints (notifications, security ×5, email-templates ×2, scheduled-reports ×2, onboarding)
Integrations:   15 endpoints (nusuk: 3, payment: 4, whatsapp: 5, umrahcash: 3)
Pilgrim Portal: 20 endpoints (login, me, logout, docs, manasik, doa, gamification ×3, gallery ×2, testimonial, referral ×2, roommate ×2, share-itinerary)
Verify:          3 endpoints (pilgrim QR + agency QR + certificate)
Users:           2 endpoints (CRUD + role management)
Other:           3 endpoints (agency, agency/export, chat AI)
Search:          1 endpoint  (global search)
Notifications:   3 endpoints (list+markAll, markRead+delete)
Tasks:           2 endpoints (list+create, update+delete)
Public:          3 endpoints (agency/public/[slug], share/itinerary/[code], agency/[slug])
Gamification:    4 endpoints (stats, badges, leaderboard, history)
Command Center: 11 endpoints (login, me, logout, agencies, agencies/[id], stats, audit-log, alerts, analytics, compliance, auto-suspend)
Academy:        10 endpoints (courses, detail, lesson, progress, user progress, quiz, attempt, certificate, reviews ×2)
Blockchain:      5 endpoints (certificates CRUD, certificate detail, verify, public verify)
```

### B. Color Reference

```css
/* GEZMA Primary */
--gezma-red: #F60000;
--gezma-red-hover: #E40000;

/* Pilgrim Green */
--pilgrim-green: #059669;

/* Category Colors */
--blue: #2563EB;  --green: #059669;  --orange: #D97706;
--purple: #7C3AED; --red: #DC2626;   --teal: #0891B2;
--pink: #EC4899;

/* Neutral */
--charcoal: #111827; --gray-600: #4B5563; --gray-400: #9CA3AF;
--gray-border: #E5E7EB; --gray-bg: #F3F4F6;
```

### C. Related Documents

- `GEZMA-AGENT-PLAN-v2.md` - Original frontend plan
- `CHECKPOINT.md` - Development checkpoint (session-based)
- `BLUEPRINT-TRACKING.md` - Blueprint vs actual status

---

*Plan Version: 3.5*
*Created: 2026-02-23*
*Updated: 2026-02-25 (Session 10: Mega Feature Session — 37 Features)*
*Next: Connect real API keys for Phase 3 integrations, or Mobile Native (Flutter — separate repo)*

### Git Log (Phase 4 + Session 10)

```
Session 7:  feat: implement Phase 4A — Gamifikasi, Command Center, White-label Branding
Session 8:  feat: implement Phase 4B — Blockchain, CC Polish, Academy LMS, Tests
Session 9:  feat: implement Session 9 — Error Boundaries, Security, Pilgrim Gamification, CC Analytics
Session 10: feat: Session 10 — Mega Feature Session (37 features)
```
