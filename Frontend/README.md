# WaraWiri Village — Frontend

Landing page (dan nantinya formulir reservasi) untuk desa wisata berkelanjutan **WaraWiri Village**. Dibangun dengan React + Vite + Tailwind CSS.

## Menjalankan

```bash
npm install
npm run dev       # dev server di http://localhost:5173
npm run build     # build production ke dist/
npm run preview   # preview hasil build production
npm run lint      # lint dengan oxlint
```

## Struktur

```text
src/
├── assets/village/    # Foto (saat ini placeholder dari Unsplash)
├── components/        # Navbar, Hero, Carousel, VillageInfo, ContactInfo, VillageMap, Footer
├── data/village.js    # Konten desa — GANTI dengan data asli begitu tersedia
├── pages/Landing.jsx  # Merangkai semua komponen jadi satu halaman
├── App.jsx
└── main.jsx
```

## Catatan Implementasi

- **Peta lokasi** memakai React Leaflet + tile OpenStreetMap (gratis, tanpa API key). Trik embed Google Maps tanpa API key (`/maps?...&output=embed`) sudah tidak berfungsi lagi di akun Google saat ini — jika ingin kembali ke Google Maps, gunakan Maps Embed API resmi (butuh API key).
- **Styling** pakai Tailwind CSS v4 lewat plugin `@tailwindcss/vite`. Token warna & font kustom didefinisikan di `src/index.css` lewat blok `@theme`.
- **Konten** semua teks & data desa saat ini placeholder di `src/data/village.js` (nama, deskripsi, highlight, galeri, kontak, koordinat peta). Untuk mengganti ke data desa mitra yang asli, cukup ubah file ini — tidak perlu menyentuh komponen.

## Status

Sprint 1 (informasi desa + carousel, kontak + peta) sudah selesai. Lihat [README utama](../README.md) di root repo untuk detail progres per-sprint dan acceptance criteria yang belum dikerjakan.
