# Role & Access Audit — GEZMA

> Reviewed: 12 April 2026
> Total halaman: 121 pages

---

## 3 Tier User System

| Level | User | Panel | Akses |
|-------|------|-------|-------|
| **Admin Gezma** | Tim internal Gezma | Command Center (`/command-center`) | Kelola platform, semua agensi, compliance |
| **User (Travel Agent)** | Owner/Admin/Staff/Marketing agensi | Dashboard (`/dashboard`) | Kelola bisnis agensi sendiri |
| **Jamaah** | Jamaah umrah | Pilgrim Portal (`/pilgrim`) | Lihat trip, dokumen, pembayaran sendiri |

---

## Halaman yang Perlu Dipindahkan / Ditambahkan

### A. Fitur yang SEHARUSNYA di Command Center (Admin Gezma)

Fitur-fitur ini bersifat **platform-level** — dikelola oleh tim Gezma, bukan oleh masing-masing travel agent.

| Fitur | Sekarang di | Seharusnya di | Alasan |
|-------|------------|---------------|--------|
| **Integrasi Nusuk API** | Dashboard > Settings > Integrations | **Command Center** | Koneksi ke Saudi Arabia = platform-level, bukan per-agensi |
| **Payment Gateway** | Dashboard > Settings > Integrations | **Command Center** | Gateway pembayaran dikelola Gezma, agensi cuma pakai |
| **WhatsApp Business API** | Dashboard > Settings > Integrations | **Keduanya** | Config API di CC, per-agensi cuma set nomor WA sendiri |
| **UmrahCash** | Dashboard > Settings > Integrations | **Command Center** | Transfer lintas negara = platform-level partnership |
| **Billing / Subscription** | Dashboard > Settings | **Command Center** | Gezma yang billing agensi, bukan agensi atur sendiri |
| **Gamification Rules** | (belum ada UI) | **Command Center** | Aturan poin, badge, leaderboard = platform-level |
| **Marketplace Management** | (belum ada) | **Command Center** | Approve/reject supplier, set commission, moderasi produk |
| **Academy Content** | (belum ada) | **Command Center** | Upload kursus, materi, sertifikasi = konten dari Gezma |
| **News Management** | (belum ada) | **Command Center** | Publish berita, pengumuman = dari tim Gezma |
| **Forum Moderation** | (belum ada) | **Command Center** | Moderasi thread, ban user, pin topic = admin Gezma |
| **Platform Analytics** | CC > Dashboard (basic) | **Command Center** (expand) | Revenue platform, growth, churn rate, dll |
| **GezmaPay Administration** | (belum ada) | **Command Center** | Kelola wallet system, top-up approval, fraud monitoring |
| **PayLater Administration** | (belum ada) | **Command Center** | Set limit, approve/reject pengajuan, monitoring cicilan |
| **Foundation Administration** | CC > Foundation (basic) | **Command Center** (expand) | Approve kampanye, kelola dana, laporan transparansi |

### B. Fitur yang BENAR di Dashboard (Travel Agent)

| Fitur | Alasan tetap di Dashboard |
|-------|--------------------------|
| Jamaah (Pilgrims) | Agensi kelola jamaah sendiri |
| Paket (Packages) | Agensi buat paket sendiri |
| Perjalanan (Trips) | Agensi atur trip sendiri |
| Dokumen (Documents) | Dokumen per-agensi |
| Reports | Laporan bisnis per-agensi |
| Forum (participate) | Agensi ikut diskusi |
| News (read) | Agensi baca berita |
| Academy (learn) | Agensi ikut kursus |
| Marketplace (buy) | Agensi belanja supplier |
| GezmaPay (use) | Agensi pakai wallet |
| PayLater (apply) | Agensi ajukan paylater |
| Tabungan (create) | Agensi buat program tabungan jamaah |
| Foundation (create campaign) | Agensi buat kampanye donasi |
| Gamification (participate) | Agensi lihat poin & badge |
| Blockchain (issue cert) | Agensi terbitkan sertifikat |
| Trade Centre (submit) | Agensi jual produk B2B |
| Settings > Profile | Profil agensi sendiri |
| Settings > Team | Kelola staff sendiri |
| Settings > Security | Password & 2FA sendiri |
| Settings > Notifications | Preferensi notifikasi sendiri |
| Settings > Branding | Branding agensi sendiri |
| Settings > Email Templates | Template email agensi |

### C. Fitur yang BENAR di Pilgrim Portal (Jamaah)

| Fitur | Status |
|-------|--------|
| Home, Profile, Trip, Payments | ✅ Benar |
| Documents, Tracking, Roommate | ✅ Benar |
| Gallery, Manasik, Packing, Doa | ✅ Benar |
| Achievements, Currency, Emergency, Shop | ✅ Benar |

---

## Command Center — Fitur yang Perlu Ditambahkan

### Saat ini (7 halaman):
1. Dashboard (stats overview)
2. Agencies (kelola agensi)
3. Agencies/[id] (detail agensi)
4. Audit Log
5. Compliance
6. Foundation
7. Login

### Yang perlu ditambahkan:

| No | Fitur CC Baru | Prioritas | Deskripsi |
|----|--------------|-----------|-----------|
| 1 | **Integrations Management** | High | Pindahkan dari dashboard, kelola Nusuk/PG/WA/UmrahCash level platform |
| 2 | **Billing & Subscriptions** | High | Kelola plan, invoice, pembayaran dari agensi |
| 3 | **User Management** | High | Lihat semua user across agensi, suspend/ban |
| 4 | **Marketplace Admin** | Medium | Approve supplier, set commission, moderasi produk |
| 5 | **GezmaPay Admin** | Medium | Monitor wallet, approve top-up, fraud detection |
| 6 | **PayLater Admin** | Medium | Approve/reject pengajuan, monitoring cicilan |
| 7 | **Content Management** | Medium | Publish news, academy courses, announcements |
| 8 | **Forum Moderation** | Medium | Moderasi thread, manage reports, pin/ban |
| 9 | **Gamification Rules** | Low | Set badge criteria, poin rules, rewards |
| 10 | **Platform Analytics** | Low | Revenue, growth, cohort analysis, churn |
| 11 | **Email/Notification Center** | Low | Template system, broadcast ke semua agensi |
| 12 | **System Settings** | Low | Platform config, feature flags, maintenance mode |

---

## Dashboard — Fitur yang Perlu Dihapus/Sembunyikan

| Fitur | Aksi | Alasan |
|-------|------|--------|
| Settings > Integrations (Nusuk, PG, WA, UmrahCash) | **Pindah ke CC** atau sembunyikan | Bukan urusan travel agent |
| Settings > Billing | **Pindah ke CC** | Gezma yang billing, bukan self-service |

---

## Role Permission di Dashboard (Travel Agent)

Dalam dashboard travel agent sendiri, ada 4 role internal:

| Fitur | Owner | Admin | Staff | Marketing |
|-------|-------|-------|-------|-----------|
| Jamaah | CRUD | CRUD | View, Create, Edit | View, Create |
| Paket | CRUD | CRUD | View | View, Create, Edit |
| Trip | CRUD | CRUD | View | View |
| Dokumen | CRUD | CRUD | View, Upload | View |
| Reports | View | View | - | View |
| GezmaPay (use) | Full | Full | View saldo | - |
| PayLater (apply) | Apply | Apply | - | - |
| Team/Users | CRUD | CRUD | - | - |
| Settings | Full | Full | Profile+Security only | Profile+Security only |
| Foundation | CRUD | CRUD | View | View, Create |
| Forum | Create, Moderate | Create, Moderate | Create | Create |
| Trade Centre | Full | Full | View | View, Submit |

---

## Kesimpulan

**Masalah utama:** Command Center (Admin Gezma) terlalu kosong — hanya 7 halaman. Banyak fitur platform-level yang "numpuk" di Dashboard travel agent karena belum ada UI-nya di CC.

**Prioritas fix:**
1. Pindahkan Integrations dari Dashboard ke CC
2. Tambah Billing & Subscription management di CC
3. Tambah User Management di CC
4. Secara bertahap tambahkan fitur admin lainnya

**Estimasi total:** 12 halaman baru di Command Center
