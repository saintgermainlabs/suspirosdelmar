import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useLang } from "../LanguageContext"
import { getRoomBySlug, roomsData } from "../data/roomsData"
import { getTidycalUrl } from "../data/tidycal"

export interface TidyCalModalProps {
  open: boolean
  onClose: () => void
  /** Room id from roomsData; undefined → fallback calendar */
  roomId?: string
  /** Optional: lets visitors skip the calendar and type dates in the form */
  onManualDates?: () => void
}

export default function TidyCalModal({
  open,
  onClose,
  roomId,
  onManualDates,
}: TidyCalModalProps) {
  const { tr, lang } = useLang()
  const m = tr.tidycal
  const [loaded, setLoaded] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // With no room chosen in the form, let the visitor pick one inside the popup
  const [pickedRoomId, setPickedRoomId] = useState("")
  useEffect(() => {
    if (open) setPickedRoomId("")
  }, [open, roomId])
  const activeRoomId = roomId || pickedRoomId || undefined

  const room = activeRoomId ? getRoomBySlug(activeRoomId) : undefined
  const embedUrl = getTidycalUrl()
  const directUrl = getTidycalUrl(false)

  useEffect(() => {
    setLoaded(false)
  }, [embedUrl, open])

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onCloseRef.current()
      }
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.({ preventScroll: true })
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-stretch md:items-center justify-center bg-[#0d1d28]/80 backdrop-blur-sm md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tidycal-modal-title"
      data-testid="tidycal-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative flex flex-col w-full h-full md:h-[88vh] md:max-w-3xl bg-[#f7f4ef] md:rounded-lg shadow-2xl overflow-hidden md:border md:border-[#d6cdb8]">
        <div className="flex items-start justify-between gap-4 px-5 py-4 md:px-6 border-b border-[#d6cdb8] bg-white">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-[#4a8fa3] font-medium">
              {m.tag}
            </p>
            <h2
              id="tidycal-modal-title"
              className="font-display text-xl md:text-2xl text-[#1b4d6e] truncate"
            >
              {room ? room.title[lang] : m.title}
            </h2>
            {!roomId && (
              <div className="mt-2">
                <label htmlFor="tidycal-room" className="sr-only">
                  {m.pickRoom}
                </label>
                <select
                  id="tidycal-room"
                  value={pickedRoomId}
                  onChange={(e) => setPickedRoomId(e.target.value)}
                  className="w-full max-w-xs border border-[#d6cdb8] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4a8fa3] bg-white"
                >
                  <option value="">{m.pickRoom}</option>
                  {roomsData.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title[lang]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="shrink-0 text-[#1b4d6e] bg-[#ede8df] hover:bg-[#d6cdb8] p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a8fa3]"
            aria-label={m.close}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="relative flex-1 bg-white">
          {!loaded && (
            <div
              className="absolute inset-0 flex items-center justify-center text-sm text-[#6b6355]"
              aria-live="polite"
            >
              {m.loading}
            </div>
          )}
          <iframe
            key={embedUrl}
            src={embedUrl}
            title={m.iframeTitle}
            onLoad={() => setLoaded(true)}
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-5 py-3 md:px-6 border-t border-[#d6cdb8] text-xs text-[#6b6355]">
          {onManualDates ? (
            <button
              type="button"
              onClick={onManualDates}
              className="text-[#4a8fa3] underline underline-offset-2 hover:text-[#1b4d6e]"
            >
              {m.manualDates}
            </button>
          ) : (
            <span />
          )}
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4a8fa3] underline underline-offset-2 hover:text-[#1b4d6e]"
          >
            {m.openNewTab}
          </a>
        </div>
      </div>
    </div>,
    document.body,
  )
}
