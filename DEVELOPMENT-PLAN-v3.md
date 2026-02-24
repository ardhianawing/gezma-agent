# 🕋 GEZMA Development Plan v3.0

> **Created:** 2026-02-23
> **Last Updated:** 2026-02-24 (Session 6)
> **Status:** Phase 2 Complete, Phase 3 Prep Done
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
| **Dashboard** | 100% | Stats, Alerts, Activity Log, Charts (Revenue, Status, Capacity) |
| **Pilgrims CRM** | 100% | CRUD, Documents, Payments, Status, Timeline, Bulk Actions, Import CSV, Export CSV, QR Verification |
| **Packages** | 100% | CRUD, HPP Calculator, Itinerary Builder, Itinerary Display, Duplicate, Brochure PDF |
| **Trips** | 100% | CRUD, Manifest CRUD, Room Assignment, Checklist, Print Manifest |
| **Reports** | 100% | 5-tab: Keuangan, Demografi, Dokumen, Aging, Funnel + CSV Export |
| **Settings** | 100% | Theme, Language, Users, Agency Profile, Notification Prefs, Granular Permissions (25 perms) |
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

### 🔲 Phase 4 — Advanced (0%)

Belum dimulai.

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
│  PHASE 4 🔲 ─── Advanced Features                              │
│  ├── Gamifikasi                                                │
│  ├── Blockchain Verification                                   │
│  ├── Command Center (Admin Asosiasi)                           │
│  ├── White-label Full                                          │
│  └── Mobile Native (Flutter)                                   │
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

## 8. PHASE 4: ADVANCED FEATURES 🔲

### Future Scope (Belum Dimulai)

| Feature | Complexity | Notes |
|---------|------------|-------|
| Gamifikasi | HIGH | Poin, badge, leaderboard |
| Blockchain Verification | HIGH | Hyperledger, dokumen verification |
| Command Center | MEDIUM | Admin asosiasi dashboard |
| White-label Full | MEDIUM | Custom domain, full branding |
| Mobile Native | HIGH | Flutter app |
| Paket Modular | MEDIUM | Umrah backpacker, component-based |
| Tabungan Umrah | HIGH | Fintech partnership needed |
| PayLater Syariah | HIGH | Lembaga keuangan partnership |

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

### Phase 4: Advanced 🔲

```
□ GAMIFIKASI — Poin, badge, leaderboard
□ BLOCKCHAIN — Hyperledger, dokumen verification
□ COMMAND CENTER — Admin asosiasi dashboard
□ WHITE-LABEL — Custom domain, full branding
□ MOBILE NATIVE — Flutter app
```

---

## 📎 APPENDIX

### A. API Count Summary (72 Total)

```
Auth:           7 endpoints
Pilgrims:      15 endpoints (CRUD + docs + payments + status + history + bulk + import + QR + export)
Packages:       7 endpoints (CRUD + duplicate + brochure)
Trips:          7 endpoints (CRUD + checklist + manifest + manifest/remove)
Dashboard:      4 endpoints (stats, alerts, activities, charts)
Reports:        5 endpoints (financial, demographics, documents, payment-aging, conversion)
Reports Export:  1 endpoint  (financial/export)
Settings:       1 endpoint  (notification preferences GET/PUT)
Integrations:  15 endpoints (nusuk: 3, payment: 4, whatsapp: 5, umrahcash: 3)
Pilgrim Portal: 9 endpoints (login, me, logout, documents GET/POST, manasik, manasik/progress, doa, doa/favorites)
Verify:         2 endpoints (pilgrim QR + agency QR)
Users:          2 endpoints (CRUD + role management)
Other:          2 endpoints (agency, chat AI)
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

*Plan Version: 3.1*
*Created: 2026-02-23*
*Updated: 2026-02-24 (Phase 2 Complete)*
*Next: Phase 3 real API integration + Phase 4 advanced features*
