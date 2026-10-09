import SiteImage from "../components/SiteImage"
import { Link, useNavigate } from "react-router-dom"
import Footer from "../components/Footer"
import SEO from "../components/SEO"
import { useLang } from "../LanguageContext"
import { roomsData } from "../data/roomsData"

const commonSpacePhotos = [
  {
    src: "/images/Common_Area.jpg",
    alt: {
      en: "Bright common area with dining table and seating",
      es: "Área común luminosa con mesa de comedor y asientos",
    },
  },
  {
    src: "/images/Common_Room_Couches.jpg",
    alt: {
      en: "Comfortable couches in the spacious common room",
      es: "Sofás cómodos en la amplia sala común",
    },
  },
  {
    src: "/images/Common_Room_View1.jpg",
    alt: {
      en: "Common room with windows onto the courtyard garden",
      es: "Sala común con ventanas al jardín del patio interior",
    },
  },
  {
    src: "/images/Common_Kitxhen.jpg",
    alt: {
      en: "Common kitchen with cooking area",
      es: "Cocina común con área de cocción",
    },
  },
  {
    src: "/images/Common_Kitchen_View2.jpg",
    alt: {
      en: "Common kitchen and dining space",
      es: "Cocina común y espacio de comedor",
    },
  },
  {
    src: "/images/Common_Kitchen_Utilitiews.jpg",
    alt: {
      en: "Kitchen utilities ready for guests",
      es: "Utensilios de cocina listos para los huéspedes",
    },
  },
  {
    src: "/images/SharedKitchen.jpg",
    alt: {
      en: "Shared guest kitchen with clean sink and wooden shelves",
      es: "Cocina compartida para huéspedes con lavadero limpio y repisas de madera",
    },
  },
  {
    src: "/images/Shared_Kitchen.jpg",
    alt: {
      en: "Spacious shared kitchen area with countertops",
      es: "Amplia área de cocina compartida con encimeras",
    },
  },
  {
    src: "/images/Shared_Kitchen_Appliances.jpg",
    alt: {
      en: "Shared kitchen appliances and dining table",
      es: "Electrodomésticos de cocina compartida y mesa de comedor",
    },
  },
  {
    src: "/images/Shared_Kitchen_Decor.jpg",
    alt: {
      en: "Decor details in the shared kitchen",
      es: "Detalles decorativos en la cocina compartida",
    },
  },
  {
    src: "/images/Shared_Kitchen(1).jpg",
    alt: {
      en: "Shared kitchen, another angle",
      es: "Cocina compartida, otra vista",
    },
  },
  {
    src: "/images/Garden.jpg",
    alt: {
      en: "Courtyard garden with red geraniums",
      es: "Jardín interior con geranios rojos",
    },
  },
  {
    src: "/images/Garden2.jpg",
    alt: {
      en: "Lush potted plants in the sunny courtyard garden",
      es: "Plantas en maceta en el soleado jardín interior",
    },
  },
  {
    src: "/images/Couch.jpg",
    alt: {
      en: "Cozy couch corner for relaxing",
      es: "Rincón acogedor con sofá para relajarse",
    },
  },
]

export default function Rooms() {
  const { tr, lang } = useLang()
  const navigate = useNavigate()
  const r = tr.rooms

  const bedrooms = roomsData.slice(0, 4)
  const apartment = roomsData[4]

  return (
    <main className="pt-16 min-h-screen bg-[#f7f4ef]">
      <SEO
        title={r.heroTitle}
        description={r.heroSub}
        url={window.location.href}
      />

      {/* Hero */}
      <section className="relative h-72 md:h-96 bg-[#1b4d6e] flex items-center justify-center overflow-hidden">
        <SiteImage loading="eager" fetchPriority="high" sizes="100vw"
          src="https://images.unsplash.com/photo-1783255620846-6b98d1fe2eb0?w=1600&h=600&fit=crop&auto=format"
          alt="Waves crashing against a cliffside house at sunset"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b4d6e]/30 to-[#1b4d6e]/60" />
        <div className="relative z-10 text-center text-white px-6">
          <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-3 font-medium">
            {r.tag}
          </p>
          <h1 className="font-display text-5xl md:text-6xl mb-3">
            {r.heroTitle}
          </h1>
          <p className="text-[#a8bdc9] max-w-md mx-auto">{r.heroSub}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <p className="text-xs text-[#6b6355] italic bg-[#ede8df] border border-[#d6cdb8] rounded-lg px-5 py-3 inline-block">
          {r.priceNote}
        </p>
      </div>

      {/* Bedrooms */}
      <section className="max-w-5xl mx-auto px-6 pb-16 space-y-16">
        {bedrooms.map((room, i) => (
          <article
            key={room.id}
            className={`grid md:grid-cols-2 gap-8 items-center ${
              i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
            }`}
          >
            <Link
              to={`/rooms/${room.slug}`}
              className="relative overflow-hidden rounded-lg bg-[#d6cdb8] h-72 md:h-80 block group shadow-sm"
            >
              <SiteImage
                src={room.images.hero}
                alt={room.title[lang]}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {room.featured && (
                <span className="absolute top-4 left-4 bg-[#4a8fa3] text-white text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wider">
                  {r.featured}
                </span>
              )}
            </Link>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-1 font-medium">
                {room.tagline[lang]}
              </p>
              <h2 className="font-display text-3xl text-[#1b4d6e] mb-1">
                <Link
                  to={`/rooms/${room.slug}`}
                  className="hover:text-[#4a8fa3] transition-colors"
                >
                  {room.title[lang]}
                </Link>
              </h2>
              <div className="flex items-center gap-4 text-sm text-[#6b6355] mb-4">
                <span aria-hidden="true">👥 {room.capacity[lang]}</span>
                <span aria-hidden="true">🛏️ {room.bed[lang]}</span>
              </div>
              <p className="text-[#6b6355] leading-relaxed mb-5">
                {room.desc[lang]}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {room.amenities[lang].map((a) => (
                  <span
                    key={a}
                    className="text-xs bg-[#ede8df] text-[#6b6355] px-3 py-1 rounded-full"
                  >
                    {a}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-display text-[#1b4d6e] font-semibold">
                    {r.from} {room.price}
                  </span>
                  <span className="text-sm text-[#6b6355] ml-1">
                    {r.fromNight}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/rooms/${room.slug}`)}
                  className="bg-[#1b4d6e] hover:bg-[#4a8fa3] text-white text-sm font-medium px-6 py-2.5 rounded transition-colors shadow-sm"
                >
                  {r.bookNow}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Apartment teaser */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-white border border-[#d6cdb8] rounded-lg overflow-hidden grid md:grid-cols-2 items-stretch shadow-md">
          <Link
            to="/apartment"
            className="overflow-hidden h-56 md:h-auto bg-[#d6cdb8] block group"
          >
            <SiteImage
              src="/images/Appartment_Bedroom_View1.jpg"
              alt={apartment.title[lang]}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </Link>
          <div className="p-8 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-2 font-medium">
              {tr.apartment.tag}
            </p>
            <h2 className="font-display text-2xl text-[#1b4d6e] mb-1">
              {apartment.title[lang]}
            </h2>
            <p className="text-sm italic text-[#4a8fa3] mb-4">
              {apartment.tagline[lang]}
            </p>
            <p className="text-sm text-[#6b6355] mb-4">
              {tr.rooms.from} {apartment.price} {r.fromNight} ·{" "}
              {apartment.capacity[lang]}
            </p>
            <button
              onClick={() => navigate("/apartment")}
              className="bg-[#1b4d6e] hover:bg-[#4a8fa3] text-white text-sm font-medium px-6 py-2.5 rounded transition-colors w-fit shadow-sm"
            >
              {tr.home.seeApartment}
            </button>
          </div>
        </div>
      </section>

      {/* Common spaces */}
      <section className="bg-[#ede8df] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-2 font-medium">
              {r.commonSpacesTag}
            </p>
            <h2 className="font-display text-4xl text-[#1b4d6e]">
              {r.commonSpacesTitle}
            </h2>
            <p className="text-[#6b6355] mt-3 max-w-xl mx-auto">
              {r.commonSpacesDesc}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {commonSpacePhotos.map((photo) => (
              <figure
                key={photo.src}
                className="overflow-hidden rounded-lg bg-[#d6cdb8]"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <SiteImage
                    src={photo.src}
                    alt={photo.alt[lang]}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <figcaption className="text-xs text-[#6b6355] px-3 py-2 bg-white">
                  {photo.alt[lang]}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
