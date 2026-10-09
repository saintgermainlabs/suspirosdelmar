import { Link } from "react-router-dom"
import { useLang } from "../LanguageContext"
import SEO from "../components/SEO"
import Footer from "../components/Footer"

export default function NotFound() {
  const { lang, tr } = useLang()
  const title = lang === "es" ? "Página no encontrada" : "Page not found"
  const description = lang === "es" ? "No encontramos esta página. Vuelve al inicio para explorar nuestras habitaciones." : "We couldn't find this page. Return home to explore our rooms."
  return (
    <main className="pt-16 min-h-screen bg-[#f7f4ef]">
      <SEO title={title} description={description} noindex />
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-[#4a8fa3] text-lg mb-4">404</p>
        <h1 className="font-display text-4xl text-[#1b4d6e] mb-6">{title}</h1>
        <p className="text-[#6b6355] mb-8">{description}</p>
        <Link to="/" className="inline-block rounded bg-[#1b4d6e] text-white px-6 py-3 focus-visible:outline-2 focus-visible:outline-offset-4">{tr.nav.home}</Link>
      </section>
      <Footer />
    </main>
  )
}
