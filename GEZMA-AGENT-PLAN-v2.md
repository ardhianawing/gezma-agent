# GEZMA Agent - Frontend Prototype Plan v2.0

## Executive Summary

GEZMA Agent adalah **SaaS Dashboard untuk Travel Agency Umrah (PPIU)** - sistem operasi internal untuk manajemen operasional travel umrah. Bukan aplikasi booking, bukan OTA, bukan aplikasi jemaah. Ini adalah *operating system* untuk travel agency.

**Scope Phase 1**: Frontend Prototype (PWA-ready) dengan arsitektur white-label ready.

---

## 1. Project Overview

### 1.1 What GEZMA Agent IS:
- Internal operational dashboard untuk travel agency
- CRM untuk manajemen data jemaah dengan status lifecycle
- Document management (passport, visa, dll)
- Package/itinerary builder dengan kalkulasi HPP
- Trip manifest & operational checklist
- Agency profile & legal verification (QR Code)
- Action center / operational alerts
- **PWA (Progressive Web App)** - installable, offline-capable

### 1.2 What GEZMA Agent is NOT:
- Bukan travel booking app (OTA)
- Bukan aplikasi untuk jemaah (itu Gezma Pilgrim - nanti)
- Bukan marketplace B2B (itu fase berikutnya)
- **Bukan** booking hotel/ticket inventory (Phase 1)
- **Bukan** Nusuk integration (Phase 1)
- **Bukan** blockchain implementation (Phase 1)

### 1.3 Target Users:
- Travel Owner / Pemilik PPIU
- Admin Operasional
- Staff Marketing

### 1.4 Future-Proofing:
- White-label architecture ready
- Multi-tenant structure prepared
- API-first mindset (mock data now, real API later)

---

## 2. Design System (Brand Tokens)

### 2.1 Color Palette
```css
/* Primary Colors - GEZMA Red */
--gezma-red: #F60000;           /* Primary accent - CTA, active states */
--gezma-red-hover: #E40000;     /* Hover state */
--gezma-red-pressed: #CB0000;   /* Pressed/active state */
--gezma-red-light: #FFE5E5;     /* Light tint for backgrounds */

/* Neutral Colors */
--charcoal: #3A3A3A;            /* Primary text */
--charcoal-light: #4A4A4A;      /* Secondary text */
--gray-600: #6B7280;            /* Muted text */
--gray-400: #9CA3AF;            /* Placeholder */
--gray-border: #DDD9D9;         /* Borders */
--gray-200: #E5E7EB;            /* Dividers */
--gray-100: #F3F4F6;            /* Light backgrounds */
--white: #FFFFFF;               /* Background */

/* Semantic Colors */
--success: #10B981;
--success-light: #D1FAE5;
--warning: #F59E0B;
--warning-light: #FEF3C7;
--error: #EF4444;
--error-light: #FEE2E2;
--info: #3B82F6;
--info-light: #DBEAFE;
```

### 2.2 Typography
```css
/* Font Family */
--font-primary: 'Satoshi', sans-serif;      /* Primary font */
--font-mono: 'JetBrains Mono', monospace;   /* Code, IDs, reference numbers */

/* Font Weights */
--font-regular: 400;    /* Body text */
--font-medium: 500;     /* Emphasis, labels */
--font-semibold: 600;   /* Subheadings, buttons */
--font-bold: 700;       /* Headings, key metrics */

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px - captions, badges */
--text-sm: 0.875rem;    /* 14px - body small, table cells */
--text-base: 1rem;      /* 16px - body default */
--text-lg: 1.125rem;    /* 18px - body large */
--text-xl: 1.25rem;     /* 20px - subheading */
--text-2xl: 1.5rem;     /* 24px - section heading */
--text-3xl: 1.875rem;   /* 30px - page heading */
--text-4xl: 2.25rem;    /* 36px - hero/dashboard */
```

### 2.3 Design Principles
- **Clean & Spacious**: Whitespace-heavy layout (Linear/Notion style)
- **Dominant White**: White background, minimal visual clutter
- **Red Sparingly**: Only for CTA buttons, active states, critical alerts
- **Border Radius**: 12-14px (premium SaaS feel)
- **Shadows**: Very subtle, almost flat design
- **Hierarchy**: Clear visual hierarchy with typography weights

### 2.4 Component Styling Guidelines
```css
/* Border Radius */
--radius-sm: 8px;       /* Small elements (badges, tags) */
--radius-md: 12px;      /* Buttons, inputs, cards */
--radius-lg: 14px;      /* Modals, large cards */
--radius-xl: 16px;      /* Full-screen modals */

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.08);
```

---

## 3. Tech Stack

### 3.1 Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v3
- **UI Components**: shadcn/ui (customized dengan GEZMA tokens)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand (untuk global state)
- **Tables**: TanStack Table
- **Charts**: Recharts

### 3.2 PWA Requirements
- **Web App Manifest**: name, icons, theme_color, start_url
- **Service Worker**: App shell caching strategy
- **Installability**: Add to Home Screen prompt
- **Offline Fallback**: No-connection page
- **Performance**: LCP < 2.5s, optimized bundle

### 3.3 Development Tools
- **Language**: TypeScript
- **Linting**: ESLint + Prettier
- **Package Manager**: npm

### 3.4 White-Label Architecture
```
Multi-tenant ready structure:
- Tenant config dari URL subdomain atau path
- Theme/branding per tenant (logo, colors optional override)
- Tenant context provider
```

---

## 4. PWA Requirements (Phase 1)

### 4.1 Web App Manifest
```json
{
  "name": "GEZMA Agent",
  "short_name": "GEZMA",
  "description": "Travel Agency Operations Dashboard",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#F60000",
  "background_color": "#FFFFFF",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192" },
    { "src": "/icons/icon-512.png", "sizes": "512x512" }
  ]
}
```

### 4.2 Service Worker Strategy
- **Caching**: App shell (HTML, CSS, JS, fonts)
- **Strategy**: Cache-first for static assets, network-first for API
- **Offline**: Show offline fallback page when no connection

### 4.3 Performance Targets
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1
- Bundle size: Optimized with code splitting

### 4.4 Platform Support
- Desktop: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Android Chrome
- Installable on both desktop and mobile

---

## 5. Information Architecture

### 5.1 Module Structure

```
GEZMA Agent
├── 🏠 Dashboard (Overview)
│   ├── Stats summary (total jemaah, trips aktif, pendapatan)
│   ├── Action Center / Operational Alerts
│   │   ├── Pilgrims missing documents
│   │   ├── Trips with incomplete manifest
│   │   ├── Agency license expiring
│   │   └── Payments pending
│   ├── Upcoming departures
│   ├── Recent activities
│   └── Quick actions
│
├── 👥 Pilgrims (CRM Jemaah)
│   ├── List semua jemaah (with status badges)
│   ├── Add/Edit jemaah
│   ├── Detail jemaah
│   │   ├── Profile & contact
│   │   ├── Documents (passport, visa, KTP)
│   │   ├── Payment history
│   │   ├── Trip history
│   │   └── Checklist per pilgrim
│   ├── Status filtering & bulk actions
│   └── Import/Export data
│
├── 📦 Packages (Paket Umrah)
│   ├── List paket
│   ├── Package builder (create/edit)
│   │   ├── Basic info (nama, durasi, kategori)
│   │   ├── Itinerary builder (day by day)
│   │   ├── Pricing calculator (HPP + margin)
│   │   └── Inclusions/exclusions
│   ├── Brochure generator (PDF/Image)
│   └── Package templates
│
├── ✈️ Trips (Keberangkatan)
│   ├── List trips (with status)
│   ├── Trip detail
│   │   ├── Manifest jemaah
│   │   ├── Rooming list
│   │   ├── Flight info
│   │   ├── Operational checklist
│   │   └── Documents per trip
│   ├── Create trip (from package)
│   └── Trip status tracking
│
├── 📄 Documents (Dokumen Agency)
│   ├── PPIU License
│   ├── Company documents
│   ├── Certificates
│   └── QR Verification page (public)
│
├── 🏢 Agency Profile
│   ├── Company info
│   ├── Bank accounts
│   ├── Contact persons
│   ├── Branding settings (logo, colors)
│   └── Legal status & expiry alerts
│
└── ⚙️ Settings
    ├── User management (staff)
    ├── Roles & permissions
    ├── Notification preferences
    └── Integration settings (placeholder)
```

### 5.2 Pilgrim Status System

Status digunakan di seluruh sistem untuk tracking lifecycle jemaah:

| Status | Description | Badge Color |
|--------|-------------|-------------|
| **Lead/Draft** | Data awal, belum commit | Gray |
| **DP** | Sudah bayar DP | Blue |
| **Lunas** | Pembayaran lengkap | Green |
| **Dokumen Complete** | Semua dokumen masuk | Teal |
| **Visa Process** | Visa sedang diproses | Yellow |
| **Ready** | Siap berangkat | Purple |
| **Departed** | Sudah berangkat | Orange |
| **Completed** | Selesai, sudah pulang | Green (success) |

**Where Status Appears:**
- Pilgrim list table (filterable badge column)
- Pilgrim detail page (status timeline)
- Action Center alerts
- Trip manifest (status per pilgrim)
- Dashboard statistics

### 5.3 Operational Checklists

**Per Pilgrim Checklist:**
- [ ] KTP uploaded
- [ ] Passport uploaded & valid
- [ ] Pas foto uploaded
- [ ] DP paid
- [ ] Full payment
- [ ] Visa application submitted
- [ ] Visa received
- [ ] Health certificate

**Per Trip Checklist:**
- [ ] All pilgrims confirmed
- [ ] Manifest complete
- [ ] Rooming list finalized
- [ ] Flight tickets issued
- [ ] Hotel confirmed
- [ ] Guide/muthawwif assigned
- [ ] Insurance processed
- [ ] Departure briefing done

### 5.4 User Flows

**Flow 1: Add New Pilgrim**
```
Dashboard → Pilgrims → Add Pilgrim → Form (basic + documents) → Save → View Detail → Start Checklist
```

**Flow 2: Create Package**
```
Packages → Create → Basic Info → Itinerary Builder → Pricing → Preview → Save
```

**Flow 3: Create Trip from Package**
```
Packages → Select → Create Trip → Set Dates → Add Pilgrims → Generate Manifest → Operational Checklist
```

**Flow 4: Handle Action Center Alert**
```
Dashboard → Action Center → Click Alert → Navigate to Detail → Resolve Issue → Mark Complete
```

---

## 6. Folder Structure

```
D:\Gezma-Project\gezma-agent\
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-icon.svg
│   │   └── logo-white.svg
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── fonts/
│   │   └── Satoshi/
│   ├── manifest.json
│   └── offline.html
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Dashboard
│   │   │   │
│   │   │   ├── pilgrims/
│   │   │   │   ├── page.tsx              # List
│   │   │   │   ├── new/page.tsx          # Add
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Detail
│   │   │   │       └── edit/page.tsx     # Edit
│   │   │   │
│   │   │   ├── packages/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/page.tsx
│   │   │   │
│   │   │   ├── trips/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   │
│   │   │   ├── documents/page.tsx
│   │   │   ├── agency/page.tsx
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── users/page.tsx
│   │   │       └── integrations/page.tsx
│   │   │
│   │   ├── verify/[code]/page.tsx        # Public verification
│   │   │
│   │   ├── offline/page.tsx              # PWA offline page
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── breadcrumb.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx
│   │   │   ├── action-center.tsx         # Operational alerts
│   │   │   ├── upcoming-trips.tsx
│   │   │   ├── recent-activity.tsx
│   │   │   └── quick-actions.tsx
│   │   │
│   │   ├── pilgrims/
│   │   │   ├── pilgrim-form.tsx
│   │   │   ├── pilgrim-table.tsx
│   │   │   ├── pilgrim-card.tsx
│   │   │   ├── pilgrim-checklist.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── status-timeline.tsx
│   │   │   └── document-upload.tsx
│   │   │
│   │   ├── packages/
│   │   │   ├── package-form.tsx
│   │   │   ├── itinerary-builder.tsx
│   │   │   ├── pricing-calculator.tsx
│   │   │   └── brochure-preview.tsx
│   │   │
│   │   ├── trips/
│   │   │   ├── trip-form.tsx
│   │   │   ├── manifest-table.tsx
│   │   │   ├── rooming-list.tsx
│   │   │   └── trip-checklist.tsx
│   │   │
│   │   └── shared/
│   │       ├── page-header.tsx
│   │       ├── empty-state.tsx
│   │       ├── loading-skeleton.tsx
│   │       ├── data-table.tsx
│   │       └── offline-indicator.tsx
│   │
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── validations/
│   │
│   ├── hooks/
│   │   ├── use-tenant.ts
│   │   ├── use-sidebar.ts
│   │   ├── use-mobile.ts
│   │   └── use-online.ts                 # PWA online status
│   │
│   ├── stores/
│   │   ├── tenant-store.ts
│   │   └── ui-store.ts
│   │
│   ├── types/
│   │   ├── pilgrim.ts
│   │   ├── package.ts
│   │   ├── trip.ts
│   │   ├── agency.ts
│   │   └── index.ts
│   │
│   ├── data/
│   │   ├── mock-agencies.ts              # 3 sample agencies
│   │   ├── mock-pilgrims.ts              # 20 pilgrims
│   │   ├── mock-packages.ts              # 6 packages
│   │   ├── mock-trips.ts                 # 5 trips
│   │   └── mock-activity.ts
│   │
│   └── config/
│       ├── site.ts
│       ├── navigation.ts
│       └── tenant.ts
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 7. Pages to Build

### Phase 1A: Foundation (Core UI)
| # | Page | Route | Priority |
|---|------|-------|----------|
| 1 | Login | `/login` | High |
| 2 | Register | `/register` | High |
| 3 | Dashboard (with Action Center) | `/` | High |
| 4 | Sidebar + Header Layout | - | High |
| 5 | Offline Page | `/offline` | High |

### Phase 1B: Pilgrims Module
| # | Page | Route | Priority |
|---|------|-------|----------|
| 6 | Pilgrim List (with status filter) | `/pilgrims` | High |
| 7 | Add Pilgrim | `/pilgrims/new` | High |
| 8 | Pilgrim Detail (with checklist) | `/pilgrims/[id]` | High |
| 9 | Edit Pilgrim | `/pilgrims/[id]/edit` | Medium |

### Phase 1C: Packages Module
| # | Page | Route | Priority |
|---|------|-------|----------|
| 10 | Package List | `/packages` | High |
| 11 | Create Package | `/packages/new` | High |
| 12 | Package Detail | `/packages/[id]` | Medium |
| 13 | Edit Package | `/packages/[id]/edit` | Medium |

### Phase 1D: Trips Module
| # | Page | Route | Priority |
|---|------|-------|----------|
| 14 | Trip List | `/trips` | High |
| 15 | Create Trip | `/trips/new` | Medium |
| 16 | Trip Detail (Manifest + Checklist) | `/trips/[id]` | High |

### Phase 1E: Agency & Settings
| # | Page | Route | Priority |
|---|------|-------|----------|
| 17 | Agency Documents | `/documents` | Medium |
| 18 | Agency Profile | `/agency` | Medium |
| 19 | Settings | `/settings` | Low |
| 20 | User Management | `/settings/users` | Low |
| 21 | Public Verification | `/verify/[code]` | Medium |

---

## 8. Components to Build

### 8.1 Base UI Components (shadcn/ui customized)
- [ ] Button (variants: default, destructive, outline, ghost)
- [ ] Input
- [ ] Textarea
- [ ] Select
- [ ] Checkbox
- [ ] Radio
- [ ] Switch
- [ ] Card
- [ ] Dialog/Modal
- [ ] Dropdown Menu
- [ ] Table
- [ ] Tabs
- [ ] Badge (with status colors)
- [ ] Avatar
- [ ] Toast/Notification
- [ ] Skeleton loader
- [ ] Tooltip

### 8.2 Layout Components
- [ ] Sidebar (collapsible)
- [ ] Header (with user menu)
- [ ] Breadcrumb
- [ ] Page Header (title + actions)
- [ ] Mobile Navigation

### 8.3 Dashboard Components
- [ ] Stats Cards
- [ ] Action Center (operational alerts)
- [ ] Upcoming Trips Widget
- [ ] Recent Activity
- [ ] Quick Actions

### 8.4 Pilgrim Components
- [ ] Pilgrim Form
- [ ] Pilgrim Table (with status column)
- [ ] Status Badge
- [ ] Status Timeline
- [ ] Pilgrim Checklist
- [ ] Document Upload Widget

### 8.5 Package Components
- [ ] Package Form
- [ ] Itinerary Builder
- [ ] Pricing Calculator
- [ ] Package Card

### 8.6 Trip Components
- [ ] Trip Form
- [ ] Manifest Table
- [ ] Rooming List Generator
- [ ] Trip Checklist

### 8.7 PWA Components
- [ ] Offline Indicator
- [ ] Install Prompt
- [ ] Offline Page

---

## 9. Mock Data Scenarios

### 9.1 Sample Agencies (3)
1. **PT. Barokah Travel** - Large agency, 500+ pilgrims/year
2. **Safar Umrah Tour** - Medium agency, 200 pilgrims/year
3. **Al-Hikmah Travel** - Small agency, 50 pilgrims/year

### 9.2 Sample Pilgrims (20)
- Mix of statuses (Lead, DP, Lunas, etc.)
- Various document completion states
- Different age groups and genders
- Some with complete data, some incomplete (for testing alerts)

### 9.3 Sample Packages (6)
1. Umrah Reguler 9 Hari
2. Umrah Plus Turki 12 Hari
3. Umrah Ramadhan 14 Hari
4. Umrah VIP Executive 9 Hari
5. Umrah Budget Hemat 9 Hari
6. Umrah Plus Mesir 14 Hari

### 9.4 Sample Trips (5)
- 1 completed trip (history)
- 1 ongoing trip (departed)
- 2 upcoming trips (different dates)
- 1 trip in preparation (incomplete manifest)

---

## 10. Deliverables

### 10.1 Prototype
- Clickable frontend prototype with all routes
- All pages functional with mock data
- Responsive design (desktop + mobile)
- PWA installable

### 10.2 Design System
- Documented component library
- Color tokens & typography
- Consistent styling across all pages

### 10.3 Mock Data
- 3 sample agencies
- 20 pilgrims (various statuses)
- 6 packages
- 5 trips
- Realistic Indonesian data (names, addresses, etc.)

### 10.4 Demo Script (5-minute walkthrough)
1. **Login** (30s) - Show login page, enter demo credentials
2. **Dashboard** (60s) - Overview stats, Action Center alerts
3. **Pilgrims** (90s) - List, add new, view detail with checklist
4. **Packages** (60s) - List, view itinerary builder
5. **Trips** (60s) - List, view manifest, show checklist
6. **Agency** (30s) - Profile, verification QR

### 10.5 Acceptance Checklist
- [ ] All 21 pages render without errors
- [ ] Sidebar navigation works correctly
- [ ] Forms validate input (client-side)
- [ ] Responsive on desktop (1280px+) and mobile (375px)
- [ ] Data tables sort and filter correctly
- [ ] Mock data displays properly
- [ ] Colors match GEZMA branding (#F60000)
- [ ] Typography uses Satoshi font
- [ ] Border radius is 12-14px
- [ ] Empty states show appropriately
- [ ] Loading skeletons implemented
- [ ] Status badges show correct colors
- [ ] Action Center shows alerts
- [ ] Checklists are interactive
- [ ] PWA manifest configured
- [ ] Offline page shows when disconnected
- [ ] Install prompt works (PWA)

---

## 11. Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 14 (App Router) | Modern, supports RSC, good DX |
| Styling | Tailwind + shadcn/ui | Fast development, customizable |
| Primary Font | Satoshi | Premium SaaS feel, legibility |
| Primary Color | #F60000 | Brand color from logo |
| Border Radius | 12-14px | Premium SaaS aesthetic |
| State | Zustand | Lightweight, simple |
| Multi-tenant | Architecture ready | Future-proof |
| PWA | Required Phase 1 | Mobile-friendly, offline-capable |
| Mock Data | Static JSON | Prototype phase, no backend yet |

---

## 12. TypeScript Type Definitions

### 12.1 Core Types (types/index.ts)

```typescript
// ============================================
// ENUMS & CONSTANTS
// ============================================

export const PILGRIM_STATUS = {
  LEAD: 'lead',
  DP: 'dp',
  LUNAS: 'lunas',
  DOKUMEN: 'dokumen',
  VISA: 'visa',
  READY: 'ready',
  DEPARTED: 'departed',
  COMPLETED: 'completed',
} as const;

export type PilgrimStatus = typeof PILGRIM_STATUS[keyof typeof PILGRIM_STATUS];

export const PILGRIM_STATUS_CONFIG: Record<PilgrimStatus, { label: string; color: string; bgColor: string }> = {
  lead: { label: 'Lead', color: '#6B7280', bgColor: '#F3F4F6' },
  dp: { label: 'DP', color: '#1D4ED8', bgColor: '#DBEAFE' },
  lunas: { label: 'Lunas', color: '#047857', bgColor: '#D1FAE5' },
  dokumen: { label: 'Dokumen', color: '#0F766E', bgColor: '#CCFBF1' },
  visa: { label: 'Visa Process', color: '#B45309', bgColor: '#FEF3C7' },
  ready: { label: 'Ready', color: '#6D28D9', bgColor: '#EDE9FE' },
  departed: { label: 'Departed', color: '#C2410C', bgColor: '#FFEDD5' },
  completed: { label: 'Completed', color: '#15803D', bgColor: '#DCFCE7' },
};

export const DOCUMENT_TYPE = {
  KTP: 'ktp',
  PASSPORT: 'passport',
  PHOTO: 'photo',
  VISA: 'visa',
  HEALTH_CERT: 'health_cert',
  BOOK_NIKAH: 'book_nikah',
} as const;

export type DocumentType = typeof DOCUMENT_TYPE[keyof typeof DOCUMENT_TYPE];

export const DOCUMENT_STATUS = {
  MISSING: 'missing',
  UPLOADED: 'uploaded',
  VERIFIED: 'verified',
  EXPIRED: 'expired',
  REJECTED: 'rejected',
} as const;

export type DocumentStatus = typeof DOCUMENT_STATUS[keyof typeof DOCUMENT_STATUS];

export const PACKAGE_CATEGORY = {
  REGULAR: 'regular',
  PLUS: 'plus',
  VIP: 'vip',
  RAMADHAN: 'ramadhan',
  BUDGET: 'budget',
} as const;

export type PackageCategory = typeof PACKAGE_CATEGORY[keyof typeof PACKAGE_CATEGORY];

export const TRIP_STATUS = {
  OPEN: 'open',
  PREPARING: 'preparing',
  READY: 'ready',
  DEPARTED: 'departed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type TripStatus = typeof TRIP_STATUS[keyof typeof TRIP_STATUS];

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
} as const;

export type Gender = typeof GENDER[keyof typeof GENDER];
```

### 12.2 Pilgrim Types (types/pilgrim.ts)

```typescript
import { DocumentType, DocumentStatus, PilgrimStatus, Gender } from './index';

export interface PilgrimDocument {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number; // in bytes
  uploadedAt?: string; // ISO date
  expiryDate?: string; // ISO date (for passport)
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string; // e.g., "Istri", "Suami", "Anak", "Orang Tua"
}

export interface PilgrimChecklist {
  ktpUploaded: boolean;
  passportUploaded: boolean;
  passportValid: boolean; // > 6 months from departure
  photoUploaded: boolean;
  dpPaid: boolean;
  dpAmount?: number;
  dpDate?: string;
  fullPayment: boolean;
  fullPaymentDate?: string;
  visaSubmitted: boolean;
  visaSubmittedDate?: string;
  visaReceived: boolean;
  visaReceivedDate?: string;
  healthCertificate: boolean;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  type: 'dp' | 'installment' | 'full' | 'refund';
  method: 'transfer' | 'cash' | 'card';
  date: string;
  notes?: string;
  receiptUrl?: string;
}

export interface Pilgrim {
  id: string;

  // Personal Info
  nik: string; // 16 digits
  name: string;
  gender: Gender;
  birthPlace: string;
  birthDate: string; // ISO date
  address: string;
  city: string;
  province: string;
  postalCode?: string;

  // Contact
  phone: string;
  email: string;
  whatsapp?: string;

  // Emergency Contact
  emergencyContact: EmergencyContact;

  // Status & Assignment
  status: PilgrimStatus;
  tripId?: string;
  roomNumber?: string;
  roomType?: 'single' | 'double' | 'triple' | 'quad';

  // Documents
  documents: PilgrimDocument[];

  // Checklist
  checklist: PilgrimChecklist;

  // Payments
  payments: PaymentRecord[];
  totalPaid: number;
  remainingBalance: number;

  // Metadata
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// For list/table display
export interface PilgrimSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: PilgrimStatus;
  tripId?: string;
  tripName?: string;
  documentsComplete: number;
  documentsTotal: number;
  createdAt: string;
}
```

### 12.3 Package Types (types/package.ts)

```typescript
import { PackageCategory } from './index';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface ItineraryActivity {
  id: string;
  time: string; // e.g., "08:00"
  title: string;
  description?: string;
  location?: string;
}

export interface ItineraryDay {
  day: number;
  date?: string; // Optional, calculated from trip departure
  title: string; // e.g., "Kedatangan di Madinah"
  description?: string;
  activities: ItineraryActivity[];
  meals: MealType[];
  hotel?: string;
  city: string; // "Madinah", "Makkah", "Jeddah"
}

export interface PricingBreakdown {
  airline: number;
  hotel: number;
  visa: number;
  transport: number;
  meals: number;
  guide: number;
  insurance: number;
  handling: number;
  others: number;
}

export interface Package {
  id: string;

  // Basic Info
  name: string;
  slug: string;
  category: PackageCategory;
  description: string;
  duration: number; // days

  // Itinerary
  itinerary: ItineraryDay[];

  // Pricing
  hpp: PricingBreakdown; // Harga Pokok Penjualan
  totalHpp: number;
  margin: number; // percentage
  marginAmount: number;
  publishedPrice: number;

  // Inclusions
  inclusions: string[];
  exclusions: string[];

  // Hotels
  makkahHotel: string;
  makkahHotelRating: number; // 3, 4, 5
  makkahHotelDistance: string; // e.g., "300m dari Masjidil Haram"
  madinahHotel: string;
  madinahHotelRating: number;
  madinahHotelDistance: string;

  // Airline
  airline: string;

  // Status
  isActive: boolean;
  isPromo: boolean;
  promoPrice?: number;
  promoEndDate?: string;

  // Media
  thumbnailUrl?: string;
  galleryUrls?: string[];
  brochureUrl?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

### 12.4 Trip Types (types/trip.ts)

```typescript
import { TripStatus, PilgrimStatus } from './index';

export interface FlightInfo {
  departureAirline: string;
  departureFlightNo: string;
  departureDate: string;
  departureTime: string;
  departureAirport: string; // e.g., "CGK - Soekarno Hatta"
  departureTerminal?: string;

  returnAirline: string;
  returnFlightNo: string;
  returnDate: string;
  returnTime: string;
  returnAirport: string;
  returnTerminal?: string;
}

export interface ManifestEntry {
  pilgrimId: string;
  pilgrimName: string;
  pilgrimStatus: PilgrimStatus;
  documentsComplete: number;
  documentsTotal: number;
  roomNumber?: string;
  roomType?: string;
  seatPreference?: string;
  mealPreference?: string;
  specialNeeds?: string;
  addedAt: string;
}

export interface RoomAssignment {
  roomNumber: string;
  roomType: 'single' | 'double' | 'triple' | 'quad';
  hotel: 'makkah' | 'madinah';
  pilgrims: {
    pilgrimId: string;
    pilgrimName: string;
  }[];
}

export interface TripChecklist {
  allPilgrimsConfirmed: boolean;
  manifestComplete: boolean;
  roomingListFinalized: boolean;
  flightTicketsIssued: boolean;
  hotelConfirmed: boolean;
  guideAssigned: boolean;
  guideName?: string;
  guidePhone?: string;
  insuranceProcessed: boolean;
  departureBriefingDone: boolean;
  departureBriefingDate?: string;
}

export interface Trip {
  id: string;

  // Basic Info
  name: string; // e.g., "Umrah Reguler - Maret 2026"
  packageId: string;
  packageName: string;

  // Dates
  departureDate: string;
  returnDate: string;
  registrationCloseDate?: string;

  // Capacity
  capacity: number;
  registeredCount: number;
  confirmedCount: number;

  // Status
  status: TripStatus;

  // Flight
  flightInfo: FlightInfo;

  // Manifest
  manifest: ManifestEntry[];

  // Rooming
  roomAssignments: RoomAssignment[];

  // Checklist
  checklist: TripChecklist;

  // Guide
  muthpirimawwifName?: string;
  muthawwifPhone?: string;

  // Pricing (from package, can be overridden)
  pricePerPerson: number;

  // Notes
  notes?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

### 12.5 Agency Types (types/agency.ts)

```typescript
export interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string; // e.g., "014" for BCA
  accountNumber: string;
  accountName: string;
  isPrimary: boolean;
}

export interface ContactPerson {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface AgencyDocument {
  id: string;
  type: 'ppiu_license' | 'siup' | 'npwp' | 'akta' | 'domisili' | 'other';
  name: string;
  number?: string; // Document number
  fileUrl?: string;
  issueDate?: string;
  expiryDate?: string;
  status: 'valid' | 'expiring' | 'expired';
}

export interface AgencyBranding {
  primaryColor: string;
  secondaryColor?: string;
  logoUrl?: string;
  logoIconUrl?: string;
  logoWhiteUrl?: string;
  faviconUrl?: string;
}

export interface Agency {
  id: string;

  // Basic Info
  name: string; // Company name
  legalName: string; // PT. ...
  tagline?: string;
  description?: string;

  // PPIU Info
  ppiuNumber: string; // Nomor izin PPIU
  ppiuIssueDate: string;
  ppiuExpiryDate: string;
  ppiuStatus: 'active' | 'expiring' | 'expired';

  // Contact
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;

  // Address
  address: string;
  city: string;
  province: string;
  postalCode: string;

  // Bank Accounts
  bankAccounts: BankAccount[];

  // Contact Persons
  contactPersons: ContactPerson[];

  // Documents
  documents: AgencyDocument[];

  // Branding
  branding: AgencyBranding;

  // Verification
  verificationCode: string; // For QR code
  verificationUrl: string;
  isVerified: boolean;

  // Settings
  settings: {
    currency: string;
    timezone: string;
    dateFormat: string;
    language: string;
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

---

## 13. Zod Validation Schemas

### 13.1 Pilgrim Validation (lib/validations/pilgrim.ts)

```typescript
import { z } from 'zod';

export const emergencyContactSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  phone: z.string().min(10, 'No HP minimal 10 digit').max(15),
  relation: z.string().min(2, 'Hubungan harus diisi'),
});

export const pilgrimFormSchema = z.object({
  // Personal Info
  nik: z
    .string()
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d+$/, 'NIK hanya boleh angka'),
  name: z.string().min(3, 'Nama minimal 3 karakter').max(100),
  gender: z.enum(['male', 'female'], { required_error: 'Pilih jenis kelamin' }),
  birthPlace: z.string().min(2, 'Tempat lahir harus diisi'),
  birthDate: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 1 && age <= 120;
  }, 'Tanggal lahir tidak valid'),
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
  city: z.string().min(2, 'Kota harus diisi'),
  province: z.string().min(2, 'Provinsi harus diisi'),
  postalCode: z.string().optional(),

  // Contact
  phone: z
    .string()
    .min(10, 'No HP minimal 10 digit')
    .max(15)
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Format No HP tidak valid'),
  email: z.string().email('Email tidak valid'),
  whatsapp: z.string().optional(),

  // Emergency Contact
  emergencyContact: emergencyContactSchema,

  // Optional
  notes: z.string().optional(),
});

export type PilgrimFormData = z.infer<typeof pilgrimFormSchema>;

// For status update
export const pilgrimStatusSchema = z.object({
  status: z.enum(['lead', 'dp', 'lunas', 'dokumen', 'visa', 'ready', 'departed', 'completed']),
  notes: z.string().optional(),
});

// For document upload
export const documentUploadSchema = z.object({
  type: z.enum(['ktp', 'passport', 'photo', 'visa', 'health_cert', 'book_nikah']),
  file: z.any(), // File object, validated separately
  expiryDate: z.string().optional(), // Required for passport
});
```

### 13.2 Package Validation (lib/validations/package.ts)

```typescript
import { z } from 'zod';

export const itineraryActivitySchema = z.object({
  id: z.string(),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu HH:MM'),
  title: z.string().min(3),
  description: z.string().optional(),
  location: z.string().optional(),
});

export const itineraryDaySchema = z.object({
  day: z.number().min(1),
  title: z.string().min(3, 'Judul hari harus diisi'),
  description: z.string().optional(),
  activities: z.array(itineraryActivitySchema).min(1, 'Minimal 1 aktivitas'),
  meals: z.array(z.enum(['breakfast', 'lunch', 'dinner'])),
  hotel: z.string().optional(),
  city: z.string().min(2),
});

export const pricingBreakdownSchema = z.object({
  airline: z.number().min(0),
  hotel: z.number().min(0),
  visa: z.number().min(0),
  transport: z.number().min(0),
  meals: z.number().min(0),
  guide: z.number().min(0),
  insurance: z.number().min(0),
  handling: z.number().min(0),
  others: z.number().min(0),
});

export const packageFormSchema = z.object({
  name: z.string().min(5, 'Nama paket minimal 5 karakter'),
  category: z.enum(['regular', 'plus', 'vip', 'ramadhan', 'budget']),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter'),
  duration: z.number().min(7, 'Durasi minimal 7 hari').max(30, 'Durasi maksimal 30 hari'),

  // Itinerary
  itinerary: z.array(itineraryDaySchema).min(1, 'Minimal 1 hari itinerary'),

  // Pricing
  hpp: pricingBreakdownSchema,
  margin: z.number().min(0).max(100, 'Margin maksimal 100%'),

  // Hotels
  makkahHotel: z.string().min(3),
  makkahHotelRating: z.number().min(3).max(5),
  makkahHotelDistance: z.string(),
  madinahHotel: z.string().min(3),
  madinahHotelRating: z.number().min(3).max(5),
  madinahHotelDistance: z.string(),

  // Airline
  airline: z.string().min(2),

  // Inclusions
  inclusions: z.array(z.string()).min(1, 'Minimal 1 fasilitas termasuk'),
  exclusions: z.array(z.string()),

  // Status
  isActive: z.boolean(),
});

export type PackageFormData = z.infer<typeof packageFormSchema>;
```

### 13.3 Trip Validation (lib/validations/trip.ts)

```typescript
import { z } from 'zod';

export const flightInfoSchema = z.object({
  departureAirline: z.string().min(2),
  departureFlightNo: z.string().min(2),
  departureDate: z.string(),
  departureTime: z.string(),
  departureAirport: z.string().min(3),
  departureTerminal: z.string().optional(),

  returnAirline: z.string().min(2),
  returnFlightNo: z.string().min(2),
  returnDate: z.string(),
  returnTime: z.string(),
  returnAirport: z.string().min(3),
  returnTerminal: z.string().optional(),
});

export const tripFormSchema = z.object({
  name: z.string().min(5, 'Nama trip minimal 5 karakter'),
  packageId: z.string().min(1, 'Pilih paket'),

  departureDate: z.string().refine((date) => {
    return new Date(date) > new Date();
  }, 'Tanggal berangkat harus di masa depan'),

  returnDate: z.string(),
  registrationCloseDate: z.string().optional(),

  capacity: z.number().min(10, 'Kapasitas minimal 10').max(200, 'Kapasitas maksimal 200'),

  flightInfo: flightInfoSchema,

  pricePerPerson: z.number().min(0),

  notes: z.string().optional(),
}).refine((data) => {
  return new Date(data.returnDate) > new Date(data.departureDate);
}, {
  message: 'Tanggal pulang harus setelah tanggal berangkat',
  path: ['returnDate'],
});

export type TripFormData = z.infer<typeof tripFormSchema>;

// For adding pilgrim to manifest
export const addToManifestSchema = z.object({
  pilgrimId: z.string().min(1, 'Pilih jemaah'),
  roomNumber: z.string().optional(),
  seatPreference: z.string().optional(),
  mealPreference: z.string().optional(),
  specialNeeds: z.string().optional(),
});
```

---

## 14. Sample Mock Data

### 14.1 Mock Agencies (data/mock-agencies.ts)

```typescript
import { Agency } from '@/types/agency';

export const mockAgencies: Agency[] = [
  {
    id: 'agency_001',
    name: 'Barokah Travel',
    legalName: 'PT. Barokah Perjalanan Wisata',
    tagline: 'Perjalanan Berkah, Ibadah Sempurna',
    description: 'Travel umrah terpercaya sejak 2010',

    ppiuNumber: 'PPIU/123/2023',
    ppiuIssueDate: '2023-01-15',
    ppiuExpiryDate: '2026-01-15',
    ppiuStatus: 'active',

    email: 'info@barokahtravel.co.id',
    phone: '021-5551234',
    whatsapp: '6281234567890',
    website: 'https://barokahtravel.co.id',

    address: 'Jl. Gatot Subroto No. 123, Lantai 5',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12930',

    bankAccounts: [
      {
        id: 'bank_001',
        bankName: 'Bank Central Asia',
        bankCode: '014',
        accountNumber: '1234567890',
        accountName: 'PT Barokah Perjalanan Wisata',
        isPrimary: true,
      },
      {
        id: 'bank_002',
        bankName: 'Bank Syariah Indonesia',
        bankCode: '451',
        accountNumber: '7654321098',
        accountName: 'PT Barokah Perjalanan Wisata',
        isPrimary: false,
      },
    ],

    contactPersons: [
      {
        id: 'cp_001',
        name: 'Haji Ahmad Hidayat',
        position: 'Direktur Utama',
        phone: '081234567890',
        email: 'ahmad@barokahtravel.co.id',
        isPrimary: true,
      },
      {
        id: 'cp_002',
        name: 'Siti Fatimah',
        position: 'Manager Operasional',
        phone: '081234567891',
        email: 'fatimah@barokahtravel.co.id',
        isPrimary: false,
      },
    ],

    documents: [
      {
        id: 'doc_001',
        type: 'ppiu_license',
        name: 'Izin PPIU',
        number: 'PPIU/123/2023',
        issueDate: '2023-01-15',
        expiryDate: '2026-01-15',
        status: 'valid',
      },
    ],

    branding: {
      primaryColor: '#F60000',
      logoUrl: '/images/logo.svg',
      logoIconUrl: '/images/logo-icon.svg',
    },

    verificationCode: 'BRK2023XYZ',
    verificationUrl: 'https://gezma.id/verify/BRK2023XYZ',
    isVerified: true,

    settings: {
      currency: 'IDR',
      timezone: 'Asia/Jakarta',
      dateFormat: 'DD/MM/YYYY',
      language: 'id',
    },

    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];
```

### 14.2 Mock Pilgrims (data/mock-pilgrims.ts)

```typescript
import { Pilgrim, PilgrimSummary } from '@/types/pilgrim';

export const mockPilgrims: Pilgrim[] = [
  {
    id: 'plg_001',
    nik: '3201234567890001',
    name: 'Ahmad Fauzi',
    gender: 'male',
    birthPlace: 'Jakarta',
    birthDate: '1985-05-15',
    address: 'Jl. Merdeka No. 123, RT 01/RW 02, Kelurahan Menteng',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    postalCode: '10310',
    phone: '081234567890',
    email: 'ahmad.fauzi@email.com',
    whatsapp: '6281234567890',
    emergencyContact: {
      name: 'Fatimah Azzahra',
      phone: '081234567891',
      relation: 'Istri',
    },
    status: 'dp',
    tripId: 'trip_001',
    roomNumber: '101',
    roomType: 'double',
    documents: [
      { id: 'doc_001', type: 'ktp', status: 'verified', fileName: 'ktp_ahmad.jpg', uploadedAt: '2024-01-10' },
      { id: 'doc_002', type: 'passport', status: 'missing' },
      { id: 'doc_003', type: 'photo', status: 'missing' },
    ],
    checklist: {
      ktpUploaded: true,
      passportUploaded: false,
      passportValid: false,
      photoUploaded: false,
      dpPaid: true,
      dpAmount: 5000000,
      dpDate: '2024-01-12',
      fullPayment: false,
      visaSubmitted: false,
      visaReceived: false,
      healthCertificate: false,
    },
    payments: [
      {
        id: 'pay_001',
        amount: 5000000,
        type: 'dp',
        method: 'transfer',
        date: '2024-01-12',
        notes: 'DP via BCA',
      },
    ],
    totalPaid: 5000000,
    remainingBalance: 20000000,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-12T15:30:00Z',
  },
  {
    id: 'plg_002',
    nik: '3201234567890002',
    name: 'Siti Aminah',
    gender: 'female',
    birthPlace: 'Bandung',
    birthDate: '1990-08-20',
    address: 'Jl. Asia Afrika No. 45',
    city: 'Bandung',
    province: 'Jawa Barat',
    phone: '081234567892',
    email: 'siti.aminah@email.com',
    emergencyContact: {
      name: 'Budi Santoso',
      phone: '081234567893',
      relation: 'Suami',
    },
    status: 'lunas',
    tripId: 'trip_001',
    roomNumber: '102',
    documents: [
      { id: 'doc_004', type: 'ktp', status: 'verified' },
      { id: 'doc_005', type: 'passport', status: 'verified', expiryDate: '2028-06-15' },
      { id: 'doc_006', type: 'photo', status: 'verified' },
      { id: 'doc_007', type: 'visa', status: 'verified' },
    ],
    checklist: {
      ktpUploaded: true,
      passportUploaded: true,
      passportValid: true,
      photoUploaded: true,
      dpPaid: true,
      fullPayment: true,
      fullPaymentDate: '2024-01-20',
      visaSubmitted: true,
      visaReceived: true,
      healthCertificate: true,
    },
    payments: [
      { id: 'pay_002', amount: 5000000, type: 'dp', method: 'transfer', date: '2024-01-05' },
      { id: 'pay_003', amount: 20000000, type: 'full', method: 'transfer', date: '2024-01-20' },
    ],
    totalPaid: 25000000,
    remainingBalance: 0,
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-25T11:00:00Z',
  },
  {
    id: 'plg_003',
    nik: '3201234567890003',
    name: 'Budi Santoso',
    gender: 'male',
    birthPlace: 'Surabaya',
    birthDate: '1975-12-01',
    address: 'Jl. Darmo No. 88',
    city: 'Surabaya',
    province: 'Jawa Timur',
    phone: '081234567894',
    email: 'budi.santoso@email.com',
    emergencyContact: {
      name: 'Dewi Kartika',
      phone: '081234567895',
      relation: 'Istri',
    },
    status: 'lead',
    documents: [],
    checklist: {
      ktpUploaded: false,
      passportUploaded: false,
      passportValid: false,
      photoUploaded: false,
      dpPaid: false,
      fullPayment: false,
      visaSubmitted: false,
      visaReceived: false,
      healthCertificate: false,
    },
    payments: [],
    totalPaid: 0,
    remainingBalance: 25000000,
    createdAt: '2024-01-28T14:00:00Z',
    updatedAt: '2024-01-28T14:00:00Z',
  },
  // ... tambahkan 17 pilgrim lagi dengan variasi status
];

// Summary for table display
export const mockPilgrimSummaries: PilgrimSummary[] = mockPilgrims.map(p => ({
  id: p.id,
  name: p.name,
  email: p.email,
  phone: p.phone,
  status: p.status,
  tripId: p.tripId,
  tripName: p.tripId ? 'Umrah Reguler - Maret 2026' : undefined,
  documentsComplete: p.documents.filter(d => d.status === 'verified').length,
  documentsTotal: 4,
  createdAt: p.createdAt,
}));
```

### 14.3 Mock Packages (data/mock-packages.ts)

```typescript
import { Package } from '@/types/package';

export const mockPackages: Package[] = [
  {
    id: 'pkg_001',
    name: 'Umrah Reguler 9 Hari',
    slug: 'umrah-reguler-9-hari',
    category: 'regular',
    description: 'Paket umrah reguler dengan fasilitas lengkap dan harga terjangkau.',
    duration: 9,

    itinerary: [
      {
        day: 1,
        title: 'Keberangkatan dari Jakarta',
        city: 'Jakarta',
        activities: [
          { id: 'act_001', time: '20:00', title: 'Berkumpul di Terminal 3 Soekarno-Hatta' },
          { id: 'act_002', time: '23:00', title: 'Penerbangan menuju Madinah' },
        ],
        meals: [],
      },
      {
        day: 2,
        title: 'Tiba di Madinah',
        city: 'Madinah',
        hotel: 'Grand Mercure Madinah',
        activities: [
          { id: 'act_003', time: '08:00', title: 'Tiba di Bandara Prince Mohammed' },
          { id: 'act_004', time: '10:00', title: 'Check-in hotel' },
          { id: 'act_005', time: '12:00', title: 'Sholat Dzuhur di Masjid Nabawi' },
          { id: 'act_006', time: '15:00', title: 'Istirahat' },
        ],
        meals: ['lunch', 'dinner'],
      },
      // ... hari 3-9
    ],

    hpp: {
      airline: 8000000,
      hotel: 5000000,
      visa: 1500000,
      transport: 1000000,
      meals: 1500000,
      guide: 500000,
      insurance: 300000,
      handling: 500000,
      others: 200000,
    },
    totalHpp: 18500000,
    margin: 30,
    marginAmount: 5550000,
    publishedPrice: 25000000,

    inclusions: [
      'Tiket pesawat PP Jakarta - Madinah/Jeddah',
      'Hotel bintang 4 di Madinah (3 malam)',
      'Hotel bintang 4 di Makkah (4 malam)',
      'Makan 3x sehari (menu Indonesia)',
      'Visa umrah',
      'Transport bus AC',
      'Muthawwif berpengalaman',
      'Asuransi perjalanan',
      'Air zamzam 5 liter',
      'Perlengkapan umrah',
    ],
    exclusions: [
      'Biaya kelebihan bagasi',
      'Pengeluaran pribadi',
      'Kursi roda (jika diperlukan)',
      'Tips untuk guide lokal',
    ],

    makkahHotel: 'Hilton Suites Makkah',
    makkahHotelRating: 4,
    makkahHotelDistance: '300m dari Masjidil Haram',
    madinahHotel: 'Grand Mercure Madinah',
    madinahHotelRating: 4,
    madinahHotelDistance: '200m dari Masjid Nabawi',

    airline: 'Saudi Arabian Airlines',

    isActive: true,
    isPromo: false,

    thumbnailUrl: '/images/packages/umrah-reguler.jpg',

    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  // ... tambahkan 5 paket lagi
];
```

### 14.4 Mock Trips (data/mock-trips.ts)

```typescript
import { Trip } from '@/types/trip';

export const mockTrips: Trip[] = [
  {
    id: 'trip_001',
    name: 'Umrah Reguler - Maret 2026',
    packageId: 'pkg_001',
    packageName: 'Umrah Reguler 9 Hari',

    departureDate: '2026-03-15',
    returnDate: '2026-03-23',
    registrationCloseDate: '2026-03-01',

    capacity: 45,
    registeredCount: 32,
    confirmedCount: 28,

    status: 'preparing',

    flightInfo: {
      departureAirline: 'Saudi Arabian Airlines',
      departureFlightNo: 'SV 817',
      departureDate: '2026-03-15',
      departureTime: '23:00',
      departureAirport: 'CGK - Soekarno Hatta',
      departureTerminal: 'Terminal 3',

      returnAirline: 'Saudi Arabian Airlines',
      returnFlightNo: 'SV 816',
      returnDate: '2026-03-23',
      returnTime: '10:00',
      returnAirport: 'JED - King Abdulaziz',
    },

    manifest: [
      {
        pilgrimId: 'plg_001',
        pilgrimName: 'Ahmad Fauzi',
        pilgrimStatus: 'dp',
        documentsComplete: 1,
        documentsTotal: 4,
        roomNumber: '101',
        addedAt: '2024-01-12T00:00:00Z',
      },
      {
        pilgrimId: 'plg_002',
        pilgrimName: 'Siti Aminah',
        pilgrimStatus: 'lunas',
        documentsComplete: 4,
        documentsTotal: 4,
        roomNumber: '102',
        addedAt: '2024-01-05T00:00:00Z',
      },
    ],

    roomAssignments: [
      {
        roomNumber: '101',
        roomType: 'double',
        hotel: 'makkah',
        pilgrims: [
          { pilgrimId: 'plg_001', pilgrimName: 'Ahmad Fauzi' },
          { pilgrimId: 'plg_004', pilgrimName: 'Fatimah Azzahra' },
        ],
      },
    ],

    checklist: {
      allPilgrimsConfirmed: false,
      manifestComplete: false,
      roomingListFinalized: false,
      flightTicketsIssued: true,
      hotelConfirmed: true,
      guideAssigned: true,
      guideName: 'Ustadz Hamzah',
      guidePhone: '966501234567',
      insuranceProcessed: true,
      departureBriefingDone: false,
    },

    pricePerPerson: 25000000,

    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-28T00:00:00Z',
  },
  // ... tambahkan 4 trip lagi
];
```

---

## 15. Component Props Interface

### 15.1 Layout Components

```typescript
// components/layout/sidebar.tsx
export interface SidebarProps {
  className?: string;
}

export interface SidebarNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  children?: SidebarNavItem[];
}

// components/layout/header.tsx
export interface HeaderProps {
  title?: string;
  showBreadcrumb?: boolean;
}

// components/layout/page-header.tsx
export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}
```

### 15.2 Shared Components

```typescript
// components/shared/data-table.tsx
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  filterColumn?: string;
  filterOptions?: { label: string; value: string }[];
  pageSize?: number;
  onRowClick?: (row: TData) => void;
}

// components/shared/status-badge.tsx
export interface StatusBadgeProps {
  status: PilgrimStatus | TripStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

// components/shared/empty-state.tsx
export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

// components/shared/stat-card.tsx
export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  href?: string;
}
```

### 15.3 Domain Components

```typescript
// components/pilgrims/pilgrim-form.tsx
export interface PilgrimFormProps {
  initialData?: Partial<Pilgrim>;
  onSubmit: (data: PilgrimFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// components/pilgrims/pilgrim-table.tsx
export interface PilgrimTableProps {
  data: PilgrimSummary[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// components/pilgrims/pilgrim-checklist.tsx
export interface PilgrimChecklistProps {
  checklist: PilgrimChecklist;
  onUpdate: (field: keyof PilgrimChecklist, value: boolean) => void;
  isEditable?: boolean;
}

// components/packages/itinerary-builder.tsx
export interface ItineraryBuilderProps {
  value: ItineraryDay[];
  onChange: (days: ItineraryDay[]) => void;
  duration: number;
}

// components/packages/pricing-calculator.tsx
export interface PricingCalculatorProps {
  hpp: PricingBreakdown;
  margin: number;
  onHppChange: (hpp: PricingBreakdown) => void;
  onMarginChange: (margin: number) => void;
}

// components/trips/manifest-table.tsx
export interface ManifestTableProps {
  manifest: ManifestEntry[];
  tripId: string;
  onAddPilgrim: () => void;
  onRemovePilgrim: (pilgrimId: string) => void;
  onUpdateRoom: (pilgrimId: string, roomNumber: string) => void;
}

// components/dashboard/action-center.tsx
export interface ActionCenterProps {
  alerts: Alert[];
  onAlertClick: (alert: Alert) => void;
  maxItems?: number;
}

export interface Alert {
  id: string;
  type: 'missing_docs' | 'incomplete_manifest' | 'license_expiring' | 'payment_pending' | 'visa_delay';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  count?: number;
  href: string;
  createdAt: string;
}
```

---

## 16. API Contract (Future Backend)

> Catatan: Ini untuk referensi integrasi backend di fase berikutnya.

### 16.1 REST Endpoints

```
Base URL: /api/v1

# Authentication
POST   /auth/login
POST   /auth/register
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me

# Pilgrims
GET    /pilgrims                    # List (with pagination, filter, search)
GET    /pilgrims/:id                # Detail
POST   /pilgrims                    # Create
PUT    /pilgrims/:id                # Update
DELETE /pilgrims/:id                # Delete
PATCH  /pilgrims/:id/status         # Update status
POST   /pilgrims/:id/documents      # Upload document
DELETE /pilgrims/:id/documents/:docId

# Packages
GET    /packages
GET    /packages/:id
POST   /packages
PUT    /packages/:id
DELETE /packages/:id
POST   /packages/:id/duplicate

# Trips
GET    /trips
GET    /trips/:id
POST   /trips
PUT    /trips/:id
DELETE /trips/:id
POST   /trips/:id/manifest          # Add pilgrim to manifest
DELETE /trips/:id/manifest/:pilgrimId
PUT    /trips/:id/rooming
PATCH  /trips/:id/checklist

# Agency
GET    /agency
PUT    /agency
POST   /agency/documents
GET    /agency/verify/:code         # Public

# Dashboard
GET    /dashboard/stats
GET    /dashboard/alerts
GET    /dashboard/upcoming-trips
GET    /dashboard/recent-activity
```

### 16.2 Response Format

```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

---

## 17. Execution Checklist

Urutan eksekusi untuk AI/Developer:

### Step 1: Project Setup
- [ ] Initialize Next.js project (jika belum)
- [ ] Install dependencies (lihat package.json di Section 3)
- [ ] Setup Tailwind config dengan GEZMA tokens
- [ ] Setup globals.css dengan Satoshi font
- [ ] Create folder structure

### Step 2: Base Components
- [ ] Initialize shadcn/ui
- [ ] Install & customize: button, input, card, table, tabs, badge, dialog, dropdown-menu, toast, skeleton, avatar, tooltip
- [ ] Create lib/utils.ts dengan cn() helper

### Step 3: Type Definitions
- [ ] Create semua file di types/ folder
- [ ] Create validation schemas di lib/validations/

### Step 4: Mock Data
- [ ] Create mock-agencies.ts
- [ ] Create mock-pilgrims.ts (20 entries)
- [ ] Create mock-packages.ts (6 entries)
- [ ] Create mock-trips.ts (5 entries)
- [ ] Create mock-activity.ts

### Step 5: Layout Components
- [ ] Create sidebar.tsx
- [ ] Create header.tsx
- [ ] Create (dashboard)/layout.tsx
- [ ] Create (auth)/layout.tsx

### Step 6: Shared Components
- [ ] Create page-header.tsx
- [ ] Create data-table.tsx
- [ ] Create status-badge.tsx
- [ ] Create empty-state.tsx
- [ ] Create loading-skeleton.tsx

### Step 7: Auth Pages
- [ ] Create login/page.tsx
- [ ] Create register/page.tsx

### Step 8: Dashboard
- [ ] Create dashboard page.tsx
- [ ] Create stats-cards.tsx
- [ ] Create action-center.tsx
- [ ] Create upcoming-trips.tsx
- [ ] Create recent-activity.tsx
- [ ] Create quick-actions.tsx

### Step 9: Pilgrims Module
- [ ] Create pilgrims/page.tsx (list)
- [ ] Create pilgrim-table.tsx
- [ ] Create pilgrims/new/page.tsx
- [ ] Create pilgrim-form.tsx
- [ ] Create pilgrims/[id]/page.tsx (detail)
- [ ] Create pilgrim-checklist.tsx
- [ ] Create document-upload.tsx
- [ ] Create pilgrims/[id]/edit/page.tsx

### Step 10: Packages Module
- [ ] Create packages/page.tsx
- [ ] Create packages/new/page.tsx
- [ ] Create package-form.tsx
- [ ] Create itinerary-builder.tsx
- [ ] Create pricing-calculator.tsx
- [ ] Create packages/[id]/page.tsx

### Step 11: Trips Module
- [ ] Create trips/page.tsx
- [ ] Create trips/new/page.tsx
- [ ] Create trip-form.tsx
- [ ] Create trips/[id]/page.tsx
- [ ] Create manifest-table.tsx
- [ ] Create trip-checklist.tsx

### Step 12: Agency & Settings
- [ ] Create documents/page.tsx
- [ ] Create agency/page.tsx
- [ ] Create settings/page.tsx
- [ ] Create settings/users/page.tsx
- [ ] Create verify/[code]/page.tsx

### Step 13: PWA Setup
- [ ] Create public/manifest.json
- [ ] Create offline/page.tsx
- [ ] Setup PWA icons

### Step 14: Final Polish
- [ ] Test all navigation
- [ ] Test responsive
- [ ] Fix any styling issues
- [ ] Verify acceptance checklist

---

*Plan Version: 2.1*
*Created: 2026-02-01*
*Updated: 2026-02-02*
*Target: Frontend Prototype - All Modules + PWA*
*Status: Ready for Execution*
