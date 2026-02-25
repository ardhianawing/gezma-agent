# 🕋 GEZMA — Blueprint Tracking Document

> **Last Synced:** 2026-02-25 (Session 13 — Production Readiness)
> **Repository:** github.com/ardhianawing/gezma-agent
> **Blueprint Sources:**
> 1. Cetak Biru Strategis v1 (Generasi Emas Z & Milenial)
> 2. Cetak Biru Strategis v2 (Koperasi Platform Digital)
> 3. Frontend Prototype Plan v2.0

---

## 📊 EXECUTIVE SUMMARY

| Komponen | Blueprint | Implemented | Completion |
|----------|-----------|-------------|------------|
| **Gezma Agent** (Core B2B) | ✓ | ✅ | **~100%** |
| **Gezma Pilgrim** (B2C App) | ✓ | ✅ Full Featured + Profile Edit | **97%** |
| **Gezma Academy** (LMS) | ✓ | ✅ Quiz + Certs + Reviews | **90%** |
| **Gezma Command Center** | ✓ | ✅ Compliance + Auto-suspend | **95%** |
| **Platform Pages** | ✓ | ✅ Mock UI + Detail Pages | **75%** |
| **Nusuk Integration** | ✓ Critical | ⏸️ Mock Service | 10% |
| **Fintech Integration** | ✓ | ⏸️ Mock Service | 10% |
| **Blockchain Verification** | ✓ | ✅ Mock Done | **80%** |
| **Gamifikasi** | ✓ | ✅ Done + Referral + All Hooks Wired | **100%** |
| **White-label Branding** | ✓ | ✅ Done + Public Profile | **85%** |

---

## 🏗️ GEZMA ONE — SUPER APP ARCHITECTURE

### Referensi Blueprint:
- Cetak Biru v2, BAB 3: Konsep Platform Digital "GezmaOne"
- Frontend Plan v2.0, Section 5: Information Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GezmaOne SUPER APP                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │  GEZMA AGENT    │  │  GEZMA PILGRIM  │                      │
│  │  (B2B Travel)   │  │  (B2C Jemaah)   │                      │
│  │  ✅ ~100% Done  │  │  ✅ 95% Done    │                      │
│  └─────────────────┘  └─────────────────┘                      │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │ GEZMA COMMAND   │  │ GEZMA ACADEMY   │                      │
│  │ CENTER (Admin)  │  │     (LMS)       │                      │
│  │  ✅ 95% Done    │  │  ✅ 90% Done    │                      │
│  └─────────────────┘  └─────────────────┘                      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              PLATFORM & EKOSISTEM (⏸️ Placeholder)         │ │
│  │  Marketplace | Forum | Berita | Trade Centre | Layanan    │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ GEZMA AGENT (B2B Dashboard)

### Referensi Blueprint:
- Cetak Biru v2, BAB 3.2: Modul Gezma Agent
- Frontend Plan v2.0, Section 5.1: Module Structure

### Status: ✅ ~100% Complete (Session 10)

| Fitur (Blueprint) | Route | Status | Notes |
|-------------------|-------|--------|-------|
| **Dashboard Overview** | `/dashboard` | ✅ Done | Stats, alerts, activity, charts, customizable |
| ↳ Stats Summary | | ✅ Real | Total jemaah, trips, revenue |
| ↳ Action Center / Alerts | | ✅ Real | Operational alerts |
| ↳ Upcoming Trips | | ✅ Real | |
| ↳ Recent Activities | | ✅ Real | Activity log dari DB |
| ↳ Quick Actions | | ✅ Real | |
| ↳ **Revenue Trend Chart** | | ✅ NEW | LineChart 12 bulan (Recharts) |
| ↳ **Pilgrim Status Distribution** | | ✅ NEW | PieChart per status |
| ↳ **Trip Capacity Chart** | | ✅ NEW | BarChart capacity vs registered |
| ↳ **Customizable Layout** | | ✅ S10 | Widget show/hide, edit mode, localStorage persist |
| ↳ **Onboarding Tour** | | ✅ S10 | Step-by-step highlight for new users |
| **Pilgrims CRM** | `/pilgrims` | ✅ Done | Full CRUD |
| ↳ List + Search + Filter + Pagination | | ✅ Real | |
| ↳ Add Pilgrim | `/pilgrims/new` | ✅ Real | |
| ↳ Detail Pilgrim | `/pilgrims/[id]` | ✅ Real | |
| ↳ Edit Pilgrim | `/pilgrims/[id]/edit` | ✅ Real | |
| ↳ Delete Pilgrim | | ✅ Real | With confirm dialog |
| ↳ Document Upload (KTP, Passport, etc) | | ✅ Real | API + UI |
| ↳ Status Lifecycle (8 status) | | ✅ Real | lead → completed |
| ↳ Checklist per Pilgrim | | ✅ Real | 9 items |
| ↳ Payment Records (CRUD) | | ✅ Real | DP, cicilan, lunas, refund |
| ↳ Trip Assignment | | ✅ Real | |
| ↳ **Export CSV (server-side)** | | ✅ UPGRADED | UTF-8 BOM, server-side API |
| ↳ **Import CSV** | | ✅ Done | 3-step modal, template download |
| ↳ **Bulk Actions** | | ✅ Done | Status, trip assign, delete |
| ↳ **Status Timeline Visual** | | ✅ Done | Horizontal progress + vertical |
| ↳ **Kanban Board View** | | ✅ S10 | 8-column status board, HTML5 DnD |
| ↳ **Internal Notes** | | ✅ S10 | Per-pilgrim notes, author tracking |
| ↳ **Invoice/Kwitansi PDF** | | ✅ S10 | jsPDF, "LUNAS" watermark, download |
| **Packages** | `/packages` | ✅ Done | Full CRUD |
| ↳ List + Search + Filter | | ✅ Real | |
| ↳ Create Package | `/packages/new` | ✅ Real | |
| ↳ Detail Package | `/packages/[id]` | ✅ Real | |
| ↳ Edit Package | `/packages/[id]/edit` | ✅ Real | |
| ↳ HPP Calculator (9 komponen) | | ✅ Real | |
| ↳ Margin & Published Price | | ✅ Real | Auto-calculate |
| ↳ Itinerary Builder | | ✅ Real | Day-by-day |
| ↳ **Itinerary Display** | | ✅ NEW | Vertical timeline, city badges |
| ↳ Category (5 types) | | ✅ Real | Regular/Plus/VIP/Ramadhan/Budget |
| ↳ **Package Duplicate** | | ✅ Done | Clone + "(Copy)" suffix |
| ↳ **Brochure Generator PDF** | | ✅ Done | jsPDF, A4, full branding |
| ↳ **Package Builder Wizard** | `/packages/builder` | ✅ S10 | 4-step wizard (Flight→Hotel→Visa), running total |
| **Trips** | `/trips` | ✅ Done | Full CRUD |
| ↳ List + Search + Filter | | ✅ Real | |
| ↳ Create Trip | `/trips/new` | ✅ Real | |
| ↳ Detail Trip | `/trips/[id]` | ✅ Real | |
| ↳ Edit Trip | `/trips/[id]/edit` | ✅ Real | |
| ↳ Auto-generate Manifest | | ✅ Real | |
| ↳ Operational Checklist | | ✅ Real | |
| ↳ Print Manifest | | ✅ Real | |
| ↳ Capacity Tracking | | ✅ Real | |
| ↳ **Rooming List Management** | | ✅ Done | Inline room editing |
| ↳ **Manifest CRUD (add/remove)** | | ✅ Done | Modal add, remove |
| ↳ **Calendar View** | | ✅ S10 | Month grid, trip dots, day click panel |
| ↳ **Waiting List** | | ✅ S10 | Per-trip waiting list when at capacity |
| **Documents** | `/documents` | ✅ Basic | Agency documents |
| **Activity Log** | `/activities` | ✅ Done | Full page, filter, search, pagination |
| **Task Management** | `/tasks` | ✅ S10 | 3-column Kanban, assignee filter, CRUD |
| **Notification Center** | `/notifications` | ✅ S10 | Bell badge, dropdown, full page, mark read |
| **Global Search** | Ctrl+K | ✅ S10 | Command palette, search pilgrims/packages/trips |
| **Blockchain Certificates** | `/blockchain` | ✅ NEW | Issue/verify/revoke, public verify page |
| **Agency Profile** | `/agency` | ✅ Done | |
| ↳ **Public Agency Profile** | `/agency/[slug]` | ✅ S10 | Public page, packages, testimonials, stats |
| ↳ **Data Export** | | ✅ S10 | Export all agency data as JSON |
| ↳ Company Info | | ✅ Real | |
| ↳ **Bank Accounts** | | ⚠️ Partial | UI ada, data basic |
| ↳ **Branding Settings** | `/settings/branding` | ✅ Done | Color picker, logo, title, live preview |
| ↳ **QR Verification Page** | `/verify/pilgrim/[code]` | ✅ Done | QR generate + public verify |
| **Reports** | `/reports` | ✅ UPGRADED | 5-tab layout |
| ↳ Tab Keuangan: Revenue, Outstanding, Collection Rate, Breakdown | | ✅ Real | |
| ↳ **Tab Demografi: Gender, Usia, Provinsi** | | ✅ NEW | PieChart + BarChart |
| ↳ **Tab Dokumen: Completion rate per type** | | ✅ NEW | Stacked progress bars |
| ↳ **Tab Aging: Piutang 0-30/31-60/61-90/90+ hari** | | ✅ NEW | BarChart + top debtors |
| ↳ **Tab Funnel: Konversi lead → completed** | | ✅ NEW | Funnel bars + percentage |
| ↳ **Export CSV per tab** | | ✅ NEW | Server-side UTF-8 BOM |
| ↳ **Comparison Analytics** | | ✅ S10 | Period comparison, delta indicators (green/red %) |
| ↳ **Scheduled Reports** | `/settings/scheduled-reports` | ✅ S10 | Configure frequency, type, email recipients |
| **Settings** | `/settings` | ✅ Done | |
| ↳ Theme Toggle | | ✅ Real | Light/Dark |
| ↳ Language | | ✅ Real | ID/EN |
| ↳ Change Password | | ✅ Real | |
| ↳ User Management | `/settings/users` | ✅ Real | CRUD |
| ↳ **Roles & Permissions** | | ✅ Done | 25 perms, role matrix, per-user overrides |
| ↳ **Notification Preferences** | `/settings/notifications` | ✅ Done | 5 categories × 3 channels |
| ↳ **Security Settings** | `/settings/security` | ✅ NEW | Change password + login history (IP, user agent) |
| ↳ **2FA/TOTP** | | ✅ S10 | QR setup, verify, disable, login flow with tempToken |
| ↳ **Session Management** | | ✅ S10 | List active sessions, revoke access |
| ↳ **Email Templates** | `/settings/email-templates` | ✅ S10 | Per-event templates, variable interpolation |

### Authentication (Blueprint Section: Security)
| Fitur | Status | Notes |
|-------|--------|-------|
| Login | ✅ Real | JWT cookie, 7 hari |
| Register (3 step) | ✅ Real | Agency → PIC → Password |
| Email Verification | ✅ Real | Wajib |
| Forgot Password | ✅ Real | SMTP reset link |
| Auth Middleware | ✅ Real | Protected routes |
| Role System | ✅ Real | owner, admin, staff, marketing |
| **API Rate Limiting** | ✅ S10 | In-memory sliding window, per IP+route |

### PWA (Blueprint: Mobile-First)
| Fitur | Status | Notes |
|-------|--------|-------|
| Web App Manifest | ✅ Real | Installable |
| Service Worker | ✅ Real | Cache strategy |
| Offline Fallback | ✅ Real | `/offline` page |
| Offline Indicator | ✅ Real | Red bar |
| Install Prompt | ✅ Real | Banner |
| Update Prompt | ✅ Real | New version notification |

### AI Assistant
| Fitur | Status | Notes |
|-------|--------|-------|
| Chat Widget | ✅ Real | Floating bottom-right |
| Gemini 2.0 Flash | ✅ Real | Context-aware umrah |

---

## 2️⃣ GEZMA PILGRIM (B2C App Jemaah)

### Referensi Blueprint:
- Cetak Biru v1, BAB 3.3: Gezma Pilgrim (Apps Jemaah Milenial)
- Cetak Biru v2, BAB 3.3: Modul Gezma Pilgrim

### Status: ✅ Full Featured (95%) — Session 10

| Fitur (Blueprint) | Status | Priority |
|-------------------|--------|----------|
| **Login (Booking Code)** | ✅ Done | HIGH |
| **Dashboard Jemaah** | ✅ Done | HIGH |
| ↳ "Lihat Detail" link ke payment history | ✅ Done | |
| ↳ **Gamification Widget** | ✅ NEW | Level/Points/Badge card, links to achievements |
| **Detail Perjalanan** | ✅ Done | HIGH |
| **Profile & Dokumen** | ✅ Done | HIGH |
| **Document Upload** | ✅ Done | HIGH |
| ↳ Upload per doc type (JPG/PNG/WebP/PDF) | ✅ Done | |
| ↳ 5MB limit, status badge, progress bar | ✅ Done | |
| **Payment History** | ✅ Done | HIGH |
| ↳ Full timeline, progress bar, summary | ✅ Done | |
| **Manasik Digital** | ✅ Basic | HIGH |
| ↳ Panduan Ibadah Video | 🔲 | |
| ↳ Manasik AR (Augmented Reality) | 🔲 | |
| ↳ "Doa Sesuai Lokasi" (GPS) | 🔲 | |
| **Gamifikasi** (Blueprint v1 Exclusive) | ✅ Done | MEDIUM |
| ↳ Sistem Poin (6 rules) | ✅ NEW | complete_lesson, complete_course, daily_login, etc |
| ↳ Badge System (6 badges) | ✅ NEW | Pelajar Rajin, Hafiz Doa, Siap Berangkat, etc |
| ↳ Achievements Page | ✅ NEW | `/pilgrim/achievements` — stats, badges, history |
| ↳ Level System (50pts/level) | ✅ NEW | Progress bar to next level |
| ↳ Endpoint Hooks | ✅ S13 | All 6 hooks wired: doa fav, manasik, doc upload, daily_login, update_profile, course complete |
| ↳ Reward (diskon, sedekah digital) | 🔲 | Needs fintech integration |
| **Error Boundary** | ✅ NEW | Graceful error handling, "Coba Lagi" button |
| **Safety Features** | 🔲 | HIGH |
| ↳ Tombol SOS Darurat | 🔲 | |
| ↳ Live Tracking Grup | 🔲 | |
| **Packing Checklist** | ✅ S10 | MEDIUM |
| ↳ 7 categories, custom items, progress bar | ✅ S10 | |
| **Prayer Times Widget** | ✅ S10 | MEDIUM |
| ↳ Makkah/Madinah toggle, next prayer highlight | ✅ S10 | |
| **Currency Converter** | ✅ S10 | MEDIUM |
| ↳ IDR ↔ SAR, editable rate | ✅ S10 | |
| **Emergency Contacts** | ✅ S10 | HIGH |
| ↳ KBRI, KJRI, RS, Polisi, Ambulans, Kemenag | ✅ S10 | |
| **Itinerary Sharing** | ✅ S10 | MEDIUM |
| ↳ Public shareable link `/share/itinerary/[code]` | ✅ S10 | |
| **Photo Gallery** | ✅ S10 | LOW |
| ↳ Upload, caption, delete | ✅ S10 | |
| **Testimonial/Review** | ✅ S10 | MEDIUM |
| ↳ Star rating + comment (completed trips only) | ✅ S10 | |
| **Referral System** | ✅ S10 | MEDIUM |
| ↳ Generate code, share, bonus points | ✅ S10 | |
| **GezmaPay (Dompet Digital)** | 🔲 | MEDIUM |
| ↳ Bayar dam, sedekah | 🔲 | |
| ↳ ~~Konversi IDR → SAR~~ | ✅ S10 | Currency converter done |
| **Social Commerce** | 🔲 | LOW |
| ↳ Toko Perlengkapan Umrah | 🔲 | |
| ↳ Fashion Muslim Trends | 🔲 | |
| **Cari Teman Sekamar** (Blueprint v1) | ✅ S10 | LOW |
| ↳ Roommate matching | ✅ S10 | Preference form + matching algorithm |
| ↳ Sharing economy | 🔲 | |

### Pilgrim Portal Navigation (14+ pages)
| Nav Item | Route | Status |
|----------|-------|--------|
| Beranda | `/pilgrim` | ✅ |
| Perjalanan | `/pilgrim/trip` | ✅ |
| Manasik | `/pilgrim/manasik` | ✅ |
| Doa | `/pilgrim/doa` | ✅ |
| Pencapaian | `/pilgrim/achievements` | ✅ |
| Dokumen | `/pilgrim/documents` | ✅ |
| Payments | `/pilgrim/payments` | ✅ |
| Profil | `/pilgrim/profile` | ✅ |
| Packing | `/pilgrim/packing` | ✅ S10 |
| Currency | `/pilgrim/currency` | ✅ S10 |
| Emergency | `/pilgrim/emergency` | ✅ S10 |
| Gallery | `/pilgrim/gallery` | ✅ S10 |
| Roommate | `/pilgrim/roommate` | ✅ S10 |
| Login | `/pilgrim/login` | ✅ |

---

## 3️⃣ GEZMA ACADEMY (LMS)

### Referensi Blueprint:
- Cetak Biru v1, BAB 3.4: Gezma Academy
- Cetak Biru v2, BAB 3: Platform LMS

### Status: ✅ 90% — Quiz + Certificates + Reviews (Session 10)

| Fitur (Blueprint) | Route | Status | Notes |
|-------------------|-------|--------|-------|
| Academy Page | `/academy` | ✅ Real DB | 12 kursus from DB, API-driven, progress tracking, avg rating |
| Course Detail + Lessons | `/academy/[id]` | ✅ Done | Lesson viewer, markdown content, progress bar, reviews |
| Course Progress Tracking | | ✅ Done | Per-user, per-lesson completion, auto-complete |
| Academy API (10 endpoints) | `/api/academy/*` | ✅ UPDATED | +quiz, +quiz/attempt, +certificate, +reviews |
| DB Models (7 total) | | ✅ UPDATED | +AcademyQuiz, +QuizQuestion, +QuizAttempt, +CourseReview |
| Seed Data | | ✅ Done | 12 courses + 36 lessons seeded |
| **Kursus Operasional** | | ✅ Seeded | 3 courses (Dasar Manajemen, Visa, Handling) |
| **Kursus Manasik & Ibadah** | | ✅ Seeded | 3 courses (Manasik, Doa, Fiqih) |
| **Kursus Bisnis** | | ✅ Seeded | 3 courses (Marketing, Keuangan, Pricing) |
| **Tutorial GEZMA** | | ✅ Seeded | 3 courses (Jamaah, Laporan, Keuangan) |
| **Quiz & Assessment** | `/academy/[id]/quiz` | ✅ S10 | Per-course quiz, scoring, pass/fail, one-at-a-time UI |
| **Certificate Generator** | | ✅ S10 | jsPDF decorative cert, download when quiz passed |
| **Course Rating & Review** | | ✅ S10 | 1-5 star, one per user, avg rating on cards |
| **Sertifikasi Mutawwif** | | 🔲 | |
| ↳ Public Speaking | | 🔲 | |
| ↳ Content Creation | | 🔲 | |
| ↳ Fikih Kontemporer | | 🔲 | |
| **Video Lessons** | | 🔲 | videoUrl field ready, needs content |

---

## 4️⃣ GEZMA COMMAND CENTER (Admin Asosiasi)

### Referensi Blueprint:
- Cetak Biru v2, BAB 3.4: Gezma Command Center

### Status: ✅ 95% — Compliance + Auto-suspend (Session 10)

| Fitur (Blueprint) | Status | Notes |
|-------------------|--------|-------|
| **Admin Auth (SystemAdmin)** | ✅ Done | Independent JWT (cc_token), login/me/logout |
| **Dashboard Global** | ✅ Done | Stats + recent agencies + PPIU expiry alerts |
| **Agency List** | ✅ Done | Search, status filter, pagination |
| **Agency Detail** | ✅ Done | Info, users, stats, approve/suspend |
| **Audit Log API** | ✅ Done | Cross-agency activity logs, filterable |
| **Audit Log UI Page** | ✅ Done | Filter bar, paginated table, CC blue theme |
| **Blue Theme Layout** | ✅ Done | Independent layout, dark sidebar, #2563EB primary |
| **Responsive Layout** | ✅ Done | Mobile hamburger menu, overlay sidebar, sticky header |
| **PPIU Expiry Alerts** | ✅ Done | API + dashboard banner (orange/red), days remaining |
| **Error Boundary** | ✅ NEW | Graceful error handling, "Muat Ulang" button |
| **Big Data Analytics** | ✅ NEW | Period filter (7d/30d/90d/1y), 4 Recharts |
| ↳ Tren Jemaah (Line Chart) | ✅ NEW | Daily pilgrim registrations over period |
| ↳ Top 10 Agensi (Bar Chart) | ✅ NEW | Horizontal bar by pilgrim count |
| ↳ Status Perjalanan (Pie Chart) | ✅ NEW | Trip status distribution |
| ↳ Revenue Bulanan (Area Chart) | ✅ NEW | Monthly revenue estimate |
| ↳ Preferensi Hotel | 🔲 | |
| ↳ Pola Belanja | 🔲 | |
| **Sistem Verifikasi & Audit** | ✅ Mostly | Agency status + PPIU monitoring + alerts |
| ↳ Monitor Izin PPIU Anggota | ✅ Done | Status filter + expiry alerts |
| ↳ Auto-block Expired License | ✅ S10 | Auto-suspend with confirmation dialog |
| ↳ Notifikasi Expiry | ✅ Done | Dashboard alert banner |
| **Compliance Dashboard** | ✅ S10 | Weighted score (PPIU 40%, docs 30%, activity 20%, verified 10%) |

---

## 5️⃣ PLATFORM PAGES (Ekosistem)

### Referensi Blueprint:
- Semua dokumen cetak biru

### Status: ✅ 75% — Mock UI + Detail Pages (Session 10)

| Page | Route | Status | Mock Data | UI Design |
|------|-------|--------|-----------|-----------|
| **Marketplace** | `/marketplace` | ✅ Mock UI | ✅ 30 items | ✅ Done |
| ↳ **Item Detail** | `/marketplace/[id]` | ✅ S10 | ✅ | Full display, related items |
| ↳ Hotel (Makkah/Madinah) | | 🔲 | ✅ 12 items | |
| ↳ Visa | | 🔲 | ✅ 3 items | |
| ↳ Bus & Handling | | 🔲 | ✅ 3 items | |
| ↳ Asuransi | | 🔲 | ✅ 3 items | |
| ↳ Mutawwif | | 🔲 | ✅ 3 items | |
| ↳ Tiket Pesawat | | 🔲 | ✅ 5 items | |
| **Forum** | `/forum` | ✅ Mock UI | ✅ 12 threads | ✅ Done |
| ↳ **Thread Detail** | `/forum/[id]` | ✅ S10 | ✅ | Full content, mock replies |
| ↳ Kategori (7 types) | | 🔲 | ✅ 7 cats | |
| ↳ Threads | | 🔲 | ✅ 12 threads | |
| ↳ Kaskus-style Table | | 🔲 | | |
| **Berita** | `/news` | ✅ Mock UI | ✅ 10 artikel | ✅ Done |
| ↳ **Article Detail** | `/news/[id]` | ✅ S10 | ✅ | Full content, related articles |
| ↳ Regulasi | | 🔲 | ✅ | |
| ↳ Pengumuman | | 🔲 | ✅ | |
| ↳ Event | | 🔲 | ✅ | |
| ↳ Tips | | 🔲 | ✅ | |
| ↳ Peringatan | | 🔲 | ✅ | |
| **Trade Centre** | `/trade` | ✅ Mock UI | ✅ 20 items | ✅ Done |
| ↳ Katalog Produk Ekspor | | 🔲 | ✅ 20 items | |
| ↳ Pengajuan Produk | | 🔲 | | |
| ↳ Proses Kurasi | | 🔲 | | |
| **Layanan** | `/services` | ✅ Mock UI | ✅ 6 services | ✅ Done |
| ↳ Konsultasi Legal | | 🔲 | | |
| ↳ Partner Visa | | 🔲 | | |
| ↳ Download Dokumen | | 🔲 | | |
| ↳ Support | | 🔲 | | |
| **Help/FAQ** | `/help` | ✅ S10 | ✅ 25 FAQs | Searchable, 5 categories, accordion |

---

## 6️⃣ INTEGRASI PIHAK KETIGA

### Referensi Blueprint:
- Cetak Biru v2, BAB 4: Solusi Strategis dan Integrasi Ekosistem
- Cetak Biru v2, BAB 1.2: Era Nusuk dan Mandat Integrasi 2025

### Status: ⏸️ Mock Services Ready — Perlu API Keys

| Integrasi | Blueprint Ref | Status | Priority | Notes |
|-----------|---------------|--------|----------|-------|
| **Nusuk API** | BAB 1.2, 4 | ⏸️ Mock Service | 🔴 CRITICAL | Service + 3 API + UI ready |
| ↳ Hotel Booking | | ⏸️ Mock | | |
| ↳ Visa Processing | | ⏸️ Mock | | |
| ↳ Status Tracking | | ⏸️ Mock | | |
| **Siskopatuh Kemenag** | BAB 5.2 | 🔲 Belum | 🔴 CRITICAL | |
| ↳ Pelaporan PPIU | | 🔲 | | |
| ↳ Verifikasi Izin | | 🔲 | | |
| **Payment Gateway** | BAB 4.1 | ⏸️ Mock Service | 🔴 HIGH | Service + 4 API + UI ready |
| ↳ Midtrans/Xendit | | ⏸️ Mock | | |
| ↳ Virtual Account | | ⏸️ Mock | | |
| **UmrahCash** | BAB 4.1 | ⏸️ Mock Service | 🟡 HIGH | Service + 3 API + UI ready |
| ↳ Cross-border IDR → SAR | | ⏸️ Mock | | |
| ↳ Fixed Rate Lock | | ⏸️ Mock | | |
| ↳ Split Payment | | ⏸️ Mock | | |
| **WhatsApp API** | | ⏸️ Mock Service | 🟡 HIGH | Service + 5 API + UI ready |
| ↳ Notifikasi Jemaah | | ⏸️ Mock | | |
| ↳ Broadcast | | ⏸️ Mock | | |
| **Blockchain** | BAB 4.2 | ✅ Mock Done | 🟢 MEDIUM | Service + 5 API + UI |
| ↳ Sertifikat Digital | | ✅ Done | | Issue/verify/revoke certificates |
| ↳ Verifikasi Dokumen | | ✅ Done | | Public verify page |
| ↳ Smart Contract Escrow | | 🔲 | | Needs real blockchain |
| **Asuransi H2H** | BAB 4.4 | 🔲 Belum | 🟢 MEDIUM | |
| ↳ Zurich Syariah | | 🔲 | | |
| ↳ Mega Insurance | | 🔲 | | |
| ↳ Auto-generate Polis | | 🔲 | | |
| **Maskapai API** | | 🔲 Belum | 🔵 LOW | |
| **Google Calendar** | | 🔲 Belum | 🔵 LOW | |
| **Accounting (Jurnal)** | | 🔲 Belum | 🔵 LOW | |

---

## 7️⃣ FITUR GEN Z / MILENIAL

### Referensi Blueprint:
- Cetak Biru v1 (Exclusive): Semua fitur gamifikasi dan lifestyle

### Status: ✅ 95% Done — Agent + Pilgrim Gamification + Referral + Roommate (Session 7+9+10)

| Fitur | Blueprint v1 Section | Status | Notes |
|-------|---------------------|--------|-------|
| **Gamifikasi Agent** | BAB 3.1 | ✅ Done | Agent-level gamification |
| ↳ Sistem Poin | | ✅ Done | 8 action rules, auto-award via activity logger |
| ↳ Badge System | | ✅ Done | 11 badges, auto-check thresholds |
| ↳ Leaderboard | | ✅ Done | Top 10 agencies per month |
| ↳ Level System | | ✅ Done | Every 100 points = 1 level |
| ↳ Gamification Page | | ✅ Done | Stats, badges, leaderboard, history |
| ↳ Dashboard Widget | | ✅ Done | Points/Level card + mini top 5 |
| **Gamifikasi Pilgrim** | BAB 3.3 | ✅ NEW | Pilgrim-level gamification (Session 9) |
| ↳ Sistem Poin (6 rules) | | ✅ NEW | lesson, course, login, profile, document, doa |
| ↳ Badge System (6 badges) | | ✅ NEW | Langkah Pertama, Pelajar Rajin, Hafiz Doa, etc |
| ↳ Achievements Page | | ✅ NEW | `/pilgrim/achievements` — stats, grid, history |
| ↳ Level System (50pts/lvl) | | ✅ NEW | Progress bar to next level |
| ↳ Dashboard Widget | | ✅ NEW | Level/Points/Badge on pilgrim home |
| ↳ Endpoint Hooks | | ✅ S13 | All 6 hooks wired: doa fav, manasik, doc upload, daily_login, update_profile, course |
| ↳ Reward (diskon, sedekah) | | 🔲 | Needs fintech integration |
| **Paket Modular** | BAB 3.2 | ✅ S10 | Package Builder Wizard |
| ↳ Umrah Backpacker | | ✅ S10 | 4-step builder (Flight→Hotel→Visa) |
| ↳ BYO Ticket (LA only) | | ✅ S10 | Mix-and-match components |
| **Tabungan Umrah Digital** | BAB 4.1 | 🔲 | |
| ↳ Auto-debet Rp 20K/hari | | 🔲 | "Sedarah" |
| ↳ Fintech partnership | | 🔲 | |
| **PayLater Syariah** | BAB 4.1 | 🔲 | |
| ↳ "Umrah Dulu Bayar Nanti" | | 🔲 | First jobbers |
| ↳ Akad transparan | | 🔲 | |
| **Cari Teman Sekamar** | BAB 3.3 | 🔲 | |
| ↳ Roommate matching | | 🔲 | Solo traveler |
| ↳ Verifikasi keamanan | | 🔲 | |
| **Paket Tematik** | BAB 4.3 | 🔲 | |
| ↳ Umrah + Coding Bootcamp | | 🔲 | |
| ↳ Umrah + Sejarah Islam | | 🔲 | Content creator |
| ↳ Umrah Backpacker Halal | | 🔲 | |
| **Kolaborasi Influencer** | BAB 4.3 | 🔲 | |
| ↳ Brand Ambassador | | 🔲 | |
| ↳ Tour Leader Khusus | | 🔲 | |

---

## 8️⃣ INFRASTRUCTURE & TECH STACK

### Referensi Blueprint:
- Cetak Biru v2, BAB 5.1: Tumpukan Teknologi
- Frontend Plan v2.0, Section 3: Tech Stack

| Component | Blueprint Rec | Actual | Match |
|-----------|---------------|--------|-------|
| **Backend** | Golang | Next.js API Routes | ⚠️ Different |
| **Mobile** | Flutter | PWA (Web) | ⚠️ Different approach |
| **Database** | PostgreSQL + MongoDB | PostgreSQL + Prisma 7 (39 models) | ✅ Partial |
| **API Gateway** | Kong/Apigee | - | ❌ Not implemented |
| **Blockchain** | Hyperledger Fabric | Mock Simulation | ⚠️ Simulated |
| **Cloud** | GCP Jakarta | Docker + Nginx + Traefik | ⚠️ Self-hosted |
| **Frontend** | - | Next.js 16 + Inline Styles | ✅ |
| **Auth** | - | JWT Cookies (agent + pilgrim) | ✅ |
| **Email** | - | Nodemailer SMTP | ✅ |
| **AI** | - | Gemini 2.0 Flash | ✅ Bonus |
| **Validation** | - | Zod v4 | ✅ |
| **Charts** | - | Recharts | ✅ |
| **PDF** | - | jsPDF + jspdf-autotable | ✅ |
| **QR** | - | qrcode | ✅ |

---

## 9️⃣ WHITE-LABEL ARCHITECTURE

### Referensi Blueprint:
- Cetak Biru v2, BAB 3.1: White-Labeling
- Frontend Plan v2.0, Section 3.4: White-Label Architecture

### Status: ✅ 80% — Core Done (Session 7)

| Fitur | Status | Notes |
|-------|--------|-------|
| Multi-tenant DB structure | ✅ Ready | agencyId di semua model |
| Tenant context provider | ✅ Done | BrandingProvider + useBranding hook |
| Custom branding per tenant | ✅ Done | primaryColor, secondaryColor, logos, favicon, appTitle |
| Theme override from branding | ✅ Done | Dynamic primary/primaryLight/primaryHover/sidebarActiveItem |
| Color utils | ✅ Done | lighten, darken, hexToRgba |
| Sidebar branding | ✅ Done | Uses agency logo + appTitle |
| Branding Settings UI | ✅ Done | `/settings/branding` — color picker, URLs, live preview |
| Custom domain per tenant | 🔲 Belum | Needs DNS/proxy configuration |
| Hexagonal Architecture | 🔲 Belum | Satu codebase, banyak brand |

---

## 🗺️ DEVELOPMENT ROADMAP

### Berdasarkan Blueprint BAB 5.2: Peta Jalan Pengembangan

| Phase | Blueprint Timeline | Actual Status | Completion |
|-------|-------------------|---------------|------------|
| **Phase 1: Fondasi** | Bulan 1-6 | ✅ Done | 95% |
| ↳ Badan Hukum | | ⚠️ External | |
| ↳ MVP Gezma Agent | | ✅ Done | |
| ↳ Integrasi Siskopatuh | | 🔲 Belum | |
| ↳ 100 Early Adopters | | ⚠️ External | |
| **Phase 2: Konektivitas** | Bulan 7-12 | 🔄 In Progress | 15% |
| ↳ B2B Marketplace | | ⏸️ Placeholder | |
| ↳ Nusuk Integration | | ⏸️ Mock Service | CRITICAL |
| ↳ Payment Gateway | | ⏸️ Mock Service | |
| ↳ UmrahCash | | ⏸️ Mock Service | |
| ↳ Gezma Pilgrim Beta | | ✅ MVP Done | |
| **Phase 3: Ekosistem** | Tahun 2 | 🔄 Partial | 15% |
| ↳ Full Nusuk API | | 🔲 | |
| ↳ Blockchain Verification | | ✅ Mock Done | |
| ↳ Lifestyle Commerce | | 🔲 | |
| ↳ Asuransi H2H | | 🔲 | |

---

## 📋 IMMEDIATE ACTION ITEMS

### High Priority (Harus Segera)
1. **Nusuk API Integration** — Mock service ready, perlu real API key
2. **Payment Gateway Integration** — Mock service ready, perlu API key
3. **WhatsApp Notifications** — Mock service ready, perlu API key

### Medium Priority
4. ~~**CC Big Data Analytics**~~ — ✅ Done (Session 9) — 4 charts + period filter
5. **Academy Video Content** — Real video lessons, seed quiz data
6. ~~**Pilgrim Portal Gamification**~~ — ✅ Done (Session 9) — 6 rules, 6 badges, achievements page
7. ~~**Quiz & Assessment**~~ — ✅ Done (Session 10) — Per-course quiz, certificates, reviews
8. ~~**Compliance Dashboard**~~ — ✅ Done (Session 10) — Weighted scoring, auto-suspend

### Low Priority (Nice to Have)
9. Mobile native app (Flutter)
10. Custom domain per tenant (white-label)
11. Gamifikasi rewards (diskon, sedekah — needs fintech)
12. Sertifikasi Mutawwif courses
13. Cron jobs for scheduled reports & PPIU expiry auto-check
14. File storage migration (local → S3/MinIO)

### ✅ Completed (Session 12)
15. ~~**UI/UX Polish**~~ — ✅ Done (Session 12) — Skeleton loaders (12 pages), toast notifications (~25 pages), ConfirmDialog (7 pages), button spinners (20 pages), accessibility (12 files), empty states (12 pages). 44 files, 534 insertions.

---

## 📂 FILES REFERENCE

### Blueprint Documents
- `GEZMA-AGENT-PLAN-v2.md` — Frontend Prototype Plan (in repo)
- Cetak Biru Strategis v1 — Generasi Emas (external)
- Cetak Biru Strategis v2 — Koperasi Platform (external)

### Implementation Files
- `CHECKPOINT.md` — Development checkpoint (in repo)
- `DEVELOPMENT-PLAN-v3.md` — Phase 2 & 3 execution plan
- `prisma/schema.prisma` — Database models (39 models)
- `src/app/api/` — ~133 API endpoints
- `src/app/(dashboard)/` — 40+ dashboard pages
- `src/app/(command-center)/` — 7 command center pages
- `src/app/(pilgrim)/` — 14+ pilgrim portal pages
- `src/app/agency/` — 1 public agency page
- `src/app/share/` — 1 public itinerary page
- `__tests__/` — 34 test files (415 unit tests)
- `e2e/` — 5 Playwright spec files

---

*Document Version: 2.0*
*Created: 2026-02-23*
*Updated: 2026-02-25 (Session 12 — UI/UX Polish)*
*Next Review: After real API integration or production hardening*
