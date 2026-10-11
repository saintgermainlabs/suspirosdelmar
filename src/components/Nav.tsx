import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useLang } from "../LanguageContext"

export default function Nav() {
  const [open, setOpen] = useState(false)
  const { lang, setLang, tr } = useLang()
  const navigate = useNavigate()

  const links = [
    { label: tr.nav.rooms, path: "/rooms" },
    { label: tr.nav.experiences, path: "/experiences" },
    { label: tr.nav.gallery, path: "/gallery" },
    { label: tr.nav.about, path: "/about" },
    { label: tr.nav.contact, path: "/contact" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f7f4ef]/90 backdrop-blur-md border-b border-[#d6cdb8]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          aria-label={`Los Suspiros del Mar — ${tr.nav.home}`}
          className="flex items-center gap-2 font-display text-[#1b4d6e] hover:opacity-80 transition-opacity shrink-0"
        >
          <img src="/assets/logo-wave.svg" alt="" width="40" height="40" className="h-9 w-9 sm:h-10 sm:w-10" />
          <span className="flex flex-col">
            <span className="text-base sm:text-lg font-semibold leading-tight">Los Suspiros</span>
            <span className="text-xs tracking-[0.2em] leading-tight">del Mar</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <NavLink
              key={l.path}
              to={l.path}
              end={l.path === "/"}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a8fa3] rounded ${
                  isActive
                    ? "text-[#1b4d6e] font-semibold"
                    : "text-[#6b6355] hover:text-[#1b4d6e]"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}

          {/* Language switcher */}
          <div className="flex items-center gap-1 border border-[#d6cdb8] rounded-full px-1 py-1 ml-2">
            <button
              onClick={() => setLang("es")}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                lang === "es"
                  ? "bg-[#1b4d6e] text-white"
                  : "text-[#6b6355] hover:text-[#1b4d6e]"
              }`}
            >
              ES
            </button>
            <button
              onClick={() => setLang("en")}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                lang === "en"
                  ? "bg-[#1b4d6e] text-white"
                  : "text-[#6b6355] hover:text-[#1b4d6e]"
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={() => navigate("/contact")}
            className="ml-1 bg-[#1b4d6e] text-white text-sm font-medium px-5 py-2.5 rounded hover:bg-[#4a8fa3] transition-colors"
          >
            {tr.nav.bookNow}
          </button>
        </nav>

        {/* Mobile right side */}
        <div className="md:hidden flex items-center gap-3">
          <div className="flex items-center gap-1 border border-[#d6cdb8] rounded-full px-1 py-1">
            <button
              onClick={() => setLang("es")}
              className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-all ${
                lang === "es" ? "bg-[#1b4d6e] text-white" : "text-[#6b6355]"
              }`}
            >
              ES
            </button>
            <button
              onClick={() => setLang("en")}
              className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-all ${
                lang === "en" ? "bg-[#1b4d6e] text-white" : "text-[#6b6355]"
              }`}
            >
              EN
            </button>
          </div>
          <button
            className="text-[#1b4d6e] p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a8fa3] rounded"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? (
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
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden bg-[#f7f4ef] border-t border-[#d6cdb8] px-6 py-4 flex flex-col gap-4"
        >
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              onClick={() => setOpen(false)}
              className="text-left text-sm font-medium text-[#6b6355] hover:text-[#1b4d6e]"
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => {
              navigate("/contact")
              setOpen(false)
            }}
            className="bg-[#1b4d6e] text-white text-sm font-medium px-5 py-2.5 rounded w-fit"
          >
            {tr.nav.bookNow}
          </button>
        </div>
      )}
    </header>
  )
}
