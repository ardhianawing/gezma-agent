# GEZMA Agent — Development Checkpoint

> **Last Updated:** 2026-02-23 (Session 3)
> **Blueprint Reference:** `GEZMA-AGENT-PLAN-v2.md`, `DEVELOPMENT-PLAN-v3.md`

---

## STATUS RINGKAS

| Kategori | Status | Keterangan |
|----------|--------|------------|
| **Phase 1: Core Agent Dashboard** | ✅ 100% Done | Semua modul + API |
| **Phase 2A: Platform Pages** | ✅ Done | 6 halaman dengan mock data |
| **Phase 2B: Agent Backlog** | ✅ Done | Manifest CRUD, Timeline, Bulk, Import CSV |
| **Phase 2C: Gezma Pilgrim MVP** | ✅ Done | 6 halaman + layout + real DB |
| **Phase 3: Integrasi** | ✅ Prep Done | 4 service layers + 15 API endpoints + 7 UI pages (mock) |
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
| Status Timeline Visual | ✅ NEW |
| Checklist per Jemaah (9 item) | ✅ |
| Payment Records (DP, Cicilan, Lunas, Refund) | ✅ |
| Trip Assignment | ✅ |
| Export CSV | ✅ |
| Import CSV (upload, preview, mapping, validate) | ✅ NEW |
| Bulk Actions (status, trip assign, delete) | ✅ NEW |

### 3. Packages (Paket Umrah)
| Fitur | Status |
|-------|--------|
| CRUD + Search + Filter | ✅ |
| HPP Calculator (9 komponen biaya) | ✅ |
| Margin & Published Price (auto-calculate) | ✅ |
| Itinerary Builder (day-by-day) | ✅ |
| Kategori (Regular/Plus/VIP/Ramadhan/Budget) | ✅ |

### 4. Trips (Keberangkatan)
| Fitur | Status |
|-------|--------|
| CRUD + Search + Filter | ✅ |
| Manifest CRUD (add/remove pilgrim) | ✅ NEW |
| Room Assignment (inline editing) | ✅ NEW |
| Capacity Progress Bar | ✅ NEW |
| Operational Checklist (8 item) | ✅ |
| Print Manifest | ✅ |

### 5. Dashboard
| Fitur | Status |
|-------|--------|
| Stats Summary, Activity Log, Alerts, Quick Actions, Upcoming Trips | ✅ |

### 6. Financial Reports
| Fitur | Status |
|-------|--------|
| Revenue, Outstanding, Collection Rate, Breakdown, Trend | ✅ |

### 7. Settings
| Fitur | Status |
|-------|--------|
| Theme (Light/Dark), Language (ID/EN), Password, Users, Agency Profile | ✅ |

### 8. AI Assistant
| Fitur | Status |
|-------|--------|
| Chat Widget + Gemini 2.0 Flash | ✅ |

### 9. PWA
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

### Belum Dikerjakan (LOW priority)
| Fitur | Status | Prioritas |
|-------|--------|-----------|
| Brochure Generator (PDF) | ❌ | LOW |
| Package Duplicate | ❌ | LOW |
| QR Verification Page | ❌ | LOW |
| Granular Roles & Permissions | ❌ | LOW |
| Notification Preferences | ❌ | LOW |

---

## D. PHASE 2C — GEZMA PILGRIM MVP (100%)

App terpisah untuk jemaah (route group `(pilgrim)`) dengan layout mobile-first, bottom nav, green theme:

| Fitur | Status | Keterangan |
|-------|--------|------------|
| Layout + Navigation | ✅ | Bottom nav (mobile) + top nav (desktop), green accent (#059669) |
| Pilgrim Context | ✅ | Login state via httpOnly cookie (JWT), auto-restore session via `/me` API |
| Login dengan booking code | ✅ | Real DB auth via API, JWT token (30-day), error handling |
| **Pilgrim Auth (JWT)** | ✅ NEW | `auth-pilgrim.ts` — sign/verify pilgrim_token cookie, separate from agent auth |
| **Pilgrim Portal API** | ✅ NEW | 3 endpoints: login, me, logout (`/api/pilgrim-portal/*`) |
| **Data Transformer** | ✅ NEW | `pilgrim-portal.service.ts` — DB rows → PilgrimPortalData shape |
| **DB Migration** | ✅ NEW | `bookingCode` field + unique constraint `[agencyId, bookingCode]` |
| Dashboard jemaah | ✅ | Welcome, status progress (8 step), quick info, payment summary, docs, agency contact |
| Detail perjalanan | ✅ | Countdown timer, flight info, hotels, muthawwif, room assignment, itinerary timeline |
| Manasik digital | ✅ | 8 materi dari DB per-agency, progress tracking persisten via API |
| Panduan doa | ✅ | 16 doa dari DB per-agency, favorit persisten via API |
| **Manasik & Doa DB** | ✅ NEW | 4 tabel: manasik_lessons, doa_prayers, pilgrim_manasik_progress, pilgrim_doa_favorites |
| **Manasik & Doa API** | ✅ NEW | 4 endpoints: GET manasik, POST progress, GET doa, POST favorites |
| **Seed Script** | ✅ NEW | `prisma/seed-manasik-doa.ts` — seed default content per-agency |
| Profile & dokumen | ✅ | Data pribadi, kontak, kamar, dokumen checklist, travel agent info, logout |

---

## E. PHASE 3 — INTEGRASI (Preparation Done)

Semua menggunakan mock data, siap connect real API ketika key tersedia:

| Integrasi | Service | API Endpoints | UI Pages | Status |
|-----------|---------|---------------|----------|--------|
| **Nusuk API** | nusuk.service.ts | 3 (config, hotels, visa) | Settings + detail config | ✅ Mock |
| **Payment Gateway** | payment-gateway.service.ts | 4 (config, invoices, webhook) | Settings + pilgrim invoice | ✅ Mock |
| **WhatsApp** | whatsapp.service.ts | 5 (config, test, send, broadcast, templates) | Settings + trip broadcast | ✅ Mock |
| **UmrahCash** | umrahcash.service.ts | 3 (config, rate, transfer) | Settings + calculator | ✅ Mock |

**Halaman Baru:**
- `/settings/integrations` — Hub semua integrasi
- `/settings/integrations/nusuk` — Config Nusuk API
- `/settings/integrations/payment` — Config Payment Gateway (Midtrans/Xendit/Duitku)
- `/settings/integrations/whatsapp` — Config WhatsApp + template editor
- `/settings/integrations/umrahcash` — Exchange rate calculator + transfer
- `/pilgrims/[id]/invoice` — Buat & kelola invoice pembayaran
- `/trips/[id]/broadcast` — Broadcast WhatsApp ke jemaah

---

## F. API ENDPOINTS (55 Total)

```
Auth:          7 endpoints (login, register, verify, password, etc)
Pilgrims:     13 endpoints (CRUD + documents + payments + status + history + bulk + import)
Packages:      5 endpoints (full CRUD)
Trips:         7 endpoints (CRUD + checklist + manifest + manifest/remove)
Dashboard:     3 endpoints (stats, alerts, activities)
Reports:       1 endpoint  (financial)
Integrations: 15 endpoints (nusuk: 3, payment: 4, whatsapp: 5, umrahcash: 3)
Pilgrim Portal: 7 endpoints (login, me, logout, manasik, manasik/progress, doa, doa/favorites)
Other:         3 endpoints (agency, users, chat AI)
```

---

## F. TECH STACK

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | 100% inline styles + useTheme() |
| Database | PostgreSQL + Prisma v7 |
| Auth | JWT (HTTP-only cookies) |
| Email | Nodemailer (SMTP) |
| AI | Google Gemini 2.0 Flash |
| Validation | Zod v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Docker + Nginx + Traefik |

---

## G. FILE STRUCTURE

```
src/
├── app/
│   ├── (auth)/          → 4 pages
│   ├── (dashboard)/     → 22 pages (6 platform + 16 operasional)
│   ├── (pilgrim)/       → 6 pages (login, home, trip, manasik, doa, profile) + layout
│   ├── api/             → 40 API endpoints (incl. pilgrim-portal: 7)
│   └── offline/         → PWA offline page
├── components/
│   ├── shared/          → 12 reusable components
│   ├── layout/          → 3 (sidebar, header, page-header)
│   ├── packages/        → 3 (form, itinerary, pricing)
│   ├── pilgrims/        → 3 (document-upload, status-timeline, import-modal)
│   ├── trips/           → 1 (trip-form)
│   ├── dashboard/       → 2 (action-center, quick-actions)
│   ├── pwa/             → 4 (sw-register, offline, install, update)
│   └── ai-assistant/    → 1 (ChatWidget)
├── data/                → 8 mock data files (+pilgrim-portal, manasik, doa)
├── lib/
│   ├── services/        → 7 service files (incl. pilgrim-portal.service)
│   ├── hooks/           → 4 hooks
│   ├── contexts/        → 1 (pilgrim-context)
│   ├── validations/     → 5 schemas
│   ├── i18n/            → ID + EN translations
│   └── theme/           → Light + Dark color system
└── types/               → 5 type definition files
```

---

## H. GIT LOG (Session 3)

```
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

## I. NEXT STEPS

1. **Pilgrim Portal Enhancements** — Document upload dari portal, payment status realtime
2. **Phase 3: Integrasi** — Nusuk API, Payment Gateway, WhatsApp API (connect real keys)
3. **Phase 4: Advanced** — Gamifikasi, Blockchain, Command Center, Mobile Native
4. **Low Priority Backlog** — Brochure Generator, Package Duplicate, QR Verification, Granular Roles
