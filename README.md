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

**Backend** (`Backend/`) — sudah dibangun untuk Sprint 2: API Node.js **tanpa framework** (`node:http` stdlib) dengan struktur MVC (routes/controllers/models), penyimpanan ke **Firebase Firestore** (koleksi `reservations`) lewat `firebase-admin`. Database file JSON lama (`Backend/data/reservations.json`) hanya dipakai sebagai sumber migrasi.

- `GET /api/reservations` — daftar semua reservasi
- `POST /api/reservations` — buat reservasi baru (validasi di server)

---

## 📁 Struktur Folder

```text
WaraWiriApp/
├── 📂 Backend/                # API reservasi (Node.js tanpa framework, MVC)
│   ├── 📂 data/
│   │   └── reservations.json  # data lama — sumber migrasi ke Firestore
│   ├── 📂 src/
│   │   ├── 📂 controllers/    # reservationsController.js — logika bisnis & response API
│   │   ├── 📂 models/         # reservationModel.js — baca/tulis Firestore
│   │   ├── 📂 routes/         # reservations.js — dispatch GET/POST /api/reservations
│   │   ├── 📂 scripts/        # migrateJsonToFirestore.js — migrasi data JSON lama
│   │   ├── firebase.js        # inisialisasi firebase-admin + kredensial
│   │   ├── validators.js      # validasi server-side (server tidak percaya client)
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
    │   ├── 📂 lib/             # reservation.js — validasi & submit form + test (node:test)
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

### Backend

Butuh Node.js 22.9+ dan `Frontend` sudah di-`npm install` (untuk build):

**1. Hubungkan Firebase (sekali saja, untuk pemilik project)**

1. Buka [Firebase Console](https://console.firebase.google.com) → pilih project `warawiriapp-da23e`
2. Buat database Firestore: **Build → Firestore Database → Create database** (production mode, region `asia-southeast1`)
3. **Project settings → Service accounts → Generate new private key** — file `*.json` akan terunduh
4. Simpan file itu sebagai `Backend/serviceAccountKey.json` — **sudah cukup, tanpa `.env`**
5. (Opsional) hanya kalau nama file/port beda — salin `.env.example` jadi `.env`:

   ```env
   PORT=3001
   FIREBASE_SERVICE_ACCOUNT=serviceAccountKey.json
   ```

   (`.env` dan file service account sudah di-`.gitignore` — **jangan pernah di-commit ke git**, kirim filenya lewat WhatsApp/Drive saja)
6. (Opsional) pindahkan data lama ke Firestore:

   ```bash
   cd Backend
   npm run migrate
   ```

**Menjalankan di laptop lain (tim)**

Kunci Firebase tidak ikut di git. Minta file kunci ke pemilik project (WhatsApp/Drive), lalu:

```bash
git clone <repo>
cd WaraWiriapp/Backend && npm install && copy <path-kunci> serviceAccountKey.json
cd ../Frontend && npm install
cd ../Backend && npm start      # backend siap
```

**Security rules** — karena backend memakai `firebase-admin` (melewati rules), blokir akses langsung dari browser/app lain:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**2. Jalankan**

```bash
# terminal 1 — mode development (Vite dev server mem-proxy /api ke backend)
cd Backend
npm start                          # http://localhost:3001 (memuat .env otomatis)

# terminal 2
cd Frontend
npm run dev
```

Mode production (satu terminal saja, backend menyajikan `Frontend/dist`):

```bash
cd Frontend && npm run build
cd ../Backend && npm start         # buka http://localhost:3001
```

Data reservasi tersimpan online di Firestore (koleksi `reservations`, project `warawiriapp-da23e`). Cek lewat `GET http://localhost:3001/api/reservations` atau langsung di Firebase Console.

---

## ☁️ Deploy ke Production (otomatis dari GitHub)

Konfigurasi ada di [`render.yaml`](render.yaml) (Render Blueprint) — build `Frontend` lalu jalankan `Backend` sebagai satu layanan, jadi API dan situs berada di URL yang sama.

**Setup sekali saja:**

1. Buka [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint** → hubungkan repo `daehos/WaraWiriapp` (butuh izin akses GitHub)
2. Render membaca `render.yaml` → klik **Apply**
3. Setelah service jadi, buka **Environment** → isi variabel `FIREBASE_SERVICE_ACCOUNT_JSON` dengan **seluruh isi** file `serviceAccountKey.json` (tempel apa adanya) → **Save**
4. Tunggu deploy selesai → dapat URL publik `https://warawiriapp-xxxx.onrender.com`

**Setelah itu auto-deploy:** setiap `git push` ke `main` memicu build & deploy ulang otomatis.

Catatan free tier:

- Service **tidur** setelah ~15 menit tanpa akses → request pertama bisa nunggu ±30 detik (wajar).
- Build butuh `Frontend/dist` — perintah build sudah tercantum di `render.yaml`, tidak perlu diubah.
- `FIREBASE_SERVICE_ACCOUNT_JSON` hanya ditaruh di dashboard Render (bukan di git).

---

## 📝 Catatan untuk Kontributor

- **Konten masih placeholder.** Nama desa, deskripsi, kontak, dan koordinat peta ada di `Frontend/src/data/village.js` — cukup ubah file ini untuk mengganti ke data desa mitra yang asli, tidak perlu menyentuh komponen.
- **Foto galeri** saat ini dari Unsplash (lihat kredit di footer situs) — ganti dengan foto asli desa begitu tersedia.
- **Alur kerja Git:** buat branch baru per fitur/sprint (contoh: `feature/sprint1-landing-page`), lalu buka Pull Request ke `main`. Jika belum menjadi collaborator repo ini, kerja lewat fork lalu buka PR dari fork tersebut.
- **Jangan pernah commit kunci Firebase.** `Backend/serviceAccountKey.json`, `Backend/.env`, dan file `*serviceAccount*.json` sudah di-`.gitignore`. Kunci hanya dibagikan di luar git (WhatsApp/Drive) dan cukup ditaruh di `Backend/` — backend otomatis memakainya. Kalau kunci pernah telanjur ter-commit, buang lewat **Firebase Console → Service accounts → Delete existing key**, lalu generate baru.
- Pertanyaan atau kendala setup, tanyakan di grup tim sebelum membuka issue baru.
