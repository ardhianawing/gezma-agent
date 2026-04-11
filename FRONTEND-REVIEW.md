# Frontend Review — GEZMA Agent

> Reviewed: 11 April 2026
> Reviewer: Claude (Frontend Design Skill)
> URL: https://gezma.ezyindustries.my.id

---

## Halaman yang Di-review

| No | Halaman | URL Path | Status |
|----|---------|----------|--------|
| 1 | Login | `/login` | OK |
| 2 | Dashboard | `/dashboard` | Perlu improve |
| 3 | Marketplace | `/marketplace` | OK, minor fixes |
| 4 | GezmaPay | `/gezmapay` | Perlu improve |
| 5 | Academy | `/academy` | OK |
| 6 | News | `/news` | Bagus |
| 7 | Forum | `/forum` | OK |
| 8 | Packages | `/packages` | Perlu improve |
| 9 | Pilgrims | `/pilgrims` | OK, minor fixes |
| 10 | Gamification | `/gamification` | OK |
| 11 | Foundation Home | `/foundation` | Perlu improve |
| 12 | Foundation Campaigns | `/foundation/campaigns` | OK |
| 13 | Foundation Goods | `/foundation/goods` | OK |
| 14 | Foundation Financing | `/foundation/financing` | OK |
| 15 | Foundation Impact | `/foundation/impact` | OK |

---

## 1. Design System & Brand Consistency

### Masalah
- Brand color GEZMA adalah **merah (#DC2626)** tapi beberapa modul pakai warna sendiri tanpa coherent palette:
  - Dashboard hero: **hijau gelap + dark gradient** — tidak sesuai brand
  - GezmaPay: **biru gradient** — terasa seperti app terpisah
  - Gamification: **kuning/amber** — wajar untuk gamification tapi transisi dari halaman lain terasa kasar
  - Foundation: **merah** — sesuai brand

### Rekomendasi
- Buat **color palette per modul** yang tetap berakar di merah brand:
  - Dashboard: merah → dark red gradient
  - GezmaPay: merah → biru gelap gradient (financial trust feel, tapi tetap ada aksen merah)
  - Gamification: merah → amber/gold gradient (reward feel)
- Semua CTA button tetap `#DC2626` di seluruh app — saat ini sudah konsisten

---

## 2. Typography

### Masalah
- Seluruh app pakai **system fonts / default sans-serif** — generic, kurang karakter
- Heading size tidak konsisten:
  - Dashboard: heading kecil
  - Marketplace: heading besar bold
  - Foundation: heading medium
- Tidak ada font hierarchy yang jelas (display vs body)

### Rekomendasi
- **Display font** (headings): Plus Jakarta Sans atau DM Sans — modern, clean, bagus untuk brand Indonesia
- **Body font**: Inter atau system — readable, familiar
- Standarisasi heading sizes:
  - Page title: `28px / bold`
  - Section title: `20px / semibold`
  - Card title: `16px / semibold`
  - Body: `14px / regular`
  - Caption: `12px / regular`

---

## 3. Per-Page Analysis

### 3.1 Dashboard (`/dashboard`)
**Skor: 6/10**

Kelebihan:
- Informasi lengkap: stats, chart, activity, departures
- Quick actions section berguna

Kekurangan:
- **Hero banner warna hijau** — tidak match brand merah
- **Terlalu padat** — terlalu banyak section tanpa breathing room
- Chart (pie + line) terlalu kecil untuk meaningful insight
- "Action Center" section kosong / tidak berguna
- Stat cards (156, 3, 12) styling flat

Rekomendasi:
- Hero banner → gradient merah brand
- Kurangi density: group related sections, tambah spacing
- Chart buat lebih besar atau hide di tab
- Stat cards → tambah icon + subtle background color

### 3.2 Marketplace (`/marketplace`)
**Skor: 7.5/10**

Kelebihan:
- Card layout horizontal bagus
- Star ratings, badges (Best Seller, Premium) jelas
- Filter & sort berfungsi
- Harga prominent

Kekurangan:
- Image placeholders gradient — OK tapi semua sama
- Card density agak tight
- Category pills bisa lebih visible

Rekomendasi:
- Variasi gradient per kategori produk
- Sedikit tambah gap antar card
- Category pills → rounded colored badges

### 3.3 GezmaPay (`/gezmapay`)
**Skor: 5/10**

Kelebihan:
- Balance card gradient biru bagus visual-nya
- Clean layout

Kekurangan:
- **Halaman terlalu kosong** — hanya balance card + empty state
- Empty state minimal (emoji + 1 line text)
- Tidak ada quick action (Transfer, QR Pay, History filter)
- Warna biru tidak match brand

Rekomendasi:
- Tambah quick action buttons di bawah balance card (Top Up, Transfer, Scan QR, Withdraw)
- Empty state → ilustrasi SVG + CTA button
- Balance card → merah-dark gradient agar match brand
- Tambah section "Promo" atau "Fitur GezmaPay" untuk mengisi kekosongan

### 3.4 Academy (`/academy`)
**Skor: 7/10**

Kelebihan:
- Card design dengan kategori badges bagus
- Progress indicator (lesson count, duration)
- Layout clean

Kekurangan:
- Semua card terasa monoton — same layout, no visual variety
- Tidak ada hero/featured course section
- Rating stars kurang visible

Rekomendasi:
- Tambah featured course banner di atas
- Variasi card size untuk highlight course populer

### 3.5 News (`/news`)
**Skor: 8/10 — Terbaik**

Kelebihan:
- Real images — jauh lebih engaging
- Featured article besar di atas
- Grid layout responsif
- Waktu baca, kategori badge, tanggal lengkap

Kekurangan:
- Minor: beberapa gambar aspect ratio inconsistent

Rekomendasi:
- Standarisasi image aspect ratio (16:9)
- Jadikan template untuk halaman lain

### 3.6 Forum (`/forum`)
**Skor: 7/10**

Kelebihan:
- Thread list clean dan informative
- Kategori badges warna-warni
- Reply count, views, pin indicator jelas
- Create Thread button prominent

Kekurangan:
- Pure list view — bisa monoton untuk scroll panjang
- Tidak ada trending/hot topic highlight

Rekomendasi:
- Tambah "Trending Topics" section di atas
- Alternating row background untuk readability

### 3.7 Packages (`/packages`)
**Skor: 6/10**

Kelebihan:
- Info lengkap: duration, airline, rating, harga
- "Builder Paket Modular" button unik

Kekurangan:
- **Tidak ada gambar sama sekali** — paling bland di seluruh app
- Card layout flat, tidak ada visual appeal
- Star rating pakai karakter Unicode — bisa lebih polished
- Semua card terlihat sama

Rekomendasi:
- Tambah image/gradient header per package (gambar Makkah, Madinah, Turki)
- Card → vertical layout dengan image di atas
- Highlight "Popular" atau "Best Value" package
- Star rating → SVG stars yang proper

### 3.8 Pilgrims (`/pilgrims`)
**Skor: 7/10**

Kelebihan:
- Table layout clean dan functional
- Status badges (Active, Completed, Pending) jelas
- Search dan filter ada
- Pagination works

Kekurangan:
- Pure table — monoton untuk data banyak
- Avatar placeholder semua sama (merah circle)
- Tidak ada summary stats di atas

Rekomendasi:
- Tambah stat cards di atas: Total Jamaah, Active, Completed, Pending
- Avatar → initials (huruf pertama nama)
- Alternating row background

### 3.9 Gamification (`/gamification`)
**Skor: 7/10**

Kelebihan:
- Stat cards (Points, Level, Rank) prominent
- Badge collection visual
- Leaderboard clear

Kekurangan:
- Badge icons semua emoji — kurang polished
- Leaderboard avatars semua sama
- Empty state "No points history yet" di bawah

Rekomendasi:
- Badge → custom SVG atau gradient circles dengan icon
- Leaderboard avatar → initials dengan warna berbeda
- Points history → timeline view

### 3.10 Foundation (`/foundation/*`)
**Skor: 7/10**

Kelebihan:
- Hero banner ada
- Stat cards functional
- Campaign cards dengan gradient per kategori
- Impact dashboard informatif
- Financing accordion clean

Kekurangan:
- Hero banner kecil, kurang impactful
- Stat cards terlalu padat
- Goods page cards bisa lebih clean
- Foundation home terlalu banyak section kecil

Rekomendasi:
- Hero banner lebih besar dengan overlay text yang dramatic
- Stat cards 2x2 grid dengan icon lebih besar
- Campaign cards → tambah hover animation
- Goods → clean card without oversized gradient

---

## 4. Cross-Cutting Issues

### 4.1 Empty States
- GezmaPay, Gamification Points History → terlalu minimal
- Perlu: ilustrasi/icon + deskripsi + CTA button
- Template: icon besar (64px) + heading + 1 line desc + button

### 4.2 Loading States
- Beberapa halaman pakai skeleton loader (bagus)
- Beberapa halaman hanya spinner atau blank
- Standarisasi: skeleton loader untuk semua data-fetching pages

### 4.3 Mobile Responsiveness (iPhone 375px)

> Catatan: Aplikasi ini dioptimalkan untuk PC/laptop, mobile sebagai secondary.

**Yang Sudah Bagus:**
- Sidebar collapse ke hamburger — OK
- Header menyesuaikan: search icon, dark mode, notifications, avatar
- Card grids collapse ke 1 column — OK
- Foundation campaigns: single column stacked — OK
- News: featured article + grid cards responsive — OK
- Forum: thread list responsive, badges wrapping baik
- GezmaPay: balance card full width, clean
- Packages: single column stacking — OK

**Masalah Mobile:**

1. **Dashboard — PALING BERMASALAH**
   - Hero banner text terlalu panjang, banyak whitespace
   - Stat cards (156, 8, 3, 12) stack vertikal → halaman jadi sangat panjang
   - Chart pie dan bar terlalu kecil, legend terpotong
   - Quick Actions grid 2x3 OK tapi icon terlalu kecil
   - "Gamification" card overlap dengan leaderboard
   - Terlalu banyak scroll — content overload

2. **Pilgrims — TABLE OVERFLOW**
   - Table horizontal scroll — functional tapi UX buruk
   - Kolom terlalu banyak (name, phone, email, package, status, payment, actions)
   - Text terpotong di kolom kecil
   - Status badges overlapping
   - **Rekomendasi: card view untuk mobile** — nama + status + package per card

3. **Marketplace — MINOR**
   - Card horizontal layout collapse ke vertical — OK
   - Tapi badge "Best Seller" / "Premium" terlalu besar relatif ke card
   - Filter pills horizontal scroll — OK tapi kurang obvious bisa scroll

4. **Packages — MINOR**
   - "Builder Paket Modular" + "Create Package" buttons stack — agak crowded
   - Card content OK tapi description terpotong

5. **Forum — OK**
   - Thread items stack well
   - Category badges wrap properly
   - Create Thread button prominent

6. **Foundation — MINOR**
   - Stat cards 1-column OK
   - Campaign cards single column — good
   - Module cards text bisa lebih besar
   - "Donate Now" button pada hero agak kecil

7. **Install Banner (PWA) — KRITIS di mobile**
   - Banner fixed bottom menutupi konten
   - Pada beberapa halaman menutupi CTA buttons
   - Harus bisa di-dismiss permanently

**Skor Mobile:**
- Dashboard: 4/10
- Pilgrims: 4/10
- Marketplace: 7/10
- GezmaPay: 7/10
- Foundation: 7/10
- Forum: 7.5/10
- News: 8/10
- Packages: 6.5/10
- **Rata-rata mobile: 6.4/10**

### 4.4 Micro-interactions
- Hampir tidak ada animasi/transitions
- Card hover effects minimal (translateY saja)
- Tidak ada page transition
- Rekomendasi: tambah subtle fade-in saat page load, card hover shadow grow

### 4.5 Install Banner (PWA)
- Banner "Install GEZMA Agent" muncul di SEMUA halaman dan menutupi konten
- Sangat mengganggu — terutama di mobile
- Rekomendasi: tampilkan sekali saja, simpan preference di localStorage, atau pindahkan ke posisi yang tidak mengganggu (bottom bar, bukan floating overlay)

---

## 5. Prioritas Perbaikan

### Tier 1 — High Impact, Harus Fix (untuk presentasi)
1. **Dashboard hero banner** → warna sesuai brand merah
2. **GezmaPay** → tambah quick actions, less empty
3. **Packages** → tambah visual/image per paket
4. **Install banner** → kurangi agresivitas, dismiss permanently via localStorage
5. **Pilgrims mobile** → card view gantikan table di viewport < 768px

### Tier 2 — Medium Impact
6. **Typography upgrade** → Plus Jakarta Sans / DM Sans
7. **Foundation home hero** → lebih besar dan impactful
8. **Consistent spacing** → standarisasi section padding (24px → 32px)
9. **Empty states** → upgrade semua ke template dengan ilustrasi + CTA
10. **Dashboard mobile** → simplify layout, collapsible sections, smaller charts

### Tier 3 — Polish
11. **Micro-interactions** → card hover, page fade-in
12. **Gamification badges** → custom icons gantikan emoji
13. **Marketplace mobile badges** → resize badge proportions
14. **Mobile touch targets** → pastikan semua button minimal 44x44px

---

## 6. Kesimpulan

GEZMA secara keseluruhan sudah **functional dan usable**. Design-nya clean dan konsisten di level dasar. Untuk level presentasi/investor, yang perlu di-upgrade adalah:

- **Visual identity yang lebih kuat** — typography + brand color consistency
- **Halaman kosong** — GezmaPay dan empty states perlu konten visual
- **Hero sections** — beberapa halaman perlu focal point yang lebih kuat
- **Polish** — micro-interactions, loading states, image placeholders

**Skor Desktop:**
- Rata-rata: **6.8/10**
- Target setelah improvement: **8.5/10**

**Skor Mobile:**
- Rata-rata: **6.4/10**
- Target setelah improvement: **7.5/10** (secondary priority, app optimized for PC/laptop)
