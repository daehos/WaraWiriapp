# WaraWiriapp
Tugas DTPL otw jadi startup


# Struktur Folder
WaraWiriApp/
├── 📂 Backend/                # Modul Backend (Server, API, & database logic)
│   ├── 📂 src/
│   │   ├── 📂 controllers/    # Pengendali logika bisnis & rute API
│   │   ├── 📂 models/         # Skema data & interaksi database
│   │   ├── 📂 routes/         # Definisi endpoint REST API
│   │   └── app.js             # Entry point aplikasi backend
│   ├── .env.example           # Konfigurasi environment variabel
│   └── package.json           # Dependencies & script backend
│
└── 📂 Frontend/               # Modul Frontend (Antarmuka pengguna / UI)
    ├── 📂 src/
    │   ├── 📂 components/     # Komponen UI yang reusable
    │   ├── 📂 pages/          # Tampilan halaman utama aplikasi
    │   ├── 📂 services/       # Layanan penanganan integrasi API ke Backend
    │   └── App.js             # Komponen utama frontend
    └── package.json           # Dependencies & script frontend
