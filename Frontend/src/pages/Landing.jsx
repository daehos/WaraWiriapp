import Carousel from '../components/Carousel'
import ContactInfo from '../components/ContactInfo'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import Navbar from '../components/Navbar'
import PetaWisata from '../components/peta/PetaWisata'
import ReservationSection from '../components/ReservationSection'
import VillageInfo from '../components/VillageInfo'
import VillageMap from '../components/VillageMap'
import { village } from '../data/village'

export default function Landing() {
  return (
    <div>
      <Navbar />
      <Hero name={village.name} tagline={village.tagline} image={village.heroImage} />
      <VillageInfo description={village.description} highlights={village.highlights} />
      <PetaWisata />
      <Carousel images={village.gallery} />
      <ReservationSection />

      <section id="kontak" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <ContactInfo {...village.contact} />
          <VillageMap
            position={village.mapPosition}
            name={village.name}
            address={village.contact.address}
            linkHref={village.mapLinkHref}
          />
        </div>
      </section>

      <Footer name={village.name} />
    </div>
  )
}
