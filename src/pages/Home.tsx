import SiteImage from "../components/SiteImage"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Footer from "../components/Footer"
import SEO from "../components/SEO"
import { useLang } from "../LanguageContext"
import heroImg from "../imports/dlirr.jpg"
import { previewPhotos } from "../galleryData"
import { roomsData } from "../data/roomsData"
import { localDateString, nextDate } from "../utils/dates"

export default function Home() {
  const { tr, lang } = useLang()
  const navigate = useNavigate()
  const h = tr.home

  const [form, setForm] = useState({
    checkin: "",
    checkout: "",
    guests: "2",
    roomIndex: "",
  })

  const highlights = [
    { icon: "🌊", title: h.highlightTitle1, desc: h.highlightDesc1 },
    { icon: "🏠", title: h.highlightTitle2, desc: h.highlightDesc2 },
    { icon: "🛏️", title: h.highlightTitle3, desc: h.highlightDesc3 },
    { icon: "🌿", title: h.highlightTitle4, desc: h.highlightDesc4 },
  ]

  const todayStr = localDateString()
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 3)
  const maxDateStr = localDateString(maxDate)
  const checkoutMin = nextDate(form.checkin || todayStr)

  const handleDateInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      if (
        "showPicker" in e.currentTarget &&
        typeof e.currentTarget.showPicker === "function"
      ) {
        e.currentTarget.showPicker()
      }
    } catch (_) {
      // Fallback
    }
  }

  const handleBookSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    let targetPath = "/contact"
    if (form.roomIndex === "4") {
      targetPath = "/apartment"
    } else if (form.roomIndex !== "") {
      const targetRoom = roomsData[Number(form.roomIndex)]
      if (targetRoom) {
        targetPath = `/rooms/${targetRoom.slug}`
      }
    }
    navigate(targetPath, {
      state: {
        checkin: form.checkin,
        checkout: form.checkout,
        guests: form.guests,
      },
    })
  }

  return (
    <main className="pt-16 min-h-screen bg-[#f7f4ef]">
      <SEO
        title={lang === "es" ? "Hotel en Playa Arica, Lurín, Lima" : "Beach Hotel in Playa Arica, Lurín, Lima"}
        description={`${h.heroDesc} ${h.location}`}
        url={window.location.origin}
      />

      {/* Hero */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-[#1b4d6e]">
        <SiteImage loading="eager" fetchPriority="high" sizes="100vw"
          src={heroImg}
          alt="Sunset at Los Suspiros del Mar"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b4d6e]/40 via-transparent to-[#1a1714]/70" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto fade-up">
          <p className="text-[#d6cdb8] text-sm uppercase tracking-widest mb-4 font-medium">
            {h.location}
          </p>
          <h1 className="font-display text-5xl md:text-7xl text-white leading-tight mb-6">
            Los Suspiros
            <br />
            <em>del Mar</em>
          </h1>
          <p className="text-[#d6cdb8] text-lg md:text-xl font-light max-w-xl mx-auto mb-3">
            {h.heroSub}
          </p>
          <p className="text-[#a8bdc9] text-base font-light max-w-lg mx-auto mb-10">
            {h.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/contact")}
              className="bg-[#4a8fa3] hover:bg-white hover:text-[#1b4d6e] text-white font-medium px-8 py-3.5 rounded transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-md"
            >
              {h.cta1}
            </button>
            <button
              onClick={() => navigate("/rooms")}
              className="border border-white/50 text-white hover:bg-white/10 font-medium px-8 py-3.5 rounded transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {h.cta2}
            </button>
          </div>
        </div>
      </section>

      {/* Quick Reservation Search Bar */}
      <section
        className="max-w-5xl mx-auto px-6 -mt-12 relative z-20"
        aria-label={h.bookTitle}
      >
        <form onSubmit={handleBookSubmit} className="bg-white shadow-xl rounded-lg p-6 border border-[#d6cdb8]">
          <p className="text-xs uppercase tracking-widest text-[#6b6355] mb-4 font-medium">
            {h.bookTitle}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="home-checkin"
                className="block text-xs text-[#6b6355] mb-1"
              >
                {h.checkin}
              </label>
              <input
                id="home-checkin"
                type="date"
                min={todayStr}
                max={maxDateStr}
                required
                value={form.checkin}
                onClick={handleDateInputClick}
                onChange={(e) => setForm({ ...form, checkin: e.target.value, checkout: form.checkout > e.target.value ? form.checkout : "" })}
                className="w-full border border-[#d6cdb8] rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4a8fa3] cursor-pointer"
              />
            </div>
            <div>
              <label
                htmlFor="home-checkout"
                className="block text-xs text-[#6b6355] mb-1"
              >
                {h.checkout}
              </label>
              <input
                id="home-checkout"
                type="date"
                required
                value={form.checkout}
                min={checkoutMin}
                max={maxDateStr}
                onClick={handleDateInputClick}
                onChange={(e) => setForm({ ...form, checkout: e.target.value })}
                className="w-full border border-[#d6cdb8] rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4a8fa3] cursor-pointer"
              />
            </div>
            <div>
              <label
                htmlFor="home-guests"
                className="block text-xs text-[#6b6355] mb-1"
              >
                {h.guests}
              </label>
              <select
                id="home-guests"
                value={form.guests}
                onChange={(e) => setForm({ ...form, guests: e.target.value })}
                className="w-full border border-[#d6cdb8] rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4a8fa3]"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? h.guest : h.guestsPlural}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="home-room"
                className="block text-xs text-[#6b6355] mb-1"
              >
                {h.roomType}
              </label>
              <select
                id="home-room"
                value={form.roomIndex}
                onChange={(e) =>
                  setForm({ ...form, roomIndex: e.target.value })
                }
                className="w-full border border-[#d6cdb8] rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4a8fa3]"
              >
                <option value="">{h.anyRoom}</option>
                {tr.contact.roomOptions.map((o, i) => (
                  <option key={o} value={i}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-[#1b4d6e] hover:bg-[#4a8fa3] text-white font-medium px-8 py-3 rounded transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a8fa3] shadow-sm"
            >
              {h.checkAvail}
            </button>
          </div>
        </form>
      </section>

      {/* Highlights */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((hh) => (
            <div
              key={hh.title}
              className="group bg-white border border-[#d6cdb8] rounded-lg p-6 hover:border-[#4a8fa3] hover:shadow-md transition-all"
            >
              <span className="text-3xl" aria-hidden="true">
                {hh.icon}
              </span>
              <h3 className="font-display text-lg text-[#1b4d6e] mt-3 mb-2">
                {hh.title}
              </h3>
              <p className="text-sm text-[#6b6355] leading-relaxed">
                {hh.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-4 font-medium">
            {h.escapeTag}
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-[#1b4d6e] leading-tight mb-6 whitespace-pre-line">
            {h.escapeTitle}
          </h2>
          <p className="text-[#6b6355] leading-relaxed mb-4">{h.escapeP1}</p>
          <p className="text-[#6b6355] leading-relaxed mb-8">{h.escapeP2}</p>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-[#1b4d6e] font-medium border-b border-[#1b4d6e] pb-0.5 hover:text-[#4a8fa3] hover:border-[#4a8fa3] transition-colors text-sm"
          >
            {h.exploreRooms}
          </Link>
        </div>
        <div className="relative">
          <SiteImage
            src="https://images.unsplash.com/photo-1764377723140-c68667675015?w=800&h=600&fit=crop&auto=format"
            alt="Coastal village at sunset"
            loading="lazy"
            decoding="async"
            className="rounded-lg w-full object-cover h-80 md:h-96 bg-[#d6cdb8] shadow-md"
          />
          <div className="absolute -bottom-5 -left-5 bg-[#1b4d6e] text-white px-5 py-4 rounded-lg shadow-lg hidden md:block">
            <p className="font-display text-2xl">{h.walkBadge}</p>
            <p className="text-xs text-[#a8bdc9]">{h.walkBadgeSub}</p>
          </div>
        </div>
      </section>

      {/* Featured rooms */}
      <section className="bg-[#ede8df] mt-24 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-2 font-medium">
                {h.accomTag}
              </p>
              <h2 className="font-display text-4xl text-[#1b4d6e]">
                {h.accomTitle}
              </h2>
            </div>
            <Link
              to="/rooms"
              className="hidden md:inline text-sm text-[#6b6355] hover:text-[#1b4d6e] underline underline-offset-4 transition-colors"
            >
              {h.seeAll}
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roomsData.slice(0, 4).map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-lg overflow-hidden border border-[#d6cdb8] hover:shadow-lg transition-shadow group flex flex-col justify-between"
              >
                <div>
                  <Link
                    to={`/rooms/${r.slug}`}
                    className="overflow-hidden h-52 bg-[#d6cdb8] block"
                  >
                    <SiteImage
                      src={r.images.hero}
                      alt={r.title[lang]}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="p-5">
                    <h3 className="font-display text-lg text-[#1b4d6e] mb-1">
                      <Link
                        to={`/rooms/${r.slug}`}
                        className="hover:text-[#4a8fa3] transition-colors"
                      >
                        {r.title[lang]}
                      </Link>
                    </h3>
                    <p className="text-[#4a8fa3] text-sm font-medium mb-4">
                      {tr.rooms.from} {r.price} /{" "}
                      {tr.rooms.fromNight.replace("/ ", "")}
                    </p>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <Link
                    to={`/rooms/${r.slug}`}
                    className="text-xs uppercase tracking-wider text-[#1b4d6e] hover:text-[#4a8fa3] font-semibold transition-colors"
                  >
                    {h.viewDetails}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Apartment */}
      <section className="bg-white py-20 border-t border-[#ede8df]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            {/* Left side: Image Grid */}
            <div className="w-full md:w-1/2 space-y-4">
              <Link
                to="/apartment"
                className="overflow-hidden rounded-lg h-80 md:h-96 bg-[#d6cdb8] shadow-sm block group"
              >
                <SiteImage
                  src="/images/Appartment_Bedroom_View1.jpg"
                  alt="Apartment Bedroom"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </Link>
              <div className="grid grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-lg h-40 bg-[#d6cdb8] shadow-sm">
                  <SiteImage
                    src="/images/Appartment_Kitchen.jpg"
                    alt="Apartment Kitchen"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-lg h-40 bg-[#d6cdb8] shadow-sm">
                  <SiteImage
                    src="/images/Appartment_Bathroom.jpg"
                    alt="Apartment Bathroom"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right side: Apartment Info */}
            <div className="w-full md:w-1/2">
              <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-2 font-medium">
                {h.apartmentsTag}
              </p>
              <h2 className="font-display text-4xl text-[#1b4d6e] mb-4">
                <Link
                  to="/apartment"
                  className="hover:text-[#4a8fa3] transition-colors"
                >
                  {roomsData[4].title[lang]}
                </Link>
              </h2>
              <p className="text-lg italic text-[#4a8fa3] font-light mb-6">
                {roomsData[4].tagline[lang]}
              </p>

              <div className="flex items-center gap-6 text-sm text-[#6b6355] mb-6 border-y border-[#ede8df] py-3">
                <span className="flex items-center gap-1.5" aria-hidden="true">
                  👥 {roomsData[4].capacity[lang]}
                </span>
                <span className="flex items-center gap-1.5" aria-hidden="true">
                  🛏️ {roomsData[4].bed[lang]}
                </span>
              </div>

              <p className="text-[#6b6355] leading-relaxed mb-6">
                {roomsData[4].desc[lang]}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {roomsData[4].amenities[lang].map((a) => (
                  <span
                    key={a}
                    className="text-xs bg-[#ede8df] text-[#6b6355] px-3 py-1.5 rounded-full font-medium"
                  >
                    {a}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#ede8df]">
                <div>
                  <span className="text-sm text-[#6b6355] block">
                    {tr.rooms.from}
                  </span>
                  <span className="text-3xl font-display text-[#1b4d6e] font-semibold">
                    {roomsData[4].price}
                  </span>
                  <span className="text-sm text-[#6b6355] ml-1">
                    / {tr.rooms.fromNight.replace("/ ", "").replace("/", "")}
                  </span>
                </div>
                <Link
                  to="/apartment"
                  className="bg-[#1b4d6e] hover:bg-[#4a8fa3] text-white text-sm font-medium px-8 py-3.5 rounded transition-colors shadow-sm"
                >
                  {h.seeApartment}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-2 font-medium">
              {tr.gallery.sectionTag}
            </p>
            <h2 className="font-display text-4xl text-[#1b4d6e]">
              {tr.gallery.sectionTitle}
            </h2>
          </div>
          <Link
            to="/gallery"
            className="hidden md:inline text-sm text-[#6b6355] hover:text-[#1b4d6e] underline underline-offset-4 transition-colors"
          >
            {tr.gallery.viewAll}
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {previewPhotos.map((photo, i) => (
            <Link
              key={photo.id}
              to="/gallery"
              className={`group relative overflow-hidden rounded-lg bg-[#d6cdb8] cursor-pointer ${
                i === 0 ? "col-span-2 row-span-2" : ""
              }`}
              style={{ aspectRatio: i === 0 ? "4/3" : "1/1" }}
            >
              <SiteImage
                src={photo.thumb}
                alt={photo.alt.en}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#1b4d6e]/0 group-hover:bg-[#1b4d6e]/20 transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="bg-[#1b4d6e] py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-4 font-medium">
              {h.locationTag}
            </p>
            <h2 className="font-display text-4xl mb-6">{h.locationTitle}</h2>
            <p className="text-[#a8bdc9] leading-relaxed mb-6">{h.locationP}</p>
            <div className="space-y-3">
              {h.nearbyItems.map(([icon, label, dist]) => (
                <div key={label as string} className="flex items-center gap-4">
                  <span className="text-xl" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="text-[#d6cdb8] text-sm">{label}</span>
                  <span className="ml-auto text-xs text-[#4a8fa3] font-medium">
                    {dist}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/contact")}
              className="mt-8 bg-[#4a8fa3] hover:bg-white hover:text-[#1b4d6e] text-white font-medium px-7 py-3 rounded transition-all text-sm shadow-sm"
            >
              {h.getDirections}
            </button>
          </div>
          <div className="relative h-72 md:h-96 bg-[#4a8fa3]/20 rounded-lg overflow-hidden shadow-xl">
            <SiteImage
              src="https://images.unsplash.com/photo-1569872809440-a424ae8eced0?w=800&h=600&fit=crop&auto=format"
              alt="Rocky coast at sunset"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur rounded-lg px-5 py-4 text-center shadow-xl">
                <p className="font-display text-[#1b4d6e] font-semibold">
                  Los Suspiros del Mar
                </p>
                <p className="text-xs text-[#6b6355] mt-1">{h.mapAddress}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Los Suspiros del Mar, " + h.mapAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-[#4a8fa3] underline"
                >
                  {h.openMaps}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center max-w-2xl mx-auto px-6">
        <h2 className="font-display text-4xl md:text-5xl text-[#1b4d6e] mb-4">
          <em>{h.ctaTitle}</em>
        </h2>
        <p className="text-[#6b6355] mb-8">{h.ctaDesc}</p>
        <button
          onClick={() => navigate("/contact")}
          className="bg-[#1b4d6e] hover:bg-[#4a8fa3] text-white font-medium px-10 py-4 rounded transition-colors text-sm shadow-sm"
        >
          {h.ctaBtn}
        </button>
      </section>

      <Footer />
    </main>
  )
}
