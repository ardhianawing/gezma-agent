# Pre-Deployment Checklist — GEZMA Agent

## 1. Environment Variables

### Wajib (Required)

| Variable | Contoh | Catatan |
|---|---|---|
| `DB_PASSWORD` | `strong_random_password` | Password PostgreSQL, wajib eksplisit |
| `DATABASE_URL` | `postgresql://gezma_admin:<DB_PASSWORD>@db:5432/gezma_agent` | Connection string lengkap |
| `JWT_SECRET` | `min-32-karakter-random-string...` | Minimal 32 karakter |
| `TOTP_ENCRYPTION_KEY` | `openssl rand -hex 32` | AES-256 key untuk 2FA, generate dengan `openssl rand -hex 32` |
| `NODE_ENV` | `production` | Set `production` untuk deploy |

### Opsional (Recommended)

| Variable | Default | Catatan |
|---|---|---|
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | - | Email username |
| `SMTP_PASS` | - | App password (bukan password email biasa) |
| `SMTP_FROM` | - | Sender email |
| `GEMINI_API_KEY` | - | Google Gemini 2.0 Flash, untuk AI assistant |
| `STORAGE_DRIVER` | `local` | `local` atau `s3` |
| `CRON_ENABLED` | `true` | Scheduled jobs (reports, suspend PPIU, alerts) |
| `APP_URL` | `http://localhost:3000` | Server-side base URL |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Client-side base URL |

### S3 Storage (Wajib kalau `STORAGE_DRIVER=s3`)

| Variable | Catatan |
|---|---|
| `S3_BUCKET` | Nama bucket |
| `S3_REGION` | Region (e.g. `ap-southeast-1`) |
| `S3_ENDPOINT` | Untuk MinIO, kosongkan untuk AWS S3 |
| `S3_ACCESS_KEY` | Access key |
| `S3_SECRET_KEY` | Secret key |

---

## 2. Setup Steps

### Fresh Deploy

```bash
# 1. Clone repo
git clone https://github.com/ardhianawing/gezma-agent.git
cd gezma-agent

# 2. Buat .env dari template
cp .env.example .env
# Edit .env, isi semua variable wajib

# 3. Start services
docker compose up -d

# 4. Push schema ke database
npx prisma db push

# 5. Cek health
curl http://localhost:3001/api/health
```

### Update Deploy (Sudah Ada DB)

```bash
# 1. Pull latest
git pull origin master

# 2. Rebuild & restart
docker compose up -d --build

# 3. Push schema kalau ada perubahan model
npx prisma db push

# 4. Cek health
curl http://localhost:3001/api/health
```

---

## 3. Verification Checklist

- [ ] `.env` file lengkap, semua variable wajib terisi
- [ ] `docker compose up -d` — semua services healthy
- [ ] `GET /api/health` — response `200 OK`
- [ ] Login page accessible di browser
- [ ] Register → verifikasi email → login flow works
- [ ] Dashboard loads dengan data
- [ ] Command Center login works (kalau dipakai)
- [ ] Pilgrim Portal login works (kalau dipakai)

---

## 4. Security Checklist

- [ ] `DB_PASSWORD` bukan default, gunakan password kuat
- [ ] `JWT_SECRET` minimal 32 karakter, random
- [ ] `TOTP_ENCRYPTION_KEY` di-generate dengan `openssl rand -hex 32`
- [ ] HTTPS aktif (Traefik + Let's Encrypt)
- [ ] `.env` file TIDAK ter-commit ke git
- [ ] SMTP password menggunakan App Password (bukan password email)

---

## 5. Integrasi API (Belum Aktif — Mock)

Service berikut masih menggunakan mock data. Ganti dengan real API saat siap:

| Service | File | Status |
|---|---|---|
| Nusuk API | `src/lib/services/nusuk.service.ts` | Mock |
| Payment Gateway | `src/lib/services/payment-gateway.service.ts` | Mock (webhook handler ready) |
| WhatsApp API | `src/lib/services/whatsapp.service.ts` | Mock |
| UmrahCash | `src/lib/services/umrahcash.service.ts` | Mock |

---

## 6. Port & Network

| Service | Port | Catatan |
|---|---|---|
| App (Next.js) | `3001:3000` | Exposed di host port 3001 |
| PostgreSQL | `5432` (internal) | Tidak exposed ke host, hanya via Docker network |
| Traefik | `80/443` | HTTPS termination |

Domain: `gezma.ezyindustries.my.id` (configured di docker-compose labels)
