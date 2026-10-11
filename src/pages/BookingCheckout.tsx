import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useLang } from "../LanguageContext"
import DatePicker from "../components/DatePicker"
import BookingPolicy from "../components/BookingPolicy"
import { localDateString, nextDate, requiresAdvanceDeposit } from "../utils/dates"
import { casita, casitaRequest, overlaps, paymentError, saveBooking } from "../utils/casita"
import type { Hold, Provider, RoomsResponse } from "../utils/casita"

export default function BookingCheckout() {
  const { lang, tr } = useLang()
  const p = tr.payments
  const f = tr.contact.fields
  const navigate = useNavigate()
  const prefill = (useLocation().state ?? {}) as { checkin?: string; checkout?: string; guests?: string; name?: string; email?: string; phone?: string }
  const [form, setForm] = useState({ roomId: "", checkIn: prefill.checkin || "", checkOut: prefill.checkout || "", guests: prefill.guests || "2", name: prefill.name || "", email: prefill.email || "", phone: prefill.phone || "" })
  const advanceDeposit = requiresAdvanceDeposit(form.checkIn)
  const [depositMismatch, setDepositMismatch] = useState(false)
  const [data, setData] = useState<RoomsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<keyof typeof p | null>(null)
  const [refresh, setRefresh] = useState(0)
  const room = data?.rooms.find(r => r.id === form.roomId)
  const today = localDateString()
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 3)
  const max = localDateString(maxDate)
  useEffect(() => {
    if (!casita.propertyId) { setLoading(false); return }
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ propertyId: casita.propertyId, from: today, to: max })
    casitaRequest<RoomsResponse>(`/rooms?${params}`, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setData(result) })
      .catch(err => { if (!controller.signal.aborted) setError(paymentError(err)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [refresh, today, max])
  const ranges = data?.unavailable?.[form.roomId] ?? []
  const field = "w-full rounded-lg border border-[#d6cdb8] bg-white px-3 py-3 text-sm focus-visible:outline-2 focus-visible:outline-[#d8755b]"
  const button = "rounded-lg bg-[#d8755b] px-5 py-3 font-medium text-white hover:bg-[#bd6048] disabled:opacity-50"

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setDepositMismatch(false)
    if (advanceDeposit && data?.property.depositPercent !== 50) { setDepositMismatch(true); return }
    const provider = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value as Provider | undefined
    if (!room || !provider || !form.name.trim() || form.checkIn < today || form.checkOut <= form.checkIn || Number(form.guests) > room.maxGuests || Number(form.guests) < 1) { setError("invalid"); return }
    if ((provider === "paypal" && (!room.bookableUsd || room.rateUsd === null)) || (provider === "mercadopago" && (!room.bookablePen || room.ratePen === null))) { setError("noRate"); return }
    if (overlaps(form.checkIn, form.checkOut, ranges)) { setError("conflict"); return }
    setBusy(true)
    setError(null)
    try {
      const params = new URLSearchParams({ propertyId: casita.propertyId, from: form.checkIn, to: form.checkOut })
      const latest = await casitaRequest<RoomsResponse>(`/rooms?${params}`)
      if (overlaps(form.checkIn, form.checkOut, latest.unavailable?.[room.id] ?? [])) { setError("conflict"); setRefresh(r => r + 1); return }
      const hold = await casitaRequest<Hold>("/bookings/hold", { method: "POST", body: JSON.stringify({ roomId: room.id, checkIn: form.checkIn, checkOut: form.checkOut, guests: Number(form.guests), guestName: form.name.trim(), guestEmail: form.email.trim(), guestPhone: form.phone.trim() || undefined, guestLang: lang, provider }) })
      if (!hold.publicRef || !Number.isFinite(Date.parse(hold.holdExpiresAt))) throw new Error("Invalid hold response")
      if (advanceDeposit && (!Number.isFinite(hold.total) || hold.total <= 0 || !Number.isFinite(hold.deposit) || Math.abs(hold.deposit - hold.total * 0.5) > 0.01)) { setDepositMismatch(true); return }
      const booking = { email: form.email.trim(), checkIn: form.checkIn, checkOut: form.checkOut, hold }
      saveBooking(booking)
      navigate(`/reserva/${encodeURIComponent(hold.publicRef)}`, { state: { booking, startCheckout: true } })
    } catch (err) { setError(paymentError(err)) } finally { setBusy(false) }
  }

  return <main className="mx-auto max-w-3xl px-4 py-12 md:py-20">
    <section className="rounded-2xl border border-[#d6cdb8] bg-[#faf6ef] p-6 shadow-sm md:p-10">
      <h1 className="font-display text-3xl text-[#1b4d6e]">{p.title}</h1>
      <p className="my-4 text-[#6b6355]">{p.intro}</p>
      <div className="mb-5"><BookingPolicy checkin={form.checkIn} /></div>
      {depositMismatch && <p role="alert" className="my-4 rounded-lg border border-[#d8755b] p-4">{tr.bookingPolicy.depositMismatch}</p>}
      {!casita.propertyId ? <><p role="status">{p.unavailable}</p><Link className="mt-5 inline-block underline" to="/contact">{tr.nav.contact}</Link></> : <>
        {loading && <p role="status">{p.loading}</p>}
        {error && <div role="alert" className="my-4 rounded-lg border border-[#d8755b] p-4">{p[error]} {!data && <button className="ml-3 underline" onClick={() => setRefresh(r => r + 1)}>{p.retry}</button>}</div>}
        {!loading && data && (data.rooms.length === 0 ? <p>{p.noRooms}</p> : <form onSubmit={submit} className="space-y-5">
          <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
            <label className="block text-sm">{f.room} *<select required value={form.roomId} className={`${field} mt-1`} onChange={e => setForm({ ...form, roomId: e.target.value, checkIn: "", checkOut: "", guests: "1" })}><option value="">{p.choose}</option>{data.rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
            {room && <div className="rounded-lg bg-white p-4 text-sm"><p>{room.ratePen !== null && `S/ ${room.ratePen.toFixed(2)} `}{room.ratePen !== null && room.rateUsd !== null && " / "}{room.rateUsd !== null && `$ ${room.rateUsd.toFixed(2)} `} · {p.nightly}</p><p className="mt-2">{p.deposit}: {data.property.depositPercent}%</p></div>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="pay-checkin" className="mb-1 block text-sm">{f.checkin} *</label><DatePicker id="pay-checkin" required value={form.checkIn} min={today} max={max} className={field} isDateDisabled={date => ranges.some(r => date >= r.start.slice(0, 10) && date < r.end.slice(0, 10))} onChange={value => setForm({ ...form, checkIn: value, checkOut: "" })} /></div>
              <div><label htmlFor="pay-checkout" className="mb-1 block text-sm">{f.checkout} *</label><DatePicker id="pay-checkout" required value={form.checkOut} min={nextDate(form.checkIn || today)} max={max} className={field} isDateDisabled={date => Boolean(form.checkIn && overlaps(form.checkIn, date, ranges))} onChange={value => setForm({ ...form, checkOut: value })} /></div>
              <label className="block text-sm">{f.guests} *<input className={`${field} mt-1`} required type="number" min="1" max={room?.maxGuests || 1} step="1" value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })} /></label>
              <label className="block text-sm">{f.name} *<input className={`${field} mt-1`} required autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
              <label className="block text-sm">{f.email} *<input className={`${field} mt-1`} required type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
              <label className="block text-sm">{f.phone}<input className={`${field} mt-1`} type="tel" autoComplete="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(!room || room.ratePen !== null) && <button type="submit" value="mercadopago" disabled={!room?.bookablePen || loading} className={button}>{p.mp}</button>}
              {(!room || room.rateUsd !== null) && <button type="submit" value="paypal" disabled={!room?.bookableUsd || loading} className={button}>{p.paypal}</button>}
            </div>
          </fieldset>
          {form.checkIn && !advanceDeposit && <Link to="/contact" state={{ checkin: form.checkIn, checkout: form.checkOut, guests: form.guests }} className="block rounded-lg border border-[#1b4d6e] px-5 py-3 text-center text-sm font-medium text-[#1b4d6e]">{tr.bookingPolicy.arrival}</Link>}
          {busy && <p role="status">{p.processing}</p>}
        </form>)}
      </>}
    </section>
  </main>
}
