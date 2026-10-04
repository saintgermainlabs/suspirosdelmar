import { useNavigate } from "react-router-dom"
import Footer from "../components/Footer"
import SEO from "../components/SEO"
import { useLang } from "../LanguageContext"

export default function About() {
  const { tr } = useLang()
  const navigate = useNavigate()
  const a = tr.about

  return (
    <main className="pt-16 min-h-screen bg-[#f7f4ef]">
      <SEO
        title={a.heroTitle}
        description={a.heroSub}
        url={window.location.href}
      />

      <section className="relative h-72 md:h-96 bg-[#1b4d6e] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop&auto=format"
          alt="Calm sea shore at dusk"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b4d6e]/30 to-[#1b4d6e]/60" />
        <div className="relative z-10 text-center text-white px-6">
          <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-3 font-medium">
            {a.tag}
          </p>
          <h1 className="font-display text-5xl md:text-6xl mb-3">
            {a.heroTitle}
          </h1>
          <p className="text-[#a8bdc9] max-w-md mx-auto">{a.heroSub}</p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-2 font-medium">
            {a.storyTag}
          </p>
          <h2 className="font-display text-4xl text-[#1b4d6e]">
            {a.storyTitle}
          </h2>
        </div>
        <div className="space-y-6 text-[#6b6355] leading-relaxed text-base">
          <p>{a.storyP1}</p>
          <p>{a.storyP2}</p>
          <p>{a.storyP3}</p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#ede8df] py-20 border-y border-[#d6cdb8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-2 font-medium">
              {a.valuesTag}
            </p>
            <h2 className="font-display text-4xl text-[#1b4d6e]">
              {a.valuesTitle}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {a.values.map((v) => (
              <div
                key={v.title}
                className="bg-white border border-[#d6cdb8] rounded-lg p-6 shadow-sm"
              >
                <span className="text-3xl" aria-hidden="true">
                  {v.icon}
                </span>
                <h3 className="font-display text-lg text-[#1b4d6e] mt-3 mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-[#6b6355] leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-2 font-medium">
            {a.teamTag}
          </p>
          <h2 className="font-display text-4xl text-[#1b4d6e]">
            {a.teamTitle}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {a.team.map((member) => (
            <div
              key={member.name}
              className="bg-white border border-[#d6cdb8] rounded-lg p-8 shadow-sm"
            >
              <h3 className="font-display text-2xl text-[#1b4d6e] mb-1">
                {member.name}
              </h3>
              <p className="text-xs uppercase tracking-widest text-[#4a8fa3] font-medium mb-4">
                {member.role}
              </p>
              <p className="text-sm text-[#6b6355] leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center max-w-2xl mx-auto px-6">
        <h2 className="font-display text-3xl md:text-4xl text-[#1b4d6e] mb-4">
          <em>{a.ctaTitle}</em>
        </h2>
        <p className="text-[#6b6355] mb-8">{a.ctaDesc}</p>
        <button
          onClick={() => navigate("/contact")}
          className="bg-[#1b4d6e] hover:bg-[#4a8fa3] text-white font-medium px-10 py-4 rounded transition-colors text-sm shadow-sm"
        >
          {a.ctaBtn}
        </button>
      </section>

      <Footer />
    </main>
  )
}
