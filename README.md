# 🚌 WaraWiriApp

> **Tugas Desain dan Terapkan Perangkat Lunak (DTPL) otw jadi Startup**

---

## 📌 Pendekatan Repositori (Monorepo)

Repositori ini menggunakan struktur **Monorepo**, di mana kode **Backend** dan **Frontend** disimpan dalam satu repository tunggal untuk memudahkan pengelolaan *codebase*, pengembangan, dan pelacakan versi.

---

## 📁 Struktur Folder

```text
WaraWiriApp/
├── 📂 Backend/                # Modul Backend (Server, API, & database logic)
│   ├── 📂 src/
│   │   ├── 📂 controllers/    # Pengendali logika bisnis & penanganan request API
│   │   ├── 📂 models/         # Skema data & interaksi basis data (Database)
│   │   ├── 📂 routes/         # Definisi endpoint REST API
│   │   └── app.js             # Entry point aplikasi backend
│   ├── .env.example           # Contoh berkas konfigurasi variabel lingkungan
│   └── package.json           # Dependensi & skrip backend
│
└── 📂 Frontend/               # Modul Frontend (Antarmuka pengguna / UI)
    ├── 📂 src/
    │   ├── 📂 components/     # Komponen UI modular yang dapat digunakan kembali
    │   ├── 📂 pages/          # Halaman & tampilan utama aplikasi
    │   ├── 📂 services/       # Integrasi komunikasi HTTP/API ke Backend
    │   └── App.js             # Komponen utama aplikasi frontend
    └── package.json           # Dependensi & skrip frontend
