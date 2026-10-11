import { useEffect, useRef, useState } from "react"
import { useLang } from "../LanguageContext"
import { casita, casitaRequest, overlaps } from "../utils/casita"
import type { RoomsResponse } from "../utils/casita"
import { localDateString } from "../utils/dates"

interface Props {
  open: boolean
  onClose: () => void
}

export default function AvailabilityCalendar({ open, onClose }: Props) {
  const { lang, tr } = useLang()
  const c = tr.availability
  const dialog = useRef<HTMLDialogElement>(null)
  const [month, setMonth] = useState(() => localDateString().slice(0, 7))
  const [data, setData] = useState<RoomsResponse | null>(null)
  const [roomId, setRoomId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const today = localDateString()
  const [year, number] = month.split("-").map(Number)
  const from = `${month}-01`
  const to = localDateString(new Date(year, number + 1, 1))
  const locale = lang === "es" ? "es-PE" : "en-US"
  const room = data?.rooms.find(item => item.id === roomId)
  const ranges = data?.unavailable?.[roomId]

  useEffect(() => {
    if (open) {
      dialog.current?.showModal()
      const previous = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        dialog.current?.close()
        document.body.style.overflow = previous
      }
    }
  }, [open])

  useEffect(() => {
    if (!open || !casita.propertyId) return
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    setData(null)
    const params = new URLSearchParams({ propertyId: casita.propertyId, from, to })
    casitaRequest<RoomsResponse>(`/rooms?${params}`, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return
        if (!Array.isArray(result.rooms)) throw new Error("Invalid availability response")
        setData(result)
        setRoomId(previous => result.rooms.some(item => item.id === previous) ? previous : result.rooms[0]?.id || "")
      })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [open, from, to, retry])

  return (
    <dialog
      ref={dialog}
      aria-labelledby="availability-title"
      onCancel={(event) => { event.preventDefault(); onClose() }}
      className="m-auto w-[calc(100%-1rem)] max-w-6xl max-h-[94dvh] overflow-y-auto rounded-2xl border border-[#d6cdb8] bg-[#f7f4ef] p-5 text-[#1a1714] shadow-2xl backdrop:bg-[#0d1d28]/70 md:p-10"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-[#4a8fa3]">{c.tag}</p>
          <h2 id="availability-title" className="font-display text-3xl text-[#1b4d6e] md:text-4xl">{c.title}</h2>
          <p className="mt-2 text-sm text-[#6b6355]">{c.note}</p>
        </div>
        <button type="button" onClick={onClose} aria-label={c.close} className="rounded-full border border-[#d6cdb8] px-4 py-2 text-xl hover:bg-white">×</button>
      </div>
      {!casita.propertyId ? <p role="status" className="mt-8 rounded-lg bg-white p-6">{c.notConfigured}</p> : <>
        <div className="my-6 flex flex-wrap items-end justify-between gap-4">
          <label className="text-sm font-medium">{c.accommodation}
            <select value={roomId} disabled={loading || !data?.rooms.length} onChange={event => setRoomId(event.target.value)} className="mt-2 block w-full min-w-56 rounded-lg border border-[#d6cdb8] bg-white px-4 py-3">
              {!data && <option value="">{c.loading}</option>}
              {data?.rooms.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <div className="flex gap-2">
            <button type="button" aria-label={tr.datePicker.previous} disabled={month <= today.slice(0, 7)} onClick={() => setMonth(localDateString(new Date(year, number - 2, 1)).slice(0, 7))} className="rounded-lg border border-[#d6cdb8] bg-white px-5 py-3 disabled:opacity-30">←</button>
            <button type="button" aria-label={tr.datePicker.next} onClick={() => setMonth(localDateString(new Date(year, number, 1)).slice(0, 7))} className="rounded-lg border border-[#d6cdb8] bg-white px-5 py-3">→</button>
          </div>
        </div>
        {loading && <p role="status" className="py-8">{c.loading}</p>}
        {error && <div role="alert" className="rounded-lg bg-white p-6"><p>{c.error}</p><button type="button" onClick={() => setRetry(value => value + 1)} className="mt-3 underline">{tr.payments.retry}</button></div>}
        {!loading && !error && data && (!room ? <p role="status">{tr.payments.noRooms}</p> : <>
          {!Array.isArray(ranges) && <p role="status" className="mb-4 text-sm text-[#6b6355]">{c.unknown}</p>}
          <div className="grid gap-6 lg:grid-cols-2">
            {[0, 1].map(offset => {
              const first = new Date(year, number - 1 + offset, 1)
              const currentMonth = localDateString(first).slice(0, 7)
              const days = new Date(year, number + offset, 0).getDate()
              return <section key={currentMonth} className="rounded-xl border border-[#d6cdb8] bg-white p-3 md:p-5">
                <h3 className="mb-4 text-center font-display text-2xl capitalize text-[#1b4d6e]">{first.toLocaleDateString(locale, { month: "long", year: "numeric" })}</h3>
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                  {Array.from({ length: 7 }, (_, index) => <span key={`weekday-${index}`} className="pb-2 text-center text-xs text-[#6b6355]">{new Date(2024, 0, 7 + index).toLocaleDateString(locale, { weekday: "short" })}</span>)}
                  {Array.from({ length: first.getDay() }, (_, index) => <span key={`space-${index}`} />)}
                  {Array.from({ length: days }, (_, index) => {
                    const date = `${currentMonth}-${String(index + 1).padStart(2, "0")}`
                    const next = localDateString(new Date(first.getFullYear(), first.getMonth(), index + 2))
                    const past = date < today
                    const known = Array.isArray(ranges)
                    const unavailable = known && overlaps(date, next, ranges)
                    const status = past ? c.past : !known ? c.unknownDay : unavailable ? c.unavailable : c.available
                    return <div key={date} aria-label={`${new Date(`${date}T12:00:00`).toLocaleDateString(locale, { dateStyle: "full" })}: ${status}`} title={status} className={`flex min-h-14 flex-col items-center justify-center rounded-lg border text-sm md:min-h-20 ${past ? "border-transparent bg-gray-50 text-gray-400" : !known ? "border-[#d6cdb8] bg-[#f7f4ef]" : unavailable ? "border-red-200 bg-red-50 text-red-800" : "border-teal-200 bg-teal-50 text-teal-900"}`}>
                      <span className="font-medium md:text-lg">{index + 1}</span>
                      {!past && <span aria-hidden="true" className="mt-1 text-xs">{!known ? "?" : unavailable ? "×" : "✓"}</span>}
                    </div>
                  })}
                </div>
              </section>
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-5 text-sm"><span className="text-teal-800">✓ {c.available}</span><span className="text-red-800">× {c.unavailable}</span><span className="text-[#6b6355]">? {c.unknownDay}</span></div>
        </>)}
      </>}
    </dialog>
  )
}
