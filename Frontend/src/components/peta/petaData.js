/* =====================================================================
 * GAMBAR PETA
 * File ada di public/. Ganti dengan URL CDN bila diperlukan.
 * Semua koordinat memakai piksel artwork asli 1024 × 764;
 * jika versi CDN beresolusi lain, koordinat diskalakan otomatis.
 * ===================================================================== */
export const MAP_IMAGE_URL = `${import.meta.env.BASE_URL}manud-jaya-map.jpg`
export const COORD_SPACE = { w: 1024, h: 764 }

/* =====================================================================
 * REGIONS — satu poligon per zona (piksel gambar), termasuk sisi tanah
 * cokelat di bawahnya. Kalibrasi: buka ?edit=1, lalu "Salin JSON"
 * dan tempel hasilnya ke sini.
 * kind: 'zone' = dipotong dari gambar, 'tab' = digambar (akses tepi pulau).
 * ===================================================================== */
export const REGIONS = [
  {
    id: 'pendakian', number: 1, kind: 'zone', color: '#D23C9E',
    name: 'Hiking Trail & Protected Forest',
    nameId: 'Jalur Pendakian & Hutan Lindung',
    short: 'Pendakian & Hutan',
    blurb: 'Mendaki Bukit Manud melewati hutan lindung pinus merah, dengan pos registrasi di kaki bukit dan panorama puncak di atas awan.',
    points: [[552,188],[552,196],[528,200],[480,236],[452,236],[452,244],[440,244],[444,292],[456,292],[464,312],[476,316],[492,340],[472,344],[464,364],[444,380],[396,368],[344,376],[332,364],[308,368],[292,352],[260,356],[252,348],[224,344],[184,296],[196,284],[196,268],[216,268],[224,252],[248,256],[252,232],[272,232],[276,216],[288,216],[300,200],[340,196],[344,188],[332,184],[332,160],[340,152],[360,152],[364,128],[404,92],[428,92],[444,112],[460,116],[464,144],[444,152],[500,156],[508,168],[532,172]],
    labelAnchor: [318, 282],
  },
  {
    id: 'air-terjun', number: 2, kind: 'zone', color: '#7B4BC4',
    name: 'Kabut Sendang Waterfalls',
    nameId: 'Air Terjun Curug Kabut Sendang',
    short: 'Curug Kabut Sendang',
    blurb: 'Rangkaian curug bertingkat dengan kolam alami berair jernih di tengah hutan ungu. Sejuk untuk berendam dan bermain air.',
    points: [[184,296],[224,344],[252,348],[260,356],[292,352],[308,368],[332,364],[344,376],[396,368],[444,380],[464,440],[464,488],[440,532],[412,548],[412,560],[388,552],[384,576],[364,576],[356,584],[360,644],[236,576],[220,556],[200,556],[64,476],[60,376],[72,336],[140,324],[156,300]],
    labelAnchor: [128, 432],
  },
  {
    id: 'konservasi', number: 3, kind: 'zone', color: '#D8462F',
    name: 'Rare Flower Conservation',
    nameId: 'Konservasi Bunga Langka',
    short: 'Konservasi Bunga',
    blurb: 'Taman konservasi edelweiss dan Kebun Raya Mini Manud Jaya: rumah kaca bunga langka, pembibitan, dan jalur edukasi flora pegunungan.',
    points: [[780,284],[784,308],[772,320],[768,304],[752,296],[712,324],[688,328],[680,344],[648,352],[644,364],[612,368],[596,344],[492,340],[476,316],[464,312],[456,292],[444,292],[440,244],[452,244],[452,236],[480,236],[528,200],[552,196],[552,188],[588,184],[616,196],[652,180],[692,184],[720,208],[720,224],[780,228],[780,248],[764,252],[776,264]],
    labelAnchor: [596, 300],
  },
  {
    id: 'sawah-kebun', number: 4, kind: 'zone', color: '#E9A21B',
    name: 'Rice Terraces & Pick-Your-Own Farms',
    nameId: 'Sawah Terasering & Kebun Petik',
    short: 'Sawah & Kebun Petik',
    blurb: 'Sawah Terasering Manud yang berundak keemasan, aliran sungai pedesaan, dan kebun petik buah serta sayur milik warga.',
    points: [[492,340],[596,344],[612,368],[616,380],[636,388],[664,416],[668,460],[660,468],[640,468],[636,484],[644,496],[660,496],[672,476],[704,476],[744,496],[744,504],[764,516],[756,592],[528,724],[496,724],[360,644],[356,584],[364,576],[384,576],[388,552],[412,560],[412,548],[440,532],[464,488],[464,440],[444,380],[464,364],[472,344]],
    labelAnchor: [560, 470],
  },
  {
    id: 'budaya', number: 5, kind: 'zone', color: '#3D9A3F',
    name: 'Homestays, Crafts & Local Food',
    nameId: 'Homestay, Kerajinan & Kuliner Lokal',
    short: 'Budaya & Homestay',
    blurb: 'Kampung rumah panggung warga yang dibuka sebagai homestay, lengkap dengan lapak kerajinan, warung kuliner lokal, dan sanggar budaya.',
    points: [[756,592],[764,516],[744,504],[744,496],[704,476],[672,476],[660,496],[644,496],[636,484],[640,468],[660,468],[668,460],[664,416],[636,388],[616,380],[612,368],[644,364],[648,352],[680,344],[688,328],[712,324],[752,296],[768,304],[772,320],[784,308],[780,284],[800,280],[812,288],[812,280],[836,280],[840,308],[868,312],[876,344],[900,340],[916,368],[948,368],[964,396],[960,476]],
    labelAnchor: [872, 452],
  },
  {
    id: 'akses-cililin', number: 6, kind: 'tab', color: '#1F8FB3',
    name: 'Access from Cililin',
    nameId: 'Akses dari Cililin',
    short: 'Akses Cililin',
    pillText: 'Cililin',
    blurb: 'Gerbang barat dari arah Kecamatan Cililin, paling dekat ke Curug Kabut Sendang. Titik turun angkot dan ojek wisata.',
    points: [[214,566],[252,586],[214,606],[176,586]],
    labelAnchor: [120, 592],
  },
  {
    id: 'akses-padalarang', number: 7, kind: 'tab', color: '#3557C5',
    name: 'Access from Padalarang',
    nameId: 'Akses dari Padalarang',
    short: 'Akses Padalarang',
    pillText: 'Padalarang',
    blurb: 'Gerbang utama dari arah Padalarang dan Bandung, dilengkapi parkir bus, pos tiket, dan halte shuttle desa.',
    points: [[636,673],[678,695],[638,716],[596,694]],
    labelAnchor: [640, 738],
  },
]

/* =====================================================================
 * POIS — titik minat. Jumlah per zona/kategori dihitung dari data ini.
 * type: foto | saung | toilet | parkir | info | trekking | sanggar | homestay | kuliner | kerajinan
 * ===================================================================== */
export const POIS = [
  // 1 · Jalur Pendakian & Hutan Lindung
  { region: 'pendakian', name: 'Puncak Bukit Manud', type: 'foto', services: ['Spot Foto', 'Trekking'], tag: 'Puncak 1.420 mdpl', description: 'Titik tertinggi desa dengan bendera puncak dan lautan awan saat matahari terbit.', x: 412, y: 104 },
  { region: 'pendakian', name: 'Pos Registrasi Pendakian', type: 'info', services: ['Trekking', 'Fasilitas Umum'], tag: 'Kaki bukit', description: 'Wajib lapor sebelum mendaki. Tersedia peta jalur, sewa tongkat, dan pemandu lokal.', x: 446, y: 228 },
  { region: 'pendakian', name: 'Jalur Pendakian Puncak', type: 'trekking', services: ['Trekking'], tag: 'Jalur utama', description: 'Jalur setapak 2,8 km berkelok di lereng bukit. Tingkat kesulitan sedang, ±2 jam ke puncak.', x: 380, y: 196 },
  { region: 'pendakian', name: 'Spot Foto Lereng Kabut', type: 'foto', services: ['Spot Foto', 'Trekking'], tag: 'Lereng tengah', description: 'Tikungan jalur dengan latar kabut tipis dan siluet gunung di kejauhan.', x: 360, y: 166 },
  { region: 'pendakian', name: 'Hutan Lindung Manud Jaya', type: 'trekking', services: ['Trekking', 'Spot Foto'], tag: 'Hutan pinus merah', description: 'Hutan pinus berdaun kemerahan yang dilindungi warga. Jalur interpretasi 1 km bersama pemandu.', x: 276, y: 300 },
  { region: 'pendakian', name: 'Papan Interpretasi Hutan', type: 'info', services: ['Fasilitas Umum'], tag: 'Gerbang hutan', description: 'Papan edukasi flora dan fauna hutan lindung, titik kumpul sebelum jelajah hutan.', x: 352, y: 326 },
  { region: 'pendakian', name: 'Shelter Pendaki Pinus', type: 'saung', services: ['Trekking'], tag: 'Tepi hutan barat', description: 'Shelter kayu untuk beristirahat dan berteduh, tersedia air minum isi ulang.', x: 236, y: 276 },
  { region: 'pendakian', name: 'Toilet & Mushola Pos Pendakian', type: 'toilet', services: ['Fasilitas Umum'], tag: 'Dekat pos registrasi', description: 'Toilet bersih dan mushola kecil sebelum memulai pendakian.', x: 420, y: 300 },

  // 2 · Air Terjun Curug Kabut Sendang
  { region: 'air-terjun', name: 'Curug Kabut Sendang', type: 'foto', services: ['Spot Foto', 'Trekking'], tag: 'Curug utama', description: 'Air terjun utama setinggi 25 m yang selalu berselimut kabut tipis, ikon Desa Manud Jaya.', x: 412, y: 458 },
  { region: 'air-terjun', name: 'Curug Atas Manud', type: 'foto', services: ['Spot Foto'], tag: 'Hulu curug', description: 'Curug pertama yang jatuh dari tebing hutan, paling indah disinari matahari pagi.', x: 166, y: 334 },
  { region: 'air-terjun', name: 'Kolam Alami Leuwi Sendang', type: 'foto', services: ['Spot Foto'], tag: 'Kolam atas', description: 'Kolam batu berair jernih yang aman untuk berendam, kedalaman sekitar 1 m.', x: 204, y: 388 },
  { region: 'air-terjun', name: 'Kolam Bawah Curug', type: 'foto', services: ['Spot Foto'], tag: 'Kolam tengah', description: 'Kolam bertingkat di bawah curug kedua, favorit keluarga untuk bermain air.', x: 288, y: 470 },
  { region: 'air-terjun', name: 'Jalur Hutan Ungu', type: 'trekking', services: ['Trekking', 'Spot Foto'], tag: 'Hutan barat', description: 'Jalur setapak di antara pepohonan berdaun ungu menuju tepi tebing curug atas.', x: 108, y: 396 },
  { region: 'air-terjun', name: 'Jembatan Kayu Sendang', type: 'foto', services: ['Spot Foto', 'Trekking'], tag: 'Hilir curug', description: 'Jembatan kayu melintasi aliran curug, penghubung ke area sawah terasering.', x: 392, y: 540 },
  { region: 'air-terjun', name: 'Pos Penjaga Curug', type: 'info', services: ['Fasilitas Umum'], tag: 'Tepi kolam', description: 'Petugas jaga dan pelampung pinjaman. Buka setiap hari 07.00–16.30.', x: 246, y: 436 },
  { region: 'air-terjun', name: 'Ruang Bilas & Toilet Curug', type: 'toilet', services: ['Fasilitas Umum'], tag: 'Dekat kolam bawah', description: 'Ruang bilas, toilet, dan loker untuk pengunjung yang berendam.', x: 330, y: 512 },

  // 3 · Konservasi Bunga Langka
  { region: 'konservasi', name: 'Taman Konservasi Edelweiss Manud', type: 'foto', services: ['Spot Foto'], tag: 'Taman utama', description: 'Petak edelweiss jawa yang dibudidayakan untuk konservasi. Dilarang memetik, boleh berfoto.', x: 560, y: 272 },
  { region: 'konservasi', name: 'Rumah Kaca Bunga Langka', type: 'info', services: ['Spot Foto', 'Fasilitas Umum'], tag: 'Rumah kaca', description: 'Koleksi anggrek hutan dan kantong semar yang dirawat dalam rumah kaca.', x: 656, y: 214 },
  { region: 'konservasi', name: 'Kebun Raya Mini Manud Jaya', type: 'foto', services: ['Spot Foto', 'Trekking'], tag: 'Sisi timur', description: 'Kebun koleksi tanaman pegunungan dengan jalur edukasi berpapan nama.', x: 736, y: 256 },
  { region: 'konservasi', name: 'Pembibitan Flora Pegunungan', type: 'kerajinan', services: ['Kerajinan'], tag: 'Area pembibitan', description: 'Ikut menanam bibit dan membawa pulang pot kecil hasil semai sendiri.', x: 606, y: 312 },
  { region: 'konservasi', name: 'Papan Edukasi Konservasi', type: 'info', services: ['Fasilitas Umum'], tag: 'Pintu masuk taman', description: 'Informasi jenis bunga langka dan aturan berkunjung di area konservasi.', x: 514, y: 246 },
  { region: 'konservasi', name: 'Saung Pengamatan Kupu-kupu', type: 'saung', services: ['Spot Foto'], tag: 'Taman bunga', description: 'Saung kecil untuk mengamati kupu-kupu yang hinggap di bunga liar.', x: 690, y: 300 },
  { region: 'konservasi', name: 'Toilet Area Konservasi', type: 'toilet', services: ['Fasilitas Umum'], tag: 'Sisi barat', description: 'Toilet dan wastafel untuk pengunjung taman konservasi.', x: 480, y: 280 },

  // 4 · Sawah Terasering & Kebun Petik
  { region: 'sawah-kebun', name: 'Sawah Terasering Manud', type: 'foto', services: ['Spot Foto', 'Trekking'], tag: 'Terasering utama', description: 'Undakan sawah keemasan menjelang panen, paling indah sekitar pukul 16.30.', x: 596, y: 418 },
  { region: 'sawah-kebun', name: 'Gazebo Pandang Terasering', type: 'foto', services: ['Spot Foto'], tag: 'Puncak undakan', description: 'Gazebo kayu di tepi terasering, favorit untuk foto keluarga dan prewedding.', x: 640, y: 448 },
  { region: 'sawah-kebun', name: 'Saung Petani Edukasi Tanam Padi', type: 'saung', services: ['Trekking', 'Kuliner'], tag: 'Teras tengah', description: 'Belajar menanam padi bersama petani, ditutup makan liwet di saung.', x: 516, y: 466 },
  { region: 'sawah-kebun', name: 'Jalur Pematang Sawah', type: 'trekking', services: ['Trekking'], tag: 'Pematang bawah', description: 'Jalan santai menyusuri pematang sawah hingga tepi sungai, sekitar 1,5 km.', x: 500, y: 532 },
  { region: 'sawah-kebun', name: 'Alur Sungai Pedesaan', type: 'foto', services: ['Spot Foto'], tag: 'Hilir sawah', description: 'Sungai kecil berbatu yang mengairi sawah, latar foto khas pedesaan.', x: 452, y: 612 },
  { region: 'sawah-kebun', name: 'Kebun Petik Buah Warga', type: 'kuliner', services: ['Kuliner', 'Spot Foto'], tag: 'Kebun buah', description: 'Petik sendiri jeruk, jambu, dan stroberi musiman. Bayar sesuai timbangan.', x: 612, y: 540 },
  { region: 'sawah-kebun', name: 'Lapak Sayur Segar', type: 'kuliner', services: ['Kuliner'], tag: 'Kebun sayur', description: 'Sayur organik hasil panen pagi langsung dari kebun warga.', x: 566, y: 598 },
  { region: 'sawah-kebun', name: 'Kios Buah Musiman', type: 'kuliner', services: ['Kuliner'], tag: 'Ujung kebun', description: 'Kios beratap belang dengan buah segar, jus, dan rujak khas desa.', x: 724, y: 488 },
  { region: 'sawah-kebun', name: 'Area Parkir Kebun', type: 'parkir', services: ['Fasilitas Umum'], tag: 'Dekat gerbang selatan', description: 'Parkir motor dan mobil kecil untuk pengunjung kebun petik.', x: 618, y: 626 },

  // 5 · Homestay, Kerajinan & Kuliner Lokal
  { region: 'budaya', name: 'Homestay Bale Manud', type: 'homestay', services: ['Homestay'], tag: 'Blok Kaler', description: 'Rumah panggung kayu dua kamar dengan teras menghadap kebun raya. Termasuk sarapan.', x: 806, y: 304 },
  { region: 'budaya', name: 'Homestay Pasir Kembang', type: 'homestay', services: ['Homestay'], tag: 'Blok Kaler', description: 'Menginap bersama keluarga petani, ikut memanen sayur di pagi hari.', x: 840, y: 330 },
  { region: 'budaya', name: 'Homestay Leuit Jaya', type: 'homestay', services: ['Homestay'], tag: 'Blok Tengah', description: 'Rumah adat dengan lumbung padi (leuit) di halaman, muat 4–6 orang.', x: 884, y: 362 },
  { region: 'budaya', name: 'Homestay Imah Panggung', type: 'homestay', services: ['Homestay'], tag: 'Blok Wetan', description: 'Rumah panggung di ujung kampung dengan pemandangan lembah yang luas.', x: 928, y: 390 },
  { region: 'budaya', name: 'Homestay Teh Ani', type: 'homestay', services: ['Homestay', 'Kuliner'], tag: 'Dekat tangga kampung', description: 'Homestay bersih dengan kelas memasak masakan Sunda bersama tuan rumah.', x: 700, y: 372 },
  { region: 'budaya', name: 'Homestay Kebun Kopi', type: 'homestay', services: ['Homestay'], tag: 'Blok Kidul', description: 'Kamar sederhana dan nyaman, cocok untuk rombongan pelajar dan live-in.', x: 880, y: 416 },
  { region: 'budaya', name: 'Lapak Kerajinan Bambu', type: 'kerajinan', services: ['Kerajinan'], tag: 'Pasar kampung', description: 'Anyaman bambu, caping, dan suvenir kayu buatan perajin Manud Jaya.', x: 770, y: 396 },
  { region: 'budaya', name: 'Galeri Anyaman Warga', type: 'kerajinan', services: ['Kerajinan'], tag: 'Pasar kampung', description: 'Kelas singkat menganyam besek dan tas pandan, sesi 90 menit.', x: 792, y: 462 },
  { region: 'budaya', name: 'Sanggar Seni Budaya Manud', type: 'sanggar', services: ['Kerajinan', 'Spot Foto'], tag: 'Alun-alun kampung', description: 'Latihan dan pentas kecapi suling serta jaipong setiap Sabtu sore.', x: 744, y: 438 },
  { region: 'budaya', name: 'Warung Kuliner Lokal', type: 'kuliner', services: ['Kuliner'], tag: 'Lorong warung', description: 'Nasi liwet, pepes ikan, dan sambal dadak dengan lalapan dari kebun.', x: 818, y: 426 },
  { region: 'budaya', name: 'Kedai Kopi Manud', type: 'kuliner', services: ['Kuliner'], tag: 'Lorong warung', description: 'Kopi arabika lereng Bukit Manud dan bandrek hangat, pas untuk udara sejuk.', x: 846, y: 452 },
  { region: 'budaya', name: 'Pos Informasi Desa Wisata', type: 'info', services: ['Fasilitas Umum'], tag: 'Balai kampung', description: 'Pemesanan homestay, paket wisata, dan pemandu. Buka setiap hari 07.00–17.00.', x: 720, y: 412 },
  { region: 'budaya', name: 'Area Parkir Kampung', type: 'parkir', services: ['Fasilitas Umum'], tag: 'Sisi timur', description: 'Parkir untuk 30 motor dan 10 mobil tamu homestay, dijaga pemuda setempat.', x: 904, y: 456 },
  { region: 'budaya', name: 'Toilet & Mushola Kampung', type: 'toilet', services: ['Fasilitas Umum'], tag: 'Tengah kampung', description: 'Mushola warga dengan tempat wudu dan toilet umum yang terawat.', x: 932, y: 424 },

  // 6 · Akses dari Cililin
  { region: 'akses-cililin', name: 'Terminal Angkot Cililin', type: 'parkir', services: ['Fasilitas Umum'], tag: 'Gerbang barat', description: 'Titik turun angkot jurusan Cililin–Manud Jaya. Beroperasi 05.30–18.00.', x: 202, y: 586 },
  { region: 'akses-cililin', name: 'Pos Informasi Gerbang Barat', type: 'info', services: ['Fasilitas Umum'], tag: 'Gerbang barat', description: 'Peta cetak, tiket masuk curug, dan penitipan barang untuk pengunjung.', x: 220, y: 578 },
  { region: 'akses-cililin', name: 'Pangkalan Ojek Wisata', type: 'parkir', services: ['Fasilitas Umum', 'Trekking'], tag: 'Gerbang barat', description: 'Ojek warga untuk mengantar ke curug, pos pendakian, dan homestay.', x: 226, y: 594 },

  // 7 · Akses dari Padalarang
  { region: 'akses-padalarang', name: 'Gerbang Utama Manud Jaya', type: 'info', services: ['Fasilitas Umum', 'Spot Foto'], tag: 'Gerbang selatan', description: 'Gerbang utama dari arah Padalarang–Bandung dengan papan selamat datang.', x: 624, y: 692 },
  { region: 'akses-padalarang', name: 'Parkir Bus & Mobil Pengunjung', type: 'parkir', services: ['Fasilitas Umum'], tag: 'Gerbang selatan', description: 'Parkir luas untuk bus pariwisata dan mobil pribadi, dijaga 24 jam.', x: 642, y: 686 },
  { region: 'akses-padalarang', name: 'Halte Shuttle Desa Wisata', type: 'info', services: ['Fasilitas Umum'], tag: 'Gerbang selatan', description: 'Shuttle gratis keliling desa setiap 30 menit pada akhir pekan.', x: 648, y: 702 },
]

/* Elemen langit (awan) yang dipotong menjadi layer sendiri. */
export const SKY = [
  { id: 'awan-1', drift: 'drift', patch: '#9BC1ED', points: [[733,92],[738,84],[748,82],[756,86],[764,88],[772,94],[768,100],[740,100]] },
  { id: 'awan-2', drift: 'drift', patch: '#A0C4EE', points: [[785,94],[796,80],[816,74],[840,70],[852,62],[872,60],[892,66],[902,78],[908,90],[924,102],[926,114],[940,130],[949,138],[940,145],[908,144],[876,130],[870,124],[876,112],[820,106],[796,102]] },
]

export const SERVICES = ['Trekking', 'Homestay', 'Kuliner', 'Kerajinan', 'Spot Foto', 'Fasilitas Umum']

export const CATEGORIES = [
  { id: 'Trekking', icon: 'ic-trekking' },
  { id: 'Homestay', icon: 'ic-homestay' },
  { id: 'Kuliner', icon: 'ic-kuliner' },
  { id: 'Kerajinan', icon: 'ic-kerajinan' },
]

export const POI_TYPES = {
  foto: { label: 'Spot Foto', icon: 'ic-foto' },
  saung: { label: 'Saung Lesehan', icon: 'ic-saung' },
  toilet: { label: 'Toilet & Mushola', icon: 'ic-toilet' },
  parkir: { label: 'Area Parkir', icon: 'ic-parkir' },
  info: { label: 'Pos Informasi', icon: 'ic-info' },
  trekking: { label: 'Jalur Trekking', icon: 'ic-trekking' },
  sanggar: { label: 'Sanggar Seni', icon: 'ic-sanggar' },
  homestay: { label: 'Homestay', icon: 'ic-homestay' },
  kuliner: { label: 'Kuliner', icon: 'ic-kuliner' },
  kerajinan: { label: 'Kerajinan', icon: 'ic-kerajinan' },
}

export const STRIP_TYPES = ['foto', 'saung', 'toilet', 'parkir', 'info', 'trekking', 'sanggar']

/* =====================================================================
 * Kuota harian per zona (data dummy — ganti dengan data dari API).
 * Total zona = jumlah kapasitas & terisi semua sesi.
 * ===================================================================== */
export const QUOTA_UPDATED_AT = '07.00 WIB'

export const QUOTAS = {
  pendakian: {
    unit: 'pendaki',
    sessions: [
      { label: 'Pendakian Sunrise', time: '03.30–09.00', capacity: 50, booked: 44 },
      { label: 'Pendakian Siang', time: '08.00–14.00', capacity: 70, booked: 38 },
    ],
    note: 'Pendaki wajib registrasi di pos dan turun sebelum pukul 16.00.',
  },
  'air-terjun': {
    unit: 'pengunjung',
    sessions: [
      { label: 'Sesi Pagi', time: '07.00–11.00', capacity: 80, booked: 52 },
      { label: 'Sesi Siang', time: '12.00–16.30', capacity: 80, booked: 74 },
    ],
    note: 'Kolam ditutup sementara bila debit air naik setelah hujan deras.',
  },
  konservasi: {
    unit: 'pengunjung',
    sessions: [
      { label: 'Tur Edukasi Rumah Kaca', time: '09.00–10.30', capacity: 25, booked: 25 },
      { label: 'Kunjungan Taman Bebas', time: '08.00–16.00', capacity: 100, booked: 41 },
    ],
    note: 'Jumlah pengunjung dibatasi agar tanaman langka tidak terinjak.',
  },
  'sawah-kebun': {
    unit: 'peserta',
    sessions: [
      { label: 'Edukasi Tanam Padi', time: '08.00–11.00', capacity: 30, booked: 17 },
      { label: 'Petik Buah & Sayur', time: '09.00–15.00', capacity: 90, booked: 63 },
    ],
    note: 'Hasil petik dibayar sesuai timbangan; keranjang disediakan.',
  },
  budaya: {
    unit: 'kamar',
    sessions: [
      { label: 'Kamar Homestay', time: 'Check-in 14.00', capacity: 28, booked: 23 },
      { label: 'Rumah Panggung Rombongan', time: 'Check-in 14.00', capacity: 6, booked: 6 },
    ],
    note: 'Pemesanan menginap paling lambat H-1 melalui pengelola desa.',
  },
  'akses-cililin': {
    unit: 'slot parkir',
    sessions: [
      { label: 'Parkir Mobil', time: '06.00–21.00', capacity: 25, booked: 9 },
      { label: 'Parkir Motor', time: '06.00–21.00', capacity: 70, booked: 33 },
    ],
    note: 'Jalan dari Cililin menanjak; bus pariwisata disarankan lewat Padalarang.',
  },
  'akses-padalarang': {
    unit: 'slot parkir',
    sessions: [
      { label: 'Parkir Mobil', time: '24 jam', capacity: 40, booked: 34 },
      { label: 'Parkir Bus Pariwisata', time: '24 jam', capacity: 6, booked: 2 },
    ],
    note: 'Shuttle gratis dari parkir ke pusat desa setiap 30 menit di akhir pekan.',
  },
}
