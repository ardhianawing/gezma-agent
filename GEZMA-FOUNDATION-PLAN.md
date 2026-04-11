# Plan: Gezma Foundation

## Context
Gezma Foundation adalah modul filantropi baru yang akan ditambahkan ke ekosistem GEZMA. Terinspirasi dari model ACT (Aksi Cepat Tanggap), fitur ini mencakup penggalangan dana, donasi barang bekas, pembangunan masjid ramah musafir, layanan sosial (kesehatan, makanan, pendidikan, pelatihan usaha), dan pendanaan khusus untuk travel agent anggota GEZMA. Tujuannya: menghubungkan agensi umrah, jemaah, dan masyarakat luas dalam satu ekosistem sosial-filantropi yang transparan.

---

## Sub-Modul

### 1. Kampanye Donasi (Model ACT)
- CRUD kampanye dengan judul, deskripsi, target dana, deadline, foto, kategori
- Kategori: Bencana, Masjid, Yatim, Kesehatan, Pendidikan, Pelatihan Usaha, Umrah Dhuafa
- Progress bar real-time (terkumpul vs target)
- Laporan transparansi penggunaan dana
- Sertifikat digital donatur (PDF)
- Donasi satu kali atau recurring bulanan

### 2. Sedekah Barang (Barang Bekas)
- Listing barang tidak terpakai oleh agensi/jemaah
- Kategori: pakaian, perlengkapan ibadah, elektronik, dll
- Sistem request oleh penerima manfaat yang terverifikasi
- Status: tersedia → diminta → diserahkan

### 3. Masjid Pemuda Ramah Musafir
- Kampanye khusus pembangunan masjid dengan konsep:
  - Buka 24 jam, tidak dikunci
  - Ruang istirahat ber-AC
  - Makanan & minuman gratis
  - Layanan kesehatan dasar
  - WiFi gratis
- Progress pembangunan (fase 1-5)
- Galeri foto progress
- Laporan penggunaan dana per fase

### 4. Layanan Sosial
Program yang dibiayai dari Foundation:
- **Kesehatan** — klinik gratis / subsidi untuk dhuafa
- **Dapur Umum** — distribusi makanan
- **Pendidikan** — beasiswa, bimbel gratis
- **Pelatihan Usaha** — UMKM, kerajinan, digital marketing

### 5. Pendanaan Travel Agent (Qardhul Hasan)
- Pinjaman tanpa bunga untuk agensi anggota GEZMA
- Pengajuan online dengan upload dokumen
- Approval oleh Command Center
- Cicilan transparan
- Dana dari keuntungan Foundation

### 6. Fitur Tambahan
- **Wakaf Produktif** — wakaf uang untuk aset produktif
- **Zakat Calculator** — hitung & salurkan zakat
- **Donor Leaderboard** — poin, badge, gamifikasi
- **Impact Dashboard** — visualisasi dampak nyata
- **Laporan Keuangan Publik** — halaman publik transparansi 100%
- **Program Umrah Dhuafa** — subsidi biaya umrah dari Foundation

---

## Arsitektur & File yang Akan Dibuat/Diubah

### Database (Prisma Schema)
**File:** `/home/ezyindustries/deployments/gezma-agent/prisma/schema.prisma`

Model baru yang ditambahkan:
```prisma
model FoundationCampaign {
  id            String   @id @default(uuid())
  title         String
  description   String
  category      String   // bencana|masjid|yatim|kesehatan|pendidikan|pelatihan|umrah_dhuafa
  targetAmount  Float
  currentAmount Float    @default(0)
  deadline      DateTime?
  status        String   @default("active") // active|completed|cancelled
  imageUrl      String?
  agencyId      String?  // null = platform-level campaign
  agency        Agency?  @relation(fields: [agencyId], references: [id])
  donations     FoundationDonation[]
  impactReports FoundationImpact[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([agencyId])
  @@index([status])
  @@index([category])
}

model FoundationDonation {
  id           String              @id @default(uuid())
  campaignId   String
  campaign     FoundationCampaign  @relation(fields: [campaignId], references: [id])
  donorName    String
  donorEmail   String?
  amount       Float
  type         String              // onetime|recurring
  method       String              // transfer|cash|gezmapay
  status       String              @default("pending") // pending|completed|failed
  isAnonymous  Boolean             @default(false)
  receiptUrl   String?
  agencyId     String?
  agency       Agency?             @relation(fields: [agencyId], references: [id])
  createdAt    DateTime            @default(now())
  @@index([campaignId])
  @@index([agencyId])
}

model FoundationImpact {
  id          String              @id @default(uuid())
  campaignId  String
  campaign    FoundationCampaign  @relation(fields: [campaignId], references: [id])
  title       String
  description String
  amountUsed  Float
  photoUrl    String?
  createdAt   DateTime            @default(now())
  @@index([campaignId])
}

model FoundationGoods {
  id          String   @id @default(uuid())
  agencyId    String
  agency      Agency   @relation(fields: [agencyId], references: [id])
  title       String
  description String
  category    String   // pakaian|ibadah|elektronik|lainnya
  condition   String   // baik|cukup_baik
  imageUrl    String?
  status      String   @default("available") // available|requested|delivered
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([agencyId])
  @@index([status])
}

model FoundationFinancing {
  id           String   @id @default(uuid())
  agencyId     String
  agency       Agency   @relation(fields: [agencyId], references: [id])
  amount       Float
  purpose      String
  tenorMonths  Int      // 3, 6, 12
  monthlyAmount Float
  status       String   @default("pending") // pending|approved|rejected|active|completed
  notes        String?
  approvedAt   DateTime?
  installments FoundationFinancingInstallment[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@index([agencyId])
  @@index([status])
}

model FoundationFinancingInstallment {
  id            String              @id @default(uuid())
  financingId   String
  financing     FoundationFinancing @relation(fields: [financingId], references: [id])
  installmentNo Int
  amount        Float
  dueDate       DateTime
  paidAt        DateTime?
  status        String              @default("pending") // pending|paid|overdue
  @@index([financingId])
}
```

### API Routes (baru)
```
/src/app/api/foundation/campaigns/route.ts       → GET (list), POST (create)
/src/app/api/foundation/campaigns/[id]/route.ts  → GET, PUT, DELETE
/src/app/api/foundation/campaigns/[id]/donate/route.ts → POST (donasi)
/src/app/api/foundation/goods/route.ts           → GET, POST
/src/app/api/foundation/goods/[id]/route.ts      → GET, PUT, DELETE
/src/app/api/foundation/financing/route.ts       → GET, POST
/src/app/api/foundation/financing/[id]/route.ts  → GET, PUT
/src/app/api/foundation/financing/[id]/approve/route.ts → POST (CC only)
/src/app/api/foundation/stats/route.ts           → GET (impact dashboard)
```

### Validasi (baru)
**File:** `/home/ezyindustries/deployments/gezma-agent/src/lib/validations/foundation.ts`
- `createCampaignSchema` — validasi kampanye baru
- `createDonationSchema` — validasi donasi
- `createGoodsSchema` — validasi barang sedekah
- `createFinancingSchema` — validasi pengajuan pendanaan

### Dashboard Pages (baru)
```
/src/app/(dashboard)/foundation/page.tsx         → Beranda Foundation (overview + kampanye)
/src/app/(dashboard)/foundation/campaigns/page.tsx → Daftar semua kampanye
/src/app/(dashboard)/foundation/campaigns/new/page.tsx → Buat kampanye baru
/src/app/(dashboard)/foundation/campaigns/[id]/page.tsx → Detail kampanye + donasi
/src/app/(dashboard)/foundation/goods/page.tsx   → Barang bekas
/src/app/(dashboard)/foundation/financing/page.tsx → Pendanaan agensi
/src/app/(dashboard)/foundation/impact/page.tsx  → Impact dashboard
```

### File yang Dimodifikasi
1. **Sidebar:** `/home/ezyindustries/deployments/gezma-agent/src/components/layout/sidebar.tsx`
   - Tambah item `{ label: 'Gezma Foundation', href: '/foundation', icon: Heart }` di section PLATFORM

2. **Middleware:** `/home/ezyindustries/deployments/gezma-agent/src/middleware.ts`
   - Tambah `/foundation` ke array `protectedPaths`

3. **Permissions:** `/home/ezyindustries/deployments/gezma-agent/src/lib/permissions.ts`
   - Tambah: `FOUNDATION_VIEW`, `FOUNDATION_CREATE`, `FOUNDATION_EDIT`, `FOUNDATION_DELETE`, `FOUNDATION_FINANCING_APPROVE`

4. **Command Center:** Tambah halaman kelola Foundation di `/src/app/(command-center)/foundation/`

---

## Urutan Implementasi

1. **Prisma Schema** — tambah 5 model baru, jalankan `prisma migrate`
2. **Validasi** — buat `foundation.ts` validation schemas
3. **API Routes** — buat semua endpoint (ikuti pola GezmaPay)
4. **Permissions** — tambah permission constants + update RBAC
5. **Middleware** — tambah `/foundation` ke protected paths
6. **Sidebar** — tambah nav item
7. **Dashboard Pages** — buat semua halaman UI
8. **Command Center** — halaman approve financing & kelola kampanye platform

---

## Pola yang Digunakan (Reuse)

| Kebutuhan | Referensi |
|-----------|-----------|
| API route pattern | `/src/app/api/gezmapay/route.ts` |
| Financing/installment | `/src/app/api/paylater/route.ts` |
| Validation schema | `/src/lib/validations/payment.ts` |
| Dashboard page UI | `/src/app/(dashboard)/marketplace/page.tsx` |
| Campaign/card UI | `/src/app/(dashboard)/academy/page.tsx` |
| Auth check | `getAuthPayload()` dari `/src/lib/auth-server.ts` |
| Rate limiting | `rateLimit()` dari `/src/lib/rate-limiter.ts` |
| Activity logging | `logActivity()` dari `/src/lib/activity-logger.ts` |
| Prisma transaction | `prisma.$transaction()` |

---

## Verifikasi Setelah Implementasi

1. Jalankan `npx prisma migrate dev` — pastikan schema berhasil
2. Jalankan `npm run build` — pastikan tidak ada TypeScript error
3. Test API: `GET /api/foundation/campaigns`, `POST /api/foundation/campaigns`
4. Test UI: buka `/foundation` di browser, cek tampilan responsif
5. Test donasi flow: buat kampanye → donasi → cek progress bar update
6. Test financing flow: ajukan pendanaan → approve dari CC → cek installment generated
7. Cek sidebar ada item Foundation
8. Cek permission: Staff tidak bisa approve financing
