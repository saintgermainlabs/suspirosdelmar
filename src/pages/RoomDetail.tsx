import SiteImage from "../components/SiteImage"
import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useLang } from "../LanguageContext"
import { getRoomBySlug } from "../data/roomsData"
import BookingForm from "../components/BookingForm"
import Lightbox from "../components/Lightbox"
import Footer from "../components/Footer"
import SEO from "../components/SEO"
import NotFound from "./NotFound"

export default function RoomDetail() {
  const { roomId } = useParams<{ roomId: string }>()
  const { lang, tr } = useLang()
  const [activePhoto, setActivePhoto] = useState<number | null>(null)

  const room = getRoomBySlug(roomId || "")

  if (!room) {
    return <NotFound />
  }

  const r = tr.rooms
  const roomTitle = room.title[lang]
  const roomDesc = room.desc[lang]
  const roomTagline = room.tagline[lang]
  const roomCapacity = room.capacity[lang]
  const roomBed = room.bed[lang]
  const roomAmenities = room.amenities[lang]

  return (
    <main className="pt-16 min-h-screen bg-[#f7f4ef]">
      <SEO
        title={roomTitle}
        description={roomDesc}
        image={room.images.hero}
        url={window.location.href}
      />

      {/* Hero Header */}
      <section className="relative h-72 md:h-96 bg-[#1b4d6e] flex items-center justify-center overflow-hidden">
        <SiteImage loading="eager" fetchPriority="high" sizes="100vw"
          src={room.images.hero}
          alt={roomTitle}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b4d6e]/40 via-transparent to-[#1b4d6e]/80" />
        <div className="relative z-10 text-center text-white px-6 max-w-3xl">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#a8bdc9] hover:text-white mb-4 transition-colors"
          >
            ← {lang === "en" ? "Back to all rooms" : "Volver a habitaciones"}
          </Link>
          <h1 className="font-display text-4xl md:text-6xl mb-2">
            {roomTitle}
          </h1>
          <p className="text-[#d6cdb8] text-base md:text-lg italic font-light">
            {roomTagline}
          </p>
        </div>
      </section>

      {/* Main Content & Reservation Split Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid lg:grid-cols-12 gap-12 items-start">
        {/* Left 7 Cols: Room Details & Photo Tour */}
        <div className="lg:col-span-7 space-y-10">
          {/* Key Specs Bar */}
          <div className="bg-white border border-[#d6cdb8] rounded-lg p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#4a8fa3] block font-medium">
                {r.from}
              </span>
              <span className="text-3xl font-display text-[#1b4d6e] font-semibold">
                {room.price}
              </span>
              <span className="text-sm text-[#6b6355] ml-1">{r.fromNight}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#6b6355]">
              <span className="flex items-center gap-1.5" aria-hidden="true">
                👥 {roomCapacity}
              </span>
              <span className="flex items-center gap-1.5" aria-hidden="true">
                🛏️ {roomBed}
              </span>
            </div>
          </div>

          {/* Room Description */}
          <div>
            <h2 className="font-display text-2xl text-[#1b4d6e] mb-4">
              {lang === "en" ? "About this room" : "Sobre esta habitación"}
            </h2>
            <p className="text-[#6b6355] leading-relaxed text-base">
              {roomDesc}
            </p>
          </div>

          {/* Amenities Grid */}
          <div>
            <h3 className="font-display text-xl text-[#1b4d6e] mb-4">
              {r.amenitiesLabel}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {roomAmenities.map((a) => (
                <div
                  key={a}
                  className="bg-white border border-[#d6cdb8] rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-[#1b4d6e] font-medium"
                >
                  <span className="text-[#4a8fa3]">✓</span> {a}
                </div>
              ))}
            </div>
          </div>

          {/* Room Photo Gallery */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-[#1b4d6e]">
                {lang === "en"
                  ? "Room Photo Gallery"
                  : "Galería de la habitación"}
              </h3>
              <span className="text-xs text-[#6b6355]">
                {lang === "en"
                  ? "Click any photo to enlarge"
                  : "Haz clic para ampliar"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {room.images.gallery.map((photo, i) => (
                <button
                  key={photo.src}
                  onClick={() => setActivePhoto(i)}
                  className="group overflow-hidden rounded-lg bg-[#d6cdb8] aspect-[4/3] focus:outline-none focus:ring-2 focus:ring-[#4a8fa3]"
                >
                  <SiteImage
                    src={photo.src}
                    alt={photo.alt[lang]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Embedded Reservation Form */}
        <div
          id="reservation-form"
          className="lg:col-span-5 lg:sticky lg:top-24"
        >
          <BookingForm
            defaultRoomIndex={room.index.toString()}
            lockRoomSelect={false}
            title={
              lang === "en" ? `Reserve ${roomTitle}` : `Reservar ${roomTitle}`
            }
            subtitle={
              lang === "en" ? "Select your dates" : "Selecciona tus fechas"
            }
          />
        </div>
      </section>

      {/* Mobile Sticky Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1b4d6e] text-white p-4 shadow-2xl flex items-center justify-between border-t border-white/10">
        <div>
          <span className="text-xs text-[#a8bdc9] block">{roomTitle}</span>
          <span className="text-lg font-display font-semibold">
            {room.price}
          </span>
          <span className="text-xs text-[#a8bdc9]">
            {" "}
            / {r.fromNight.replace("/ ", "")}
          </span>
        </div>
        <a
          href="#reservation-form"
          className="bg-[#4a8fa3] hover:bg-white hover:text-[#1b4d6e] text-white text-sm font-medium px-5 py-2.5 rounded transition-all"
        >
          {r.bookNow}
        </a>
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        images={room.images.gallery}
        activeIndex={activePhoto}
        onClose={() => setActivePhoto(null)}
        onNavigate={(idx) => setActivePhoto(idx)}
      />

      <Footer onNavigate={() => {}} />
    </main>
  )
}
