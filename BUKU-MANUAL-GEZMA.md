# BUKU MANUAL GEZMA AGENT
## Platform Manajemen Umrah & Haji Terpadu

**Versi:** 1.0 | **Tanggal:** April 2026  
**URL Aplikasi:** https://gezma.ezyindustries.my.id

---

## DAFTAR ISI

1. [Pengenalan GEZMA](#1-pengenalan-gezma)
2. [Jenis Pengguna & Akses](#2-jenis-pengguna--akses)
3. [Autentikasi (Login & Register)](#3-autentikasi)
4. [Dashboard Agensi](#4-dashboard-agensi)
5. [Manajemen Jemaah (Pilgrims)](#5-manajemen-jemaah)
6. [Paket Umrah](#6-paket-umrah)
7. [Keberangkatan (Trips)](#7-keberangkatan-trips)
8. [Laporan (Reports)](#8-laporan-reports)
9. [Academy / LMS](#9-academy--lms)
10. [Forum Komunitas](#10-forum-komunitas)
11. [Marketplace](#11-marketplace)
12. [Berita & Informasi](#12-berita--informasi)
13. [Profil Agensi & Branding](#13-profil-agensi--branding)
14. [Gamifikasi & Reward](#14-gamifikasi--reward)
15. [Sertifikat Blockchain](#15-sertifikat-blockchain)
16. [Pengaturan (Settings)](#16-pengaturan-settings)
17. [Fitur Keuangan Lanjutan](#17-fitur-keuangan-lanjutan)
18. [Manajemen Tugas & Dokumen](#18-manajemen-tugas--dokumen)
19. [Portal Jemaah](#19-portal-jemaah)
20. [Command Center (Admin GEZMA)](#20-command-center)
21. [Skenario Penggunaan Lengkap](#21-skenario-penggunaan-lengkap)
22. [Referensi API](#22-referensi-api)

---

## 1. PENGENALAN GEZMA

**GEZMA Agent** (Gerakan Ziarah Mabrur) adalah platform manajemen umrah berbasis web yang dirancang untuk:
- **Travel Agent Umrah** — mengelola jemaah, paket, dan keberangkatan secara profesional
- **Jemaah** — memantau status perjalanan, dokumen, dan informasi ibadah
- **Admin GEZMA** — mengawasi seluruh ekosistem agensi di Indonesia

### Fitur Unggulan

| Kategori | Fitur |
|----------|-------|
| CRM Jemaah | Manajemen data lengkap, status lifecycle, dokumen, pembayaran |
| Paket Tour | Builder paket dengan HPP calculator & itinerary visual |
| Keberangkatan | Manifest, room assignment, checklist pra-keberangkatan |
| Laporan | 5 jenis laporan real-time dengan export CSV |
| LMS | Kursus, quiz, dan sertifikat untuk staf |
| Forum | Komunitas antar travel agent Indonesia |
| Marketplace | Platform produk & layanan umrah |
| Portal Jemaah | App khusus jemaah (manasik, doa, packing, tracking) |
| Gamifikasi | Poin, badge, dan leaderboard antar agensi |
| Keamanan | JWT, bcrypt, TOTP 2FA, rate limiting, audit log |

---

## 2. JENIS PENGGUNA & AKSES

GEZMA memiliki 3 area terpisah dengan pengguna berbeda:

### A. Dashboard Agensi (Staff Travel Agent)

| Role | Akses |
|------|-------|
| **Owner** | Full akses — semua fitur, settings, laporan keuangan, manajemen user |
| **Admin** | Hampir full — kecuali beberapa pengaturan sensitif agensi |
| **Staff** | Operasional — CRUD jemaah, paket, trip, proses pembayaran |
| **Marketing** | Terbatas — view jemaah & paket, buat paket (perlu approval) |

**URL Login:** `https://gezma.ezyindustries.my.id/login`

### B. Portal Jemaah

Jemaah login menggunakan **booking code** yang diberikan oleh agensi.

**URL Login:** `https://gezma.ezyindustries.my.id/pilgrim/login`

### C. Command Center (Admin GEZMA)

Admin platform GEZMA dengan akses super untuk mengawasi semua agensi.

**URL Login:** `https://gezma.ezyindustries.my.id/command-center/login`

---

## 3. AUTENTIKASI

### 3.1 Registrasi Agensi Baru

**Lokasi:** `/register`

Registrasi dilakukan dalam **3 langkah:**

**Langkah 1 — Info Agensi:**
- Nama agensi (nama brand)
- Nama legal (PT/CV/Yayasan)
- Nomor PPIU (opsional, isi nanti)
- Nomor telepon agensi

**Langkah 2 — Data PIC:**
- Nama lengkap PIC
- Email (digunakan untuk login)
- Nomor HP
- Jabatan (default: Direktur)

**Langkah 3 — Password:**
- Password (minimal 8 karakter)
- Konfirmasi password

Setelah registrasi → email verifikasi dikirim → klik link → akun aktif.

> **Catatan:** Akun baru otomatis mendapat role **Owner**.

---

### 3.2 Login

**Lokasi:** `/login`

1. Masukkan email & password
2. Jika 2FA aktif → masukkan kode dari authenticator app
3. Login berhasil → diarahkan ke Dashboard

**Keamanan:**
- Maksimal 5 percobaan gagal per menit
- Akun terkunci sementara setelah terlalu banyak percobaan gagal
- Token aktif selama 7 hari

---

### 3.3 Lupa Password

**Lokasi:** `/forgot-password`

1. Masukkan email terdaftar
2. Cek email → klik link reset
3. Masukkan password baru (minimal 8 karakter)
4. Login dengan password baru

---

### 3.4 Aktivasi 2FA (Two-Factor Authentication)

**Lokasi:** `Settings → Security → Two-Factor Authentication`

1. Klik "Setup 2FA"
2. Scan QR code dengan Google Authenticator / Authy
3. Masukkan kode 6 digit untuk verifikasi
4. 2FA aktif → setiap login akan diminta kode

---

## 4. DASHBOARD AGENSI

**Lokasi:** `/dashboard`

Dashboard adalah halaman utama setelah login, menampilkan ringkasan operasional agensi secara real-time.

### Widget yang Tersedia

| Widget | Data yang Ditampilkan |
|--------|----------------------|
| **Total Jemaah** | Jumlah semua jemaah terdaftar |
| **Paket Aktif** | Jumlah paket yang sedang aktif |
| **Keberangkatan Aktif** | Jumlah trip yang sedang berjalan |
| **Dokumen Pending** | Jumlah dokumen yang belum diupload/diverifikasi |
| **Total Revenue** | Total pendapatan dari pembayaran |
| **Outstanding** | Total pembayaran yang belum lunas |

### Grafik

- **Revenue Trend** — grafik garis 12 bulan terakhir
- **Status Jemaah** — pie chart distribusi status (lead, DP, lunas, dll)
- **Kapasitas Trip** — bar chart isi vs kapasitas per trip

### Alert & Notifikasi

Dashboard juga menampilkan peringatan otomatis:
- Dokumen jemaah yang akan kadaluarsa
- Trip yang mendekati tanggal keberangkatan
- Pembayaran yang sudah jatuh tempo
- Peringatan PPIU hampir expired

### Quick Actions

Tombol pintas untuk aksi yang paling sering dilakukan:
- Tambah Jemaah Baru
- Buat Paket Baru
- Buat Trip Baru
- Lihat Laporan
- Import Jemaah (CSV)

---

## 5. MANAJEMEN JEMAAH

**Lokasi:** `/dashboard/pilgrims`

Modul terpenting di GEZMA — tempat mengelola seluruh data jemaah dari proses pendaftaran hingga keberangkatan.

### 5.1 Daftar Jemaah

Tampilan daftar dengan fitur:
- **Pencarian** — by nama, NIK, email, nomor HP
- **Filter** — by status, by trip
- **Tampilan** — tabel atau grid
- **Pilih massal** — centang multiple jemaah untuk bulk action
- **Sort** — klik header kolom

**Kolom yang ditampilkan:**
Nama | NIK | Email | Nomor HP | Status | Dokumen | Trip | Aksi

---

### 5.2 Tambah Jemaah Baru

**Lokasi:** `/dashboard/pilgrims/new`

**Data yang diisi:**

| Kelompok | Field |
|----------|-------|
| **Identitas** | NIK (16 digit), Nama lengkap, Jenis kelamin, Tempat lahir, Tanggal lahir |
| **Alamat** | Alamat lengkap, Kota, Provinsi, Kode pos |
| **Kontak** | Nomor HP, Email, WhatsApp |
| **Kontak Darurat** | Nama, Nomor HP, Hubungan |
| **Catatan** | Internal notes (tidak dilihat jemaah) |

Setelah disimpan → jemaah otomatis mendapat status **"Lead"** dan **booking code** unik.

---

### 5.3 Detail Jemaah

**Lokasi:** `/dashboard/pilgrims/[id]`

Halaman detail memiliki beberapa tab:

#### Tab Informasi
- Data lengkap personal
- Penugasan trip & nomor kamar
- Timeline status (visual)
- QR Code untuk check-in

#### Tab Dokumen
Kelola dokumen wajib jemaah:

| Dokumen | Keterangan |
|---------|------------|
| KTP | Kartu Tanda Penduduk |
| Paspor | Dengan tanggal kadaluarsa |
| Foto | Foto formal |
| Visa | Dengan tanggal kadaluarsa |
| Sertifikat Kesehatan | Health certificate |
| Buku Nikah | Untuk jemaah suami-istri |

**Status dokumen:** Belum Upload → Diupload → Diverifikasi / Ditolak

**Alur upload:**
1. Klik ikon upload di samping tipe dokumen
2. Pilih file (PDF/JPG/PNG)
3. Isi tanggal kadaluarsa (jika ada)
4. Upload → staf memverifikasi
5. Status berubah ke "Terverifikasi"

#### Tab Pembayaran
Rekam dan pantau pembayaran jemaah:

| Field | Keterangan |
|-------|------------|
| Jumlah | Nominal pembayaran |
| Tipe | DP, Cicilan, Lunas, Refund |
| Metode | Transfer, Tunai, Kartu |
| Tanggal | Tanggal pembayaran |
| Bukti | Upload foto/scan bukti transfer |

Sistem otomatis menghitung **Total Dibayar** dan **Sisa Tagihan**.

#### Tab Catatan (Notes)
- Catatan internal oleh staf
- Tidak terlihat oleh jemaah
- Tercatat siapa yang menulis & kapan

---

### 5.4 Status Lifecycle Jemaah

Setiap jemaah memiliki status yang mencerminkan progress perjalanan:

```
Lead → DP (Down Payment) → Lunas → Dokumen → Visa → Ready → Departed → Completed
```

| Status | Artinya |
|--------|---------|
| **Lead** | Jemaah baru mendaftar, belum bayar |
| **DP** | Sudah membayar uang muka |
| **Lunas** | Pembayaran lunas 100% |
| **Dokumen** | Semua dokumen sudah disubmit |
| **Visa** | Proses visa sedang berjalan |
| **Ready** | Siap berangkat, semua lengkap |
| **Departed** | Sudah berangkat, sedang di tanah suci |
| **Completed** | Perjalanan selesai, sudah pulang |

**Cara update status:**
1. Buka detail jemaah
2. Klik status saat ini
3. Pilih status baru
4. Tambahkan catatan (opsional)
5. Simpan → perubahan tercatat di log

---

### 5.5 Import Jemaah (CSV)

**Lokasi:** `/dashboard/pilgrims` → tombol "Import"

**Format CSV yang diterima:**
```
name, nik, gender, birthDate, phone, email, address, city, province, emergencyContactName, emergencyContactPhone, emergencyContactRelation
```

**Proses:**
1. Download template CSV
2. Isi data di Excel/Google Sheets
3. Upload file CSV
4. Preview validasi (baris berhasil / baris error)
5. Konfirmasi → data masuk ke sistem
6. Laporan ringkasan: X berhasil, Y gagal

**Batas:** Maksimal 1.000 baris per file, ukuran file max 10MB

---

### 5.6 Export Jemaah (CSV)

**Lokasi:** `/dashboard/pilgrims` → tombol "Export"

Ekspor semua atau filter berdasarkan:
- Status tertentu
- Trip tertentu
- Rentang tanggal

File yang dihasilkan berisi semua data jemaah termasuk ringkasan dokumen dan pembayaran.

---

### 5.7 Bulk Action (Aksi Massal)

1. Centang jemaah yang ingin dipilih
2. Klik dropdown "Aksi Massal"
3. Pilih aksi:
   - **Update Status** — ubah status massal
   - **Assign ke Trip** — masukkan ke trip tertentu
   - **Export Terpilih** — download CSV hanya yang dipilih
   - **Hapus** — soft delete (data tetap bisa dipulihkan)

---

### 5.8 QR Code Jemaah

Setiap jemaah memiliki QR code unik yang berisi:
- ID Jemaah
- Nama
- Booking Code

**Kegunaan:**
- Check-in saat keberangkatan (scan QR)
- Identifikasi jemaah di lapangan
- Download sebagai gambar untuk dicetak

---

### 5.9 Invoice Jemaah

**Lokasi:** `/dashboard/pilgrims/[id]` → "Generate Invoice"

Invoice otomatis memuat:
- Data agensi & PPIU
- Data jemaah
- Detail paket
- Rincian harga (HPP, margin, harga jual)
- Riwayat pembayaran
- Sisa tagihan
- Informasi rekening pembayaran

---

## 6. PAKET UMRAH

**Lokasi:** `/dashboard/packages`

### 6.1 Daftar Paket

Tampilkan semua paket dengan:
- Filter: kategori (Regular, Plus, VIP, Ramadhan, Budget)
- Filter: status (aktif/nonaktif)
- Search: nama paket

---

### 6.2 Buat Paket Baru

**Lokasi:** `/dashboard/packages/new`

#### Info Dasar
| Field | Keterangan |
|-------|------------|
| Nama paket | Nama yang akan ditampilkan ke jemaah |
| Kategori | Regular / Plus / VIP / Ramadhan / Budget |
| Deskripsi | Penjelasan paket (minimal 20 karakter) |
| Durasi | Berapa hari (7–30 hari) |
| Maskapai | Nama maskapai penerbangan |

#### Kalkulator HPP (Harga Pokok Penjualan)

| Komponen | Contoh |
|----------|--------|
| Tiket pesawat | Rp 8.000.000 |
| Hotel | Rp 4.500.000 |
| Visa | Rp 1.200.000 |
| Transport | Rp 800.000 |
| Konsumsi | Rp 600.000 |
| Muthawwif/Guide | Rp 400.000 |
| Asuransi | Rp 200.000 |
| Handling | Rp 300.000 |
| Lain-lain | Rp 200.000 |
| **Total HPP** | **Rp 16.200.000** |

Sistem otomatis menghitung:
- **Total HPP** = jumlah semua komponen
- **Harga Jual** = HPP + Margin%
- **Margin Rupiah** = harga jual - HPP

#### Builder Itinerary

Susun agenda perjalanan hari per hari:
- Tambah hari (dinamis)
- Per hari: nama kota, hotel, makan (pagi/siang/malam)
- Tambah aktivitas: jam, nama kegiatan, lokasi, keterangan
- Preview real-time

**Contoh isian:**
```
Hari 1 — Madinah
  07:00 — Tiba di Bandara Madinah
  09:00 — Check-in Hotel Pullman
  13:00 — Sholat Dzuhur di Masjid Nabawi
  Makan: Pagi ✓ | Siang ✓ | Malam ✓
```

#### Info Hotel
- Nama hotel Makkah + rating bintang + jarak dari Masjidil Haram
- Nama hotel Madinah + rating bintang + jarak dari Masjid Nabawi

#### Inclusions / Exclusions
Daftar apa yang **termasuk** dan **tidak termasuk** dalam paket.

**Contoh inclusions:**
- Tiket pesawat PP kelas ekonomi
- Hotel bintang 4 (twin sharing)
- Visa umrah
- Bus selama di tanah suci
- Muthawwif profesional

---

### 6.3 Duplikat Paket

Salin paket yang sudah ada sebagai titik awal paket baru:
1. Klik tombol "Duplikat" di paket yang dipilih
2. Sistem membuat salinan dengan nama "Copy of [nama paket]"
3. Edit sesuai kebutuhan

---

### 6.4 Generate Brosur PDF

**Lokasi:** Detail paket → "Download Brosur"

Brosur otomatis berisi:
- Cover dengan logo agensi
- Nama & kategori paket
- Itinerary lengkap per hari
- Info hotel & fasilitas
- Tabel harga
- Daftar inclusions/exclusions
- Kontak agensi & nomor PPIU

---

## 7. KEBERANGKATAN (TRIPS)

**Lokasi:** `/dashboard/trips`

### 7.1 Buat Trip Baru

**Lokasi:** `/dashboard/trips/new`

| Field | Keterangan |
|-------|------------|
| Nama trip | Contoh: "Umrah Ramadhan 1446 Grup A" |
| Paket | Pilih dari daftar paket aktif |
| Tanggal berangkat | Harus tanggal masa depan |
| Tanggal kembali | Harus setelah tanggal berangkat |
| Kapasitas | 10–200 jemaah |
| Info penerbangan | Maskapai, nomor penerbangan, jam, bandara |
| Muthawwif | Nama & nomor HP pembimbing |
| Catatan trip | Info tambahan untuk staf |

---

### 7.2 Manifest (Daftar Jemaah dalam Trip)

**Lokasi:** Detail trip → Tab "Manifest"

**Tambah jemaah ke manifest:**
1. Klik "Tambah Jemaah"
2. Cari dari daftar jemaah terdaftar
3. Pilih jemaah
4. Isi: Nomor kamar, preferensi kursi, preferensi makan, kebutuhan khusus
5. Simpan

**Tampilan manifest:**
- Daftar semua jemaah dalam trip
- Status dokumen per jemaah
- Status pembayaran per jemaah
- Nomor kamar

**Cetak manifest:** klik "Print Manifest" → format siap cetak untuk koordinasi lapangan

---

### 7.3 Room Assignment (Penugasan Kamar)

**Lokasi:** Detail trip → Tab "Room Assignment"

- Tampilan visual kamar-kamar hotel
- Tipe kamar: Single, Double, Triple, Quad
- Drag-and-drop jemaah ke kamar
- Otomatis cek kapasitas
- Overview occupancy (terisi/kosong)
- Cocokkan dengan preferensi roommate

---

### 7.4 Checklist Pra-Keberangkatan

**Lokasi:** Detail trip → Tab "Checklist"

| Item | Status |
|------|--------|
| Semua jemaah dikonfirmasi | ☐ |
| Manifest lengkap | ☐ |
| Rooming list final | ☐ |
| Tiket penerbangan sudah terbit | ☐ |
| Hotel dikonfirmasi | ☐ |
| Guide/muthawwif ditugaskan | ☐ |
| Asuransi diproses | ☐ |
| Briefing keberangkatan selesai | ☐ |

Centang setiap item saat sudah selesai. Checklist membantu memastikan tidak ada yang terlewat.

---

### 7.5 Broadcast WhatsApp

**Lokasi:** Detail trip → Tab "Broadcast"

Kirim pesan massal ke semua jemaah dalam trip melalui WhatsApp:

**Template tersedia:**
- Ucapan selamat datang
- Pengingat pembayaran
- Update status perjalanan
- Pengingat keberangkatan
- Pengingat dokumen
- Pesan kustom

**Variabel pesan:** `{namajemaah}`, `{namatrip}`, `{tanggalberangkat}`, `{nokamar}`, dll

**Alur:**
1. Pilih template atau tulis custom
2. Preview pesan
3. Pilih penerima (semua atau filter)
4. Kirim

---

### 7.6 Waiting List

**Lokasi:** Detail trip → "Waiting List"

Jika trip sudah penuh, jemaah bisa masuk waiting list:
- Catat nama, nomor HP, email calon jemaah
- Nomor urut antrian otomatis
- Saat ada slot kosong → notifikasi ke waiting list
- Konversi dari waiting list ke manifest dengan satu klik

---

## 8. LAPORAN (REPORTS)

**Lokasi:** `/dashboard/reports`

5 jenis laporan tersedia dalam satu halaman dengan tab berbeda.

### 8.1 Laporan Keuangan

| Metrik | Keterangan |
|--------|------------|
| Total Revenue | Total pemasukan dari semua pembayaran |
| Outstanding | Total yang belum dibayar |
| Collection Rate | % yang sudah terbayar |
| Breakdown metode | Transfer / Tunai / Kartu |
| Breakdown tipe | DP / Cicilan / Lunas |
| Revenue per trip | Pendapatan per keberangkatan |
| Trend bulanan | Grafik 12 bulan |

**Export:** Klik "Export CSV" → download file siap dibuka di Excel

---

### 8.2 Laporan Demografi

- Distribusi jemaah berdasarkan **jenis kelamin**
- Distribusi berdasarkan **kelompok usia**
- **Top 10 provinsi** asal jemaah
- Distribusi per trip

---

### 8.3 Laporan Dokumen

- Completion rate per jenis dokumen (KTP, Paspor, Visa, dll)
- Jemaah dengan dokumen tidak lengkap
- Dokumen yang akan kadaluarsa (30 hari ke depan)
- Tingkat verifikasi

---

### 8.4 Laporan Aging Pembayaran

Analisis tunggakan berdasarkan umur:

| Kategori | Keterangan |
|----------|------------|
| 0–30 hari | Tunggakan masih baru |
| 31–60 hari | Perlu follow-up |
| 61–90 hari | Urgent |
| > 90 hari | Kritis, perlu tindakan |

Dilengkapi dengan **Top 10 debitur** (jemaah dengan tunggakan terbesar).

---

### 8.5 Funnel Konversi

Analisis perubahan status jemaah:

```
Lead → DP      : XX% konversi
DP → Lunas     : XX% konversi
Lunas → Selesai: XX% konversi
```

Berguna untuk mengidentifikasi di mana jemaah banyak "stuck" (tidak naik status).

---

### 8.6 Laporan Terjadwal (Auto-Email)

**Lokasi:** `Settings → Scheduled Reports`

Atur laporan terkirim otomatis ke email:
- **Frekuensi:** Mingguan atau Bulanan
- **Tipe:** Keuangan / Jemaah / Trip
- **Hari pengiriman:** Pilih hari & tanggal
- **Email tujuan:** Isi alamat email penerima

---

## 9. ACADEMY / LMS

**Lokasi:** `/dashboard/academy`

Platform pembelajaran online untuk staf travel agent.

### 9.1 Katalog Kursus

Tersedia kursus dalam kategori:
- **Operasional** — prosedur kerja travel agent
- **Manasik** — panduan ibadah umrah/haji
- **Bisnis** — pengembangan usaha travel
- **Tutorial** — cara menggunakan fitur GEZMA

**Filter:** kategori, level (pemula/menengah/lanjutan), status progress

---

### 9.2 Ikuti Kursus

1. Klik kursus dari katalog
2. Lihat overview (deskripsi, durasi, jumlah pelajaran)
3. Klik "Mulai Kursus"
4. Ikuti pelajaran berurutan
5. Tandai pelajaran selesai
6. Progress tersimpan otomatis

---

### 9.3 Quiz & Penilaian

Setelah menyelesaikan kursus → ikuti quiz:
- Soal pilihan ganda
- Nilai minimum lulus: 70%
- Hasil langsung ditampilkan setelah submit
- Bisa diulang jika tidak lulus
- Jika lulus → **sertifikat diterbitkan**

---

### 9.4 Sertifikat Kursus

Setelah lulus quiz → sertifikat digital tersedia:
- Nama pelajar
- Nama kursus
- Tanggal penyelesaian
- Download PDF

---

## 10. FORUM KOMUNITAS

**Lokasi:** `/dashboard/forum`

Forum diskusi antar travel agent umrah se-Indonesia.

### Kategori Thread

| Kategori | Kegunaan |
|----------|----------|
| **Review** | Review hotel, maskapai, vendor |
| **Regulasi** | Diskusi aturan & kebijakan Saudi/Nusuk |
| **Operasional** | Tips & trik operasional travel agent |
| **Sharing** | Berbagi pengalaman & best practice |
| **Scam Alert** | Peringatan penipuan & vendor bermasalah |
| **Tanya Jawab** | Pertanyaan & jawaban seputar umrah |

### Fitur Forum

- **Buat thread** — judul, konten, pilih kategori
- **Balas thread** — reply dengan konten teks
- **Like** — apresiasi reply yang bermanfaat
- **Pin** — thread penting di-pin oleh moderator
- **Badge penulis** — Admin, Moderator, Top Contributor, Senior Member

---

## 11. MARKETPLACE

**Lokasi:** `/dashboard/marketplace`

Platform produk & layanan untuk kebutuhan umrah, dikelola oleh GEZMA.

### Kategori Produk

- Hotel (Makkah & Madinah)
- Visa
- Bus & Handling
- Asuransi
- Muthawwif
- Tiket Pesawat

### Fitur

- **Browse produk** dengan filter kategori, kota, rating
- **Lihat detail** — gambar, deskripsi, harga, spesifikasi
- **Beri review** — rating bintang + komentar
- **Hubungi vendor** — via inquiry form

---

## 12. BERITA & INFORMASI

**Lokasi:** `/dashboard/news`

Informasi terkini seputar industri umrah:
- Update regulasi Saudi & Nusuk
- Pengumuman dari GEZMA
- Event industri
- Tips operasional
- Peringatan penipuan

---

## 13. PROFIL AGENSI & BRANDING

**Lokasi:** `/dashboard/agency`

### 13.1 Informasi Dasar
- Nama brand & nama legal (PT/CV)
- Deskripsi agensi
- Nomor telepon & WhatsApp
- Website
- Alamat lengkap

### 13.2 Info PPIU
- Nomor PPIU
- Tanggal terbit & kadaluarsa
- Status PPIU (Active / Expiring / Expired)

> **Penting:** PPIU yang expired akan otomatis disuspend oleh sistem.

### 13.3 Kustomisasi Branding
- Logo (light & dark version)
- Favicon
- Warna utama (primary color)
- Warna sekunder
- Nama aplikasi

### 13.4 White-Label & Custom Domain
- Slug publik (URL profil: `/agency/nama-agensi`)
- Custom domain (untuk paket premium)

---

## 14. GAMIFIKASI & REWARD

**Lokasi:** `/dashboard/gamification`

Sistem poin dan reward untuk mendorong penggunaan platform secara aktif.

### 14.1 Sistem Poin

Dapatkan poin dari aktivitas:

| Aktivitas | Poin |
|-----------|------|
| Tambah jemaah baru | +10 |
| Lengkapi dokumen jemaah | +5 |
| Rekam pembayaran | +10 |
| Buat trip | +15 |
| Selesaikan kursus | +20 |
| Referral berhasil | +50 |

### 14.2 Leaderboard

Ranking agensi berdasarkan total poin:
- Toggle bulanan / tahunan
- Top N agensi ditampilkan
- Posisi agensi sendiri di-highlight

### 14.3 Badge & Achievement

Badge khusus untuk pencapaian tertentu:
- 🥇 Jemaah Pertama Dibuat
- 🎯 100 Jemaah
- ✅ Perfect Compliance
- ⚡ Konversi Tercepat
- 🤝 Community Helper (aktif di forum)

---

## 15. SERTIFIKAT BLOCKCHAIN

**Lokasi:** `/dashboard/blockchain`

Penerbitan sertifikat digital untuk jemaah yang telah menyelesaikan perjalanan.

### 15.1 Terbitkan Sertifikat
1. Pilih jemaah
2. Pilih tipe sertifikat (Umrah, Haji, Academy)
3. Klik "Terbitkan"
4. Sistem generate nomor sertifikat unik
5. Simulasi transaksi blockchain (hash & block number)
6. PDF sertifikat tersedia untuk download

### 15.2 Verifikasi Sertifikat
URL publik: `/verify/certificate/[nomor-sertifikat]`

Siapapun bisa verifikasi keaslian sertifikat dengan memasukkan nomor sertifikat.

### 15.3 Cabut Sertifikat (Revoke)
Jika diperlukan, sertifikat bisa dicabut oleh admin agensi. Status berubah menjadi "Revoked" dan verifikasi publik akan menampilkan status tersebut.

---

## 16. PENGATURAN (SETTINGS)

**Lokasi:** `/dashboard/settings`

### 16.1 Keamanan

**Ganti Password:**
1. Masukkan password saat ini
2. Masukkan password baru (min 8 karakter)
3. Konfirmasi password baru
4. Simpan

**Riwayat Login:**
- Lihat semua aktivitas login (waktu, IP, device)
- Identifikasi login yang mencurigakan

**Sesi Aktif:**
- Lihat semua sesi yang sedang aktif
- Logout sesi tertentu (misal: logout dari laptop kantor saat di luar)

**Two-Factor Authentication (2FA):**
- Setup / Nonaktifkan TOTP

---

### 16.2 Integrasi

#### Payment Gateway
Konfigurasi gateway pembayaran:
- **Midtrans** — VA Bank (BCA, Mandiri, BNI, BRI), QRIS, E-wallet
- **Xendit** — VA, QRIS, Kartu Kredit
- **Duitku** — VA, QRIS, E-wallet

#### Nusuk (Portal Saudi)
- Koneksi ke sistem resmi Nusuk Saudi Arabia
- Cek ketersediaan hotel & visa
- Submit aplikasi visa

#### WhatsApp Business
- Koneksi ke **Fonnte**, **Wablas**, atau **Official WhatsApp Business API**
- Konfigurasi nomor HP bisnis
- Template pesan

#### UmrahCash
- Layanan tabungan & kurs mata uang
- Fitur transfer dana

---

### 16.3 Template Email

Kustomisasi email otomatis yang dikirim sistem:

| Event | Kapan Terkirim |
|-------|----------------|
| Welcome | Setelah registrasi |
| Payment Reminder | Pengingat pembayaran |
| Departure Reminder | Menjelang keberangkatan |
| Document Reminder | Dokumen belum lengkap |

Editor HTML tersedia dengan variabel dinamis `{name}`, `{tripDate}`, dll.

---

### 16.4 Webhook

**Untuk developer** — kirim event otomatis ke sistem eksternal:

1. Tambahkan URL endpoint (HTTPS)
2. Pilih event yang di-subscribe (jemaah dibuat, pembayaran masuk, dll)
3. Set secret key untuk verifikasi
4. Sistem akan POST event ke URL tersebut secara real-time

---

### 16.5 Notifikasi

Atur preferensi notifikasi:
- Email on/off
- In-app on/off
- Frekuensi (langsung / digest harian / mingguan)

---

## 17. FITUR KEUANGAN LANJUTAN

### 17.1 GEZMA Pay (Dompet Digital)

**Lokasi:** `/dashboard/gezmapay`

- Tampilkan saldo dompet
- Topup saldo
- Riwayat transaksi (topup, pembayaran, refund, transfer)
- Bayar layanan GEZMA via dompet

---

### 17.2 Tabungan Umrah

**Lokasi:** `/dashboard/tabungan`

Program tabungan untuk calon jemaah yang belum mampu bayar penuh:
- Buat rencana tabungan (nama, target, tenggat)
- Rekam setoran secara berkala
- Pantau progress (sudah vs target)
- Konversi ke booking jemaah saat lunas

---

### 17.3 PayLater

**Lokasi:** `/dashboard/paylater`

Layanan cicilan untuk jemaah:
- Tenor: 3, 6, atau 12 bulan
- Tipe akad: Murabahah / Ijarah
- Track status aplikasi (pending / disetujui / ditolak / aktif)
- Jadwal angsuran

---

## 18. MANAJEMEN TUGAS & DOKUMEN

### 18.1 Tugas (Tasks)

**Lokasi:** `/dashboard/tasks`

Kelola to-do list operasional tim:
- Buat tugas dengan judul & deskripsi
- Prioritas: Rendah / Sedang / Tinggi
- Status: To-Do / In Progress / Selesai
- Assign ke anggota tim
- Set tanggal jatuh tempo

---

### 18.2 Penyimpanan Dokumen

**Lokasi:** `/dashboard/documents`

Simpan dokumen internal agensi:
- Upload file (PDF, DOC, XLS, dll)
- Kategorikan (SOP, Template, Checklist, Umum)
- Download & bagikan ke tim
- Kontrol versi

---

### 18.3 Log Aktivitas

**Lokasi:** `/dashboard/activities`

Rekam jejak semua aktivitas di sistem:
- Siapa melakukan apa dan kapan
- Perubahan data (nilai lama → nilai baru)
- IP address pengguna

Berguna untuk **audit** dan **troubleshooting**.

---

## 19. PORTAL JEMAAH

**URL:** `https://gezma.ezyindustries.my.id/pilgrim/login`

Portal khusus untuk jemaah mengakses informasi perjalanan mereka sendiri.

### Login Jemaah

Jemaah login menggunakan **Booking Code** yang diberikan oleh agensi.

---

### 19.1 Dashboard Jemaah

Menampilkan:
- Status perjalanan saat ini
- Dokumen yang belum diupload
- Informasi trip (tanggal berangkat, maskapai, hotel)
- Saldo pembayaran

---

### 19.2 Upload Dokumen Sendiri

Jemaah bisa upload dokumen pribadi langsung:
1. Login ke portal
2. Masuk ke "Dokumen Saya"
3. Pilih tipe dokumen
4. Upload foto/scan
5. Agensi akan memverifikasi

---

### 19.3 Manasik Tutorial

**Lokasi:** `/pilgrim/manasik`

Panduan ibadah umrah langkah demi langkah:
- Materi per topik (ihram, tawaf, sa'i, tahallul, dll)
- Video pembelajaran (jika tersedia)
- Tandai selesai per pelajaran
- Lacak progress

---

### 19.4 Doa & Dzikir

**Lokasi:** `/pilgrim/doa`

Koleksi doa lengkap:
- Teks Arab
- Transliterasi Latin
- Terjemahan Indonesia
- Kategorisasi (umrah, harian, perjalanan, masjid)
- Tambahkan ke favorit
- Fungsi pencarian

---

### 19.5 Packing List

**Lokasi:** `/pilgrim/packing`

Checklist perlengkapan perjalanan:
- Dikelompokkan: Pakaian, Dokumen, Kebersihan, Obat, Elektronik
- Centang yang sudah dikemas
- Catatan per item
- Cetak checklist

---

### 19.6 Konverter Mata Uang

**Lokasi:** `/pilgrim/currency`

Konversi IDR ke SAR (dan mata uang lain) dengan kurs terkini.

---

### 19.7 Roommate Matching

**Lokasi:** `/pilgrim/roommate`

Sebelum berangkat, jemaah bisa mengisi preferensi teman kamar:
- Jenis kelamin
- Rentang usia
- Preferensi merokok
- Bahasa
- Catatan tambahan

Sistem akan mencocokkan dengan jemaah lain yang kompatibel.

---

### 19.8 Galeri Foto

**Lokasi:** `/pilgrim/gallery`

Upload dan simpan kenangan perjalanan:
- Upload foto dari perjalanan
- Tambahkan caption
- Lihat galeri bersama (sesama jemaah dalam trip)

---

### 19.9 Emergency / SOS

**Lokasi:** `/pilgrim/emergency`

Fitur darurat selama di tanah suci:
- Tombol SOS satu ketuk
- Kirim lokasi + pesan darurat ke kontak agensi
- Daftar kontak darurat (KBRI, rumah sakit, muthawwif)
- Nomor hotline darurat per kota

---

### 19.10 Tracking Perjalanan

**Lokasi:** `/pilgrim/tracking`

Informasi lengkap perjalanan:
- Info penerbangan (nomor, jam, bandara)
- Info hotel (nama, alamat, nomor kamar)
- Itinerary per hari
- Info muthawwif (nama & nomor HP)

---

### 19.11 Referral

Bagikan kode referral ke kenalan:
- Generate kode unik
- Share via WhatsApp/media sosial
- Pantau berapa referral yang berhasil
- Dapatkan poin reward

---

## 20. COMMAND CENTER

**URL:** `https://gezma.ezyindustries.my.id/command-center`

Area khusus admin GEZMA untuk mengawasi seluruh ekosistem platform.

### 20.1 Dashboard Admin

Stats platform secara keseluruhan:
- Total agensi terdaftar
- Total jemaah di seluruh agensi
- Total trip aktif
- Total revenue estimasi

---

### 20.2 Manajemen Agensi

**Lokasi:** `/command-center/agencies`

- Lihat semua agensi terdaftar
- Filter by status PPIU (aktif, hampir expired, expired)
- Detail per agensi: info, PPIU, jumlah user/jemaah/trip
- **Verifikasi agensi** — setujui pendaftaran baru
- **Suspend agensi** — untuk PPIU expired atau pelanggaran
- **Auto-suspend** — sistem otomatis suspend PPIU expired

---

### 20.3 Audit Log Platform

**Lokasi:** `/command-center/audit-log`

Rekam jejak semua aksi di seluruh platform:
- Filter by entitas (jemaah, user, paket, trip, agensi)
- Filter by aksi (dibuat, diupdate, dihapus)
- Timestamp + IP address per aksi

---

### 20.4 Compliance Monitoring

**Lokasi:** `/command-center/compliance`

Monitor kepatuhan agensi:
- Status PPIU semua agensi
- Agensi dengan dokumen tidak lengkap
- Statistik verifikasi dokumen
- Whitelist / blacklist

---

### 20.5 Fitur Lain Command Center

- **Feature Flags** — aktifkan/nonaktifkan fitur per agensi
- **Marketplace Management** — kelola produk di marketplace
- **News Management** — publish artikel berita
- **Services Management** — kelola katalog layanan
- **Trade Curation** — kurasi produk trade platform
- **Error Tracking** — pantau error aplikasi
- **Security Audit** — analisis keamanan sistem

---

## 21. SKENARIO PENGGUNAAN LENGKAP

Berikut skenario nyata penggunaan GEZMA dari awal hingga akhir.

---

### Skenario 1: Onboarding Agensi Baru

**Pelaku:** Direktur Travel Agent "Vauza Tamma Abadi, PT."  
**Situasi:** Baru bergabung dengan GEZMA, ingin mulai kelola jemaah

**Alur:**
1. Buka `gezma.ezyindustries.my.id/register`
2. Isi data agensi (nama, PT, PPIU, telepon)
3. Isi data PIC (nama direktur, email, HP)
4. Set password
5. Cek email → klik link verifikasi
6. Login → masuk Dashboard
7. Lengkapi profil agensi (logo, warna, alamat lengkap)
8. Upload dokumen PPIU di menu Agency
9. Siap menggunakan GEZMA! ✅

---

### Skenario 2: Membuat Paket Umrah Baru & Menetapkan Harga

**Pelaku:** Admin / Owner agensi  
**Situasi:** Musim umrah Ramadhan tiba, perlu buat paket khusus

**Alur:**
1. Masuk `/dashboard/packages` → "Buat Paket"
2. Isi nama: "Umrah Ramadhan 1447 Premium"
3. Pilih kategori: **VIP**
4. Isi komponen HPP:
   - Tiket: Rp 9.500.000
   - Hotel Makkah bintang 5 (50m dari Masjidil Haram): Rp 6.000.000
   - Hotel Madinah: Rp 2.500.000
   - Visa: Rp 1.200.000
   - Transport, makan, guide, asuransi: Rp 2.300.000
   - **Total HPP: Rp 21.500.000**
5. Set margin: 15% → **Harga Jual: Rp 24.725.000**
6. Susun itinerary 14 hari (Madinah 4 hari, Makkah 8 hari, perjalanan 2 hari)
7. Isi inclusions & exclusions
8. Simpan & aktifkan
9. Generate brosur PDF → kirim ke calon jemaah via WhatsApp ✅

---

### Skenario 3: Daftar Jemaah & Proses Hingga Berangkat

**Pelaku:** Staf agensi  
**Situasi:** Ada 25 calon jemaah yang mendaftar untuk paket Ramadhan

**Fase 1 — Pendaftaran:**
1. Terima form data dari jemaah (offline / WhatsApp)
2. Masuk `/dashboard/pilgrims/new`
3. Input data satu per satu ATAU import dari CSV
4. Setiap jemaah dibuat → status otomatis **Lead**
5. Bagikan booking code ke masing-masing jemaah

**Fase 2 — Bayar DP:**
1. Jemaah konfirmasi transfer DP
2. Buka detail jemaah → Tab Pembayaran → "+ Pembayaran"
3. Input: nominal DP, metode transfer, tanggal, upload bukti transfer
4. Update status jemaah → **DP**

**Fase 3 — Lengkapi Dokumen:**
1. Buka detail jemaah → Tab Dokumen
2. Upload KTP, paspor, foto, dll (dari scan yang dikirim jemaah)
3. Verifikasi tiap dokumen
4. Atau: Jemaah upload sendiri melalui Portal Jemaah
5. Saat semua dokumen lengkap → update status ke **Dokumen**

**Fase 4 — Pembayaran Lunas:**
1. Rekam sisa pelunasan di tab pembayaran
2. Update status → **Lunas**
3. Generate & kirim invoice ke jemaah

**Fase 5 — Pengurusan Visa:**
1. Submit data ke Nusuk (via integrasi atau manual)
2. Track status visa per jemaah
3. Saat visa keluar → update status → **Visa**

**Fase 6 — Persiapan Keberangkatan:**
1. Masuk ke detail Trip
2. Cek checklist — semua item harus ✓
3. Finalisasi room assignment
4. Kirim broadcast WA ke semua jemaah: "Keberangkatan H-7..."
5. Update status semua jemaah → **Ready**

**Fase 7 — Keberangkatan:**
1. Hari keberangkatan → scan QR code jemaah untuk check-in
2. Update status → **Departed**
3. Jemaah bisa akses portal selama di tanah suci

**Fase 8 — Selesai:**
1. Jemaah tiba kembali di Indonesia
2. Update status → **Completed**
3. Generate & terbitkan sertifikat blockchain
4. Minta testimoni dari jemaah ✅

---

### Skenario 4: Staf Baru Bergabung di Agensi

**Pelaku:** Owner agensi  
**Situasi:** Rekrut staf baru, perlu dibuatkan akun GEZMA

**Alur:**
1. Masuk `/dashboard/settings/users` (atau menu Users)
2. Klik "Tambah User"
3. Isi nama, email, nomor HP, jabatan
4. Pilih role: **Staff** (bisa lihat & edit data, tidak bisa ubah settings)
5. Sistem kirim email undangan ke staf baru
6. Staf baru set password → langsung bisa login ✅

---

### Skenario 5: Analisis Keuangan Bulanan

**Pelaku:** Owner / Direktur keuangan  
**Situasi:** Akhir bulan, perlu lihat performa keuangan

**Alur:**
1. Masuk `/dashboard/reports`
2. Pilih tab **Laporan Keuangan**
3. Lihat revenue bulan ini vs bulan lalu
4. Cek collection rate (berapa % sudah dibayar)
5. Identifikasi jemaah dengan tunggakan di tab **Aging**
6. Filter jemaah dengan outstanding > 30 hari
7. Buat list follow-up pembayaran
8. Export CSV → kirim ke tim keuangan
9. Setup laporan keuangan terkirim otomatis tiap minggu ke email direktur ✅

---

### Skenario 6: Jemaah Menyiapkan Diri Sebelum Berangkat

**Pelaku:** Jemaah (Bu Siti, peserta Umrah Ramadhan)  
**Situasi:** H-14 sebelum keberangkatan, Bu Siti ingin mempersiapkan diri

**Alur:**
1. Buka `gezma.ezyindustries.my.id/pilgrim/login`
2. Masuk menggunakan booking code yang diberikan agensi
3. Cek status perjalanan → lihat tanggal, maskapai, hotel
4. Cek dokumen — ada paspor yang belum diupload
5. Upload foto scan paspor langsung dari portal
6. Buka menu **Manasik** → pelajari tata cara ihram, tawaf, sa'i
7. Tandai setiap pelajaran yang sudah dipahami
8. Buka menu **Doa** → hafal doa-doa penting, tambahkan ke favorit
9. Buka menu **Packing List** → centang perlengkapan yang sudah dikemas
10. Cek konverter mata uang → IDR 5.000.000 = berapa SAR?
11. Simpan nomor darurat muthawwif di menu **Emergency**
12. Siap berangkat! ✅

---

### Skenario 7: Admin GEZMA Monitoring Agensi Bermasalah

**Pelaku:** Super Admin GEZMA  
**Situasi:** Ada laporan agensi "Bukan Emelem, PT." tidak merespons jemaah

**Alur:**
1. Login ke `/command-center`
2. Masuk menu **Agencies** → cari "Bukan Emelem"
3. Lihat detail: status PPIU, jumlah jemaah, trip aktif
4. Cek **Audit Log** → lihat aktivitas terakhir di akun tersebut
5. Temukan bahwa tidak ada aktivitas 30 hari terakhir
6. Cek status PPIU → ternyata hampir expired (7 hari lagi)
7. Kirim notifikasi peringatan ke email agensi
8. Jika tidak ada respons → suspend akun
9. Catat di compliance log ✅

---

### Skenario 8: Manfaatkan Forum untuk Sharing Pengalaman

**Pelaku:** Owner "Gapakepinjol Sejahtera, PT."  
**Situasi:** Baru selesai menangani jemaah bermasalah dengan vendor hotel

**Alur:**
1. Masuk `/dashboard/forum`
2. Klik "Buat Thread Baru"
3. Pilih kategori: **Scam Alert**
4. Judul: "WARNING: Hotel Al-Noha Madinah - Kualitas Tidak Sesuai Promosi"
5. Tulis pengalaman lengkap (foto, detail, dampak ke jemaah)
6. Posting
7. Thread dibaca oleh ratusan travel agent lain
8. Reply dari agensi lain yang punya pengalaman serupa
9. Admin GEZMA pin thread sebagai warning resmi ✅

---

## 22. REFERENSI API

> Bagian ini untuk developer yang ingin mengintegrasikan sistem eksternal dengan GEZMA.

**Base URL:** `https://gezma.ezyindustries.my.id/api`  
**Autentikasi:** Cookie `token` (JWT) diperoleh dari endpoint login

### Endpoint Utama

#### Autentikasi
```
POST /api/auth/login          — Login
POST /api/auth/register       — Registrasi agensi baru
POST /api/auth/logout         — Logout
GET  /api/auth/me             — Info user saat ini
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

#### Jemaah
```
GET    /api/pilgrims                          — Daftar jemaah (dengan filter & pagination)
POST   /api/pilgrims                          — Tambah jemaah baru
GET    /api/pilgrims/:id                      — Detail jemaah
PUT    /api/pilgrims/:id                      — Update jemaah
DELETE /api/pilgrims/:id                      — Hapus jemaah
POST   /api/pilgrims/import                   — Import dari CSV
GET    /api/pilgrims/export                   — Export ke CSV
POST   /api/pilgrims/bulk                     — Bulk action
GET    /api/pilgrims/:id/documents            — Dokumen jemaah
POST   /api/pilgrims/:id/documents            — Upload dokumen
POST   /api/pilgrims/:id/payments             — Rekam pembayaran
GET    /api/pilgrims/:id/qr                   — QR code
GET    /api/pilgrims/:id/invoice              — Generate invoice
PUT    /api/pilgrims/:id/status               — Update status
```

#### Paket
```
GET    /api/packages                          — Daftar paket
POST   /api/packages                          — Buat paket
GET    /api/packages/:id                      — Detail paket
PUT    /api/packages/:id                      — Update paket
DELETE /api/packages/:id                      — Hapus paket
POST   /api/packages/:id/duplicate            — Duplikat paket
GET    /api/packages/:id/brochure             — Generate brosur PDF
```

#### Keberangkatan
```
GET    /api/trips                             — Daftar trip
POST   /api/trips                             — Buat trip
GET    /api/trips/:id                         — Detail trip
PUT    /api/trips/:id                         — Update trip
POST   /api/trips/:id/manifest                — Tambah jemaah ke manifest
PUT    /api/trips/:id/manifest/:pilgrimId     — Update detail jemaah di manifest
DELETE /api/trips/:id/manifest/:pilgrimId     — Hapus dari manifest
```

#### Laporan
```
GET /api/reports/financial                    — Laporan keuangan
GET /api/reports/financial/export             — Export CSV laporan keuangan
GET /api/reports/demographics                 — Laporan demografi
GET /api/reports/documents                    — Laporan dokumen
GET /api/reports/payment-aging                — Laporan aging
GET /api/reports/conversion                   — Laporan funnel konversi
```

#### WhatsApp (Integrasi)
```
POST /api/integrations/whatsapp/send          — Kirim pesan ke satu nomor
POST /api/integrations/whatsapp/broadcast     — Kirim ke banyak nomor
GET  /api/integrations/whatsapp/templates     — Daftar template pesan
```

#### Webhook (Notifikasi Real-Time)
```
POST /api/settings/webhooks                   — Daftarkan webhook endpoint
GET  /api/settings/webhooks                   — Daftar webhook aktif
DELETE /api/settings/webhooks/:id             — Hapus webhook
```

#### Health Check
```
GET /api/health                               — Status aplikasi
GET /api/health/ready                         — Readiness probe
```

---

## PENUTUP

GEZMA Agent dirancang untuk membantu travel agent umrah Indonesia beroperasi lebih profesional, efisien, dan terkelola dengan baik. Dengan 174+ API endpoint dan fitur yang komprehensif, GEZMA dapat menjadi sistem tulang punggung operasional agensi dari pendaftaran jemaah pertama hingga penerbitan sertifikat perjalanan.

**Untuk bantuan teknis:** admin@gezmapay.id  
**Forum komunitas:** https://gezma.ezyindustries.my.id/dashboard/forum  
**Status sistem:** https://gezma.ezyindustries.my.id/api/health

---

*Dokumen ini dibuat secara otomatis berdasarkan audit menyeluruh sistem GEZMA Agent v0.1.0*  
*Terakhir diperbarui: April 2026*
