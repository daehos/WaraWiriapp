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
- Scanner ada di `/admin/scan` dan butuh login admin. Satu dashboard menampilkan dua panel: **kiri = pintu masuk**, **kanan = pintu keluar**. Saat halaman dibuka, kamera dideteksi dan dinyalakan **otomatis** untuk kedua panel — tidak perlu klik **Deteksi kamera** atau **Aktifkan kamera**. Browser hanya akan meminta izin kamera sekali. Dua kamera bisa berjalan bersamaan dan **tetap live setelah scan**; hasil scan muncul di bawah preview, dan QR yang sama baru diproses lagi setelah keluar dari frame sebentar supaya tidak terhitung berulang.
- Chrome/Edge di desktop bisa membuka dua webcam USB sekaligus. Perangkat dipilih otomatis (atau memakai pilihan terakhir yang disimpan di `localStorage`); pilihan itu dipakai lagi saat halaman dibuka. Jika urutan kamera tertukar, matikan panel terkait lalu pilih perangkat yang benar — kamera akan menyala otomatis. Kamera yang sama tidak boleh dipakai kedua panel.
- Jika kamera ditolak/tidak tersedia, panel menampilkan tombol **Coba deteksi ulang** atau **Aktifkan kamera** sebagai cadangan. Setiap panel juga tetap punya input manual untuk menempel isi QR atau mengetik kode manual 6 digit.
- Alamat lama `/admin/scan-masuk` dan `/admin/scan-keluar` tetap diarahkan ke dashboard dua panel ini.
- Counter dan kode tiket hanya bisa ditulis admin (Firebase Auth claim `admin`), divalidasi `firestore.rules`.

**Setup dua kamera (laptop admin):**

1. Sambungkan dua webcam, lalu buka `/admin/scan` dan login.
2. Izinkan akses kamera saat browser meminta. Kedua panel akan langsung aktif otomatis; tidak perlu klik **Deteksi kamera** atau **Aktifkan kamera**. Di macOS, label perangkat biasanya muncul sebagai nama webcam + ID.
3. Kalau urutan kamera tertukar, matikan kamera panel yang salah, pilih perangkat yang benar lewat dropdown, dan kamera akan menyala otomatis. Pilihan disimpan untuk kunjungan berikutnya.
4. Jika dua webcam memakai model yang sama sehingga labelnya mirip, cek gambar masing-masing panel; tukar lewat dropdown setelah kamera dimatikan.
5. Akses kamera hanya berjalan di `https://` atau `http://localhost`; jangan buka lewat IP LAN biasa.

**Tes dengan satu kamera (mis. di laptop pengembangan):**

- Cara cepat: panel masuk otomatis aktif dengan kamera fisik, lalu uji panel keluar lewat **input manual 6 digit**. Setelah itu matikan panel masuk, pindahkan kamera ke panel keluar, dan uji arah sebaliknya. Ini menguji transaksi masuk/keluar tanpa dua stream.
- Untuk menguji dua stream sekaligus tanpa webcam kedua, pakai **OBS Virtual Camera** (gratis):
  1. Buka OBS, tambahkan **Image Source** berisi screenshot QR tiket (atau **Media Source** berisi video QR).
  2. Klik **Start Virtual Camera** di OBS.
  3. Buka atau muat ulang dashboard `/admin/scan`; kamera fisik dan **OBS Virtual Camera** akan terdeteksi lalu aktif otomatis di kedua panel. Jika perlu, tukar perangkat lewat dropdown setelah mematikan panel terkait.
  4. QR dari gambar OBS akan terbaca oleh panel keluar; kamera fisik bisa diarahkan ke QR lain untuk panel masuk.
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

### Sprint 5 — Notifikasi Penugasan Warga/Pemandu (PBI-5)

| # | Acceptance Criteria | Status |
|---|---|---|
| 1 | Notifikasi bisa dikirim ke email pemandu/pengelola yang didaftarkan manual | ✅ `Backend/data/guides.json` → `npm run seed-guides`; pengirim SMTP (`npm run notify`) |
| 2 | Notifikasi diterima H-1 sebelum hari kunjungan | ✅ Job terjadwal GitHub Actions tiap jam; jendela H-1 dibuka 07:00 WIB |
| 3 | Berisi detail rombongan, jumlah, destinasi, tanggal & waktu | ✅ Lihat template di `Backend/src/core/emailTemplate.js` |
| 4 | Email masuk Inbox, bukan Spam | 🟡 Template sudah ramah-spam (teks + HTML, tanpa lampiran/tautan asing); hasil akhir bergantung SPF/DKIM/DMARC pengirim — lihat catatan di bawah |

**Cara kerja:**

- **Form reservasi** kini wajib memilih **slot waktu** (`village.reservation.waktu`, disimpan di field `waktu`). Destinasi tetap opsional; tanpa destinasi, rombongan bisa dilayani pemandu mana pun.
- **Trigger**: reservasi berstatus `dikonfirmasi` (admin menekan Approve).
- **Antrian alokasi** (`Backend/src/core/allocator.js`, murni & ber-test): FIFO menurut waktu disetujui → pemandu aktif yang menguasai destinasi → belum melewati batas `maxGroups` rombongan/hari → belum punya rombongan di slot waktu yang sama → pilih pemandu dengan prioritas tertinggi (field `urutan`): **satu pemandu diisi sampai penuh dulu** (mis. 4 rombongan), baru rombongan berikutnya **dioper** ke pemandu lain; penugasan yang sudah ada tidak berubah (idempoten).
- **Notifikasi** (`Backend/src/core/planner.js`): email ke pemandu dengan **tembusan pengelola** (`MANAGER_EMAIL`). Ada dua mode (`NOTIFY_MODE`):
  - `h-1` (**default/produksi**, sesuai kartu): mulai H-1 pukul 07:00 WIB (`NOTIFY_HOUR_WIB`).
  - `segera` (**simulasi/demo**, dipakai otomatis di `npm run local`): begitu admin menekan **Approve**, pemandu langsung dipilih dan emailnya dikirim — tanpa menunggu H-1. Persetujuan terlambat tetap terkirim di run berikutnya. Kegagalan SMTP dicoba ulang tiap jam (maks 5×). Kalau tidak ada pemandu yang tersedia, **pengelola diperingatkan sekali**; begitu pemandu ditambahkan, alokasi + notifikasi berjalan otomatis.
- **Isi email pemandu**: tanggal & waktu (disorot), destinasi, nama rombongan, **kontak** (nomor bisa langsung diketuk untuk menelepon) dan email rombongan bila ada, jumlah pengunjung, nomor reservasi, serta daftar **"Mohon bawa & siapkan"**: kotak P3K, konsumsi & air minum sesuai jumlah pengunjung, dan peralatan penunjang khusus tiap destinasi (`GEAR` di `emailTemplate.js`).
- **Dashboard admin** (`/admin`) menampilkan kolom **Waktu** dan **Pemandu** + status notifikasi (Menunggu alokasi / Ditugaskan, email belum terkirim / Notifikasi terkirim / Email gagal / Belum ada pemandu) + tombol **Kirim email pemandu** untuk kirim ulang.
- Status ditulis ke dokumen reservasi: `guideId`, `guideName`, `guideAssignedAt`, `guideNotifiedAt`, `guideNotifyStatus`, `guideNotifyAttempts`, `guideNotifyError`, `managerAlertAt`. Penulisnya hanya job Backend (Admin SDK) atau **admin yang login** di dashboard (mode online); `firestore.rules` memvalidasi tiap field, dan pengunjung publik tidak bisa menulisnya.

**Simulasi tanpa Firebase/SMTP (untuk demo tugas):**

```bash
cd Backend
npm test            # 34 test: alokasi, jendela H-1, idempotensi, retry, email
npm run simulate    # skenario lengkap dengan jam palsu; email ditulis ke Backend/outbox/simulate/index.html
```

`simulate` memutar satu hari: run 06:00 (alokasi, belum kirim) → 07:05 (email terkirim, satu SMTP gagal, satu rombongan tanpa pemandu → pengelola diperingatkan) → 08:05 (retry) → 09:30 (persetujuan terlambat) → 10:05 (pemandu baru mengambil rombongan yang tersisa) → 11:05 (tidak ada email ganda). Buka `Backend/outbox/simulate/index.html` di browser untuk melihat tiap email.

**Email pemandu di situs online (`https://warawiriapp-da23e.web.app`):**

Hosting Firebase statis tidak punya server Backend, jadi di situs online **dashboard admin sendiri yang menjalankan alokasi dan mengirim email lewat EmailJS** — pola yang sama dengan email tiket pengunjung. Kode alokasi/antrian/template-nya **sama persis** dengan Backend (`Backend/src/core`, diimpor oleh `Frontend/src/lib/guideJob.js`); hanya penyimpanan (Firestore klien) dan pengirim (EmailJS) yang berbeda. Daftar pemandu dibaca dari `Backend/data/guides.json` yang ikut ter-bundle ke situs (jadi tidak perlu seed ke Firestore).

Begitu admin menekan **Approve**: tiket dikirim ke pengunjung → pemandu dipilih dari antrian → email penugasan terkirim ke `pemandu.<nama>@mailinator.com` dengan tembusan `pengelola.warawiri@mailinator.com`. Kalau semua pemandu penuh, pengelola yang diperingatkan. Klik Approve/Kirim ulang berkali-kali tidak membuat email ganda. Email hanya dikirim untuk reservasi yang di-approve (reservasi lama tidak ikut dikirim ulang).

*Setup sekali (±5 menit), sebelum demo:*

1. **Buat template kedua di EmailJS** (paket gratis mengizinkan 2 template; yang pertama sudah dipakai email tiket). Buka [dashboard EmailJS](https://dashboard.emailjs.com/admin/templates) → **Create New Template**, lalu:
   - Tab **Settings** → **Template ID**: ganti menjadi persis `template_pemandu`
   - **To email**: `{{to_email}}` · **Cc**: `{{cc_email}}` · **Reply To**: `{{reply_to}}` · **From name**: `{{from_name}}` · **Subject**: `{{subject}}`
   - Tab **Content** → pilih **Code editor (HTML)**, hapus isinya, tempel satu baris: `{{{message_html}}}` (tiga kurung = HTML tidak di-escape). Kalau di inbox terlihat tag HTML mentah, ganti isinya menjadi `{{message}}` (teks biasa).
   - **Save**. Pastikan **Service** yang dipilih sama dengan email tiket (`service_585vhga`).
2. **Deploy** (urutannya penting — lihat "Deploy ke Production" di bawah): merge ke `main`. Workflow sekarang menayangkan `firestore.rules` terlebih dulu, baru situs.
3. **Coba**: login `/admin` → Approve satu reservasi (isi email pengunjung dengan alamat milik sendiri untuk melihat tiketnya juga) → buka `https://www.mailinator.com/v4/public/inboxes.jsp?to=pemandu.asep` (atau `wati`, `dede`, `pengelola.warawiri`).

*Tanpa akses EmailJS:* kalau `template_pemandu` belum ada, email pemandu otomatis dikirim lewat **template tiket yang sudah ada** (judul "Penugasan pemandu", tanggal, waktu, jumlah orang, destinasi; tanpa tautan tiket) dan salinan untuk pengelola dikirim sebagai email terpisah. Tampilannya mengikuti template tiket; begitu `template_pemandu` dibuat, otomatis dipakai.

*Kalau pemandu tidak menerima email:* pesan di atas tabel admin menyebut penyebabnya (mis. template belum ada → `template_pemandu` tidak ditemukan). Perbaiki, lalu klik **Kirim email pemandu** pada baris itu — tidak perlu Approve ulang.

*Catatan:* Mailinator itu publik (siapa saja yang tahu nama inbox bisa membaca) — pakai data uji. EmailJS gratis dibatasi 200 email/bulan dan 1 permintaan/detik (sudah diberi jeda otomatis). Alokasi dijalankan dari browser admin, jadi jangan Approve bersamaan dari dua admin pada reservasi yang berebut pemandu yang sama.

**Mencoba seluruh sistem di localhost (emulator Firebase):**

Website asli + database + login admin berjalan penuh **di laptop**, tanpa menyentuh project Firebase produksi dan tanpa kunci apa pun. Aturan `firestore.rules` yang dipakai emulator sama persis dengan produksi.

Prasyarat: Node 22+, **Java 21+** (`java -version`), dan internet saat pertama kali (mengunduh emulator).

```bash
# Terminal 1 — emulator + data uji + website
cd Backend && npm install
cd ../Frontend && npm install
cd ../Backend && npm run local
```

| Alamat | Isi |
|---|---|
| http://localhost:5173 | Website (ada lencana **MODE LOKAL** di kiri bawah) |
| http://localhost:5173/admin | Dashboard admin — login `admin@warawiri.local` / `admin123` |
| http://localhost:4000 | Emulator UI: lihat & ubah isi database langsung |
| `Backend/outbox/local/index.html` | Email penugasan yang dihasilkan (buka di browser) |
| http://localhost:3001 | Backend API (dipanggil dashboard saat Approve) |

Data uji (kunjungan **besok**): 3 reservasi sudah disetujui + 3 menunggu, 3 pemandu (masing-masing maks 4 rombongan/hari; rombongan ke-5 dioper ke pemandu lain).

Skenario yang bisa dicoba (mode `segera`, jadi tidak perlu menunggu H-1):

1. **Buat reservasi** di form (perhatikan kolom *Waktu kunjungan*), lalu cek tampil di `/admin`.
2. **Approve** reservasi menunggu di `/admin`. Dashboard memanggil Backend (`POST /api/guide-notify`) dan notifikasi di atas tabel menyebut hasilnya, mis. *"Pemandu Wati Susanti ditugaskan; email penugasan terkirim ke …"*. Kolom **Pemandu** ikut terisi, dan emailnya muncul di `Backend/outbox/local/index.html`. (Email tiket EmailJS ke pengunjung dimatikan di mode lokal; pesan "email tidak terkirim" itu normal.)
3. Reservasi seed yang **sudah disetujui** ikut dialokasikan pada Approve pertama (antrian FIFO), jadi beberapa email langsung muncul sekaligus.
4. **Approve "Rombongan Kantor Dinas"** (Trekking 08:00) → hanya Asep & Dede yang menguasai Trekking dan keduanya sudah memegang rombongan 08:00, jadi muncul **"Belum ada pemandu"** dan email peringatan untuk pengelola.
5. Di Emulator UI → Firestore → `guides`, **tambahkan pemandu** yang menguasai Trekking (salin dokumen yang ada, ganti `id`/`nama`/`email`), lalu jalankan `cd Backend && npm run local:notify` → rombongan tadi otomatis mendapat pemandu baru. Atur `maxGroups` untuk melihat efek batas dan oper otomatis.
6. Approve/jalankan job berulang atau klik cepat dua kali → tidak ada email ganda.
7. Mencoba perilaku produksi (H-1): `npm run local:notify -- --mode=h-1 --h-1` ("sekarang" = hari ini 07:05 WIB) atau `-- --mode=h-1 --now=2026-11-04T06:00:00+07:00` (sebelum 07:00 → alokasi jalan, email belum dikirim).

**Melihat email benar-benar masuk (Mailinator):**

Email pemandu di `Backend/data/guides.json` memakai alamat [Mailinator](https://www.mailinator.com) (`pemandu.asep@`, `pemandu.wati@`, `pemandu.dede@mailinator.com`; pengelola `pengelola.warawiri@mailinator.com`). Secara default mode lokal **hanya menulis email ke `Backend/outbox/local/`** (aman, tidak ada yang keluar dari laptop). Agar email sungguh terkirim dan tampil di inbox Mailinator:

1. Siapkan akun SMTP, mis. Gmail: aktifkan 2-Step Verification lalu buat **App Password** 16 huruf.
2. `cd Backend && cp .env.example .env`, lalu isi:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=alamatmu@gmail.com
   SMTP_PASS=app-password-16-huruf
   SEND_REAL_EMAIL=true
   ```
   (`.env` sudah di-`.gitignore`; jangan di-commit.)
3. Restart `npm run local`, klik **Approve** di `/admin`. Pesan di atas tabel kini berbunyi *"…email penugasan terkirim ke …"* (bukan "dibuat di kotak keluar lokal").
4. Buka inbox: `https://www.mailinator.com/v4/public/inboxes.jsp?to=pemandu.asep` (ganti `asep` dengan `wati`, `dede`, atau `pengelola.warawiri`). Salinan email tetap ada di `Backend/outbox/local/`.

Catatan: inbox Mailinator **publik** — siapa pun yang tahu namanya bisa membaca. Pakai hanya data uji, jangan nama/kontak pengunjung asli. Email pertama dari Gmail baru kadang tertunda atau masuk ke tab lain.

Data pemandu di emulator berasal dari `guides.json` saat `npm run local` dinyalakan. Kalau emulator sudah jalan, ubah email langsung di Emulator UI → Firestore → `guides`, atau restart.

Di produksi (hosting statis tanpa Backend) tombol Approve tetap bekerja; dashboard hanya menampilkan bahwa job terjadwal yang akan memberi tahu pemandu. Untuk meniru Approve-langsung-kirim di produksi, deploy Backend dengan `NOTIFY_MODE=segera` dan `SMTP_*`.

Perintah lain: `npm run local:seed` (reset data uji ke awal; emulator harus menyala), `npm run local:emulators` (hanya emulator). Berhenti dengan **Ctrl+C**. Data emulator hilang tiap restart (disengaja).

**Setup produksi (sekali saja):**

1. Publish ulang `firestore.rules` (field `waktu` + field penugasan pemandu yang boleh ditulis admin). Otomatis oleh workflow deploy; cadangan manual: tempel isinya di Firebase Console → Firestore → Rules.
2. Edit `Backend/data/guides.json` (ganti email contoh), lalu `cd Backend && npm run seed-guides`.
3. Buat `Backend/.env` dari `.env.example`: isi `SMTP_*` dan `MANAGER_EMAIL`.
4. Coba dulu tanpa mengirim: `npm run notify -- --dry-run --outbox` (hasil di `Backend/outbox/preview/`). Simulasi waktu: `-- --now=2026-11-04T07:05:00+07:00`.
5. Untuk jalan otomatis, tambahkan secrets di GitHub (**Settings → Secrets and variables → Actions**): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `MANAGER_EMAIL` (`FIREBASE_SERVICE_ACCOUNT` sudah ada dari deploy). Workflow: [`notify-guides.yml`](.github/workflows/notify-guides.yml) — bisa dijalankan manual dari tab **Actions** (default dry-run, hasil email jadi artifact).

**Catatan:**

- *Inbox vs Spam*: kode tidak bisa menjamin ini. Kirim lewat penyedia terautentikasi (mis. Gmail dengan App Password, Brevo, Resend) atau domain milik desa dengan SPF + DKIM + DMARC; minta pemandu menandai "bukan spam" pada email pertama. Uji dengan `mail-tester.com` sebelum demo.
- Workflow terjadwal GitHub hanya jalan dari branch `main`, bisa tertunda beberapa menit, dan otomatis nonaktif setelah 60 hari repo tanpa aktivitas.
- Fungsi input pemandu oleh Admin LSM belum ada (sesuai kartu: sprint berikutnya) — sementara lewat `guides.json` + `seed-guides`.
- Reservasi lama tanpa `waktu` tetap diproses, tetapi tidak ikut aturan "satu slot, satu pemandu".

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
├── 📂 .github/workflows/       # deploy-hosting.yml (auto-deploy) + notify-guides.yml (job H-1 tiap jam)
├── 📄 firestore.rules           # aturan Firestore: create tervalidasi, read/update/delete ditolak
├── 📄 firebase.json / .firebaserc  # konfigurasi Firebase Hosting (public: Frontend/dist)
├── 📂 Backend/                # API reservasi (opsional — baca admin & migrasi)
│   ├── 📂 data/
│   │   ├── reservations.json  # data lama — sumber migrasi ke Firestore
│   │   └── guides.json        # data pemandu manual (PBI-5) → npm run seed-guides
│   ├── 📂 src/
│   │   ├── 📂 core/           # PBI-5: allocator (antrian pemandu), planner (jendela H-1), emailTemplate, runJob — murni + test
│   │   ├── 📂 stores/         # firestoreStore (produksi) & memoryStore (tes/simulasi)
│   │   ├── 📂 mailers/        # smtpMailer (produksi) & outboxMailer (pratinjau HTML lokal)
│   │   ├── 📂 controllers/    # reservationsController.js — logika bisnis & response API
│   │   ├── 📂 models/         # reservationModel.js — baca/tulis Firestore
│   │   ├── 📂 routes/         # reservations.js — dispatch GET/POST /api/reservations
│   │   ├── 📂 scripts/        # migrate, make-admin, seed-guides, notify (job H-1), simulate (demo offline), local* (emulator)
│   │   ├── firebase.js        # inisialisasi firebase-admin + kredensial
│   │   ├── validators.js      # validasi server-side (untuk endpoint API)
│   │   ├── http.js            # helper response & baca body request
│   │   └── app.js             # entry point: HTTP server + sajikan Frontend/dist
│   ├── .env.example           # PORT & FIREBASE_SERVICE_ACCOUNT
│   └── package.json           # `npm start`, `migrate`, `make-admin`, `seed-guides`, `notify`, `simulate`, `local`, `test`
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
3. Push ke `main` → tab **Actions** di GitHub akan menayangkan **`firestore.rules` lebih dulu**, lalu build `Frontend/dist` dan deploy ke Hosting. Urutan ini disengaja (situs baru menulis field yang hanya diizinkan rules baru); rules baru kompatibel dengan situs lama, dan kalau langkah rules gagal, deploy situs ikut berhenti sehingga situs lama tetap utuh.

Hasilnya: **`https://warawiriapp-da23e.web.app`** — setiap push ke `main` auto-deploy.

Catatan:

- Kuota gratis Spark: 10 GB storage, 360 MB/hari transfer — lebih dari cukup.
- **Kuota per tanggal** sepenuhnya serverless: admin set `limit`, pengunjung menaikkan `used` lewat transaksi, ditolak = counter turun. Tetap jalan tanpa backend.
- **Email notifikasi** memakai EmailJS dari browser admin (config publik tertanam di `Frontend/src/lib/emailjs.js`; email pemandu memakai template kedua `template_pemandu`), jadi tetap aktif di hosting statis tanpa backend. Masuk folder inbox **tidak bisa dijamin 100%** — gunakan alamat pengirim dengan SPF/DKIM/DMARC yang benar, batasi Allowed Origins, dan minta penerima menandai "bukan spam" bila perlu.
- Counter kuota divalidasi rules, tapi client yang sengaja memakai batch (bukan transaksi) masih bisa memicu lost-update — untuk desa wisata risikonya kecil.
- Langkah *Deploy Firestore rules* gagal `403`/`permission denied` → di Google Cloud Console → IAM beri service account peran **Firebase Rules Admin**, lalu *Re-run*. Atau tempel `firestore.rules` manual di Firebase Console (Firestore → Rules → Publish) dan jalankan ulang workflow.
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
