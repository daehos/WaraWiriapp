# 🚌 WaraWiriApp

> **Tugas Dinamika Tim Perangkat Lunak (DTPL) otw jadi Startup**

---

## 📌 Tentang Proyek

WaraWiriApp adalah situs untuk **WaraWiri Village**, sebuah desa wisata berkelanjutan. Situs ini menampilkan informasi desa, galeri foto, kontak, peta lokasi, kuota kunjungan harian (untuk menjaga kelestarian lingkungan), dan formulir reservasi kunjungan.

---

## 📌 Pendekatan Repositori (Monorepo)

Repositori ini menggunakan struktur **Monorepo**, di mana kode **Backend** dan **Frontend** disimpan dalam satu repository tunggal untuk memudahkan pengelolaan *codebase*, pengembangan, dan pelacakan versi.

---

## ✅ Status Pengerjaan

Acceptance criteria (AC) diumumkan bertahap per-sprint oleh tim, jadi bagian ini akan terus diperbarui.

### Sprint 1 — Landing Page

| # | Acceptance Criteria | Status |
|---|---|---|
| 1 | Landing page berisi informasi desa wisata dan gambar carousel | ✅ Selesai |
| 2 | Landing page berisi informasi kontak dan peta desa wisata | ✅ Selesai |
| 3 | Landing page menampilkan informasi kuota harian | ✅ Selesai |
| 4 | Landing page dapat tampil dengan baik di browser mobile phone | 🟡 Layout sudah responsive (Tailwind), belum diverifikasi khusus (CEK LAGI GUYS TAKUT KURENG) |

### Sprint 2 — Formulir Reservasi

| # | Acceptance Criteria | Status |
|---|---|---|
| 1 | Form wajib: Nama, Kontak, Tanggal, Jumlah Pax | ✅ Selesai |
| 2 | Form opsional: Jenis Wisata | ✅ Selesai |
| 3 | Error message jika form tidak lengkap | ✅ Selesai (error per-field + auto-fokus) |
| 4 | Muncul halaman "Menunggu Konfirmasi" setelah submit | ✅ Selesai |
| 5 | Data reservasi tersimpan online (Firebase Firestore) | ✅ Selesai — koleksi `reservations` di Firestore |

Aturan tambahan: tanggal kunjungan **minimal besok** (tidak boleh hari ini), kontak harus nomor HP Indonesia atau email, jumlah pax bilangan bulat ≥ 1.

### Sprint 3 dan seterusnya

Belum diumumkan.

---

## 🛠️ Tech Stack

**Frontend** (`Frontend/`) — sudah dibangun, lihat [Frontend/README.md](Frontend/README.md) untuk detail:
- React 19 + Vite
- Tailwind CSS v4
- React Leaflet + OpenStreetMap untuk peta lokasi (gratis, tanpa API key)

**Backend** (`Backend/`) — API Node.js **tanpa framework** (`node:http` stdlib) dengan struktur MVC (routes/controllers/models) + `firebase-admin` untuk membaca data di Firestore. **Opsional di produksi** — formulir reservasi menulis langsung dari browser ke Firestore (lihat bagian Deploy); backend dipakai untuk baca data admin secara lokal dan migrasi data lama.

**Frontend** menulis reservasi langsung ke Firestore lewat Firebase Web SDK — validasi form ada di client, validasi kedua ada di [security rules](firestore.rules).

- `GET /api/reservations` — daftar semua reservasi
- `POST /api/reservations` — buat reservasi baru (validasi di server)

---

## 📁 Struktur Folder

```text
WaraWiriApp/
├── 📂 .github/workflows/       # deploy-hosting.yml — auto-deploy ke Firebase Hosting
├── 📄 firestore.rules           # aturan Firestore: create tervalidasi, read/update/delete ditolak
├── 📄 firebase.json / .firebaserc  # konfigurasi Firebase Hosting (public: Frontend/dist)
├── 📂 Backend/                # API reservasi (opsional — baca admin & migrasi)
│   ├── 📂 data/
│   │   └── reservations.json  # data lama — sumber migrasi ke Firestore
│   ├── 📂 src/
│   │   ├── 📂 controllers/    # reservationsController.js — logika bisnis & response API
│   │   ├── 📂 models/         # reservationModel.js — baca/tulis Firestore
│   │   ├── 📂 routes/         # reservations.js — dispatch GET/POST /api/reservations
│   │   ├── 📂 scripts/        # migrateJsonToFirestore.js — migrasi data JSON lama
│   │   ├── firebase.js        # inisialisasi firebase-admin + kredensial
│   │   ├── validators.js      # validasi server-side (untuk endpoint API)
│   │   ├── http.js            # helper response & baca body request
│   │   └── app.js             # entry point: HTTP server + sajikan Frontend/dist
│   ├── .env.example           # PORT & FIREBASE_SERVICE_ACCOUNT
│   └── package.json           # `npm start`, `npm run migrate`
│
└── 📂 Frontend/               # React + Vite + Tailwind CSS
    ├── 📂 src/
    │   ├── 📂 assets/village/ # Foto (saat ini placeholder dari Unsplash)
    │   ├── 📂 components/     # Hero, Carousel, VillageInfo, ContactInfo, VillageMap, ReservationSection, dst.
    │   ├── 📂 data/           # village.js — konten desa, GANTI dengan data asli saat tersedia
    │   ├── 📂 lib/            # reservation.js (validasi & submit) + firebase.js (Web SDK) + test
    │   ├── 📂 pages/          # Landing.jsx — merangkai semua komponen jadi satu halaman
    │   └── App.jsx
    └── package.json           # Dependensi & skrip frontend
```

---

## 🚀 Menjalankan Proyek Secara Lokal

### Prasyarat

- Node.js 22.9 atau lebih baru, dan npm
- Akun Google + project [Firebase](https://console.firebase.google.com) (untuk database reservasi)

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser. Untuk build production: `npm run build` (hasilnya di `Frontend/dist/`). Unit test validasi: `npm test`.

### Backend (opsional — baca data admin & migrasi)

> Form reservasi **tidak butuh backend**: browser menulis langsung ke Firestore. Backend di bawah hanya untuk membaca data (`GET /api/reservations`) secara lokal dan menjalankan migrasi.

Butuh Node.js 22.9+:

**1. Kunci Firebase (sekali saja, untuk pemilik project)**

1. Buka [Firebase Console](https://console.firebase.google.com) → pilih project `warawiriapp-da23e`
2. **Project settings → Service accounts → Generate new private key** — file `*.json` akan terunduh
3. Simpan file itu sebagai `Backend/serviceAccountKey.json` — **sudah cukup, tanpa `.env`**
4. (Opsional) hanya kalau nama file/port beda — salin `.env.example` jadi `.env`:

   ```env
   PORT=3001
   FIREBASE_SERVICE_ACCOUNT=serviceAccountKey.json
   ```

   (`.env` dan file service account sudah di-`.gitignore` — **jangan pernah di-commit ke git**, kirim filenya lewat WhatsApp/Drive saja)
5. (Opsional) pindahkan data lama ke Firestore:

   ```bash
   cd Backend
   npm run migrate
   ```

**Security rules (WAJIB dipublikasikan sekali)**

Isi lengkap ada di [`firestore.rules`](firestore.rules): client boleh **create** dengan data tervalidasi (format, panjang, `pax` 1–1000, tanggal minimal hari ini), tetapi **tidak ada** yang boleh baca/ubah/hapus lewat client.

Cara publish: Firebase Console → **Firestore Database → Rules** → ganti seluruh isi dengan isi `firestore.rules` → **Publish**.

**Menjalankan di laptop lain (tim)**

Kunci Firebase tidak ikut di git. Minta file kunci ke pemilik project (WhatsApp/Drive), lalu:

```bash
git clone <repo>
cd WaraWiriapp/Backend && npm install && copy <path-kunci> serviceAccountKey.json
cd ../Frontend && npm install
cd ../Backend && npm start      # backend siap di :3001
```

**Jalankan lokal (development):**

```bash
# terminal 1 — backend (opsional, untuk GET admin)
cd Backend && npm start

# terminal 2 — frontend
cd Frontend && npm run dev
```

Mode production lokal (backend menyajikan `Frontend/dist`):

```bash
cd Frontend && npm run build
cd ../Backend && npm start         # buka http://localhost:3001
```

Data reservasi tersimpan online di Firestore (koleksi `reservations`, project `warawiriapp-da23e`). Cek lewat Firebase Console, atau lokal lewat `GET http://localhost:3001/api/reservations`.

---

## ☁️ Deploy ke Production (GitHub → Firebase Hosting)

Situs di-host di **Firebase Hosting** (gratis, tanpa kartu kredit) dan di-deploy otomatis oleh **GitHub Actions** — workflow: [`.github/workflows/deploy-hosting.yml`](.github/workflows/deploy-hosting.yml).

**Setup sekali saja:**

1. Publish security rules (bagian *Backend* di atas) — kalau belum, form tidak akan bisa menulis data.
2. Buka repo di GitHub → **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: seluruh isi file `Backend/serviceAccountKey.json` (tempel apa adanya)
3. Push ke `main` → tab **Actions** di GitHub akan build `Frontend/dist` lalu deploy ke Hosting.

Hasilnya: **`https://warawiriapp-da23e.web.app`** — setiap push ke `main` auto-deploy.

Catatan:

- Kuota gratis Spark: 10 GB storage, 360 MB/hari transfer — lebih dari cukup.
- Frontend **tidak lagi memanggil `/api`** di produksi; backend cukup jalan di laptop untuk baca data admin.
- Kalau workflow gagal `403 (hosting)` → service account butuh role **Firebase Hosting Admin** di Google Cloud Console → IAM.
- Kalau gagal `site not found` → buka Firebase Console → **Hosting → Get started** sekali untuk membuat site.
- Limitasi: tanpa backend, proteksi anti-spam hanya dari rules (format & panjang data) — belum ada rate limit per pengunjung.

---

## 📝 Catatan untuk Kontributor

- **Konten masih placeholder.** Nama desa, deskripsi, kontak, dan koordinat peta ada di `Frontend/src/data/village.js` — cukup ubah file ini untuk mengganti ke data desa mitra yang asli, tidak perlu menyentuh komponen.
- **Foto galeri** saat ini dari Unsplash (lihat kredit di footer situs) — ganti dengan foto asli desa begitu tersedia.
- **Alur kerja Git:** buat branch baru per fitur/sprint (contoh: `feature/sprint1-landing-page`), lalu buka Pull Request ke `main`. Jika belum menjadi collaborator repo ini, kerja lewat fork lalu buka PR dari fork tersebut.
- **Jangan pernah commit kunci Firebase.** `Backend/serviceAccountKey.json`, `Backend/.env`, dan file `*serviceAccount*.json` sudah di-`.gitignore`. Kunci hanya dibagikan di luar git (WhatsApp/Drive) dan cukup ditaruh di `Backend/` — backend otomatis memakainya. Kalau kunci pernah telanjur ter-commit, buang lewat **Firebase Console → Service accounts → Delete existing key**, lalu generate baru.
- Pertanyaan atau kendala setup, tanyakan di grup tim sebelum membuka issue baru.
