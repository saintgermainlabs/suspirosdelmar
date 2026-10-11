import { Link } from "react-router-dom"
import { useLang } from "../LanguageContext"
import { site } from "../site"

export default function Footer({
  onNavigate,
}: {
  onNavigate?: (p: any) => void
}) {
  const { tr } = useLang()
  const f = tr.footer

  const links = [
    { label: tr.nav.home, path: "/" },
    { label: tr.nav.rooms, path: "/rooms" },
    { label: tr.nav.experiences, path: "/experiences" },
    { label: tr.nav.gallery, path: "/gallery" },
    { label: tr.nav.about, path: "/about" },
    { label: tr.nav.contact, path: "/contact" },
  ]

  return (
    <footer className="bg-[#1a1714] text-[#a8bdc9] pt-16 pb-12 border-t border-[#d6cdb8]/20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#a8bdc9]/10">
        <div className="md:col-span-2 space-y-4">
          <Link
            to="/"
            className="font-display text-2xl text-white tracking-wide flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/favicon.svg" alt="" width="52" height="52" />
            <span>Los Suspiros del Mar</span>
          </Link>
          <p className="text-sm leading-relaxed max-w-md text-[#a8bdc9]">
            {f.tagline}
          </p>
          <p className="text-xs italic text-[#4a8fa3] font-serif">{f.quote}</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">
            {f.navigate}
          </h4>
          <ul className="space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.path}>
                <Link
                  to={l.path}
                  className="hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">
            {f.contact}
          </h4>
          <div className="space-y-2 text-sm">
            <p className="text-white font-medium">{site.address}</p>
            <p>
              <a
                href={site.phoneHref}
                className="hover:text-white transition-colors"
              >
                {site.phoneDisplay}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${site.email}`}
                className="hover:text-white transition-colors"
              >
                {site.email}
              </a>
            </p>
            <p className="text-xs text-[#a8bdc9]/70 pt-2">{f.checkin}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#a8bdc9]/60 gap-4">
        <p>{f.rights}</p>
        <div className="flex gap-4">
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Instagram
          </a>
          <a
            href={site.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Facebook
          </a>
          <a
            href={site.social.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            TikTok
          </a>
        </div>
      </div>
    </footer>
  )
}
