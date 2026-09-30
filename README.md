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

### Sprint 2 — Formulir Reservasi (belum dikerjakan)

- Mandatory Form: Nama, Kontak, Tanggal, Jumlah Pax
- Optional Form: Jenis Wisata
- Error Message jika form tidak lengkap / mandatory form tidak diisi
- Konfirmasi pesan setelah submit

### Sprint 3 dan seterusnya

Belum diumumkan.

---

## 🛠️ Tech Stack

**Frontend** (`Frontend/`) — sudah dibangun, lihat [Frontend/README.md](Frontend/README.md) untuk detail:
- React 19 + Vite
- Tailwind CSS v4
- React Leaflet + OpenStreetMap untuk peta lokasi (gratis, tanpa API key)

**Backend** (`Backend/`) — belum dibangun. Rencana awal: Node.js/Express + Supabase (Postgres), akan mulai dikerjakan saat ada AC yang membutuhkan penyimpanan data (misalnya submit reservasi di Sprint 2).

---

## 📁 Struktur Folder

```text
WaraWiriApp/
├── 📂 Backend/                # belum dibuat — direncanakan: Server, API, & database logic
│   ├── 📂 src/
│   │   ├── 📂 controllers/    # Pengendali logika bisnis & penanganan request API
│   │   ├── 📂 models/         # Skema data & interaksi basis data (Database)
│   │   ├── 📂 routes/         # Definisi endpoint REST API
│   │   └── app.js             # Entry point aplikasi backend
│   ├── .env.example           # Contoh berkas konfigurasi variabel lingkungan
│   └── package.json           # Dependensi & skrip backend
│
└── 📂 Frontend/               # React + Vite + Tailwind CSS
    ├── 📂 src/
    │   ├── 📂 assets/village/ # Foto (saat ini placeholder dari Unsplash)
    │   ├── 📂 components/     # Komponen UI (Hero, Carousel, VillageInfo, ContactInfo, VillageMap, dst.)
    │   ├── 📂 data/           # village.js — konten desa, GANTI dengan data asli saat tersedia
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

Buka [http://localhost:5173](http://localhost:5173) di browser. Untuk build production: `npm run build` (hasilnya di `Frontend/dist/`).

### Backend

Belum tersedia — instruksi akan ditambahkan begitu development backend dimulai.

---

## 📝 Catatan untuk Kontributor

- **Konten masih placeholder.** Nama desa, deskripsi, kontak, dan koordinat peta ada di `Frontend/src/data/village.js` — cukup ubah file ini untuk mengganti ke data desa mitra yang asli, tidak perlu menyentuh komponen.
- **Foto galeri** saat ini dari Unsplash (lihat kredit di footer situs) — ganti dengan foto asli desa begitu tersedia.
- **Alur kerja Git:** buat branch baru per fitur/sprint (contoh: `feature/sprint1-landing-page`), lalu buka Pull Request ke `main`. Jika belum menjadi collaborator repo ini, kerja lewat fork lalu buka PR dari fork tersebut.
- Pertanyaan atau kendala setup, tanyakan di grup tim sebelum membuka issue baru.
