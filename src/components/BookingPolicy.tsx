import { useLang } from "../LanguageContext"
import { TIDYCAL_PATH } from "../data/tidycal"
import { requiresAdvanceDeposit } from "../utils/dates"

export default function BookingPolicy({ checkin }: { checkin: string }) {
  const { tr } = useLang()
  const p = tr.bookingPolicy
  return (
    <div className="space-y-4">
      <section aria-live="polite" className="rounded-lg border border-[#d6cdb8] bg-[#faf6ef] p-4 text-sm">
        <h3 className="font-medium text-[#1b4d6e]">{p.title}</h3>
        <p className="mt-2 text-[#6b6355]">{p.advance}</p>
        {!requiresAdvanceDeposit(checkin) && <p className="mt-2 text-[#6b6355]">{checkin ? p.nearby : p.chooseDates}</p>}
      </section>
      <section className="rounded-lg border border-[#d6cdb8] p-4 text-sm">
        <h3 className="font-medium text-[#1b4d6e]">{p.viewingTitle}</h3>
        <p className="mt-2 text-[#6b6355]">{p.viewingDescription}</p>
        <a href={`https://tidycal.com/${TIDYCAL_PATH}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[#1b4d6e] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">{p.viewingLink}</a>
      </section>
    </div>
  )
}
