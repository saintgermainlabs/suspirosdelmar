import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { useLang } from "../LanguageContext"
import HoldCountdown from "../components/HoldCountdown"
import { casitaRequest, openCheckout, paymentError, readBooking } from "../utils/casita"
import type { BookingStatus, SavedBooking } from "../utils/casita"

export default function BookingResult() {
  const { ref = "" } = useParams()
  return <Result key={ref} bookingRef={ref} />
}

function Result({ bookingRef }: { bookingRef: string }) {
  const { tr } = useLang()
  const p = tr.payments
  const routeState = useLocation().state as { booking?: SavedBooking; startCheckout?: boolean } | null
  const [saved] = useState(() => readBooking(bookingRef) ?? routeState?.booking ?? null)
  const [emailInput, setEmailInput] = useState(saved?.email ?? "")
  const [email, setEmail] = useState(saved?.email ?? "")
  const [status, setStatus] = useState<BookingStatus | null>(null)
  const [error, setError] = useState<keyof typeof p | null>(null)
  const [checkoutError, setCheckoutError] = useState<keyof typeof p | null>(null)
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [refresh, setRefresh] = useState(0)
  const checkoutStarted = useRef(false)
  const expiresAt = saved?.hold.holdExpiresAt || status?.holdExpiresAt || status?.payment?.expiresAt
  const confirmed = status?.status === "confirmed" || status?.status === "paid_in_full"
  const cancelled = status?.status === "cancelled"
  const expired = status?.status === "expired" || Boolean(expiresAt && Date.parse(expiresAt) <= now)
  const canPay = Boolean(email && !confirmed && !cancelled && !expired && (saved || status?.status === "hold"))

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!email) return
    const controller = new AbortController()
    let timer: number | undefined
    let failures = 0
    async function poll() {
      try {
        const result = await casitaRequest<BookingStatus>(`/bookings/${encodeURIComponent(bookingRef)}?${new URLSearchParams({ email })}`, { signal: controller.signal })
        if (controller.signal.aborted) return
        if (!["hold", "confirmed", "paid_in_full", "cancelled", "expired"].includes(result.status)) throw new Error("Invalid booking status")
        setStatus(result)
        setError(null)
        failures = 0
        if (result.status !== "hold") return
      } catch (err) {
        if (controller.signal.aborted) return
        setError(paymentError(err))
        failures += 1
        if (failures >= 3) return
      }
      if (!controller.signal.aborted) timer = window.setTimeout(poll, failures ? 10000 : 2500)
    }
    void poll()
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [bookingRef, email, refresh])

  async function checkout() {
    if (busy || !canPay) return
    setBusy(true)
    setCheckoutError(null)
    try { await openCheckout(bookingRef, email) }
    catch (err) { const key = paymentError(err); setCheckoutError(key === "service" ? "checkoutError" : key) }
    finally { setBusy(false) }
  }

  useEffect(() => {
    if (routeState?.startCheckout && saved && !checkoutStarted.current) {
      checkoutStarted.current = true
      void checkout()
    }
  }, [])

  const amounts = status || saved?.hold
  const currency = saved?.hold.provider === "paypal" ? "$ " : saved?.hold.provider === "mercadopago" ? "S/ " : ""
  const checkIn = status?.checkIn || saved?.checkIn
  const checkOut = status?.checkOut || saved?.checkOut
  return <main className="mx-auto max-w-2xl px-4 py-12 md:py-20">
    <section className="rounded-2xl border border-[#d6cdb8] bg-[#faf6ef] p-6 shadow-sm md:p-10" aria-busy={busy}>
      <h1 className="font-display text-3xl text-[#1b4d6e]" aria-live="polite">{confirmed ? p.confirmed : cancelled ? p.cancelled : expired ? p.expired : p.pending}</h1>
      <p className="mt-4 break-words text-sm">{p.reference}: <strong>{bookingRef}</strong></p>
      {email ? <>
        {!confirmed && !cancelled && !expired && <p className="my-4 text-sm text-[#6b6355]">{p.pendingHint}</p>}
        {(checkIn || checkOut) && <p className="my-4 text-sm">{tr.contact.fields.checkin}: {checkIn} · {tr.contact.fields.checkout}: {checkOut}</p>}
        {amounts && <dl className="my-6 space-y-2 rounded-xl bg-white p-4 text-sm">{([['total', amounts.total], ['deposit', amounts.deposit], ['balance', amounts.balance], ...(status ? [['paid', status.amountPaid]] : [])] as ["total" | "deposit" | "balance" | "paid", number][]).map(([key, amount]) => <div key={key} className="flex justify-between gap-4"><dt>{p[key]}</dt><dd>{currency}{amount.toFixed(2)}</dd></div>)}</dl>}
        {!confirmed && !cancelled && expiresAt && <HoldCountdown expiresAt={expiresAt} />}
        {error && <p role="alert" className="my-4 text-[#a84632]">{p[error]} <button className="underline" onClick={() => { setError(null); setRefresh(r => r + 1) }}>{p.retry}</button></p>}
        {checkoutError && <p role="alert" className="my-4 text-[#a84632]">{p[checkoutError]}</p>}
        {!confirmed && !cancelled && !expired && <button disabled={busy || !canPay} onClick={checkout} className="mt-5 w-full rounded-lg bg-[#d8755b] px-5 py-3 font-medium text-white hover:bg-[#bd6048] disabled:opacity-50">{busy ? p.processing : p.continue}</button>}
        {error === "notFound" && <button onClick={() => { setEmail(""); setStatus(null); setError(null) }} className="mt-4 underline">{p.emailPrompt}</button>}
      </> : <form onSubmit={e => { e.preventDefault(); setError(null); setStatus(null); setEmail(emailInput.trim()) }} className="my-6 space-y-4">
        <p>{p.emailPrompt}</p>
        <label className="block text-sm">{tr.contact.fields.email}<input required type="email" autoComplete="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} className="mt-1 w-full rounded-lg border border-[#d6cdb8] bg-white p-3" /></label>
        <button className="rounded-lg bg-[#d8755b] px-5 py-3 text-white">{p.check}</button>
      </form>}
      {(expired || cancelled) && !confirmed && <Link className="mt-6 inline-block rounded-lg bg-[#d8755b] px-5 py-3 text-white" to="/reservar">{p.restart}</Link>}
    </section>
  </main>
}
