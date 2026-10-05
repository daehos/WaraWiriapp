/* =====================================================================
 * GAMBAR PETA
 * File ada di public/. Ganti dengan URL CDN bila diperlukan.
 * Semua koordinat memakai piksel artwork asli 1024 × 764;
 * jika versi CDN beresolusi lain, koordinat diskalakan otomatis.
 * ===================================================================== */
export const MAP_IMAGE_URL = `${import.meta.env.BASE_URL}batulayang-map.png`
export const COORD_SPACE = { w: 1024, h: 764 }

/* =====================================================================
 * REGIONS — satu poligon per zona (piksel gambar), termasuk sisi tanah
 * cokelat di bawahnya. Kalibrasi: buka ?edit=1, lalu "Salin JSON"
 * dan tempel hasilnya ke sini.
 * kind: 'zone' = dipotong dari PNG, 'tab' = digambar (akses tepi pulau).
 * ===================================================================== */
export const REGIONS = [
  {
    id: 'sawah-atas', number: 1, kind: 'zone', color: '#D23C9E',
    name: 'Upper Terraces & Trekking',
    nameId: 'Trekking & Sawah Terasering Atas',
    short: 'Trekking & Sawah Atas',
    blurb: 'Pematang sawah berundak di lereng atas dengan jalur trekking, saung pandang, dan panorama matahari terbenam.',
    points: [[62,365],[64,330],[80,304],[104,294],[130,288],[160,296],[200,268],[226,240],[248,212],[272,192],[296,170],[318,158],[330,190],[350,215],[372,232],[392,258],[388,290],[380,315],[365,335],[340,346],[320,360],[300,372],[330,378],[390,386],[398,400],[430,410],[446,422],[456,436],[466,446],[474,456],[460,468],[450,480],[448,500],[440,512],[420,520],[400,530],[384,540],[370,552],[344,566],[344,632],[300,606],[264,585],[224,561],[180,537],[136,512],[64,476]],
    labelAnchor: [196, 384],
  },
  {
    id: 'sawah-bawah', number: 2, kind: 'zone', color: '#7B4BC4',
    name: 'Lower Terraces & River',
    nameId: 'Area Sawah Terasering Bawah & Alur Sungai',
    short: 'Sawah Bawah & Sungai',
    blurb: 'Sawah terasering bawah yang dialiri Sungai Cihaur: susur sungai, kolam alami, dan saung lesehan di tepi air.',
    points: [[474,456],[488,462],[510,474],[522,482],[552,488],[568,504],[584,520],[600,536],[616,548],[616,668],[592,682],[560,700],[536,714],[515,729],[480,709],[448,690],[416,672],[380,651],[344,632],[344,566],[370,552],[384,540],[400,530],[420,520],[440,512],[448,500],[450,480],[460,468]],
    labelAnchor: [528, 586],
  },
  {
    id: 'homestay', number: 3, kind: 'zone', color: '#D8462F',
    name: 'Homestays & Village Houses',
    nameId: 'Homestay & Pemukiman Warga',
    short: 'Homestay Warga',
    blurb: 'Rumah panggung warga yang dibuka sebagai homestay. Rasakan keseharian kampung Sunda dan sarapan khas buatan ambu.',
    points: [[340,346],[365,335],[380,315],[388,290],[392,258],[372,232],[350,215],[330,190],[318,158],[340,142],[372,150],[408,140],[430,118],[456,100],[500,96],[540,100],[580,92],[620,96],[620,205],[615,232],[640,240],[655,256],[632,265],[625,290],[640,305],[632,315],[620,322],[582,332],[575,345],[565,355],[590,370],[600,385],[598,398],[625,405],[632,428],[624,445],[624,465],[605,472],[586,464],[562,456],[546,448],[530,440],[520,432],[470,422],[452,410],[440,398],[428,386],[410,376],[392,366],[376,350]],
    labelAnchor: [482, 300],
  },
  {
    id: 'kerajinan', number: 4, kind: 'zone', color: '#E9A21B',
    name: 'Crafts Hall & Culture Studio',
    nameId: 'Balai Kerajinan & Sanggar Budaya',
    short: 'Balai Kerajinan',
    blurb: 'Sepanjang jalur sungai dan jembatan kayu: sanggar anyaman bambu, seni calung, dan galeri kerajinan Cililin.',
    points: [[340,346],[376,350],[392,366],[410,376],[428,386],[440,398],[452,410],[470,422],[520,432],[530,440],[546,448],[562,456],[586,464],[605,472],[624,465],[624,445],[632,428],[625,405],[668,428],[712,438],[716,460],[720,500],[744,508],[768,520],[768,585],[752,594],[720,612],[680,633],[650,650],[616,668],[616,548],[600,536],[584,520],[568,504],[552,488],[522,482],[510,474],[488,462],[474,456],[466,446],[456,436],[446,422],[430,410],[398,400],[390,386],[330,378],[300,372],[320,360]],
    labelAnchor: [690, 500],
  },
  {
    id: 'kuliner', number: 5, kind: 'zone', color: '#3D9A3F',
    name: 'Culinary & Local Stalls',
    nameId: 'Area Kuliner & Warung Lokal',
    short: 'Kuliner Lokal',
    blurb: 'Deretan warung di bawah rindang pepohonan: nasi liwet, surabi oncom, bandrek hangat, dan oleh-oleh khas Cililin.',
    points: [[620,96],[660,98],[704,114],[736,136],[760,176],[800,190],[812,206],[826,224],[840,242],[872,262],[890,280],[904,296],[926,306],[938,326],[956,338],[966,352],[964,470],[920,496],[880,520],[848,537],[808,560],[768,585],[768,520],[744,508],[720,500],[716,460],[712,438],[668,428],[625,405],[598,398],[600,385],[590,370],[565,355],[575,345],[582,332],[620,322],[632,315],[640,305],[625,290],[632,265],[655,256],[640,240],[615,232],[620,205]],
    labelAnchor: [850, 322],
  },
  {
    id: 'akses-cililin', number: 6, kind: 'tab', color: '#1F8FB3',
    name: 'Access from Cililin',
    nameId: 'Akses dari Cililin',
    short: 'Akses Cililin',
    pillText: 'Cililin',
    blurb: 'Gerbang selatan dari arah Kecamatan Cililin. Titik turun angkot, ojek wisata, dan pos informasi pengunjung.',
    points: [[600,678],[648,651],[698,679],[650,706]],
    labelAnchor: [676, 728],
  },
  {
    id: 'akses-bandung', number: 7, kind: 'tab', color: '#3557C5',
    name: 'Access from Bandung',
    nameId: 'Akses dari Bandung',
    short: 'Akses Bandung',
    pillText: 'Bandung',
    blurb: 'Gerbang utama dari arah Bandung dan Padalarang, dilengkapi area parkir kendaraan dan halte shuttle desa.',
    points: [[884,517],[932,490],[972,512],[924,539]],
    labelAnchor: [978, 541],
  },
]

/* =====================================================================
 * POIS — titik minat. Jumlah per zona/kategori dihitung dari data ini.
 * type: foto | saung | toilet | parkir | info | trekking | sanggar | homestay | kuliner | kerajinan
 * ===================================================================== */
export const POIS = [
  // 1 · Trekking & Sawah Terasering Atas
  { region: 'sawah-atas', name: 'Gerbang Jalur Trekking Pasir Luhur', type: 'trekking', services: ['Trekking', 'Fasilitas Umum'], tag: 'Pintu masuk utara', description: 'Titik awal jalur trekking 3,2 km mengelilingi terasering. Tersedia peta jalur dan tongkat pinjaman.', x: 312, y: 394 },
  { region: 'sawah-atas', name: 'Sawah Terasering Spot Sunset', type: 'foto', services: ['Spot Foto', 'Trekking'], tag: 'Pasir Sawah Luhur', description: 'Undakan sawah menghadap barat, paling indah sekitar pukul 17.15 saat langit berubah jingga.', x: 214, y: 330 },
  { region: 'sawah-atas', name: 'Puncak Pematang Batulayang', type: 'foto', services: ['Spot Foto', 'Trekking'], tag: 'Puncak terasering', description: 'Titik tertinggi terasering dengan panorama Gunung Lagadar dan hamparan sawah di bawahnya.', x: 292, y: 208 },
  { region: 'sawah-atas', name: 'Saung Lesehan Pematang', type: 'saung', services: ['Kuliner', 'Spot Foto'], tag: 'Teras sawah tengah', description: 'Saung bambu untuk beristirahat sambil menikmati kopi Cililin dan pisang goreng.', x: 150, y: 400 },
  { region: 'sawah-atas', name: 'Gazebo Pandang Terasering', type: 'foto', services: ['Spot Foto'], tag: 'Tepi barat', description: 'Gazebo kayu di bibir terasering, favorit untuk foto prewedding dan keluarga.', x: 118, y: 350 },
  { region: 'sawah-atas', name: 'Toilet & Mushola Jalur Atas', type: 'toilet', services: ['Fasilitas Umum'], tag: 'Pos istirahat 1', description: 'Toilet bersih dan mushola kecil di tengah jalur trekking. Air dari mata air setempat.', x: 252, y: 272 },
  { region: 'sawah-atas', name: 'Pos Pandu Trekking', type: 'info', services: ['Trekking', 'Fasilitas Umum'], tag: 'Pertigaan jalur', description: 'Pemandu lokal siap menemani trekking berkelompok. Pesan minimal sehari sebelumnya.', x: 272, y: 452 },
  { region: 'sawah-atas', name: 'Jalur Trekking Leuwi Batu', type: 'trekking', services: ['Trekking'], tag: 'Jalur biru', description: 'Jalur setapak berbatu menuruni terasering menuju aliran sungai. Tingkat kesulitan sedang.', x: 352, y: 472 },
  { region: 'sawah-atas', name: 'Jembatan Bambu Pematang', type: 'foto', services: ['Spot Foto', 'Trekking'], tag: 'Jalur biru bawah', description: 'Jembatan bambu kecil melintasi saluran irigasi, latar foto yang khas pedesaan.', x: 402, y: 506 },
  { region: 'sawah-atas', name: 'Camping Ground Saung Tengah', type: 'saung', services: ['Trekking', 'Homestay'], tag: 'Lahan datar tengah', description: 'Area berkemah untuk 15 tenda, lengkap dengan saung, api unggun, dan sewa perlengkapan.', x: 396, y: 442 },

  // 2 · Area Sawah Terasering Bawah & Alur Sungai
  { region: 'sawah-bawah', name: 'Alur Sungai Cihaur', type: 'foto', services: ['Spot Foto', 'Trekking'], tag: 'Hilir terasering', description: 'Aliran sungai jernih berbatu yang membelah terasering bawah. Sejuk untuk bermain air.', x: 470, y: 612 },
  { region: 'sawah-bawah', name: 'Leuwi Seuseupan (Kolam Alami)', type: 'foto', services: ['Spot Foto'], tag: 'Kolam alami', description: 'Lubuk sungai yang tenang dengan air kehijauan, cocok untuk berendam kaki.', x: 522, y: 642 },
  { region: 'sawah-bawah', name: 'Saung Lesehan Pinggir Sungai', type: 'saung', services: ['Kuliner'], tag: 'Tepi sungai', description: 'Makan siang lesehan dengan ikan bakar kolam dan sambal dadak di tepi aliran sungai.', x: 566, y: 576 },
  { region: 'sawah-bawah', name: 'Jalur Susur Sungai', type: 'trekking', services: ['Trekking'], tag: 'Jalur sungai', description: 'Susur sungai sepanjang 1 km bersama pemandu, melewati batuan dan kebun bambu.', x: 500, y: 546 },
  { region: 'sawah-bawah', name: 'Sawah Terasering Bawah', type: 'foto', services: ['Spot Foto', 'Trekking'], tag: 'Teras bawah', description: 'Petak sawah bertingkat yang menghijau di musim tanam dan menguning jelang panen.', x: 410, y: 586 },
  { region: 'sawah-bawah', name: 'Toilet Umum Leuwi', type: 'toilet', services: ['Fasilitas Umum'], tag: 'Dekat kolam', description: 'Toilet dan ruang bilas untuk pengunjung yang bermain air di sungai.', x: 592, y: 620 },
  { region: 'sawah-bawah', name: 'Kincir Bambu Ngagugulung', type: 'foto', services: ['Spot Foto'], tag: 'Saluran irigasi', description: 'Kincir air bambu tradisional yang mengalirkan air ke sawah, ikon foto terasering bawah.', x: 536, y: 508 },

  // 3 · Homestay & Pemukiman Warga
  { region: 'homestay', name: 'Homestay Saung Bambu', type: 'homestay', services: ['Homestay'], tag: 'RT 02 · Blok Luhur', description: 'Rumah panggung bambu dua kamar dengan teras menghadap sawah. Termasuk sarapan nasi liwet.', x: 372, y: 202 },
  { region: 'homestay', name: 'Homestay Abah Ujang', type: 'homestay', services: ['Homestay'], tag: 'RT 02 · Blok Luhur', description: 'Menginap bersama keluarga petani, ikut menanam padi dan memberi makan ikan di kolam.', x: 432, y: 250 },
  { region: 'homestay', name: 'Homestay Bale Sunda', type: 'homestay', services: ['Homestay'], tag: 'RT 03 · Blok Tengah', description: 'Rumah adat Sunda julang ngapak untuk 4–6 orang, dekat sanggar kesenian.', x: 486, y: 286 },
  { region: 'homestay', name: 'Homestay Teh Euis', type: 'homestay', services: ['Homestay', 'Kuliner'], tag: 'RT 03 · Blok Tengah', description: 'Homestay bersih dengan kelas memasak masakan Sunda bersama tuan rumah.', x: 536, y: 232 },
  { region: 'homestay', name: 'Homestay Lembur Kuring', type: 'homestay', services: ['Homestay'], tag: 'RT 04 · Blok Hilir', description: 'Kamar sederhana dan nyaman, cocok untuk rombongan pelajar dan live-in.', x: 426, y: 332 },
  { region: 'homestay', name: 'Homestay Imah Panggung', type: 'homestay', services: ['Homestay'], tag: 'RT 04 · Blok Hilir', description: 'Rumah panggung kayu dengan kolong untuk bersantai, dekat jalur menuju sungai.', x: 506, y: 346 },
  { region: 'homestay', name: 'Homestay Pinggir Sawah', type: 'homestay', services: ['Homestay', 'Spot Foto'], tag: 'Dekat pematang', description: 'Bangun pagi langsung disambut kabut tipis di atas terasering.', x: 404, y: 296 },
  { region: 'homestay', name: 'Warung Kopi Abah Odon', type: 'kuliner', services: ['Kuliner'], tag: 'Jalan kampung', description: 'Kopi tubruk robusta Cililin dan gorengan hangat, tempat warga berkumpul sore hari.', x: 590, y: 272 },
  { region: 'homestay', name: 'Pos Informasi Desa Wisata', type: 'info', services: ['Fasilitas Umum'], tag: 'Balai desa', description: 'Pemesanan homestay, paket wisata, dan pemandu. Buka setiap hari 07.00–17.00.', x: 586, y: 426 },
  { region: 'homestay', name: 'Area Parkir Pemukiman', type: 'parkir', services: ['Fasilitas Umum'], tag: 'Lapangan RW', description: 'Parkir motor dan mobil kecil untuk tamu homestay. Dijaga pemuda setempat.', x: 540, y: 396 },
  { region: 'homestay', name: 'Mushola Al-Ikhlas', type: 'toilet', services: ['Fasilitas Umum'], tag: 'Tengah kampung', description: 'Mushola warga dengan tempat wudu dan toilet umum yang terawat.', x: 470, y: 396 },
  { region: 'homestay', name: 'Gapura Selamat Datang Batulayang', type: 'foto', services: ['Spot Foto'], tag: 'Ujung kampung', description: 'Gapura kayu berukir dengan papan nama desa, spot foto pertama para pengunjung.', x: 556, y: 182 },

  // 4 · Balai Kerajinan & Sanggar Budaya
  { region: 'kerajinan', name: 'Sanggar Anyaman Bambu', type: 'kerajinan', services: ['Kerajinan'], tag: 'Jalur sungai timur', description: 'Belajar menganyam boboko, nyiru, dan tas bambu bersama perajin. Sesi 90 menit.', x: 650, y: 506 },
  { region: 'kerajinan', name: 'Balai Kerajinan Batulayang', type: 'kerajinan', services: ['Kerajinan', 'Fasilitas Umum'], tag: 'Bawah bale riung', description: 'Galeri dan toko hasil kerajinan warga: anyaman, ukiran kayu, dan batik tulis.', x: 690, y: 476 },
  { region: 'kerajinan', name: 'Sanggar Seni Calung & Angklung', type: 'sanggar', services: ['Kerajinan', 'Spot Foto'], tag: 'Dekat jembatan', description: 'Latihan dan pertunjukan calung setiap Sabtu sore. Pengunjung boleh ikut bermain.', x: 612, y: 526 },
  { region: 'kerajinan', name: 'Jembatan Kayu Cihaur', type: 'foto', services: ['Spot Foto', 'Trekking'], tag: 'Penyeberangan sungai', description: 'Jembatan kayu melengkung di atas sungai, menghubungkan kampung dengan area kuliner.', x: 630, y: 550 },
  { region: 'kerajinan', name: 'Galeri Batik Cililin', type: 'kerajinan', services: ['Kerajinan'], tag: 'Jalur sungai tengah', description: 'Batik tulis bermotif padi dan bambu khas Batulayang. Tersedia kelas membatik singkat.', x: 498, y: 441 },
  { region: 'kerajinan', name: 'Padepokan Wayang Golek', type: 'sanggar', services: ['Kerajinan'], tag: 'Jalur sungai barat', description: 'Melihat proses membuat wayang golek dan menonton pentas mini dalang muda.', x: 414, y: 393 },
  { region: 'kerajinan', name: 'Toilet & Mushola Balai', type: 'toilet', services: ['Fasilitas Umum'], tag: 'Belakang galeri', description: 'Fasilitas toilet dan mushola untuk pengunjung balai dan sanggar.', x: 706, y: 532 },

  // 5 · Area Kuliner & Warung Lokal
  { region: 'kuliner', name: 'Warung Liwet Cililin', type: 'kuliner', services: ['Kuliner'], tag: 'Lorong warung', description: 'Nasi liwet kastrol dengan ikan asin, sambal terasi, dan lalapan segar dari kebun.', x: 790, y: 432 },
  { region: 'kuliner', name: 'Warung Nasi Timbel Ambu', type: 'kuliner', services: ['Kuliner'], tag: 'Lorong warung', description: 'Nasi timbel bungkus daun pisang, ayam goreng kampung, dan sayur asem.', x: 860, y: 416 },
  { region: 'kuliner', name: 'Kedai Bandrek & Bajigur', type: 'kuliner', services: ['Kuliner'], tag: 'Ujung lorong', description: 'Minuman jahe hangat dan bajigur gula aren, pas untuk udara sejuk Batulayang.', x: 830, y: 374 },
  { region: 'kuliner', name: 'Saung Lesehan Kuliner', type: 'saung', services: ['Kuliner'], tag: 'Taman makan', description: 'Area makan lesehan bersama di bawah pepohonan rindang, muat 40 orang.', x: 766, y: 472 },
  { region: 'kuliner', name: 'Warung Surabi Oncom', type: 'kuliner', services: ['Kuliner'], tag: 'Lorong warung', description: 'Surabi tungku tanah liat dengan topping oncom pedas atau kinca gula merah.', x: 904, y: 442 },
  { region: 'kuliner', name: 'Pusat Oleh-oleh Opak & Ranginang', type: 'kuliner', services: ['Kuliner', 'Kerajinan'], tag: 'Pintu keluar', description: 'Opak, ranginang, dan dodol buatan ibu-ibu PKK, dikemas dalam besek bambu.', x: 846, y: 492 },
  { region: 'kuliner', name: 'Area Parkir Kuliner', type: 'parkir', services: ['Fasilitas Umum'], tag: 'Sisi timur', description: 'Parkir untuk 30 motor dan 12 mobil, dekat dengan akses dari Bandung.', x: 900, y: 482 },
  { region: 'kuliner', name: 'Toilet & Mushola Kuliner', type: 'toilet', services: ['Fasilitas Umum'], tag: 'Sisi timur', description: 'Toilet, wastafel, dan mushola yang dekat dengan deretan warung.', x: 934, y: 396 },
  { region: 'kuliner', name: 'Spot Foto Hutan Pinus', type: 'foto', services: ['Spot Foto', 'Trekking'], tag: 'Hutan belakang', description: 'Jalan setapak di antara pinus dan palem dengan cahaya pagi yang menembus kanopi.', x: 722, y: 192 },
  { region: 'kuliner', name: 'Bale Riung Warga', type: 'info', services: ['Fasilitas Umum', 'Kerajinan'], tag: 'Pusat komunitas', description: 'Pendopo tempat musyawarah, pentas budaya, dan titik kumpul rombongan wisata.', x: 700, y: 322 },

  // 6 · Akses dari Cililin
  { region: 'akses-cililin', name: 'Terminal Angkot Cililin', type: 'parkir', services: ['Fasilitas Umum'], tag: 'Gerbang selatan', description: 'Titik turun angkot jurusan Cililin–Batulayang. Beroperasi 05.30–18.00.', x: 628, y: 677 },
  { region: 'akses-cililin', name: 'Pos Informasi Gerbang Selatan', type: 'info', services: ['Fasilitas Umum'], tag: 'Gerbang selatan', description: 'Peta cetak, tiket paket wisata, dan penitipan barang untuk pengunjung.', x: 652, y: 668 },
  { region: 'akses-cililin', name: 'Pangkalan Ojek Wisata', type: 'parkir', services: ['Fasilitas Umum', 'Trekking'], tag: 'Gerbang selatan', description: 'Ojek warga untuk mengantar ke titik awal trekking dan homestay.', x: 668, y: 688 },

  // 7 · Akses dari Bandung
  { region: 'akses-bandung', name: 'Gerbang Utama Batulayang', type: 'info', services: ['Fasilitas Umum', 'Spot Foto'], tag: 'Gerbang timur', description: 'Gerbang utama dari arah Bandung–Padalarang dengan papan selamat datang.', x: 912, y: 512 },
  { region: 'akses-bandung', name: 'Parkir Bus & Mobil Pengunjung', type: 'parkir', services: ['Fasilitas Umum'], tag: 'Gerbang timur', description: 'Parkir luas untuk bus pariwisata dan mobil pribadi, dijaga 24 jam.', x: 932, y: 504 },
  { region: 'akses-bandung', name: 'Halte Shuttle Desa Wisata', type: 'info', services: ['Fasilitas Umum'], tag: 'Gerbang timur', description: 'Shuttle gratis keliling desa setiap 30 menit pada akhir pekan.', x: 940, y: 522 },
]

/* Elemen langit (awan) yang dipotong menjadi layer sendiri. */
export const SKY = [
  { id: 'awan-1', drift: 'bob', patch: null, points: [[360,72],[368,56],[390,46],[420,44],[446,50],[466,62],[472,80],[456,94],[410,96],[372,92]] },
  { id: 'awan-2', drift: 'drift', patch: '#41ADED', points: [[712,98],[716,86],[730,78],[750,80],[760,92],[756,102],[730,104]] },
  { id: 'awan-3', drift: 'drift', patch: '#44AFEF', points: [[760,114],[770,92],[796,80],[822,62],[862,56],[892,70],[902,94],[926,104],[942,126],[936,152],[892,158],[856,150],[838,132],[798,130],[768,128]] },
  { id: 'awan-4', drift: 'drift', patch: '#5BC1F2', points: [[60,280],[64,264],[84,254],[112,250],[136,258],[146,276],[138,288],[92,289],[66,288]] },
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
  'sawah-atas': {
    unit: 'pengunjung',
    sessions: [
      { label: 'Trekking Pagi', time: '06.00–10.00', capacity: 60, booked: 48 },
      { label: 'Trekking Sore', time: '14.00–18.00', capacity: 60, booked: 31 },
    ],
    note: 'Jumlah pendaki dibatasi untuk menjaga pematang sawah tetap utuh.',
  },
  'sawah-bawah': {
    unit: 'pengunjung',
    sessions: [
      { label: 'Susur Sungai Pagi', time: '08.00–11.00', capacity: 40, booked: 22 },
      { label: 'Susur Sungai Siang', time: '13.00–16.00', capacity: 40, booked: 37 },
    ],
    note: 'Susur sungai wajib didampingi pemandu lokal dan memakai pelampung.',
  },
  homestay: {
    unit: 'kamar',
    sessions: [
      { label: 'Kamar Homestay', time: 'Check-in 14.00', capacity: 24, booked: 21 },
      { label: 'Saung Menginap', time: 'Check-in 15.00', capacity: 6, booked: 6 },
    ],
    note: 'Pemesanan menginap paling lambat H-1 melalui pengelola desa.',
  },
  kerajinan: {
    unit: 'peserta',
    sessions: [
      { label: 'Kelas Anyaman Bambu', time: '09.00–11.00', capacity: 20, booked: 20 },
      { label: 'Kelas Membatik', time: '13.00–15.00', capacity: 20, booked: 9 },
    ],
    note: 'Bahan praktik sudah termasuk; hasil karya boleh dibawa pulang.',
  },
  kuliner: {
    unit: 'kursi',
    sessions: [
      { label: 'Makan Siang Lesehan', time: '11.00–14.00', capacity: 120, booked: 64 },
      { label: 'Makan Malam', time: '17.00–20.00', capacity: 80, booked: 18 },
    ],
    note: 'Rombongan di atas 20 orang mohon reservasi lebih dulu.',
  },
  'akses-cililin': {
    unit: 'slot parkir',
    sessions: [
      { label: 'Parkir Mobil', time: '06.00–21.00', capacity: 30, booked: 12 },
      { label: 'Parkir Motor', time: '06.00–21.00', capacity: 80, booked: 41 },
    ],
    note: 'Jalur Cililin menanjak; kendaraan besar disarankan lewat gerbang Bandung.',
  },
  'akses-bandung': {
    unit: 'slot parkir',
    sessions: [
      { label: 'Parkir Mobil', time: '24 jam', capacity: 40, booked: 34 },
      { label: 'Parkir Bus Pariwisata', time: '24 jam', capacity: 6, booked: 2 },
    ],
    note: 'Shuttle gratis dari parkir ke pusat desa setiap 30 menit di akhir pekan.',
  },
}
