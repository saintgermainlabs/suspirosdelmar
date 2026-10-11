import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useLang } from "../LanguageContext"
import { waLink } from "../site"
import { localDateString, nextDate, requiresAdvanceDeposit } from "../utils/dates"
import DatePicker from "./DatePicker"
import AvailabilityCalendar from "./AvailabilityCalendar"
import BookingPolicy from "./BookingPolicy"

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
  const [availabilityOpen, setAvailabilityOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof form, string>>>({})

  const advanceDeposit = requiresAdvanceDeposit(form.checkin)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting || advanceDeposit) return
    const errors: Partial<Record<keyof typeof form, string>> = {}
    for (const key of Object.keys(form) as (keyof typeof form)[]) {
      if (!form[key].trim()) errors[key] = c.validation.required
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = c.validation.email
    }
    if (form.phone.trim() && (!/^\+?[\d\s().-]+$/.test(form.phone.trim()) || form.phone.replace(/\D/g, "").length < 7 || form.phone.replace(/\D/g, "").length > 15)) {
      errors.phone = c.validation.phone
    }
    for (const key of ["checkin", "checkout"] as const) {
      const value = form[key]
      if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T12:00:00`)) || value < todayStr || value > maxDateStr)) {
        errors[key] = c.validation.dates
      }
    }
    if (form.checkout && form.checkin && form.checkout <= form.checkin) errors.checkout = c.validation.checkout
    if (!["1", "2", "3", "4", "5"].includes(form.guests)) errors.guests = c.validation.required
    if (!/^\d+$/.test(form.roomIndex) || !c.roomOptions[Number(form.roomIndex)]) errors.roomIndex = c.validation.required
    setFieldErrors(errors)
    setError(null)
    const firstInvalid = (Object.keys(errors) as (keyof typeof form)[])[0]
    if (firstInvalid) {
      document.getElementById(firstInvalid === "roomIndex" ? "b-room" : `b-${firstInvalid}`)?.focus()
      return
    }
    setIsSubmitting(true)

    const selectedRoom = c.roomOptions[Number(form.roomIndex)]
    const webhookUrl =
      import.meta.env.VITE_N8N_WEBHOOK_URL ||
      "https://n8n.sg-labs.xyz/webhook/submit"
    const formattedBookingMessage = [
      form.checkin ? `Check-in: ${form.checkin}` : null,
      form.checkout ? `Check-out: ${form.checkout}` : null,
      form.guests ? `Huéspedes: ${form.guests}` : null,
      selectedRoom ? `Habitación: ${selectedRoom}` : null,
      "Preferencia de pago: al llegar (solicitud pendiente de confirmación)",
      form.message ? `Mensaje: ${form.message.trim()}` : null,
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
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          checkin: form.checkin,
          checkout: form.checkout,
          guests: form.guests,
          room: selectedRoom,
          payment_preference: "on_arrival",
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
      <AvailabilityCalendar open={availabilityOpen} onClose={() => setAvailabilityOpen(false)} />

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
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "b-name-error" : undefined}
                name="name"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={f.namePlaceholder}
                className={inputClass}
              />
              {fieldErrors.name && <p id="b-name-error" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
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
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "b-email-error" : undefined}
                name="email"
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={f.emailPlaceholder}
                className={inputClass}
              />
              {fieldErrors.email && <p id="b-email-error" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="b-phone"
                className="block text-xs text-[#6b6355] mb-1"
              >
                {f.phone} *
              </label>
              <input
                id="b-phone"
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? "b-phone-error" : undefined}
                name="phone"
                required
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder={f.phonePlaceholder}
                className={inputClass}
              />
              {fieldErrors.phone && <p id="b-phone-error" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
            </div>
            <div>
              <label
                htmlFor="b-guests"
                className="block text-xs text-[#6b6355] mb-1"
              >
                {f.guests} *
              </label>
              <select
                id="b-guests"
                aria-invalid={Boolean(fieldErrors.guests)}
                aria-describedby={fieldErrors.guests ? "b-guests-error" : undefined}
                name="guests"
                required
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
              {fieldErrors.guests && <p id="b-guests-error" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.guests}</p>}
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
                aria-invalid={Boolean(fieldErrors.checkin)}
                aria-describedby={fieldErrors.checkin ? "b-checkin-error" : undefined}
                name="checkin"
                required
                min={todayStr}
                max={maxDateStr}
                value={form.checkin}
                onChange={(value) => setForm({ ...form, checkin: value, checkout: form.checkout > value ? form.checkout : "" })}
                className={`${inputClass} cursor-pointer`}
              />
              {fieldErrors.checkin && <p id="b-checkin-error" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.checkin}</p>}
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
                aria-invalid={Boolean(fieldErrors.checkout)}
                aria-describedby={fieldErrors.checkout ? "b-checkout-error" : undefined}
                name="checkout"
                required
                value={form.checkout}
                min={checkoutMin}
                max={maxDateStr}
                onChange={(value) => setForm({ ...form, checkout: value })}
                className={`${inputClass} cursor-pointer`}
              />
              {fieldErrors.checkout && <p id="b-checkout-error" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.checkout}</p>}
            </div>
          </div>

          <div>
            <label
              htmlFor="b-room"
              className="block text-xs text-[#6b6355] mb-1"
            >
              {f.room} *
            </label>
            <select
              id="b-room"
              aria-invalid={Boolean(fieldErrors.roomIndex)}
              aria-describedby={fieldErrors.roomIndex ? "b-room-error" : undefined}
              required
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
            {fieldErrors.roomIndex && <p id="b-room-error" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.roomIndex}</p>}
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setAvailabilityOpen(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#4a8fa3] bg-[#1b4d6e] px-5 py-3 text-sm font-medium text-white hover:bg-[#4a8fa3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a8fa3]"
            >
              <span aria-hidden="true">▦</span> {tr.availability.button}
            </button>
          </div>

          <div>
            <label
              htmlFor="b-message"
              className="block text-xs text-[#6b6355] mb-1"
            >
              {f.message} *
            </label>
            <textarea
              id="b-message"
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={fieldErrors.message ? "b-message-error" : undefined}
              required
              name="message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              placeholder={f.messagePlaceholder}
              className={`${inputClass} resize-none`}
            />
            {fieldErrors.message && <p id="b-message-error" role="alert" className="mt-1 text-xs text-red-600">{fieldErrors.message}</p>}
          </div>

          {error && (
            <div role="alert" className="text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3 text-sm text-center">
              {error}
            </div>
          )}

          <BookingPolicy checkin={form.checkin} />
          <Link
            to="/reservar"
            state={{ checkin: form.checkin, checkout: form.checkout, guests: form.guests, name: form.name, email: form.email, phone: form.phone }}
            className="block w-full rounded bg-[#1b4d6e] py-3.5 text-center text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#4a8fa3] focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {tr.bookingPolicy.gateway}
          </Link>
          {form.checkin && !advanceDeposit && <>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full border border-[#1b4d6e] text-[#1b4d6e] font-medium py-3.5 rounded transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a8fa3] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? "..." : tr.bookingPolicy.arrival}
            </button>
            <p className="text-xs text-[#6b6355] text-center">{f.note}</p>
          </>}
        </form>
      )}
    </div>
  )
}
