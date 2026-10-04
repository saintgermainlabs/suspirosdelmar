import { useState } from "react"
import { Link } from "react-router-dom"
import Footer from "../components/Footer"
import { useLang } from "../LanguageContext"
import BookingForm from "../components/BookingForm"
import Lightbox from "../components/Lightbox"
import SEO from "../components/SEO"
import { roomsData } from "../data/roomsData"

interface ApartmentPhoto {
  src: string
  alt: { en: string es: string }
}

const bedroomPhotos: ApartmentPhoto[] = [
  {
    src: "/images/Appartment_Bedroom_View1.jpg",
    alt: {
      en: "Master bedroom with sea view",
      es: "Dormitorio principal con vista al mar",
    },
  },
  {
    src: "/images/Appartment_Bedroom.jpg",
    alt: {
      en: "Bedroom with comfortable bedding",
      es: "Dormitorio con ropa de cama cómoda",
    },
  },
  {
    src: "/images/Appartment_Bedrrom_Doorway.jpg",
    alt: { en: "Bedroom doorway", es: "Puerta del dormitorio" },
  },
  {
    src: "/images/Appartment_Bedroom_Clothing_Dresser.jpg",
    alt: {
      en: "Bedroom with clothing dresser",
      es: "Dormitorio con cómoda para ropa",
    },
  },
]

const otherPhotos: ApartmentPhoto[] = [
  {
    src: "/images/Appartment_Kitchen.jpg",
    alt: {
      en: "Fully equipped private kitchen",
      es: "Cocina privada completamente equipada",
    },
  },
  {
    src: "/images/Appartment_Kitchen_View2.jpg",
    alt: { en: "Kitchen with sea view", es: "Cocina con vista al mar" },
  },
  {
    src: "/images/Appartment_Shower.jpg",
    alt: {
      en: "Spacious private shower with hot water",
      es: "Ducha privada amplia con agua caliente",
    },
  },
  {
    src: "/images/Appartment_Bathroom.jpg",
    alt: {
      en: "Clean and modern private bathroom",
      es: "Baño privado limpio y moderno",
    },
  },
  {
    src: "/images/Appartment_Bathroom_View2.jpg",
    alt: {
      en: "Private bathroom with tiled finishes",
      es: "Baño privado con acabados de azulejos",
    },
  },
]

const allPhotos = [...bedroomPhotos, ...otherPhotos]

export default function Apartment() {
  const { tr, lang } = useLang()
  const apt = tr.apartment
  const room = roomsData[4]
  const r = tr.rooms

  const [activePhoto, setActivePhoto] = useState<number | null>(null)

  return (
    <main className="pt-16 min-h-screen bg-[#f7f4ef]">
      <SEO
        title={apt.heroTitle}
        description={apt.heroSub}
        image="/images/Appartment_Bedroom_View1.jpg"
        url={window.location.href}
      />

      {/* Hero */}
      <section className="relative h-72 md:h-96 bg-[#1b4d6e] flex items-center justify-center overflow-hidden">
        <img
          src="/images/Appartment_Bedroom_View1.jpg"
          alt="Master bedroom of the upstairs apartment with sea view"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b4d6e]/30 to-[#1b4d6e]/60" />
        <div className="relative z-10 text-center text-white px-6 max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-3 font-medium">
            {apt.tag}
          </p>
          <h1 className="font-display text-5xl md:text-6xl mb-3">
            {apt.heroTitle}
          </h1>
          <p className="text-[#a8bdc9] max-w-md mx-auto">{apt.heroSub}</p>
        </div>
      </section>

      {/* Apartment details + Reservation form */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-12 gap-12 items-start">
        {/* Left: Info & Specs */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative overflow-hidden rounded-lg bg-[#d6cdb8] h-80 md:h-96 shadow-md">
            <img
              src="/images/Appartment_Bedroom_View1.jpg"
              alt={
                lang === "en"
                  ? "Master bedroom with sea view"
                  : "Dormitorio principal con vista al mar"
              }
              className="w-full h-full object-cover"
            />
            {room.featured && (
              <span className="absolute top-4 left-4 bg-[#4a8fa3] text-white text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wider">
                {r.featured}
              </span>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-1 font-medium">
              {room.tagline[lang]}
            </p>
            <h2 className="font-display text-3xl text-[#1b4d6e] mb-2">
              {room.title[lang]}
            </h2>
            <div className="flex items-center gap-6 text-sm text-[#6b6355] mb-4 border-y border-[#d6cdb8] py-3">
              <span aria-hidden="true">👥 {room.capacity[lang]}</span>
              <span aria-hidden="true">🛏️ {room.bed[lang]}</span>
              <span className="ml-auto font-display text-xl text-[#1b4d6e] font-semibold">
                {room.price}{" "}
                <span className="text-xs font-normal text-[#6b6355]">
                  {r.fromNight}
                </span>
              </span>
            </div>
            <p className="text-[#6b6355] leading-relaxed mb-6">
              {room.desc[lang]}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {room.amenities[lang].map((a) => (
                <span
                  key={a}
                  className="text-xs bg-[#ede8df] border border-[#d6cdb8] text-[#6b6355] px-3 py-1.5 rounded-full font-medium"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Embedded Booking Form */}
        <div
          id="reservation-form"
          className="lg:col-span-5 lg:sticky lg:top-24"
        >
          <BookingForm
            defaultRoomIndex="4"
            lockRoomSelect={false}
            title={
              lang === "en"
                ? "Reserve Upstairs Apartment"
                : "Reservar Apartamento Superior"
            }
            subtitle={
              lang === "en"
                ? "Check dates & request"
                : "Consulta fechas y disponibilidad"
            }
          />
        </div>
      </section>

      {/* Photo tour */}
      <section className="bg-[#ede8df] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-2 font-medium">
              {apt.galleryTag}
            </p>
            <h2 className="font-display text-4xl text-[#1b4d6e]">
              {apt.galleryTitle}
            </h2>
            <p className="text-[#6b6355] mt-3 max-w-xl mx-auto">
              {apt.gallerySub}
            </p>
          </div>

          <h3 className="font-display text-xl text-[#1b4d6e] mb-4">
            {lang === "en" ? "Bedrooms" : "Dormitorios"}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {bedroomPhotos.map((photo, i) => (
              <figure
                key={photo.src}
                onClick={() => setActivePhoto(i)}
                className="group cursor-pointer overflow-hidden rounded-lg bg-[#d6cdb8] shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.alt[lang]}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <figcaption className="text-xs text-[#6b6355] px-3 py-2 bg-white">
                  {photo.alt[lang]}
                </figcaption>
              </figure>
            ))}
          </div>

          <h3 className="font-display text-xl text-[#1b4d6e] mb-4">
            {lang === "en"
              ? "Kitchen, bathroom & living areas"
              : "Cocina, baño y áreas de estar"}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {otherPhotos.map((photo, i) => (
              <figure
                key={photo.src}
                onClick={() => setActivePhoto(bedroomPhotos.length + i)}
                className="group cursor-pointer overflow-hidden rounded-lg bg-[#d6cdb8] shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.alt[lang]}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

      {/* Lightbox */}
      <Lightbox
        images={allPhotos}
        activeIndex={activePhoto}
        onClose={() => setActivePhoto(null)}
        onNavigate={(idx) => setActivePhoto(idx)}
      />

      <Footer onNavigate={() => {}} />
    </main>
  )
}
