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

### Sprint 3 — Dashboard Admin

| # | Acceptance Criteria | Status |
|---|---|---|
| 1 | Login admin (email + password) dengan pesan gagal login | ✅ Selesai — Firebase Auth |
| 2 | Reset password lewat link yang dikirim ke email | ✅ Selesai — `sendPasswordResetEmail` |
| 3 | Tabel reservasi Pending / Approved / Rejected | ✅ Selesai — `/admin` |
| 4 | Tampilan identitas wisatawan dan jumlah peserta | ✅ Selesai |
| 5 | Aksi Approve / Reject tersimpan ke database | ✅ Selesai |
| 6 | Pencarian nama/kontak dan filter tanggal kunjungan | ✅ Selesai |
| 7 | Notifikasi email ke wisatawan saat approve/reject | ✅ Selesai — EmailJS, tanpa backend |

**Setup dashboard admin (sekali saja):**

1. Firebase Console → **Authentication → Get started → Sign-in method** → aktifkan **Email/Password**
2. Buat akun admin + custom claim dari folder `Backend/`:
   ```bash
   npm run make-admin -- admin@email.com
   ```
   (akun dibuat otomatis dengan password sementara yang dicetak; kalau akun sudah ada, hanya claim yang dipasang)
3. Publish ulang `firestore.rules` (Console → Firestore → Rules → Publish)
4. Buka `/admin` di situs (lokal: `http://localhost:5173/admin`)

**Email notifikasi approve/reject (EmailJS, tanpa backend):**

1. Buat akun di [emailjs.com](https://dashboard.emailjs.com/admin), lalu sambungkan email pengirim sebagai **Service**.
2. Buat **Template** dengan variabel berikut:
   - **To Email**: `{{to_email}}`
   - **Subject**: `Update Reservasi Kunjungan: {{title}} - {{status}}`
   - **Body**: gunakan variabel `name`, `title`, `status`, `is_approved`, `is_declined`, `tanggal_kunjungan`, `waktu_kunjungan`, `lokasi_gedung_ruangan`, `jumlah_orang`, `alasan_penolakan`, `ticket_url`, `ticket_code`.
3. Service ID, Template ID, dan Public Key sudah tertanam di `Frontend/src/lib/email.js` (nilai publik, memang dipakai dari browser).
4. Wajib: batasi **Allowed Origins** di dashboard EmailJS ke `localhost:5173` dan `warawiriapp-da23e.web.app`.

Email dikirim ke kolom **Email**; kalau kosong, dicoba ke kontak bila formatnya email. Status tetap tersimpan walau email gagal (dashboard menampilkan alasannya). Backend SMTP (`POST /api/notify`) masih tersedia bila backend di-deploy, tetapi frontend memakai EmailJS.

### Sprint 4 — E-Ticketing QR

| # | Acceptance Criteria | Status |
|---|---|---|
| 1 | QR tiket terbit saat admin approve | ✅ Selesai |
| 2 | Email berisi link halaman tiket + kode manual | ✅ Selesai (tanpa lampiran) |
| 3 | QR hanya valid pada tanggal kunjungan (WIB) | ✅ Selesai |
| 4 | Scan masuk/keluar lewat kamera | ✅ Satu dashboard `/admin/scan` dengan dua panel kamera |
| 5 | Batas orang di dalam = pax, boleh keluar-masuk | ✅ Selesai |

**Cara kerja tiket:**

- Saat approve, reservasi mendapat `ticketCode` acak 32 karakter hex untuk QR dan `manualCode` 6 digit untuk fallback. QR berisi `WWR-TKT|nomor-reservasi|kode`; kode manual dipetakan di `manualCodes/{6 digit}` ke reservasi.
- Email berisi tombol **Buka Tiket QR** ke halaman publik `/tiket?data=…&manual=…` dan **kode manual 6 digit**. Halaman tiket membuat QR di browser, jadi tidak perlu lampiran EmailJS berbayar. Scanner menerima isi QR atau kode manual 6 digit.
- Kode manual 6 digit lebih mudah ditebak daripada QR; gunakan hanya sebagai fallback dan petugas tetap mencocokkan nama/tanggal di layar scanner.
- QR berlaku **00:00–23:59 WIB** pada `tanggal` reservasi.
- Scan masuk menaikkan `inside` dan `entries`; scan keluar menurunkan `inside` dan menaikkan `exits`. Scan masuk hanya boleh jika `inside < pax`, jadi rombongan bisa keluar-masuk tanpa melebihi jumlah orang.
- Scanner ada di `/admin/scan` dan butuh login admin. Satu dashboard menampilkan dua panel: **kiri = pintu masuk**, **kanan = pintu keluar**. Dua kamera bisa berjalan bersamaan dan **tetap live setelah scan** — tidak perlu klik tombol lagi. Hasil scan muncul di bawah preview; QR yang sama baru diproses lagi setelah keluar dari frame sebentar supaya tidak terhitung berulang.
- Chrome/Edge di desktop bisa membuka dua webcam USB sekaligus. Pilih perangkat untuk tiap panel lewat dropdown **Pilih kamera**; pilihan disimpan di `localStorage` dan dipakai lagi saat halaman dibuka. Kamera yang sama tidak boleh dipakai kedua panel.
- Jika kamera ditolak/tidak tersedia, setiap panel tetap punya input manual untuk menempel isi QR atau mengetik kode manual 6 digit.
- Alamat lama `/admin/scan-masuk` dan `/admin/scan-keluar` tetap diarahkan ke dashboard dua panel ini.
- Counter dan kode tiket hanya bisa ditulis admin (Firebase Auth claim `admin`), divalidasi `firestore.rules`.

**Setup dua kamera (laptop admin):**

1. Sambungkan dua webcam, lalu buka `/admin/scan` dan login.
2. Klik **Deteksi kamera**, izinkan akses kamera di browser. Di macOS, label perangkat biasanya muncul sebagai nama webcam + ID.
3. Panel kiri: pilih kamera pintu masuk. Panel kanan: pilih kamera pintu keluar. Klik **Aktifkan kamera** di masing-masing panel.
4. Kalau dua webcam memakai model yang sama sehingga labelnya mirip, aktifkan satu panel dulu untuk memastikan gambar yang benar, lalu tukar lewat dropdown setelah kamera dimatikan.
5. Akses kamera hanya berjalan di `https://` atau `http://localhost`; jangan buka lewat IP LAN biasa.

**Tes dengan satu kamera (mis. di laptop pengembangan):**

- Cara cepat: aktifkan kamera fisik hanya di panel masuk, lalu uji panel keluar lewat **input manual 6 digit**. Setelah itu tukar: matikan panel masuk, pindahkan kamera ke panel keluar, dan uji arah sebaliknya. Ini menguji transaksi masuk/keluar tanpa dua stream.
- Untuk menguji dua stream sekaligus tanpa webcam kedua, pakai **OBS Virtual Camera** (gratis):
  1. Buka OBS, tambahkan **Image Source** berisi screenshot QR tiket (atau **Media Source** berisi video QR).
  2. Klik **Start Virtual Camera** di OBS.
  3. Klik **Deteksi ulang kamera** di dashboard; pilih webcam fisik untuk panel masuk dan **OBS Virtual Camera** untuk panel keluar.
  4. Aktifkan kedua panel. QR dari gambar OBS akan terbaca oleh panel keluar; kamera fisik bisa diarahkan ke QR lain untuk panel masuk.
- iPhone dengan **Continuity Camera** (macOS) juga bisa menjadi kamera kedua jika tersedia.

**Template email tiket (pakai template EmailJS yang sudah ada):**

Tidak perlu template baru dan tidak perlu attachment. Ganti body template dengan contoh berikut (pertahankan **To Email** dan **Subject**). Kalau ingin mempertahankan body lama, sisipkan bagian link + kode manual di **dalam** blok `{{#is_approved}} ... {{/is_approved}}` (jangan di bagian penolakan).

```html
<div style="font-family: system-ui, Arial, sans-serif; font-size: 16px; line-height: 1.5;">
  <p>Hi {{name}},</p>

  {{#is_approved}}
  <p>Reservasi kunjungan Anda telah <strong>disetujui</strong>.</p>
  <p><strong>{{title}}</strong><br>
  Tanggal: {{tanggal_kunjungan}}<br>
  Jumlah: {{jumlah_orang}}<br>
  Lokasi: {{lokasi_gedung_ruangan}}</p>

  <p><strong>Tiket QR Anda sudah siap.</strong></p>
  <p>
    <a href="{{ticket_url}}" style="display:inline-block;background:#1f513f;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;">
      Buka Tiket QR
    </a>
  </p>
  <p>Atau buka link ini di browser:<br>
  <a href="{{ticket_url}}">{{ticket_url}}</a></p>

  <p><strong>Jika tidak ada internet di pintu masuk/keluar</strong>, tunjukkan kode manual 6 digit ini ke petugas:</p>
  <div style="font-family:monospace;font-size:12px;background:#f4f1ea;padding:12px;border-radius:8px;word-break:break-all;">
    {{ticket_code}}
  </div>

  <p>Simpan atau screenshot QR sebelum berangkat. QR berlaku pada tanggal kunjungan dan bisa dipakai keluar-masuk selama jumlah orang di dalam tidak melebihi kuota rombongan.</p>
  {{/is_approved}}

  {{#is_declined}}
  <p>Mohon maaf, reservasi kunjungan Anda <strong>belum dapat disetujui</strong>.</p>
  <p><strong>{{title}}</strong><br>
  Tanggal: {{tanggal_kunjungan}}<br>
  Jumlah: {{jumlah_orang}}</p>
  <p>Alasan: {{alasan_penolakan}}.</p>
  {{/is_declined}}

  <p>Sampai jumpa!<br>WaraWiri Village</p>
</div>
```

**Halaman tiket publik:** `/tiket?data=WWR-TKT|nomor-reservasi|kode` — QR dibuat di browser dan bisa diunduh. Halaman ini tidak membaca Firestore, jadi tidak membocorkan data reservasi; validasi tetap dilakukan scanner.

### Sprint berikutnya

Belum diumumkan.

---

## 🛠️ Tech Stack

**Frontend** (`Frontend/`) — sudah dibangun, lihat [Frontend/README.md](Frontend/README.md) untuk detail:
- React 19 + Vite
- Tailwind CSS v4
- React Leaflet + OpenStreetMap untuk peta lokasi (gratis, tanpa API key)

**Backend** (`Backend/`) — API Node.js **tanpa framework** (`node:http` stdlib) dengan struktur MVC (routes/controllers/models) + `firebase-admin` untuk membaca data di Firestore. **Opsional di produksi** — formulir reservasi menulis langsung dari browser ke Firestore (lihat bagian Deploy); backend dipakai untuk baca data admin secara lokal, migrasi data lama, dan opsi kirim email via SMTP.

**Frontend** menulis reservasi langsung ke Firestore lewat Firebase Web SDK — validasi form ada di client, validasi kedua ada di [security rules](firestore.rules).

- `GET /api/reservations` — daftar semua reservasi
- `POST /api/reservations` — buat reservasi baru (validasi + kuota di server)
- `POST /api/notify` — kirim email approve/reject (butuh token admin)

Kuota per tanggal disimpan di `quotas/{YYYY-MM-DD}` (`limit`, `used`) — bisa dibaca publik, dan `used` hanya bisa naik sebesar `pax` reservasi baru lewat transaksi (dijaga security rules).

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
- **Kuota per tanggal** sepenuhnya serverless: admin set `limit`, pengunjung menaikkan `used` lewat transaksi, ditolak = counter turun. Tetap jalan tanpa backend.
- **Email notifikasi** memakai EmailJS dari browser admin (config publik tertanam di `Frontend/src/lib/email.js`), jadi tetap aktif di hosting statis tanpa backend. Masuk folder inbox **tidak bisa dijamin 100%** — gunakan alamat pengirim dengan SPF/DKIM/DMARC yang benar, batasi Allowed Origins, dan minta penerima menandai "bukan spam" bila perlu.
- Counter kuota divalidasi rules, tapi client yang sengaja memakai batch (bukan transaksi) masih bisa memicu lost-update — untuk desa wisata risikonya kecil.
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
