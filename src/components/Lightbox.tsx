import { useEffect } from "react"
import { useLang } from "../LanguageContext"

export interface LightboxImage {
  src: string
  alt: { en: string es: string }
  category?: string
}

export default function Lightbox({
  images,
  activeIndex,
  onClose,
  onNavigate,
}: {
  images: LightboxImage[]
  activeIndex: number | null
  onClose: () => void
  onNavigate: (index: number) => void
}) {
  const { lang, tr } = useLang()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") {
        const next = (activeIndex - 1 + images.length) % images.length
        onNavigate(next)
      }
      if (e.key === "ArrowRight") {
        const next = (activeIndex + 1) % images.length
        onNavigate(next)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    if (activeIndex !== null) {
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [activeIndex, images.length, onClose, onNavigate])

  if (activeIndex === null || !images[activeIndex]) return null

  const current = images[activeIndex]

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0d1d28]/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 select-none transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between text-white max-w-7xl mx-auto w-full z-10">
        <span className="text-xs uppercase tracking-widest text-[#a8bdc9] font-medium">
          {activeIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4a8fa3]"
          aria-label={tr.gallery.lightboxClose}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Main Image View */}
      <div
        className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.alt[lang]}
          className="max-h-full max-w-full object-contain rounded shadow-2xl transition-transform duration-300"
        />

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={() =>
              onNavigate((activeIndex - 1 + images.length) % images.length)
            }
            className="absolute left-2 md:left-6 bg-black/40 hover:bg-[#1b4d6e] text-white p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4a8fa3]"
            aria-label={tr.gallery.lightboxPrev}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={() => onNavigate((activeIndex + 1) % images.length)}
            className="absolute right-2 md:right-6 bg-black/40 hover:bg-[#1b4d6e] text-white p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4a8fa3]"
            aria-label={tr.gallery.lightboxNext}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Caption Footer */}
      <div
        className="text-center text-white/90 max-w-2xl mx-auto w-full z-10 bg-black/30 backdrop-blur rounded-lg px-4 py-3 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-medium">{current.alt[lang]}</p>
      </div>
    </div>
  )
}
