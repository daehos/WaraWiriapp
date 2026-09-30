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
| 3 | Landing page menampilkan informasi kuota harian | ⬜ Belum dikerjakan |
| 4 | Landing page dapat tampil dengan baik di browser mobile phone | 🟡 Layout sudah responsive (Tailwind), belum diverifikasi khusus |

### Sprint 2 — Formulir Reservasi

| # | Acceptance Criteria | Status |
|---|---|---|
| 1 | Form wajib: Nama, Kontak, Tanggal, Jumlah Pax | ✅ Selesai |
| 2 | Form opsional: Jenis Wisata | ✅ Selesai |
| 3 | Error message jika form tidak lengkap | ✅ Selesai (error per-field + auto-fokus) |
| 4 | Muncul halaman "Menunggu Konfirmasi" setelah submit | ✅ Selesai |
| 5 | Data reservasi tersimpan (JSON sebagai database) | ✅ Selesai — `Backend/data/reservations.json` |

Aturan tambahan: tanggal kunjungan **minimal besok** (tidak boleh hari ini), kontak harus nomor HP Indonesia atau email, jumlah pax bilangan bulat ≥ 1.

### Sprint 3 dan seterusnya

Belum diumumkan.

---

## 🛠️ Tech Stack

**Frontend** (`Frontend/`) — sudah dibangun, lihat [Frontend/README.md](Frontend/README.md) untuk detail:
- React 19 + Vite
- Tailwind CSS v4
- React Leaflet + OpenStreetMap untuk peta lokasi (gratis, tanpa API key)

**Backend** (`Backend/`) — sudah dibangun untuk Sprint 2: API Node.js **tanpa framework** (`node:http` stdlib) dengan struktur MVC (routes/controllers/models), penyimpanan ke **file JSON** (`Backend/data/reservations.json`) sebagai database. Tanpa dependensi eksternal.

- `GET /api/reservations` — daftar semua reservasi
- `POST /api/reservations` — buat reservasi baru (validasi di server)

---

## 📁 Struktur Folder

```text
WaraWiriApp/
├── 📂 Backend/                # API reservasi (Node.js tanpa framework, MVC)
│   ├── 📂 data/
│   │   └── reservations.json  # "database" — daftar reservasi (JSON)
│   ├── 📂 src/
│   │   ├── 📂 controllers/    # reservationsController.js — logika bisnis & response API
│   │   ├── 📂 models/         # reservationModel.js — baca/tulis file JSON
│   │   ├── 📂 routes/         # reservations.js — dispatch GET/POST /api/reservations
│   │   ├── validators.js      # validasi server-side (server tidak percaya client)
│   │   ├── http.js            # helper response & baca body request
│   │   └── app.js             # entry point: HTTP server + sajikan Frontend/dist
│   ├── .env.example           # PORT=3001
│   └── package.json           # `npm start` — tanpa dependensi
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

- Node.js 18 atau lebih baru, dan npm

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser. Untuk build production: `npm run build` (hasilnya di `Frontend/dist/`). Unit test validasi: `npm test`.

### Backend

Butuh Node.js 18+ dan `Frontend` sudah di-`npm install` (untuk build):

```bash
# terminal 1 — mode development (Vite dev server mem-proxy /api ke backend)
cd Backend
npm start                          # atau: node src/app.js → http://localhost:3001

# terminal 2
cd Frontend
npm run dev
```

Mode production (satu terminal saja, backend menyajikan `Frontend/dist`):

```bash
cd Frontend && npm run build
cd ../Backend && npm start         # buka http://localhost:3001
```

Data reservasi tersimpan di `Backend/data/reservations.json`. Cek lewat `GET http://localhost:3001/api/reservations`.

---

## 📝 Catatan untuk Kontributor

- **Konten masih placeholder.** Nama desa, deskripsi, kontak, dan koordinat peta ada di `Frontend/src/data/village.js` — cukup ubah file ini untuk mengganti ke data desa mitra yang asli, tidak perlu menyentuh komponen.
- **Foto galeri** saat ini dari Unsplash (lihat kredit di footer situs) — ganti dengan foto asli desa begitu tersedia.
- **Alur kerja Git:** buat branch baru per fitur/sprint (contoh: `feature/sprint1-landing-page`), lalu buka Pull Request ke `main`. Jika belum menjadi collaborator repo ini, kerja lewat fork lalu buka PR dari fork tersebut.
- Pertanyaan atau kendala setup, tanyakan di grup tim sebelum membuka issue baru.
