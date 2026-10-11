import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useLang } from "../LanguageContext"
import { waLink } from "../site"
import { localDateString, nextDate } from "../utils/dates"
import DatePicker from "./DatePicker"
import TidyCalModal from "./TidyCalModal"
import { roomIdFromIndex } from "../data/tidycal"

export interface BookingFormProps {
  defaultRoomIndex?: string
  lockRoomSelect?: boolean
  initialCheckin?: string
  initialCheckout?: string
  initialGuests?: string
  title?: string
  subtitle?: string
}

export default function BookingForm({
  defaultRoomIndex = "0",
  lockRoomSelect = false,
  initialCheckin = "",
  initialCheckout = "",
  initialGuests = "2",
  title,
  subtitle,
}: BookingFormProps) {
  const { tr } = useLang()
  const c = tr.contact
  const f = c.fields
  // Dates/guests chosen in the Home availability widget arrive via router state
  const prefill = (useLocation().state ?? {}) as {
    checkin?: string
    checkout?: string
    guests?: string
  }

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    checkin: prefill.checkin || initialCheckin,
    checkout: prefill.checkout || initialCheckout,
    guests: prefill.guests || initialGuests,
    roomIndex: defaultRoomIndex,
    message: "",
  })
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Clicking a date field opens the TidyCal booking popup for the selected
  // unit; "manual" mode falls back to the built-in DatePicker for inquiries.
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [manualDates, setManualDates] = useState(false)
  const openBooking = manualDates ? undefined : () => setCalendarOpen(true)
  const handleManualDates = () => {
    setManualDates(true)
    setCalendarOpen(false)
    setTimeout(() => document.getElementById("b-checkin")?.click(), 0)
  }
  const tc = tr.tidycal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    const selectedRoom = c.roomOptions[Number(form.roomIndex)]
    const webhookUrl =
      import.meta.env.VITE_N8N_WEBHOOK_URL ||
      "https://n8n.sg-labs.xyz/webhook/submit"
    const formattedBookingMessage = [
      form.checkin ? `Check-in: ${form.checkin}` : null,
      form.checkout ? `Check-out: ${form.checkout}` : null,
      form.guests ? `Huéspedes: ${form.guests}` : null,
      selectedRoom ? `Habitación: ${selectedRoom}` : null,
      form.message ? `Mensaje: ${form.message}` : null,
    ]
      .filter(Boolean)
      .join("\n")

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          form_type: "contact",
          name: form.name,
          email: form.email,
          phone: form.phone,
          checkin: form.checkin,
          checkout: form.checkout,
          guests: form.guests,
          room: selectedRoom,
          message: formattedBookingMessage || form.message,
        }),
      })

      // n8n returns 200 with an empty body when the workflow stops before
      // "Respond to Webhook", so only trust an explicit success flag.
      const result = await response.json().catch(() => null)
      if (response.ok && result?.success === true) {
        setSent(true)
      } else {
        setError(tr.contact.submissionError)
      }
    } catch (err) {
      console.error("Submission fetch error:", err)
      setError(tr.contact.submissionError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const waBookingMessage = [
    "Hola, me gustaría reservar en Los Suspiros del Mar.",
    `${f.checkin}: ${form.checkin}`,
    `${f.checkout}: ${form.checkout}`,
    `${f.guests}: ${form.guests}`,
    form.roomIndex !== ""
      ? `${f.room}: ${c.roomOptions[Number(form.roomIndex)]}`
      : null,
    form.name ? `${f.name}: ${form.name}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  const todayStr = localDateString()
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 3)
  const maxDateStr = localDateString(maxDate)
  const checkoutMin = nextDate(form.checkin || todayStr)

  const inputClass =
    "w-full border border-[#d6cdb8] rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4a8fa3] bg-white"

  return (
    <div className="bg-white border border-[#d6cdb8] rounded-lg p-6 md:p-8 shadow-md">
      <p className="text-xs uppercase tracking-widest text-[#4a8fa3] mb-2 font-medium">
        {subtitle || c.formTag}
      </p>
      <h2 className="font-display text-2xl md:text-3xl text-[#1b4d6e] mb-6">
        {title || c.formTitle}
      </h2>
      <Link
        to="/reservar"
        state={{ checkin: form.checkin, checkout: form.checkout, guests: form.guests }}
        className="mb-6 block rounded-lg bg-[#d8755b] px-5 py-3 text-center text-sm font-medium text-white hover:bg-[#bd6048] focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {tr.payments.open}
      </Link>

      {sent ? (
        <div className="bg-[#ede8df] border border-[#d6cdb8] rounded-lg p-8 text-center">
          <span className="text-4xl" aria-hidden="true">
            🌊
          </span>
          <p className="font-display text-2xl text-[#1b4d6e] mt-4 mb-2">
            {c.successTitle}
          </p>
          <p className="text-[#6b6355] text-sm">
            {c.successMsg(form.name, form.email)}
          </p>
          <a
            href={waLink(waBookingMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#1ebe5a] text-white text-sm font-medium px-6 py-2.5 rounded transition-colors shadow-sm"
          >
            💬 {c.whatsappLink}
          </a>
          <div>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-sm text-[#4a8fa3] underline underline-offset-2"
            >
              {c.successBack}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="b-name"
                className="block text-xs text-[#6b6355] mb-1"
              >
                {f.name} *
              </label>
              <input
                id="b-name"
                name="name"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={f.namePlaceholder}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="b-email"
                className="block text-xs text-[#6b6355] mb-1"
              >
                {f.email} *
              </label>
              <input
                id="b-email"
                name="email"
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={f.emailPlaceholder}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="b-phone"
                className="block text-xs text-[#6b6355] mb-1"
              >
                {f.phone}
              </label>
              <input
                id="b-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder={f.phonePlaceholder}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="b-guests"
                className="block text-xs text-[#6b6355] mb-1"
              >
                {f.guests}
              </label>
              <select
                id="b-guests"
                name="guests"
                value={form.guests}
                onChange={(e) => setForm({ ...form, guests: e.target.value })}
                className={inputClass}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? tr.home.guest : tr.home.guestsPlural}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="b-checkin"
                className="block text-xs text-[#6b6355] mb-1"
              >
                {f.checkin} *
              </label>
              <DatePicker
                id="b-checkin"
                name="checkin"
                required
                min={todayStr}
                max={maxDateStr}
                value={form.checkin}
                onChange={(value) => setForm({ ...form, checkin: value, checkout: form.checkout > value ? form.checkout : "" })}
                onTriggerClick={openBooking}
                className={`${inputClass} cursor-pointer`}
              />
            </div>
            <div>
              <label
                htmlFor="b-checkout"
                className="block text-xs text-[#6b6355] mb-1"
              >
                {f.checkout} *
              </label>
              <DatePicker
                id="b-checkout"
                name="checkout"
                required
                value={form.checkout}
                min={checkoutMin}
                max={maxDateStr}
                onChange={(value) => setForm({ ...form, checkout: value })}
                onTriggerClick={openBooking}
                className={`${inputClass} cursor-pointer`}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setCalendarOpen(true)}
              aria-haspopup="dialog"
              className="inline-flex shrink-0 whitespace-nowrap items-center justify-center gap-2 border border-[#4a8fa3] text-[#1b4d6e] hover:bg-[#4a8fa3] hover:text-white font-medium px-5 py-2.5 rounded transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a8fa3]"
            >
              <span aria-hidden="true">📅</span> {tc.checkAvailability}
            </button>
            <p className="text-xs text-[#6b6355]">{tc.datesHint}</p>
          </div>

          <div>
            <label
              htmlFor="b-room"
              className="block text-xs text-[#6b6355] mb-1"
            >
              {f.room}
            </label>
            <select
              id="b-room"
              name="room"
              disabled={lockRoomSelect}
              value={form.roomIndex}
              onChange={(e) => setForm({ ...form, roomIndex: e.target.value })}
              className={`${inputClass} ${
                lockRoomSelect
                  ? "bg-[#ede8df] opacity-90 cursor-not-allowed"
                  : ""
              }`}
            >
              {c.roomOptions.map((o, i) => (
                <option key={o} value={i}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="b-message"
              className="block text-xs text-[#6b6355] mb-1"
            >
              {f.message}
            </label>
            <textarea
              id="b-message"
              name="message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              placeholder={f.messagePlaceholder}
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && (
            <div role="alert" className="text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1b4d6e] hover:bg-[#4a8fa3] text-white font-medium py-3.5 rounded transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a8fa3] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? "..." : f.submit}
          </button>
          <p className="text-xs text-[#6b6355] text-center">{f.note}</p>
        </form>
      )}

      <TidyCalModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        roomId={roomIdFromIndex(form.roomIndex)}
        onManualDates={handleManualDates}
      />
    </div>
  )
}
