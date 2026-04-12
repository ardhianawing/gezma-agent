# Plan: Command Center Admin Features

> Tanggal: 12 April 2026
> Prioritas: Setiap modul Dashboard harus punya counterpart admin di Command Center

---

## Status Sekarang

CC hanya punya **4 modul aktif**: Dashboard, Agencies, Compliance, Foundation (basic), News, Trade (basic)

**9 modul BELUM ADA admin page-nya sama sekali.**

---

## Modul yang Perlu Dibuat

### Tier 1 — Critical (Compliance & Risk)

#### 1. PayLater Admin (`/command-center/paylater`)
- Table semua pengajuan (across all agencies)
- Filter: pending / approved / rejected / active / overdue
- Action: Approve / Reject dengan notes
- Detail: installment schedule, payment history
- Stats: total disbursed, default rate, overdue count

#### 2. GezmaPay Admin (`/command-center/gezmapay`)
- Monitor semua transaksi across system
- Table wallets: agency, balance, last activity
- Flag suspicious transactions
- Action: block/unblock wallet, reverse transaction
- Stats: total volume, active wallets, daily transactions

#### 3. Forum Moderation (`/command-center/forum`)
- Table semua thread + reported posts
- Filter: all / reported / flagged
- Action: delete thread, lock thread, ban user, pin/unpin
- Stats: total threads, active users, reports pending

#### 4. Pilgrims Overview (`/command-center/pilgrims`)
- Table semua jamaah across agencies
- Filter: status, agency, document status
- Detect duplicates (same NIK across agencies)
- Stats: total jamaah, active, completed, by agency

### Tier 2 — Business Operations

#### 5. Marketplace Admin (`/command-center/marketplace`)
- Table semua produk/supplier
- Action: approve/reject supplier, set featured, suspend
- Review moderation
- Stats: total suppliers, active products, revenue

#### 6. Academy Admin (`/command-center/academy`)
- Table semua courses
- Action: publish/unpublish, edit, delete
- View enrollment & completion stats per course
- Certificate management (approve, revoke)

#### 7. Packages Overview (`/command-center/packages`)
- Table semua paket across agencies
- Stats: total paket, booking rate, occupancy
- Filter by category, agency, status

#### 8. Blockchain/Certificate Admin (`/command-center/blockchain`)
- Table semua certificate yang di-issue
- Action: verify, revoke
- Stats: total issued, verified, revoked

### Tier 3 — Enhancement

#### 9. Tabungan Admin (`/command-center/tabungan`)
- Monitor semua savings plans
- Stats: total tabungan, aggregate saved, completion rate
- Action: manual adjustment

#### 10. Gamification Admin (`/command-center/gamification`)
- Manage badge definitions & criteria
- Set point rules per event
- View leaderboard fairness metrics
- Detect gaming/fraud patterns

#### 11. Billing & Subscriptions (`/command-center/billing`)
- Kelola subscription plan agencies
- Invoice management
- Payment tracking
- Stats: MRR, churn rate

#### 12. Integrations Admin (`/command-center/integrations`)
- Platform-level API config (Nusuk, Payment Gateway, WA, UmrahCash)
- Status monitoring per integration
- API usage stats

---

## Urutan Implementasi

Semua halaman CC pakai **mock data** dulu (sama seperti Foundation).

**Fase 1 (Tier 1):** PayLater, GezmaPay, Forum, Pilgrims → 4 halaman
**Fase 2 (Tier 2):** Marketplace, Academy, Packages, Blockchain → 4 halaman
**Fase 3 (Tier 3):** Tabungan, Gamification, Billing, Integrations → 4 halaman

**Total: 12 halaman baru di Command Center**

---

## Pola Referensi

| Kebutuhan | Referensi |
|-----------|-----------|
| CC page style | `/src/app/(command-center)/command-center/page.tsx` |
| CC layout | `/src/app/(command-center)/layout.tsx` |
| Table + filter pattern | CC Foundation financing page |
| Approve/reject pattern | CC Foundation financing approve |
| CC auth check | `getCommandCenterAuth()` dari `/src/lib/auth-command-center.ts` |
| CC API pattern | `/src/app/api/command-center/stats/route.ts` |
