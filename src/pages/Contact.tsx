import { useState } from "react"
import Footer from "../components/Footer"
import SEO from "../components/SEO"
import BookingForm from "../components/BookingForm"
import { useLang } from "../LanguageContext"
import { site, waLink, defaultWaMessage } from "../site"

export default function Contact() {
  const { tr } = useLang()
  const c = tr.contact
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <main className="pt-16 min-h-screen bg-[#f7f4ef]">
      <SEO
        title={c.heroTitle}
        description={c.heroSub}
        url={window.location.href}
      />

      {/* Hero */}
      <section className="relative h-64 bg-[#1b4d6e] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1577978080965-0c295bd5953f?w=1600&h=400&fit=crop&auto=format"
          alt="Calm ocean water"
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 text-center text-white px-6">
          <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-3 font-medium">
            {c.tag}
          </p>
          <h1 className="font-display text-5xl md:text-6xl mb-3">
            {c.heroTitle}
          </h1>
          <p className="text-[#a8bdc9]">{c.heroSub}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-16">
        {/* Left: Reusable Booking Form */}
        <div>
          <BookingForm />

          <div className="mt-6 bg-[#e8f5e8] border border-[#a8d5a8] rounded-lg p-4 flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">
              💬
            </span>
            <div>
              <p className="text-sm font-medium text-[#2d6a2d]">
                {c.whatsappTitle}
              </p>
              <a
                href={waLink(defaultWaMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#2d6a2d] underline underline-offset-2"
              >
                {c.whatsappLink} ({site.phoneDisplay})
              </a>
            </div>
          </div>
        </div>

        {/* Right: Location Map, Info, FAQs */}
        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-4 font-medium">
              {c.findUs}
            </p>
            <div className="rounded-lg overflow-hidden h-80 w-full border border-[#d6cdb8] shadow-sm bg-[#ede8df]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3898.179876253657!2d-76.8473174!3d-12.3036704!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105a31d68c3dfe5%3A0xd03b063ef7c77cc1!2sLos%20Suspiros%20del%20Mar!5e0!3m2!1sen!2spe!4v1789997546502!5m2!1sen!2spe"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Los Suspiros del Mar Location Map"
              ></iframe>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: c.infoLabels.phone,
                value: site.phoneDisplay,
                href: site.phoneHref,
              },
              {
                label: c.infoLabels.email,
                value: site.email,
                href: `mailto:${site.email}`,
              },
              {
                label: c.infoLabels.checkin,
                value: c.infoValues.checkin,
                href: null,
              },
              {
                label: c.infoLabels.checkout,
                value: c.infoValues.checkout,
                href: null,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white border border-[#d6cdb8] rounded-lg p-4"
              >
                <p className="text-xs text-[#6b6355] uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-sm text-[#1b4d6e] font-medium hover:text-[#4a8fa3] break-all"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm text-[#1b4d6e] font-medium">
                    {item.value}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-4 font-medium">
              {c.faqTitle}
            </p>
            <div className="space-y-2">
              {c.faqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#d6cdb8] rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    aria-controls={`faq-panel-${i}`}
                    className="w-full flex justify-between items-center px-4 py-3.5 text-left text-sm font-medium text-[#1b4d6e] hover:bg-[#ede8df] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a8fa3]"
                  >
                    {faq.q}
                    <span
                      className="ml-2 shrink-0 text-[#4a8fa3]"
                      aria-hidden="true"
                    >
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div
                      id={`faq-panel-${i}`}
                      className="px-4 pb-4 text-sm text-[#6b6355] leading-relaxed border-t border-[#d6cdb8] pt-3"
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
