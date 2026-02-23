# 🕋 GEZMA Development Plan v3.0

> **Created:** 2026-02-23  
> **Status:** Active  
> **Scope:** Phase 2 (Platform & Ecosystem) + Phase 3 (Integration)

---

## 📋 DAFTAR ISI

1. [Status Saat Ini](#1-status-saat-ini)
2. [Development Phases Overview](#2-development-phases-overview)
3. [Phase 2A: Platform Pages](#3-phase-2a-platform-pages)
4. [Phase 2B: Agent Backlog](#4-phase-2b-agent-backlog)
5. [Phase 2C: Gezma Pilgrim (MVP)](#5-phase-2c-gezma-pilgrim-mvp)
6. [Phase 3: Integrasi](#6-phase-3-integrasi)
7. [Phase 4: Advanced Features](#7-phase-4-advanced-features)
8. [Technical Guidelines](#8-technical-guidelines)
9. [Execution Checklist](#9-execution-checklist)

---

## 1. STATUS SAAT INI

### ✅ Sudah Selesai (Phase 1)

| Modul | Completion | Notes |
|-------|------------|-------|
| **Auth System** | 100% | Login, Register, Email Verify, Forgot Password |
| **Dashboard** | 100% | Stats, Alerts, Activity Log |
| **Pilgrims CRM** | 95% | CRUD, Documents, Payments, Status |
| **Packages** | 95% | CRUD, HPP Calculator, Itinerary Builder |
| **Trips** | 90% | CRUD, Manifest, Checklist |
| **Reports** | 100% | Financial reports |
| **Settings** | 90% | Theme, Language, Users |
| **AI Assistant** | 100% | Gemini integration |
| **PWA** | 100% | Installable, Offline |

### ⏸️ Placeholder (Perlu Dibangun)

| Page | Route | Current Status |
|------|-------|----------------|
| Marketplace | `/marketplace` | Coming Soon |
| Forum | `/forum` | Coming Soon |
| Berita | `/news` | Coming Soon |
| Akademi | `/academy` | Coming Soon |
| Trade Centre | `/trade` | Coming Soon |
| Layanan | `/services` | Coming Soon |

### ❌ Belum Dimulai

| Feature | Priority | Notes |
|---------|----------|-------|
| Rooming List Management | HIGH | Core feature |
| Manifest CRUD | HIGH | Add/remove pilgrim |
| Import CSV | MEDIUM | Bulk data |
| Brochure Generator | LOW | PDF/Image |
| Gezma Pilgrim App | MEDIUM | B2C untuk jemaah |
| Nusuk Integration | DEFERRED | Tunggu akses API |

---

## 2. DEVELOPMENT PHASES OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                    GEZMA DEVELOPMENT ROADMAP                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1 ✅ DONE                                                │
│  Core Agent (CRM, Packages, Trips, Dashboard, Reports)          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  PHASE 2A 🔄 CURRENT ─── Platform Pages                         │
│  ├── Berita (News)                      ~2-3 jam               │
│  ├── Akademi (LMS)                      ~3-4 jam               │
│  ├── Layanan (Services)                 ~2 jam                 │
│  ├── Marketplace                        ~4-5 jam               │
│  ├── Forum                              ~4-5 jam               │
│  ├── Trade Centre                       ~3-4 jam               │
│  └── Sidebar Navigation Update          ~1 jam                 │
│      ────────────────────────────────                          │
│      Estimated Total: 3-4 hari                                 │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  PHASE 2B ─── Agent Backlog                                     │
│  ├── Rooming List Management            ~4-5 jam               │
│  ├── Manifest CRUD (add/remove)         ~3-4 jam               │
│  ├── Import CSV Jemaah                  ~3-4 jam               │
│  ├── Status Timeline Visual             ~2-3 jam               │
│  ├── Bulk Actions                       ~2-3 jam               │
│  └── Brochure Generator                 ~5-6 jam               │
│      ────────────────────────────────                          │
│      Estimated Total: 3-4 hari                                 │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  PHASE 2C ─── Gezma Pilgrim (MVP)                               │
│  ├── App Structure & Auth               ~3-4 jam               │
│  ├── Manasik Digital (Video/Text)       ~4-5 jam               │
│  ├── Panduan Doa                        ~3-4 jam               │
│  ├── Trip Tracker (untuk jemaah)        ~4-5 jam               │
│  └── Profile & Documents                ~3-4 jam               │
│      ────────────────────────────────                          │
│      Estimated Total: 3-4 hari                                 │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  PHASE 3 ─── Integrasi (Setelah Dapat Akses)                   │
│  ├── Nusuk API                          TBD                    │
│  ├── Payment Gateway                    ~5-7 hari              │
│  ├── WhatsApp API                       ~2-3 hari              │
│  └── UmrahCash (Fintech)                TBD                    │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  PHASE 4 ─── Advanced Features                                  │
│  ├── Gamifikasi                                                │
│  ├── Blockchain Verification                                   │
│  ├── Command Center (Admin Asosiasi)                           │
│  ├── White-label Full                                          │
│  └── Mobile Native (Flutter)                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. PHASE 2A: PLATFORM PAGES

### Urutan Eksekusi (Dari Mudah ke Kompleks)

| # | Page | Estimasi | Dependencies | Mock Data |
|---|------|----------|--------------|-----------|
| 1 | Berita | 2-3 jam | - | Perlu buat |
| 2 | Akademi | 3-4 jam | - | Perlu buat |
| 3 | Layanan | 2 jam | - | Tidak perlu (static) |
| 4 | Trade Centre | 3-4 jam | - | Perlu buat |
| 5 | Marketplace | 4-5 jam | - | Perlu buat |
| 6 | Forum | 4-5 jam | - | Perlu buat |
| 7 | Sidebar Update | 1 jam | Semua page | - |

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
- Article list dengan:
  - Emoji thumbnail
  - Category badge
  - Title + excerpt
  - Author + timestamp
  - Read time
- Breaking news badge (merah)
- Official badge untuk artikel GEZMA

**Mock Data:** 10 artikel dengan variasi kategori

---

### 3.2 AKADEMI (Academy/LMS)

**Referensi Desain:** Udemy-style course catalog

**Struktur Folder:**
```
src/
├── app/(dashboard)/academy/
│   └── page.tsx              # Katalog kursus
└── data/
    └── mock-academy.ts       # Mock data kursus
```

**Kategori Kursus:**
- Semua
- Operasional (⚙️) - SOP, handling, manifest
- Manasik & Ibadah (🕌) - Tata cara umrah, fiqih
- Bisnis & Marketing (📈) - HPP, digital marketing, legal
- Tutorial GEZMA (💻) - Cara pakai platform

**Komponen UI:**
- Stats bar (Total kursus, Terdaftar, Lulus, Sertifikat)
- Category pills
- Level filter (Pemula/Menengah/Lanjutan)
- Search bar
- Course grid cards:
  - Emoji thumbnail + play button overlay
  - Level badge + Free/New/Popular badge
  - Title + description (truncated)
  - Instructor + role
  - Rating stars + review count
  - Lesson count + duration
  - Progress bar (jika enrolled)
  - CTA button

**Mock Data:** 12 kursus dengan variasi kategori dan level

---

### 3.3 LAYANAN (Services)

**Referensi Desain:** Services/support page professional

**Struktur:** Static page (tidak perlu mock data)

**Kategori Layanan:**
1. Konsultasi Legal (⚖️) - Izin PPIU, kontrak, compliance
2. Partner Visa Resmi (📄) - Muassasah terverifikasi
3. Download Dokumen (📥) - Template, form, SOP
4. Support & Bantuan (🎧) - Live chat, ticket
5. Partner Asuransi (🛡️) - Zurich, Mega
6. Komunitas & Networking (👥) - Gathering, webinar

**Komponen UI:**
- Service cards grid (6 cards)
  - Icon
  - Title + description
  - Feature checklist (4 items)
  - CTA button
- Download dokumen section
  - List dengan format badge (PDF/DOCX/XLSX)
  - File name + size
  - Download icon
- Contact section
  - Live Chat card
  - WhatsApp card
  - Email card

---

### 3.4 TRADE CENTRE (Ekspor Produk)

**Referensi Desain:** B2B product catalog + submission flow

**Struktur Folder:**
```
src/
├── app/(dashboard)/trade/
│   └── page.tsx              # Trade Centre page
└── data/
    └── mock-trade.ts         # Mock data produk ekspor
```

**Kategori Produk:**
- Semua
- Makanan & Minuman (🍪)
- Buah-buahan (🍉)
- Fashion Muslim (👗)
- Kosmetik Halal (🧴)
- Kerajinan (🎨)
- Perlengkapan Ibadah (📿)

**Komponen UI:**
- Stats bar (Total produk, Listing aktif, Produsen, Negara tujuan)
- Tabs: Katalog Produk | Pengajuan Saya
- **Tab Katalog:**
  - Category pills
  - Search bar
  - Product grid cards:
    - Emoji thumbnail
    - Certification badges (Halal, BPOM, SNI)
    - Category badge
    - Name + producer + origin
    - Description (truncated)
    - Rating + inquiry count
    - MOQ (minimum order)
    - Target market badges
    - Price + CTA
- **Tab Pengajuan:**
  - CTA banner "Punya Produk Unggulan?"
  - Proses kurasi steps (5 langkah)
  - My products list dengan status badges

**Mock Data:** 20 produk dengan variasi kategori dan status

---

### 3.5 MARKETPLACE (B2B Supply)

**Referensi Desain:** Traveloka/Tiket.com style

**Struktur Folder:**
```
src/
├── app/(dashboard)/marketplace/
│   └── page.tsx              # Marketplace page
└── data/
    └── mock-marketplace.ts   # Mock data marketplace
```

**Kategori:**
- Hotel (🏨) - Makkah & Madinah
- Visa (📄)
- Bus & Handling (🚌)
- Asuransi (🛡️)
- Mutawwif (👤)
- Tiket Pesawat (✈️)

**Komponen UI:**
- Category tabs (horizontal dengan icon + count)
- Search bar + Sort dropdown
- Filter panel (collapsible):
  - City (Makkah/Madinah) - untuk hotel
  - Rating minimum
  - Price range
- Product grid:
  - Image placeholder / emoji
  - Badge (Best Seller/Premium/Popular)
  - Vendor name
  - Product name
  - Rating stars + review count
  - Tags (3 items)
  - Key details (bintang, jarak, tipe)
  - Price + CTA
- Hover effects

**Mock Data:** 30 items across all categories

---

### 3.6 FORUM (Komunitas)

**Referensi Desain:** Kaskus-style table layout (BUKAN blog cards)

**Struktur Folder:**
```
src/
├── app/(dashboard)/forum/
│   └── page.tsx              # Forum page
└── data/
    └── mock-forum.ts         # Mock data forum
```

**Kategori:**
- Semua
- Review (⭐) - Review hotel, vendor
- Regulasi (📜) - Diskusi aturan
- Operasional (⚙️) - Tips handling
- Sharing (💬) - Pengalaman
- Scam Alert (🚨) - Peringatan penipuan
- Tanya Jawab (❓) - Q&A

**Komponen UI:**
- Header: Title + stats (online, members, threads) + "Buat Thread" button
- Category pills dengan count badge
- Search + Sort tabs (Terbaru/Terpanas/Top)
- Thread table (Flexbox, bukan Grid):
  - Header row: THREAD | BALAS | LIHAT | TERAKHIR
  - Thread rows:
    - Avatar (36px)
    - Title + meta (author, badge, category tag, hashtags)
    - Reply count (large, colored if hot)
    - View count
    - Last reply (user + time ago)
  - Pinned threads: Yellow background + pin icon
  - Hot threads: Flame icon
  - Solved threads: CheckCircle icon
- Pagination

**Mock Data:** 12 threads dengan variasi kategori dan status

---

### 3.7 SIDEBAR NAVIGATION UPDATE

**Task:** Tambah menu Platform pages ke sidebar

**Struktur Sidebar Baru:**
```
📊 Dashboard

── OPERASIONAL ──
👥 Jemaah
📦 Paket
✈️ Keberangkatan
📄 Dokumen

── PLATFORM ──
🛒 Marketplace
💬 Forum
📰 Berita
🎓 Akademi
🌏 Trade Centre
🛎️ Layanan

── LAINNYA ──
📈 Laporan
🏢 Profil Agensi
⚙️ Pengaturan
❓ Bantuan
```

**File yang perlu diupdate:**
- `src/config/navigation.ts`
- `src/components/layout/sidebar.tsx`

---

## 4. PHASE 2B: AGENT BACKLOG

### 4.1 ROOMING LIST MANAGEMENT

**Priority:** HIGH

**Fitur:**
- Assign pilgrim ke kamar
- Room types: Single, Double, Triple, Quad
- Drag & drop untuk arrange
- Auto-calculate room cost
- Print rooming list

**Files:**
```
src/
├── app/(dashboard)/trips/[id]/rooming/
│   └── page.tsx
├── components/trips/
│   ├── rooming-list.tsx
│   └── room-card.tsx
└── lib/services/
    └── rooming.service.ts
```

**Database:** Tambah kolom di Pilgrim model:
- `roomNumber`
- `roomType`
- `roomMateIds`

---

### 4.2 MANIFEST CRUD

**Priority:** HIGH

**Fitur:**
- Add pilgrim to trip manifest
- Remove pilgrim from manifest
- Bulk add dari filter
- Validate capacity

**UI Location:** `/trips/[id]` detail page → Manifest section

**API Endpoints:**
```
POST   /api/trips/[id]/manifest        # Add pilgrim
DELETE /api/trips/[id]/manifest/[pilgrimId]  # Remove
POST   /api/trips/[id]/manifest/bulk   # Bulk add
```

---

### 4.3 IMPORT CSV JEMAAH

**Priority:** MEDIUM

**Fitur:**
- Upload CSV/Excel file
- Preview data sebelum import
- Validation per row
- Error handling dengan line number
- Skip duplicates option

**UI Location:** `/pilgrims` → "Import" button

**Template CSV:**
```csv
nik,name,gender,birthPlace,birthDate,address,city,province,phone,email,emergencyName,emergencyPhone,emergencyRelation
```

---

### 4.4 STATUS TIMELINE VISUAL

**Priority:** MEDIUM

**Fitur:**
- Visual timeline di pilgrim detail
- Show progression: Lead → DP → Lunas → ... → Completed
- Timestamp per status change
- Notes per transition

**UI Location:** `/pilgrims/[id]` → Status section

---

### 4.5 BULK ACTIONS

**Priority:** MEDIUM

**Fitur:**
- Select multiple pilgrims
- Actions:
  - Update status
  - Assign to trip
  - Export selected
  - Delete selected

**UI Location:** `/pilgrims` list page → Checkbox column + Action bar

---

### 4.6 BROCHURE GENERATOR

**Priority:** LOW

**Fitur:**
- Generate PDF/Image dari package
- Template pilihan
- Include: Itinerary, hotel info, pricing, inclusions
- Watermark dengan logo agency

**UI Location:** `/packages/[id]` → "Generate Brochure" button

**Library:** jsPDF atau puppeteer untuk server-side PDF

---

## 5. PHASE 2C: GEZMA PILGRIM (MVP)

### Overview

Aplikasi terpisah atau section berbeda untuk **jemaah** (bukan travel agent).

**Scope MVP:**
- Bisa akses dengan kode booking
- Lihat detail perjalanan
- Manasik digital (text + video)
- Panduan doa
- Checklist dokumen sendiri

**NOT in MVP:**
- Gamifikasi
- GezmaPay
- Social commerce
- AR features

### Struktur (Opsi 1: Integrated)

```
src/app/
├── (dashboard)/        # Untuk travel agent
└── (pilgrim)/          # Untuk jemaah
    ├── layout.tsx
    ├── login/page.tsx  # Login dengan booking code
    ├── page.tsx        # Home/Dashboard jemaah
    ├── trip/page.tsx   # Detail perjalanan
    ├── manasik/page.tsx
    ├── doa/page.tsx
    └── profile/page.tsx
```

### Struktur (Opsi 2: Separate App)

Build sebagai project terpisah nanti.

---

## 6. PHASE 3: INTEGRASI

### 6.1 NUSUK API (Deferred)

**Status:** Menunggu akses

**Preparation:**
- Abstract inventory service layer
- Add nullable nusuk fields di database
- UI placeholder "Coming Soon: Nusuk Integration"

**When Available:**
- Hotel inventory sync
- Visa submission
- Status tracking

---

### 6.2 PAYMENT GATEWAY

**Provider Options:** Midtrans, Xendit, atau Duitku

**Features:**
- Virtual Account
- QRIS
- Credit Card
- E-Wallet (GoPay, OVO, DANA)

**Integration Points:**
- Pilgrim payment page
- Auto-update payment status
- Receipt generation

---

### 6.3 WHATSAPP API

**Provider Options:** Fonnte, Wablas, atau official WhatsApp Business API

**Features:**
- Notifikasi ke jemaah (reminder, status update)
- Broadcast ke grup keberangkatan
- Auto-reply basic

---

### 6.4 UMRAHCASH (Fintech)

**Status:** Menunggu partnership

**Features:**
- Cross-border payment IDR → SAR
- Fixed rate lock
- Split payment

---

## 7. PHASE 4: ADVANCED FEATURES

### Future Scope (Tidak Dalam Plan Ini)

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

## 8. TECHNICAL GUIDELINES

### 8.1 Styling Rules

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

### 8.2 Component Patterns

**Page Header:**
```tsx
<div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
  {/* Header */}
  <div>
    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
      Page Title
    </h1>
    <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
      Description text
    </p>
  </div>
  
  {/* Content */}
  ...
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

**Hover Effect:**
```tsx
<div
  onMouseEnter={(e) => { 
    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; 
    e.currentTarget.style.transform = 'translateY(-2px)'; 
  }}
  onMouseLeave={(e) => { 
    e.currentTarget.style.boxShadow = 'none'; 
    e.currentTarget.style.transform = 'translateY(0)'; 
  }}
>
```

---

### 8.3 Mock Data Structure

**Location:** `src/data/mock-*.ts`

**Pattern:**
```typescript
// Types
export type CategoryType = 'cat1' | 'cat2' | 'cat3';

export interface Item {
  id: string;
  name: string;
  category: CategoryType;
  // ...
}

// Categories with metadata
export const categories = [
  { id: 'cat1', label: 'Category 1', icon: '📦', color: '#2563EB' },
  // ...
];

// Stats
export const stats = {
  totalItems: 100,
  // ...
};

// Data
export const items: Item[] = [
  // ...
];
```

---

### 8.4 File Naming

```
Pages:         page.tsx (Next.js convention)
Components:    kebab-case.tsx (e.g., rooming-list.tsx)
Mock Data:     mock-{domain}.ts (e.g., mock-forum.ts)
Services:      {domain}.service.ts
Types:         {domain}.ts atau index.ts
```

---

## 9. EXECUTION CHECKLIST

### Phase 2A: Platform Pages

```
□ BERITA
  □ Buat src/data/mock-news.ts
  □ Buat src/app/(dashboard)/news/page.tsx
  □ Test kategori filter
  □ Test search
  □ Verify responsive

□ AKADEMI
  □ Buat src/data/mock-academy.ts
  □ Buat src/app/(dashboard)/academy/page.tsx
  □ Test kategori filter
  □ Test level filter
  □ Test search
  □ Verify responsive

□ LAYANAN
  □ Update src/app/(dashboard)/services/page.tsx
  □ Verify semua section tampil
  □ Verify responsive

□ TRADE CENTRE
  □ Buat src/data/mock-trade.ts
  □ Buat src/app/(dashboard)/trade/page.tsx
  □ Test tab Katalog
  □ Test tab Pengajuan
  □ Test kategori filter
  □ Test search
  □ Verify responsive

□ MARKETPLACE
  □ Buat src/data/mock-marketplace.ts
  □ Buat src/app/(dashboard)/marketplace/page.tsx
  □ Test kategori tabs
  □ Test filter panel
  □ Test sort
  □ Test search
  □ Verify responsive

□ FORUM
  □ Buat src/data/mock-forum.ts
  □ Buat src/app/(dashboard)/forum/page.tsx
  □ Test kategori filter
  □ Test sort (Terbaru/Terpanas/Top)
  □ Test search
  □ Verify table layout tidak overflow
  □ Verify responsive

□ SIDEBAR UPDATE
  □ Update src/config/navigation.ts
  □ Update sidebar component
  □ Test semua navigation links
  □ Verify active state
```

### Phase 2B: Agent Backlog

```
□ ROOMING LIST
  □ Database migration (tambah fields)
  □ API endpoints
  □ UI component
  □ Integration di trip detail

□ MANIFEST CRUD
  □ API endpoints
  □ UI di trip detail
  □ Validation

□ IMPORT CSV
  □ Upload component
  □ Preview modal
  □ Validation
  □ API endpoint

□ STATUS TIMELINE
  □ Component
  □ Data structure
  □ Integration di pilgrim detail

□ BULK ACTIONS
  □ Checkbox column
  □ Action bar
  □ API endpoints

□ BROCHURE GENERATOR
  □ Template design
  □ PDF generation
  □ UI integration
```

---

## 📎 APPENDIX

### A. Prompt untuk CLI

Semua prompt untuk Platform Pages sudah disiapkan dalam format yang bisa langsung di-copy ke Claude CLI. Lihat conversation history untuk:
- Prompt Berita
- Prompt Akademi
- Prompt Layanan
- Prompt Trade Centre
- Prompt Marketplace
- Prompt Forum

### B. Color Reference

```css
/* GEZMA Primary */
--gezma-red: #F60000;
--gezma-red-hover: #E40000;

/* Category Colors */
--blue: #2563EB;
--green: #059669;
--orange: #D97706;
--purple: #7C3AED;
--red: #DC2626;
--teal: #0891B2;
--pink: #EC4899;

/* Neutral */
--charcoal: #111827;
--gray-600: #4B5563;
--gray-400: #9CA3AF;
--gray-border: #E5E7EB;
--gray-bg: #F3F4F6;
```

### C. Related Documents

- `GEZMA-AGENT-PLAN-v2.md` - Original frontend plan
- `CHECKPOINT.md` - Development checkpoint
- `BLUEPRINT-TRACKING.md` - Blueprint vs actual status

---

*Plan Version: 3.0*  
*Created: 2026-02-23*  
*Target: Phase 2 Completion*  
*Status: Ready for Execution*
