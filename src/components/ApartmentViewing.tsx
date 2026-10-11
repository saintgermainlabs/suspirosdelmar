import { useEffect, useRef } from "react"
import { useLang } from "../LanguageContext"
import { TIDYCAL_PATH } from "../data/tidycal"

export default function ApartmentViewing() {
  const { tr } = useLang()
  const c = tr.apartmentViewing
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = container.current!
    const embed = document.createElement("div")
    embed.className = "tidycal-embed"
    embed.dataset.path = TIDYCAL_PATH
    const script = document.createElement("script")
    script.src = "https://asset-tidycal.b-cdn.net/js/embed.js"
    script.async = true
    host.append(embed, script)
    return () => { host.replaceChildren() }
  }, [])

  return (
    <section id="apartment-viewing" aria-labelledby="apartment-viewing-title" className="max-w-7xl mx-auto px-6 pb-16 scroll-mt-24">
      <div className="rounded-xl border border-[#d6cdb8] bg-white p-6 md:p-10 shadow-sm">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#4a8fa3]">{c.tag}</p>
        <h2 id="apartment-viewing-title" className="font-display text-3xl text-[#1b4d6e] md:text-4xl">{c.title}</h2>
        <p className="mt-3 max-w-2xl text-[#6b6355]">{c.description}</p>
        <div ref={container} className="mt-6 min-h-[600px]" />
        <a href={`https://tidycal.com/${TIDYCAL_PATH}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-[#1b4d6e] underline underline-offset-4">{c.openNewTab}</a>
      </div>
    </section>
  )
}
