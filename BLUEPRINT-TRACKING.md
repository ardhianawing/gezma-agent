# 🕋 GEZMA — Blueprint Tracking Document

> **Last Synced:** 2026-02-23  
> **Repository:** github.com/ardhianawing/gezma-agent  
> **Blueprint Sources:**
> 1. Cetak Biru Strategis v1 (Generasi Emas Z & Milenial)
> 2. Cetak Biru Strategis v2 (Koperasi Platform Digital)
> 3. Frontend Prototype Plan v2.0

---

## 📊 EXECUTIVE SUMMARY

| Komponen | Blueprint | Implemented | Completion |
|----------|-----------|-------------|------------|
| **Gezma Agent** (Core B2B) | ✓ | ✅ | **90%** |
| **Gezma Pilgrim** (B2C App) | ✓ | 🔲 | 0% |
| **Gezma Academy** (LMS) | ✓ | ⏸️ Placeholder | 5% |
| **Gezma Command Center** | ✓ | 🔲 | 0% |
| **Platform Pages** | ✓ | ⏸️ Placeholder | 5% |
| **Nusuk Integration** | ✓ Critical | 🔲 | 0% |
| **Fintech Integration** | ✓ | 🔲 | 0% |
| **Blockchain Verification** | ✓ | 🔲 | 0% |

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
│  │  ✅ 90% Done    │  │  🔲 0% Done     │                      │
│  └─────────────────┘  └─────────────────┘                      │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │ GEZMA COMMAND   │  │ GEZMA ACADEMY   │                      │
│  │ CENTER (Admin)  │  │     (LMS)       │                      │
│  │  🔲 0% Done     │  │  ⏸️ Placeholder │                      │
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

### Status: ✅ 90% Complete

| Fitur (Blueprint) | Route | Status | Notes |
|-------------------|-------|--------|-------|
| **Dashboard Overview** | `/dashboard` | ✅ Done | Stats, alerts, activity |
| ↳ Stats Summary | | ✅ Real | Total jemaah, trips, revenue |
| ↳ Action Center / Alerts | | ✅ Real | Operational alerts |
| ↳ Upcoming Trips | | ✅ Real | |
| ↳ Recent Activities | | ✅ Real | Activity log dari DB |
| ↳ Quick Actions | | ✅ Real | |
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
| ↳ Export CSV | | ✅ Real | |
| ↳ **Import CSV** | | ❌ Belum | Blueprint: Section 5 |
| ↳ **Bulk Actions** | | ❌ Belum | Blueprint: Section 5 |
| ↳ **Status Timeline Visual** | | ❌ Belum | Blueprint: Section 5.2 |
| **Packages** | `/packages` | ✅ Done | Full CRUD |
| ↳ List + Search + Filter | | ✅ Real | |
| ↳ Create Package | `/packages/new` | ✅ Real | |
| ↳ Detail Package | `/packages/[id]` | ✅ Real | |
| ↳ Edit Package | `/packages/[id]/edit` | ✅ Real | |
| ↳ HPP Calculator (9 komponen) | | ✅ Real | |
| ↳ Margin & Published Price | | ✅ Real | Auto-calculate |
| ↳ Itinerary Builder | | ✅ Real | Day-by-day |
| ↳ Category (5 types) | | ✅ Real | Regular/Plus/VIP/Ramadhan/Budget |
| ↳ **Package Duplicate** | | ❌ Belum | |
| ↳ **Brochure Generator PDF** | | ❌ Belum | Blueprint: Section 5.1 |
| **Trips** | `/trips` | ✅ Done | Full CRUD |
| ↳ List + Search + Filter | | ✅ Real | |
| ↳ Create Trip | `/trips/new` | ✅ Real | |
| ↳ Detail Trip | `/trips/[id]` | ✅ Real | |
| ↳ Edit Trip | `/trips/[id]/edit` | ✅ Real | |
| ↳ Auto-generate Manifest | | ✅ Real | |
| ↳ Operational Checklist | | ✅ Real | |
| ↳ Print Manifest | | ✅ Real | |
| ↳ Capacity Tracking | | ✅ Real | |
| ↳ **Rooming List Management** | | ❌ Belum | Blueprint: HIGH priority |
| ↳ **Manifest CRUD (add/remove)** | | ❌ Belum | Blueprint: HIGH priority |
| **Documents** | `/documents` | ✅ Basic | Agency documents |
| **Agency Profile** | `/agency` | ✅ Done | |
| ↳ Company Info | | ✅ Real | |
| ↳ **Bank Accounts** | | ⚠️ Partial | UI ada, data basic |
| ↳ **Branding Settings** | | ❌ Belum | White-label |
| ↳ **QR Verification Page** | `/verify/[code]` | ⏸️ Placeholder | |
| **Reports** | `/reports` | ✅ Done | |
| ↳ Total Revenue | | ✅ Real | |
| ↳ Outstanding Balance | | ✅ Real | |
| ↳ Collection Rate | | ✅ Real | |
| ↳ Breakdown by Method | | ✅ Real | Transfer/Cash/Card |
| ↳ Breakdown by Type | | ✅ Real | DP/Cicilan/Lunas/Refund |
| ↳ Revenue per Trip | | ✅ Real | |
| ↳ Monthly Trend | | ✅ Real | |
| **Settings** | `/settings` | ✅ Done | |
| ↳ Theme Toggle | | ✅ Real | Light/Dark |
| ↳ Language | | ✅ Real | ID/EN |
| ↳ Change Password | | ✅ Real | |
| ↳ User Management | `/settings/users` | ✅ Real | CRUD |
| ↳ **Roles & Permissions** | | ⚠️ Basic | 4 roles, no granular perms |
| ↳ **Notification Preferences** | | ❌ Belum | |

### Authentication (Blueprint Section: Security)
| Fitur | Status | Notes |
|-------|--------|-------|
| Login | ✅ Real | JWT cookie, 7 hari |
| Register (3 step) | ✅ Real | Agency → PIC → Password |
| Email Verification | ✅ Real | Wajib |
| Forgot Password | ✅ Real | SMTP reset link |
| Auth Middleware | ✅ Real | Protected routes |
| Role System | ✅ Real | owner, admin, staff, marketing |

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

### Status: 🔲 0% — Belum Dimulai

| Fitur (Blueprint) | Status | Priority |
|-------------------|--------|----------|
| **Manasik Digital** | 🔲 | HIGH |
| ↳ Panduan Ibadah Video | 🔲 | |
| ↳ Manasik AR (Augmented Reality) | 🔲 | |
| ↳ "Doa Sesuai Lokasi" (GPS) | 🔲 | |
| **Gamifikasi** (Blueprint v1 Exclusive) | 🔲 | MEDIUM |
| ↳ Sistem Poin & Badge | 🔲 | |
| ↳ Leaderboard | 🔲 | |
| ↳ Reward (diskon, sedekah digital) | 🔲 | |
| **Safety Features** | 🔲 | HIGH |
| ↳ Tombol SOS Darurat | 🔲 | |
| ↳ Live Tracking Grup | 🔲 | |
| **GezmaPay (Dompet Digital)** | 🔲 | MEDIUM |
| ↳ Bayar dam, sedekah | 🔲 | |
| ↳ Konversi IDR → SAR | 🔲 | |
| **Social Commerce** | 🔲 | LOW |
| ↳ Toko Perlengkapan Umrah | 🔲 | |
| ↳ Fashion Muslim Trends | 🔲 | |
| **Cari Teman Sekamar** (Blueprint v1) | 🔲 | LOW |
| ↳ Roommate matching | 🔲 | |
| ↳ Sharing economy | 🔲 | |

---

## 3️⃣ GEZMA ACADEMY (LMS)

### Referensi Blueprint:
- Cetak Biru v1, BAB 3.4: Gezma Academy
- Cetak Biru v2, BAB 3: Platform LMS

### Status: ⏸️ 5% — Placeholder Only

| Fitur (Blueprint) | Route | Status | Notes |
|-------------------|-------|--------|-------|
| Academy Page | `/academy` | ⏸️ Coming Soon | Placeholder |
| **Kursus Operasional** | | 🔲 | |
| ↳ SOP Handling Jemaah | | 🔲 | |
| ↳ Manajemen Manifest | | 🔲 | |
| ↳ Emergency Handling | | 🔲 | |
| **Kursus Manasik & Ibadah** | | 🔲 | |
| ↳ Bimbingan Umrah Lengkap | | 🔲 | |
| ↳ Fiqih Umrah 4 Madzhab | | 🔲 | |
| ↳ Sejarah Makkah-Madinah | | 🔲 | |
| **Kursus Bisnis** | | 🔲 | |
| ↳ Kalkulasi HPP | | 🔲 | |
| ↳ Digital Marketing | | 🔲 | |
| ↳ Legalitas PPIU | | 🔲 | |
| **Tutorial GEZMA** | | 🔲 | |
| ↳ Panduan Pemula | | 🔲 | |
| ↳ Fitur Advanced | | 🔲 | |
| **Sertifikasi Mutawwif** | | 🔲 | |
| ↳ Public Speaking | | 🔲 | |
| ↳ Content Creation | | 🔲 | |
| ↳ Fikih Kontemporer | | 🔲 | |

---

## 4️⃣ GEZMA COMMAND CENTER (Admin Asosiasi)

### Referensi Blueprint:
- Cetak Biru v2, BAB 3.4: Gezma Command Center

### Status: 🔲 0% — Belum Dimulai

| Fitur (Blueprint) | Status | Notes |
|-------------------|--------|-------|
| **Big Data Analytics** | 🔲 | |
| ↳ Tren Jemaah Nasional | 🔲 | |
| ↳ Preferensi Hotel | 🔲 | |
| ↳ Pola Belanja | 🔲 | |
| **Sistem Verifikasi & Audit** | 🔲 | |
| ↳ Monitor Izin PPIU Anggota | 🔲 | |
| ↳ Auto-block Expired License | 🔲 | |
| ↳ Notifikasi Expiry | 🔲 | |
| **Compliance Dashboard** | 🔲 | |

---

## 5️⃣ PLATFORM PAGES (Ekosistem)

### Referensi Blueprint:
- Semua dokumen cetak biru

### Status: ⏸️ 5% — Placeholder Only

| Page | Route | Status | Mock Data | UI Design |
|------|-------|--------|-----------|-----------|
| **Marketplace** | `/marketplace` | ⏸️ Coming Soon | 📝 Ready | 📝 Prompt ready |
| ↳ Hotel (Makkah/Madinah) | | 🔲 | ✅ 12 items | |
| ↳ Visa | | 🔲 | ✅ 3 items | |
| ↳ Bus & Handling | | 🔲 | ✅ 3 items | |
| ↳ Asuransi | | 🔲 | ✅ 3 items | |
| ↳ Mutawwif | | 🔲 | ✅ 3 items | |
| ↳ Tiket Pesawat | | 🔲 | ✅ 5 items | |
| **Forum** | `/forum` | ⏸️ Coming Soon | 📝 Ready | 📝 Prompt ready |
| ↳ Kategori (7 types) | | 🔲 | ✅ 7 cats | |
| ↳ Threads | | 🔲 | ✅ 12 threads | |
| ↳ Kaskus-style Table | | 🔲 | | |
| **Berita** | `/news` | ⏸️ Coming Soon | 📝 Ready | 📝 Prompt ready |
| ↳ Regulasi | | 🔲 | ✅ | |
| ↳ Pengumuman | | 🔲 | ✅ | |
| ↳ Event | | 🔲 | ✅ | |
| ↳ Tips | | 🔲 | ✅ | |
| ↳ Peringatan | | 🔲 | ✅ | |
| **Trade Centre** | `/trade` | ⏸️ Coming Soon | 📝 Ready | 📝 Prompt ready |
| ↳ Katalog Produk Ekspor | | 🔲 | ✅ 20 items | |
| ↳ Pengajuan Produk | | 🔲 | | |
| ↳ Proses Kurasi | | 🔲 | | |
| **Layanan** | `/services` | ⏸️ Coming Soon | 📝 Ready | 📝 Prompt ready |
| ↳ Konsultasi Legal | | 🔲 | | |
| ↳ Partner Visa | | 🔲 | | |
| ↳ Download Dokumen | | 🔲 | | |
| ↳ Support | | 🔲 | | |
| **Help** | `/help` | ⏸️ Coming Soon | | |

---

## 6️⃣ INTEGRASI PIHAK KETIGA

### Referensi Blueprint:
- Cetak Biru v2, BAB 4: Solusi Strategis dan Integrasi Ekosistem
- Cetak Biru v2, BAB 1.2: Era Nusuk dan Mandat Integrasi 2025

### Status: 🔲 0% — Belum Dimulai

| Integrasi | Blueprint Ref | Status | Priority | Deadline |
|-----------|---------------|--------|----------|----------|
| **Nusuk API** | BAB 1.2, 4 | 🔲 Belum | 🔴 CRITICAL | Juni 2025 |
| ↳ Hotel Booking | | 🔲 | | |
| ↳ Visa Processing | | 🔲 | | |
| ↳ Status Tracking | | 🔲 | | |
| **Siskopatuh Kemenag** | BAB 5.2 | 🔲 Belum | 🔴 CRITICAL | |
| ↳ Pelaporan PPIU | | 🔲 | | |
| ↳ Verifikasi Izin | | 🔲 | | |
| **Payment Gateway** | BAB 4.1 | 🔲 Belum | 🔴 HIGH | |
| ↳ Midtrans/Xendit | | 🔲 | | |
| ↳ Virtual Account | | 🔲 | | |
| **UmrahCash** | BAB 4.1 | 🔲 Belum | 🟡 HIGH | |
| ↳ Cross-border IDR → SAR | | 🔲 | | |
| ↳ Fixed Rate Lock | | 🔲 | | |
| ↳ Split Payment | | 🔲 | | |
| **WhatsApp API** | | 🔲 Belum | 🟡 HIGH | |
| ↳ Notifikasi Jemaah | | 🔲 | | |
| ↳ Broadcast | | 🔲 | | |
| **Blockchain** | BAB 4.2 | 🔲 Belum | 🟢 MEDIUM | |
| ↳ Sertifikat Digital | | 🔲 | | |
| ↳ Verifikasi Dokumen | | 🔲 | | |
| ↳ Smart Contract Escrow | | 🔲 | | |
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

### Status: 🔲 0% — Belum Dimulai

| Fitur | Blueprint v1 Section | Status | Notes |
|-------|---------------------|--------|-------|
| **Gamifikasi** | BAB 3.1 | 🔲 | |
| ↳ Sistem Poin | | 🔲 | Aktivitas manasik = poin |
| ↳ Badge System | | 🔲 | "Hafalan Doa Tawaf" dll |
| ↳ Leaderboard | | 🔲 | Kompetisi grup |
| ↳ Reward (diskon, sedekah) | | 🔲 | |
| **Paket Modular** | BAB 3.2 | 🔲 | |
| ↳ Umrah Backpacker | | 🔲 | Semi-DIY |
| ↳ BYO Ticket (LA only) | | 🔲 | Jual komponen terpisah |
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
| **Database** | PostgreSQL + MongoDB | PostgreSQL + Prisma | ✅ Partial |
| **API Gateway** | Kong/Apigee | - | ❌ Not implemented |
| **Blockchain** | Hyperledger Fabric | - | ❌ Not implemented |
| **Cloud** | GCP Jakarta | - | ⚠️ TBD |
| **Frontend** | - | Next.js 16 + Tailwind | ✅ |
| **Auth** | - | JWT Cookies | ✅ |
| **Email** | - | Nodemailer SMTP | ✅ |
| **AI** | - | Gemini 2.0 Flash | ✅ Bonus |
| **Validation** | - | Zod v4 | ✅ |
| **Charts** | - | Recharts | ✅ |

---

## 9️⃣ WHITE-LABEL ARCHITECTURE

### Referensi Blueprint:
- Cetak Biru v2, BAB 3.1: White-Labeling
- Frontend Plan v2.0, Section 3.4: White-Label Architecture

### Status: ⚠️ Architecture Ready, Not Implemented

| Fitur | Status | Notes |
|-------|--------|-------|
| Multi-tenant DB structure | ✅ Ready | agencyId di semua model |
| Tenant context provider | ⚠️ Partial | Basic implementation |
| Custom branding per tenant | 🔲 Belum | Logo, colors override |
| Custom domain per tenant | 🔲 Belum | |
| Hexagonal Architecture | 🔲 Belum | Satu codebase, banyak brand |

---

## 🗺️ DEVELOPMENT ROADMAP

### Berdasarkan Blueprint BAB 5.2: Peta Jalan Pengembangan

| Phase | Blueprint Timeline | Actual Status | Completion |
|-------|-------------------|---------------|------------|
| **Phase 1: Fondasi** | Bulan 1-6 | ✅ Done | 90% |
| ↳ Badan Hukum | | ⚠️ External | |
| ↳ MVP Gezma Agent | | ✅ Done | |
| ↳ Integrasi Siskopatuh | | 🔲 Belum | |
| ↳ 100 Early Adopters | | ⚠️ External | |
| **Phase 2: Konektivitas** | Bulan 7-12 | 🔄 In Progress | 10% |
| ↳ B2B Marketplace | | ⏸️ Placeholder | |
| ↳ Nusuk Integration | | 🔲 Belum | CRITICAL |
| ↳ Payment Gateway | | 🔲 Belum | |
| ↳ UmrahCash | | 🔲 Belum | |
| ↳ Gezma Pilgrim Beta | | 🔲 Belum | |
| **Phase 3: Ekosistem** | Tahun 2 | 🔲 Not Started | 0% |
| ↳ Full Nusuk API | | 🔲 | |
| ↳ Blockchain Verification | | 🔲 | |
| ↳ Lifestyle Commerce | | 🔲 | |
| ↳ Asuransi H2H | | 🔲 | |

---

## 📋 IMMEDIATE ACTION ITEMS

### High Priority (Harus Segera)
1. **Nusuk API Integration** — Deadline Juni 2025, belum dimulai
2. **Platform Pages** — Prompt sudah ready, tinggal eksekusi
3. **Rooming List Management** — Core feature yang missing
4. **Manifest CRUD** — Add/remove pilgrim dari trip

### Medium Priority (Setelah High Selesai)
5. Import CSV Jemaah
6. Brochure PDF Generator
7. Payment Gateway Integration
8. WhatsApp Notifications

### Low Priority (Nice to Have)
9. Gamifikasi features
10. Blockchain verification
11. Mobile native app (Flutter)

---

## 📂 FILES REFERENCE

### Blueprint Documents
- `GEZMA-AGENT-PLAN-v2.md` — Frontend Prototype Plan (in repo)
- Cetak Biru Strategis v1 — Generasi Emas (external)
- Cetak Biru Strategis v2 — Koperasi Platform (external)

### Implementation Files
- `CHECKPOINT.md` — Development checkpoint (in repo)
- `prisma/schema.prisma` — Database models (8 models)
- `src/app/api/` — 28 API endpoints

---

*Document Version: 1.0*  
*Created: 2026-02-23*  
*Next Review: After Phase 2 completion*
