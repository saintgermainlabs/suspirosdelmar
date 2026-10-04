import { useState } from "react"
import Footer from "../components/Footer"
import SEO from "../components/SEO"
import Lightbox from "../components/Lightbox"
import { useLang } from "../LanguageContext"
import { photos, type GalleryCategory } from "../galleryData"

export default function Gallery() {
  const { tr, lang } = useLang()
  const g = tr.gallery

  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("all")
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const categories: { key: GalleryCategory label: string }[] = [
    { key: "all", label: g.filters.all },
    { key: "beach", label: g.filters.beach },
    { key: "rooms", label: g.filters.rooms },
    { key: "terrace", label: g.filters.terrace },
  ]

  const filteredPhotos =
    activeCategory === "all"
      ? photos
      : photos.filter((p) => p.category === activeCategory)

  return (
    <main className="pt-16 min-h-screen bg-[#f7f4ef]">
      <SEO
        title={g.heroTitle}
        description={g.heroSub}
        url={window.location.href}
      />

      {/* Hero */}
      <section className="relative h-72 md:h-96 bg-[#1b4d6e] flex items-center justify-center overflow-hidden">
        <img
          src="/images/Common_Room_View1.jpg"
          alt="Los Suspiros del Mar common room view"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b4d6e]/30 to-[#1b4d6e]/60" />
        <div className="relative z-10 text-center text-white px-6">
          <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-3 font-medium">
            {g.tag}
          </p>
          <h1 className="font-display text-5xl md:text-6xl mb-3">
            {g.heroTitle}
          </h1>
          <p className="text-[#a8bdc9] max-w-md mx-auto">{g.heroSub}</p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-6">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`text-xs font-semibold px-5 py-2.5 rounded-full transition-all ${
                activeCategory === cat.key
                  ? "bg-[#1b4d6e] text-white shadow-sm"
                  : "bg-white text-[#6b6355] border border-[#d6cdb8] hover:text-[#1b4d6e]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Photo Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setLightboxIndex(index)}
              className="group relative overflow-hidden rounded-lg bg-[#d6cdb8] aspect-[4/3] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4a8fa3]"
            >
              <img
                src={photo.thumb}
                alt={photo.alt[lang]}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#1b4d6e]/0 group-hover:bg-[#1b4d6e]/30 transition-colors flex items-end p-3">
                <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium drop-shadow">
                  🔍 {photo.alt[lang]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      <Lightbox
        images={filteredPhotos.map((p) => ({ src: p.url, alt: p.alt }))}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />

      <Footer />
    </main>
  )
}
