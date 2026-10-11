import { useRef, useState } from "react"
import { useLang } from "../LanguageContext"
import { localDateString } from "../utils/dates"

interface DatePickerProps {
  id: string
  name?: string
  value: string
  min: string
  max: string
  required?: boolean
  className: string
  onChange: (value: string) => void
  isDateDisabled?: (date: string) => boolean
  /** When set, clicking the field calls this (e.g. TidyCal popup) instead of opening the built-in calendar. */
  onTriggerClick?: () => void
}

export default function DatePicker({ id, name, value, min, max, required, className, onChange, onTriggerClick, isDateDisabled }: DatePickerProps) {
  const { lang, tr } = useLang()
  const c = tr.datePicker
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [month, setMonth] = useState(() => (value || min).slice(0, 7))
  const [year, monthNumber] = month.split("-").map(Number)
  const first = new Date(year, monthNumber - 1, 1)
  const days = new Date(year, monthNumber, 0).getDate()
  const locale = lang === "es" ? "es-PE" : "en-US"
  const monthLabel = first.toLocaleDateString(locale, { month: "long", year: "numeric" })
  const previousMonth = localDateString(new Date(year, monthNumber - 2, 1)).slice(0, 7)
  const nextMonth = localDateString(new Date(year, monthNumber, 1)).slice(0, 7)

  const open = () => {
    setMonth((value >= min && value <= max ? value : min).slice(0, 7))
    dialog.current?.showModal()
  }

  const close = () => {
    dialog.current?.close()
    trigger.current?.focus()
  }

  return (
    <div>
      <button
        ref={trigger}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-controls={`${id}-calendar`}
        onClick={onTriggerClick ?? open}
        className={`${className} flex items-center justify-between gap-3 text-left cursor-pointer`}
      >
        <span>{value ? new Date(`${value}T12:00:00`).toLocaleDateString(locale) : c.placeholder}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 11h18" />
        </svg>
      </button>
      <input
        type="text"
        name={name}
        value={value}
        required={required}
        tabIndex={-1}
        aria-label={c.placeholder}
        className="sr-only"
        onChange={() => {}}
        onInvalid={(event) => {
          event.preventDefault()
          if (!document.querySelector("dialog[open]")) open()
        }}
      />
      <dialog
        ref={dialog}
        id={`${id}-calendar`}
        aria-label={c.placeholder}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border border-[#d6cdb8] bg-white p-5 text-[#1a1714] shadow-xl backdrop:bg-black/30"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect()
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close()
          }
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <button type="button" aria-label={c.previous} disabled={previousMonth < min.slice(0, 7)} onClick={() => setMonth(previousMonth)} className="rounded p-2 hover:bg-[#ede8df] disabled:opacity-30">←</button>
          <h3 className="font-medium capitalize" aria-live="polite">{monthLabel}</h3>
          <button type="button" aria-label={c.next} disabled={nextMonth > max.slice(0, 7)} onClick={() => setMonth(nextMonth)} className="rounded p-2 hover:bg-[#ede8df] disabled:opacity-30">→</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: 7 }, (_, index) => (
            <span key={index} className="py-2 text-xs text-[#6b6355]">
              {new Date(2024, 0, 7 + index).toLocaleDateString(locale, { weekday: "short" })}
            </span>
          ))}
          {Array.from({ length: first.getDay() }, (_, index) => <span key={`empty-${index}`} />)}
          {Array.from({ length: days }, (_, index) => {
            const date = `${month}-${String(index + 1).padStart(2, "0")}`
            const disabled = date < min || date > max || Boolean(isDateDisabled?.(date))
            return (
              <button
                key={date}
                type="button"
                disabled={disabled}
                aria-label={new Date(`${date}T12:00:00`).toLocaleDateString(locale, { dateStyle: "full" })}
                aria-pressed={date === value}
                onClick={() => { onChange(date); close() }}
                className={`aspect-square rounded text-sm focus-visible:outline-2 focus-visible:outline-[#4a8fa3] disabled:opacity-25 ${date === value ? "bg-[#1b4d6e] text-white" : "hover:bg-[#ede8df]"}`}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
        <button type="button" onClick={close} className="mt-4 w-full rounded border border-[#d6cdb8] py-2 text-sm hover:bg-[#ede8df]">{c.close}</button>
      </dialog>
    </div>
  )
}
