import carouselAerial from '../assets/village/carousel-aerial.jpg'
import carouselAlley from '../assets/village/carousel-alley.jpg'
import carouselRiceWalk from '../assets/village/carousel-rice-walk.jpg'
import heroImage from '../assets/village/hero-tegelalang.jpg'

// Placeholder content — swap for the real partner village's data once available.
export const village = {
  name: 'WaraWiri Village',
  tagline: 'Jelajahi alam, jaga kelestariannya',
  heroImage,
  description:
    'WaraWiri Village adalah desa wisata berbasis komunitas yang dikelilingi sawah terasering dan hutan bambu. Setiap kunjungan dikelola bersama warga desa, dengan hasilnya kembali langsung ke ekonomi lokal — mulai dari pemandu, homestay, hingga pengrajin setempat. Kami membatasi jumlah pengunjung setiap harinya agar sawah, sungai, dan jalur trekking tetap lestari untuk generasi berikutnya.',
  highlights: [
    {
      title: 'Trekking Sawah Terasering',
      body: 'Jalur trekking ramah lingkungan menyusuri sawah terasering bersama pemandu lokal bersertifikat.',
    },
    {
      title: 'Kerajinan & Budaya Warga',
      body: 'Kunjungi sanggar anyaman bambu dan tenun tradisional yang dikelola langsung oleh warga desa.',
    },
    {
      title: 'Homestay Warga',
      body: 'Menginap di rumah warga untuk pengalaman yang lebih dekat dengan keseharian desa.',
    },
    {
      title: 'Kuliner Lokal',
      body: 'Hidangan khas desa dari hasil kebun dan sawah warga, disajikan langsung oleh keluarga setempat.',
    },
  ],
  gallery: [
    { src: heroImage, alt: 'Sawah terasering WaraWiri Village saat pagi hari' },
    { src: carouselRiceWalk, alt: 'Pengunjung berjalan menyusuri jalur sawah terasering' },
    { src: carouselAlley, alt: 'Gang tradisional di antara rumah warga desa' },
    { src: carouselAerial, alt: 'Pemandangan udara permukiman desa di tengah area hijau' },
  ],
  contact: {
    phone: '+62 812-3456-7890',
    whatsapp: 'https://wa.me/6281234567890',
    email: 'halo@warawiri.village',
    address: 'Jl. Wisata Alam No. 12, Desa WaraWiri, Kec. Cililin, Kab. Bandung Barat, Jawa Barat 40562',
  },
  // Placeholder coordinates near West Java — replace with the real partner village's location.
  // Rendered with our own Leaflet map (OpenStreetMap raster tiles, no API key, no WebGL
  // dependency) instead of an embedded iframe; the Google Maps link still opens the real
  // app/site for directions.
  mapPosition: [-6.9147, 107.4478],
  mapLinkHref: 'https://www.google.com/maps?q=-6.9147,107.4478',
  reservation: {
    jenisWisata: [
      'Trekking sawah terasering',
      'Kerajinan & budaya warga',
      'Homestay warga',
      'Kuliner lokal',
    ],
  },
}
